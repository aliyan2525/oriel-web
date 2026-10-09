"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validateBaseUrl } from "@/lib/agent/providers";
import { handleMentions } from "@/lib/agent/runtime";
import { TRUST_LEVELS } from "@/lib/agent/trust";
import { lastFour, sealKey } from "@/lib/crypto/keys";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

const PROVIDERS = ["anthropic", "openai-compatible"] as const;
const roomSchema = z.object({ name: z.string().trim().min(1).max(80) });
const messageSchema = z.object({ roomId: z.string().uuid(), body: z.string().trim().min(1).max(4000) });
const trustSchema = z.object({ roomId: z.string().uuid(), friendId: z.string().uuid(), level: z.enum(TRUST_LEVELS) });
const capSchema = z.object({ roomId: z.string().uuid(), cap: z.number().int().min(0).max(100_000_000).nullable() });
const keySchema = z.object({
  provider: z.enum(PROVIDERS),
  baseUrl: z.string().max(300).optional(),
  apiKey: z.string().trim().min(20).max(300),
});
const agentSchema = z.object({
  roomId: z.string().uuid(),
  name: z.string().trim().min(1).max(40),
  persona: z.string().trim().min(1).max(200),
  provider: z.enum(PROVIDERS),
  model: z.string().trim().min(1).max(80),
  maxReplyTokens: z.number().int().min(50).max(1000),
  consent: z.boolean(),
});
const FACT_CATEGORIES = ["availability", "plans", "profile"] as const;

/** Creates a room. The database makes the creator its host and first member. */
export async function createRoom(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = roomSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return;

  const id = randomUUID();
  const { error } = await supabase.from("rooms").insert({ id, name: parsed.data.name, host_id: user.id });
  if (error) return;
  redirect(`/app/rooms/${id}`);
}

/** Posts a message. If it mentions an agent, that agent may reply under its trust and billing rules. */
export async function postMessage(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = messageSchema.safeParse({ roomId: formData.get("roomId"), body: formData.get("body") });
  if (!parsed.success) return;

  const { error } = await supabase.from("messages").insert({
    room_id: parsed.data.roomId,
    author_profile_id: user.id,
    body: parsed.data.body,
  });
  if (!error && parsed.data.body.includes("@")) {
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
    try {
      await handleMentions(parsed.data.roomId, { id: user.id, name: profile?.display_name ?? "Member" }, parsed.data.body);
    } catch (err) {
      console.error("mention_handling_failed", err instanceof Error ? err.message : "unknown");
    }
  }
  revalidatePath(`/app/rooms/${parsed.data.roomId}`);
}

/** Sets how much agents in this room may share with one friend. Row-level security allows only the host. */
export async function setTrust(formData: FormData) {
  const { supabase } = await requireUser();
  const parsed = trustSchema.safeParse({
    roomId: formData.get("roomId"),
    friendId: formData.get("friendId"),
    level: formData.get("level"),
  });
  if (!parsed.success) return;

  await supabase.from("friend_trust").upsert(
    {
      room_id: parsed.data.roomId,
      friend_id: parsed.data.friendId,
      level: parsed.data.level,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "room_id,friend_id" },
  );
  revalidatePath(`/app/rooms/${parsed.data.roomId}`);
}

/** The host sets the room's monthly token cap. Empty means no cap. */
export async function setRoomCap(formData: FormData) {
  const { supabase } = await requireUser();
  const raw = String(formData.get("cap") ?? "").trim();
  const parsed = capSchema.safeParse({
    roomId: formData.get("roomId"),
    cap: raw === "" ? null : Number(raw),
  });
  if (!parsed.success) return;
  await supabase.from("rooms").update({ monthly_token_cap: parsed.data.cap }).eq("id", parsed.data.roomId);
  revalidatePath(`/app/rooms/${parsed.data.roomId}`);
}

/** Stores a provider key encrypted. Only the server can decrypt it. The key is never shown again. */
export async function createApiKey(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = keySchema.safeParse({
    provider: formData.get("provider"),
    baseUrl: String(formData.get("base_url") ?? "").trim() || undefined,
    apiKey: formData.get("api_key"),
  });
  if (!parsed.success) return;

  let baseUrl: string | null = null;
  if (parsed.data.provider === "openai-compatible") {
    if (!parsed.data.baseUrl) return;
    try {
      baseUrl = validateBaseUrl(parsed.data.baseUrl);
    } catch {
      return;
    }
  }

  const sealed = sealKey(parsed.data.apiKey);
  await supabase.from("api_keys").upsert(
    {
      owner_id: user.id,
      provider: parsed.data.provider,
      base_url: baseUrl,
      ciphertext: sealed.ciphertext,
      iv: sealed.iv,
      tag: sealed.tag,
      last4: lastFour(parsed.data.apiKey),
    },
    { onConflict: "owner_id,provider" },
  );
  revalidatePath("/app/settings");
}

export async function deleteApiKey(formData: FormData) {
  const { supabase } = await requireUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  await supabase.from("api_keys").delete().eq("id", id.data);
  revalidatePath("/app/settings");
}

/** Adds the signed-in user's agent to a room. Consent to host-pays is recorded here and can be changed later. */
export async function createAgent(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = agentSchema.safeParse({
    roomId: formData.get("roomId"),
    name: formData.get("name"),
    persona: formData.get("persona"),
    provider: formData.get("provider"),
    model: formData.get("model") || "claude-haiku-5-5",
    maxReplyTokens: Number(formData.get("maxReplyTokens") || 400),
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) return;

  await supabase.from("agents").insert({
    owner_id: user.id,
    room_id: parsed.data.roomId,
    name: parsed.data.name,
    persona: parsed.data.persona,
    provider: parsed.data.provider,
    model: parsed.data.model,
    max_reply_tokens: parsed.data.maxReplyTokens,
    host_pays_consent: parsed.data.consent,
  });
  revalidatePath(`/app/rooms/${parsed.data.roomId}`);
}

/** Owners only: changes whether the host's key may pay for their agent. */
export async function setConsent(formData: FormData) {
  const { supabase, user } = await requireUser();
  const agentId = z.string().uuid().safeParse(formData.get("agentId"));
  const roomId = z.string().uuid().safeParse(formData.get("roomId"));
  if (!agentId.success || !roomId.success) return;
  await supabase
    .from("agents")
    .update({ host_pays_consent: formData.get("consent") === "on" })
    .eq("id", agentId.data)
    .eq("owner_id", user.id);
  revalidatePath(`/app/rooms/${roomId.data}`);
}

/** Owners and hosts can pause an agent. Pausing is always allowed, so nobody is stuck with a noisy agent. */
export async function setPaused(formData: FormData) {
  const { supabase } = await requireUser();
  const agentId = z.string().uuid().safeParse(formData.get("agentId"));
  const roomId = z.string().uuid().safeParse(formData.get("roomId"));
  if (!agentId.success || !roomId.success) return;
  await supabase.from("agents").update({ paused: formData.get("paused") === "on" }).eq("id", agentId.data);
  revalidatePath(`/app/rooms/${roomId.data}`);
}

/** Owners replace the facts their agent may use. Facts are grouped by category; trust decides who sees which. */
export async function saveFacts(formData: FormData) {
  const { supabase, user } = await requireUser();
  const agentId = z.string().uuid().safeParse(formData.get("agentId"));
  const roomId = z.string().uuid().safeParse(formData.get("roomId"));
  if (!agentId.success || !roomId.success) return;

  const rows = FACT_CATEGORIES.flatMap((category) =>
    String(formData.get(category) ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line.length <= 500)
      .slice(0, 20)
      .map((content) => ({ agent_id: agentId.data, category, content })),
  );

  await supabase.from("agent_facts").delete().eq("agent_id", agentId.data);
  if (rows.length > 0) await supabase.from("agent_facts").insert(rows);
  void user;
  revalidatePath(`/app/rooms/${roomId.data}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
