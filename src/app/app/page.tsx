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

  return (
    <section className="app-section">
      <h1 className="app-title">Your rooms</h1>
      <form action={createRoom} className="inline-form">
        <label className="field">
          <span className="sr-only">Room name</span>
          <input name="name" required maxLength={80} placeholder="Name a room, like Thursday dinner" />
        </label>
        <button className="button button-primary" type="submit">
          Create room
        </button>
      </form>

      {rooms && rooms.length > 0 ? (
        <ul className="room-list">
          {rooms.map((room) => (
            <li key={room.id}>
              <Link className="card room-card" href={`/app/rooms/${room.id}`}>
                <span className="room-name">{room.name}</span>
                <span className="room-meta">{room.host_id === user?.id ? "You host" : "Member"}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="lead">No rooms yet. Create one, then invite your friends with the link.</p>
      )}
    </section>
  );
}
