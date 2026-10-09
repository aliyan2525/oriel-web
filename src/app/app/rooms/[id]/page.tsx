import { notFound } from "next/navigation";
import { createAgent, postMessage, saveFacts, setConsent, setPaused, setRoomCap, setTrust } from "@/app/app/actions";
import { RoomLive } from "@/components/room-live";
import { effectiveLevel, TRUST_LEVELS, type TrustLevel } from "@/lib/agent/trust";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const LEVEL_LABEL: Record<TrustLevel, string> = {
  none: "Nothing shared",
  availability: "Availability only",
  plans: "Availability and plans",
  profile: "Everything shared",
};

type Member = { profile_id: string; profiles: { display_name: string } | null };
type Message = {
  id: string;
  body: string;
  created_at: string;
  author_profile_id: string | null;
  author_agent_id: string | null;
  profiles: { display_name: string } | null;
};
type AgentRow = {
  id: string;
  owner_id: string;
  name: string;
  paused: boolean;
  provider: string;
  model: string;
  persona: string;
  host_pays_consent: boolean;
  max_reply_tokens: number;
};

const sendIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

type Params = Promise<{ id: string }>;

export default async function RoomPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, host_id, invite_code, monthly_token_cap")
    .eq("id", id)
    .maybeSingle();
  if (!room || !user) notFound();

  const isHost = room.host_id === user.id;
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
  const [membersRes, trustRes, messagesRes, agentsRes, usageRes, keysRes] = await Promise.all([
    supabase.from("room_members").select("profile_id, profiles(display_name)").eq("room_id", id),
    supabase.from("friend_trust").select("friend_id, level").eq("room_id", id),
    supabase
      .from("messages")
      .select("id, body, created_at, author_profile_id, author_agent_id, profiles(display_name)")
      .eq("room_id", id)
      .order("created_at", { ascending: true })
      .limit(200),
    supabase.from("agents").select("id, owner_id, name, paused, provider, model, persona, host_pays_consent, max_reply_tokens").eq("room_id", id),
    supabase.from("usage_events").select("input_tokens, output_tokens").eq("room_id", id).gte("created_at", monthStart),
    supabase.from("api_keys").select("provider").eq("owner_id", user.id),
  ]);

  const members = (membersRes.data ?? []) as unknown as Member[];
  const messages = (messagesRes.data ?? []) as unknown as Message[];
  const agents = (agentsRes.data ?? []) as AgentRow[];
  const levelFor = new Map((trustRes.data ?? []).map((t) => [t.friend_id as string, effectiveLevel(t.level)]));
  const myLevel = levelFor.get(user.id) ?? "none";
  const agentName = new Map(agents.map((a) => [a.id, a.name]));
  const myAgent = agents.find((a) => a.owner_id === user.id);
  const myKeyProviders = new Set((keysRes.data ?? []).map((k) => k.provider));
  const usageTotal = (usageRes.data ?? []).reduce((sum, u) => sum + u.input_tokens + u.output_tokens, 0);

  const { data: myFacts } = myAgent
    ? await supabase.from("agent_facts").select("category, content").eq("agent_id", myAgent.id)
    : { data: [] as { category: string; content: string }[] };
  const factText = (category: string) => (myFacts ?? []).filter((f) => f.category === category).map((f) => f.content).join("\n");

  return (
    <div className="room-page">
      <RoomLive roomId={id} />

      <header className="room-head">
        <div className="room-head-main">
          <span className="room-monogram room-monogram--lg">{room.name.charAt(0).toUpperCase()}</span>
          <div>
            <p className="kicker">{isHost ? "You host this room" : "Room"}</p>
            <h1 className="app-title">{room.name}</h1>
            <p className="app-sub">
              {members.length} {members.length === 1 ? "member" : "members"} · {agents.length} {agents.length === 1 ? "agent" : "agents"}
            </p>
          </div>
        </div>
        {isHost && (
          <div className="invite-card">
            <span className="invite-label">Invite link</span>
            <code>{`${site.url}/invite/${room.invite_code}`}</code>
          </div>
        )}
      </header>

      <div className="room-body">
        <section className="conversation" aria-label="Conversation">
          <ol className="thread" aria-label="Messages">
            {messages.length === 0 && (
              <li className="thread-empty">No messages yet. Say hello, or mention an agent with @name.</li>
            )}
            {messages.map((m) => {
              const mine = m.author_profile_id === user.id;
              const isAgent = Boolean(m.author_agent_id);
              return (
                <li key={m.id} className={`bubble-row${mine ? " is-mine" : ""}`}>
                  <div className={`bubble${isAgent ? " bubble--agent" : mine ? " bubble--mine" : ""}`}>
                    {!mine && (
                      <span className="bubble-author">
                        {isAgent ? `${agentName.get(m.author_agent_id ?? "") ?? "Agent"} · agent` : m.profiles?.display_name ?? "Former member"}
                      </span>
                    )}
                    <p>{m.body}</p>
                    <time className="bubble-time" dateTime={m.created_at}>
                      {new Date(m.created_at).toISOString().slice(11, 16)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>

          <form action={postMessage} className="composer">
            <input type="hidden" name="roomId" value={id} />
            <label className="sr-only" htmlFor="room-message">Message</label>
            <textarea id="room-message" name="body" required maxLength={4000} rows={1} placeholder="Message the room. Mention an agent with @name." />
            <button className="composer-send" type="submit" aria-label="Send message">
              {sendIcon}
            </button>
          </form>
        </section>

        <aside className="room-side" aria-label="Members, agents, and controls">
          <details className="side-card" open>
            <summary>Members and trust</summary>
            <ul className="side-list">
              {members.map((m) => {
                const name = m.profiles?.display_name ?? "Former member";
                const initial = name.charAt(0).toUpperCase();
                if (m.profile_id === room.host_id) {
                  return (
                    <li key={m.profile_id} className="member-row">
                      <span className="member-avatar">{initial}</span>
                      <div className="member-text">
                        <p className="member-name">{name}</p>
                        <p className="member-note">Host</p>
                      </div>
                    </li>
                  );
                }
                if (!isHost) {
                  return (
                    <li key={m.profile_id} className="member-row">
                      <span className="member-avatar">{initial}</span>
                      <div className="member-text">
                        <p className="member-name">{name}</p>
                        {m.profile_id === user.id && <p className="member-note">Your host lets agents share: {LEVEL_LABEL[myLevel]}</p>}
                      </div>
                    </li>
                  );
                }
                const level = levelFor.get(m.profile_id) ?? "none";
                return (
                  <li key={m.profile_id} className="member-row member-row--stack">
                    <div className="member-line">
                      <span className="member-avatar">{initial}</span>
                      <div className="member-text">
                        <p className="member-name">{name}</p>
                        <p className="member-note">{LEVEL_LABEL[level]}</p>
                      </div>
                    </div>
                    <form action={setTrust} className="inline-row">
                      <input type="hidden" name="roomId" value={id} />
                      <input type="hidden" name="friendId" value={m.profile_id} />
                      <select name="level" defaultValue={level} className="app-select" aria-label={`Trust level for ${name}`}>
                        {TRUST_LEVELS.map((l) => (
                          <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
                        ))}
                      </select>
                      <button className="button button-secondary" type="submit">Save</button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </details>

          <details className="side-card" open>
            <summary>Agents</summary>
            {agents.length === 0 && <p className="member-note">No agents in this room yet.</p>}
            <ul className="side-list">
              {agents.map((a) => (
                <li key={a.id} className="agent-row">
                  <div className="member-text">
                    <p className="member-name">
                      {a.name}
                      {a.paused && <span className="pill-paused">Paused</span>}
                    </p>
                    <p className="member-note">
                      {a.owner_id === user.id ? "Yours" : "Another member's"} · {a.provider} · {a.model}
                    </p>
                  </div>
                  {(a.owner_id === user.id || isHost) && (
                    <form action={setPaused}>
                      <input type="hidden" name="roomId" value={id} />
                      <input type="hidden" name="agentId" value={a.id} />
                      <input type="hidden" name="paused" value={a.paused ? "off" : "on"} />
                      <button className="button button-secondary button-small" type="submit">{a.paused ? "Resume" : "Pause"}</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </details>

          {isHost && (
            <details className="side-card" open>
              <summary>Budget</summary>
              <p className="budget-figure">{usageTotal.toLocaleString("en-US")} <span>tokens this month</span></p>
              <form action={setRoomCap} className="inline-row">
                <input type="hidden" name="roomId" value={id} />
                <input name="cap" type="number" inputMode="numeric" min={0} placeholder="Monthly cap (blank for none)" defaultValue={room.monthly_token_cap ?? ""} className="app-select" />
                <button className="button button-secondary" type="submit">Save</button>
              </form>
            </details>
          )}

          <details className="side-card" open>
            <summary>{myAgent ? `Your agent · ${myAgent.name}` : "Your agent"}</summary>
            {myAgent ? (
              <div className="app-stack">
                <form action={setConsent} className="inline-row">
                  <input type="hidden" name="roomId" value={id} />
                  <input type="hidden" name="agentId" value={myAgent.id} />
                  <label className="check">
                    <input type="checkbox" name="consent" defaultChecked={myAgent.host_pays_consent} />
                    Let the host&apos;s key pay for my agent here
                  </label>
                  <button className="button button-secondary" type="submit">Save</button>
                </form>
                <form action={saveFacts} className="app-stack">
                  <input type="hidden" name="roomId" value={id} />
                  <input type="hidden" name="agentId" value={myAgent.id} />
                  <p className="member-note">What your agent may know, one fact per line. Trust decides who hears each category.</p>
                  <label className="field"><span>Availability</span><textarea name="availability" rows={3} defaultValue={factText("availability")} /></label>
                  <label className="field"><span>Plans</span><textarea name="plans" rows={3} defaultValue={factText("plans")} /></label>
                  <label className="field"><span>Profile</span><textarea name="profile" rows={3} defaultValue={factText("profile")} /></label>
                  <button className="button button-secondary" type="submit">Save facts</button>
                </form>
              </div>
            ) : (
              <form action={createAgent} className="app-stack">
                <input type="hidden" name="roomId" value={id} />
                <label className="field"><span>Name (people mention it as @name)</span><input name="name" required maxLength={40} placeholder="Sara" /></label>
                <label className="field"><span>Persona</span><input name="persona" required maxLength={200} placeholder="Sara's assistant" /></label>
                <label className="field">
                  <span>Provider</span>
                  <select name="provider" className="app-select" defaultValue={myKeyProviders.has("anthropic") ? "anthropic" : "openai-compatible"}>
                    <option value="anthropic">Anthropic</option>
                    <option value="openai-compatible">OpenAI-compatible</option>
                  </select>
                </label>
                <label className="field"><span>Model</span><input name="model" defaultValue="claude-haiku-5-5" maxLength={80} /></label>
                <label className="check"><input type="checkbox" name="consent" /> Let the host&apos;s key pay for my agent here (when the host enables it)</label>
                <button className="button button-primary" type="submit">Add agent</button>
                {myKeyProviders.size === 0 && <p className="member-note">Add a model key in Model keys first so your agent can reply.</p>}
              </form>
            )}
          </details>
        </aside>
      </div>
    </div>
  );
}
