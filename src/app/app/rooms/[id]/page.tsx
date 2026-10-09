import { notFound } from "next/navigation";
import { postMessage, setTrust } from "@/app/app/actions";
import { TRUST_LEVELS, type TrustLevel, effectiveLevel } from "@/lib/agent/trust";
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
  profiles: { display_name: string } | null;
};

type Params = Promise<{ id: string }>;

export default async function RoomPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, host_id, invite_code")
    .eq("id", id)
    .maybeSingle();
  if (!room || !user) notFound();

  const isHost = room.host_id === user.id;
  const [membersRes, trustRes, messagesRes] = await Promise.all([
    supabase.from("room_members").select("profile_id, profiles(display_name)").eq("room_id", id),
    supabase.from("friend_trust").select("friend_id, level").eq("room_id", id),
    supabase
      .from("messages")
      .select("id, body, created_at, author_profile_id, profiles(display_name)")
      .eq("room_id", id)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  const members = (membersRes.data ?? []) as unknown as Member[];
  const messages = (messagesRes.data ?? []) as unknown as Message[];
  const levelFor = new Map((trustRes.data ?? []).map((t) => [t.friend_id as string, effectiveLevel(t.level)]));
  const myLevel = levelFor.get(user.id) ?? "none";

  return (
    <section className="app-section">
      <div>
        <p className="eyebrow">{isHost ? "You host this room" : "Room"}</p>
        <h1 className="app-title">{room.name}</h1>
      </div>

      {isHost && (
        <p className="invite">
          Invite link: <code>{`${site.url}/invite/${room.invite_code}`}</code>
        </p>
      )}

      <div className="room-layout">
        <div className="app-stack">
          <ol className="thread" aria-label="Messages">
            {messages.map((m) => (
              <li key={m.id} className="msg">
                <span className="msg-author">
                  {m.profiles?.display_name ?? "Former member"} · {new Date(m.created_at).toISOString().slice(11, 16)}
                </span>
                <p>{m.body}</p>
              </li>
            ))}
          </ol>
          <form action={postMessage} className="composer">
            <input type="hidden" name="roomId" value={id} />
            <label className="field">
              <span className="sr-only">Message</span>
              <textarea name="body" required maxLength={4000} rows={2} placeholder="Write to the room" />
            </label>
            <button className="button button-primary" type="submit">
              Send
            </button>
          </form>
        </div>

        <aside className="app-stack" aria-label="Members and trust">
          <h2 className="app-subtitle">Members</h2>
          <ul className="app-stack">
            {members.map((m) => {
              const name = m.profiles?.display_name ?? "Former member";
              if (m.profile_id === room.host_id) {
                return (
                  <li key={m.profile_id} className="trust-row">
                    <p className="scope-name">{name}</p>
                    <p className="scope-what">Host</p>
                  </li>
                );
              }
              if (!isHost) {
                return (
                  <li key={m.profile_id} className="trust-row">
                    <p className="scope-name">{name}</p>
                    {m.profile_id === user.id && (
                      <p className="scope-what">Your host lets agents share: {LEVEL_LABEL[myLevel]}</p>
                    )}
                  </li>
                );
              }
              const level = levelFor.get(m.profile_id) ?? "none";
              return (
                <li key={m.profile_id} className="trust-row">
                  <p className="scope-name">{name}</p>
                  <p className="scope-what">{LEVEL_LABEL[level]}</p>
                  <form action={setTrust}>
                    <input type="hidden" name="roomId" value={id} />
                    <input type="hidden" name="friendId" value={m.profile_id} />
                    <select name="level" defaultValue={level} className="app-select" aria-label={`Trust level for ${name}`}>
                      {TRUST_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {LEVEL_LABEL[l]}
                        </option>
                      ))}
                    </select>
                    <button className="button button-secondary" type="submit">
                      Save
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}
