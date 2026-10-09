import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createRoom } from "./actions";

export default async function AppHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, host_id, created_at")
    .order("created_at", { ascending: false });
  const list = rooms ?? [];
  const hosted = list.filter((r) => r.host_id === user?.id).length;

  return (
    <div className="app-page">
      <header className="app-page-head">
        <div>
          <p className="kicker">Dashboard</p>
          <h1 className="app-title">Your rooms</h1>
          <p className="app-sub">
            {list.length} {list.length === 1 ? "room" : "rooms"} · {hosted} hosted by you
          </p>
        </div>
      </header>

      <form action={createRoom} className="create-room spot">
        <div className="create-copy">
          <p className="panel-title">Start a new room</p>
          <p className="app-sub">Invite friends with a link. Add agents when you want them to help.</p>
        </div>
        <div className="create-controls">
          <label className="field">
            <span className="sr-only">Room name</span>
            <input name="name" required maxLength={80} placeholder="Thursday dinner" />
          </label>
          <button className="button button-primary" type="submit">
            Create room
          </button>
        </div>
      </form>

      {list.length > 0 ? (
        <ul className="room-grid">
          {list.map((room, i) => (
            <li key={room.id} className="rise" style={{ animationDelay: `${i * 70}ms` }}>
              <Link href={`/app/rooms/${room.id}`} className="room-tile spot">
                <span className="room-monogram">{room.name.charAt(0).toUpperCase()}</span>
                <span className="room-tile-body">
                  <span className="room-name">{room.name}</span>
                  <span className="room-meta">
                    {room.host_id === user?.id ? "Host" : "Member"} · {new Date(room.created_at).toISOString().slice(0, 10)}
                  </span>
                </span>
                <span className="room-arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span className="empty-orb" aria-hidden="true" />
          <h2>No rooms yet</h2>
          <p>Create one above, then share its invite link with your friends.</p>
        </div>
      )}
    </div>
  );
}
