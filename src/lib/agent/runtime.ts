import { openKey, type Sealed } from "@/lib/crypto/keys";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropicCall, openAiCompatibleCall, type ProviderCall } from "./providers";
import { decide } from "./policy";
import { runTurn } from "./turn";
import { effectiveLevel, type InfoCategory, type OwnerFacts, sharedContext, type TrustLevel } from "./trust";

/** Upper bound on one turn: prompt plus reply, used for cap checks before the call is made. */
const ESTIMATE_TOKENS = 1500;
const MAX_AGENTS_PER_MESSAGE = 2;

type Author = { id: string; name: string };
type AgentRow = {
  id: string;
  owner_id: string;
  room_id: string;
  name: string;
  persona: string;
  provider: "anthropic" | "openai-compatible";
  model: string;
  max_reply_tokens: number;
  host_pays_consent: boolean;
  paused: boolean;
  rate_limit_per_minute: number;
  max_thread_agent_turns: number;
};
type KeyRow = { owner_id: string; provider: string; base_url: string | null; ciphertext: string; iv: string; tag: string };

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Finds agents named in the message, such as "@Sara's agent" or "@Helper". */
function mentionedAgents(body: string, agents: AgentRow[]): AgentRow[] {
  return agents
    .filter((agent) => new RegExp(`(^|\\s)@${escapeRegExp(agent.name)}(?=$|[\\s.,!?])`, "i").test(body))
    .slice(0, MAX_AGENTS_PER_MESSAGE);
}

/**
 * Who pays for this reply. The host pays only when the host's billing mode allows it
 * and the agent's owner has consented. Otherwise the owner's own key is used.
 */
function choosePayer(
  agent: AgentRow,
  hostId: string,
  billingMode: string,
  keys: KeyRow[],
): KeyRow | null {
  const hostKey = keys.find((k) => k.owner_id === hostId && k.provider === agent.provider);
  const ownerKey = keys.find((k) => k.owner_id === agent.owner_id && k.provider === agent.provider);
  if (billingMode === "host_pays" && agent.host_pays_consent && hostKey) return hostKey;
  return ownerKey ?? null;
}

function providerFor(key: KeyRow, apiKey: string): ProviderCall {
  return key.base_url ? openAiCompatibleCall(key.base_url, apiKey) : anthropicCall(apiKey);
}

/**
 * Runs when a message mentions an agent. Decides whether to answer, builds the prompt from only
 * the facts that trust allows, calls the payer's model, and records the reply and its usage.
 * Errors post a short notice; they never expose keys or provider details.
 */
export async function handleMentions(roomId: string, author: Author, body: string): Promise<void> {
  const admin = createAdminClient();
  const { data: agentRows } = await admin.from("agents").select("*").eq("room_id", roomId);
  const agents = (agentRows ?? []) as AgentRow[];
  for (const agent of mentionedAgents(body, agents)) {
    try {
      await replyAsAgent(admin, roomId, agent, agents, author);
    } catch (error) {
      console.error("agent_reply_failed", error instanceof Error ? error.message : "unknown");
      await postAgentNotice(admin, roomId, agent.id, "This agent could not reply right now.");
    }
  }
}

async function replyAsAgent(
  admin: ReturnType<typeof createAdminClient>,
  roomId: string,
  agent: AgentRow,
  agents: AgentRow[],
  author: Author,
): Promise<void> {
  const { data: room } = await admin
    .from("rooms")
    .select("host_id, billing_mode, monthly_token_cap")
    .eq("id", roomId)
    .single();
  if (!room) return;

  const { data: keyRows } = await admin
    .from("api_keys")
    .select("owner_id, provider, base_url, ciphertext, iv, tag")
    .in("owner_id", [agent.owner_id, room.host_id]);
  const payer = choosePayer(agent, room.host_id, room.billing_mode, (keyRows ?? []) as KeyRow[]);

  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
  const { data: usage } = await admin
    .from("usage_events")
    .select("input_tokens, output_tokens")
    .eq("room_id", roomId)
    .gte("created_at", monthStart);
  const used = (usage ?? []).reduce((sum, u) => sum + u.input_tokens + u.output_tokens, 0);

  const minuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recent } = await admin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("author_agent_id", agent.id)
    .gte("created_at", minuteAgo);
  const { count: turns } = await admin
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("author_agent_id", agent.id);

  // The agent's owner sees everything they own. Anyone else gets the level the host set for them.
  let level: TrustLevel = "profile";
  if (author.id !== agent.owner_id) {
    const { data: trust } = await admin
      .from("friend_trust")
      .select("level")
      .eq("room_id", roomId)
      .eq("friend_id", author.id)
      .maybeSingle();
    level = effectiveLevel(trust?.level);
  }

  const decision = decide({
    trigger: "mention",
    paused: agent.paused,
    hasPayerKey: payer !== null,
    capRemainingTokens: room.monthly_token_cap === null ? null : room.monthly_token_cap - used,
    estimatedTurnTokens: ESTIMATE_TOKENS,
    repliesInLastMinute: recent ?? 0,
    rateLimitPerMinute: agent.rate_limit_per_minute,
    threadAgentTurns: turns ?? 0,
    maxThreadAgentTurns: agent.max_thread_agent_turns,
  });

  if (decision.kind === "silent") return;
  if (decision.kind === "notice") {
    await postAgentNotice(admin, roomId, agent.id, decision.message);
    return;
  }
  if (!payer) return;

  const { data: factRows } = await admin.from("agent_facts").select("category, content").eq("agent_id", agent.id);
  const facts: OwnerFacts = { availability: [], plans: [], profile: [] };
  for (const fact of factRows ?? []) facts[fact.category as InfoCategory].push(fact.content);

  const { data: recentRows } = await admin
    .from("messages")
    .select("body, author_agent_id, author_profile_id, created_at, profiles(display_name)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(20);
  const agentNames = new Map(agents.map((a) => [a.id, a.name]));
  const transcript = (recentRows ?? [])
    .reverse()
    .map((m: { body: string; author_agent_id: string | null; profiles: { display_name: string } | null }) => ({
      author: m.author_agent_id ? agentNames.get(m.author_agent_id) ?? "Agent" : m.profiles?.display_name ?? "Member",
      body: m.body,
    }));

  const apiKey = openKey(payer as unknown as Sealed);
  const result = await runTurn(
    {
      persona: agent.persona,
      sharedLines: sharedContext(facts, level),
      transcript,
      model: agent.model,
      maxTokens: agent.max_reply_tokens,
    },
    providerFor(payer, apiKey),
  );

  await admin.from("messages").insert({
    room_id: roomId,
    author_agent_id: agent.id,
    body: (result.text || "...").slice(0, 4000),
  });
  await admin.from("usage_events").insert({
    room_id: roomId,
    agent_id: agent.id,
    payer_profile_id: payer.owner_id,
    provider: payer.provider,
    model: agent.model,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
  });
}

/** Posts a notice once: not again if the same notice is already the agent's last message. */
async function postAgentNotice(
  admin: ReturnType<typeof createAdminClient>,
  roomId: string,
  agentId: string,
  text: string,
): Promise<void> {
  const { data: last } = await admin
    .from("messages")
    .select("body")
    .eq("room_id", roomId)
    .eq("author_agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last?.body === text) return;
  await admin.from("messages").insert({ room_id: roomId, author_agent_id: agentId, body: text });
}
