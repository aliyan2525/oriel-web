"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TRUST_LEVELS } from "@/lib/agent/trust";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

const roomSchema = z.object({ name: z.string().trim().min(1).max(80) });
const messageSchema = z.object({ roomId: z.string().uuid(), body: z.string().trim().min(1).max(4000) });
const trustSchema = z.object({
  roomId: z.string().uuid(),
  friendId: z.string().uuid(),
  level: z.enum(TRUST_LEVELS),
});

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

export async function postMessage(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = messageSchema.safeParse({ roomId: formData.get("roomId"), body: formData.get("body") });
  if (!parsed.success) return;

  await supabase.from("messages").insert({
    room_id: parsed.data.roomId,
    author_profile_id: user.id,
    body: parsed.data.body,
  });
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
