import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppNavLink } from "@/components/app-nav";
import { Mark } from "@/components/mark";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

/** The account's name if it has one, otherwise the part of the email before the @. */
function displayNameFor(email: string | undefined, metadata: Record<string, unknown> | undefined): string {
  const fromProvider = [metadata?.full_name, metadata?.name].find((v): v is string => typeof v === "string" && v.trim() !== "");
  const fallback = (email?.split("@")[0] ?? "").trim();
  return ((fromProvider?.trim() ?? "") || fallback || "Member").slice(0, 60);
}

const icons = {
  rooms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  ),
  keys: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l2 2M15 8l2 2" />
    </svg>
  ),
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").upsert(
    { id: user.id, display_name: displayNameFor(user.email, user.user_metadata) },
    { onConflict: "id", ignoreDuplicates: true },
  );
  const name = displayNameFor(user.email, user.user_metadata);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Sidebar">
        <Link href="/app" className="app-brand">
          <Mark size={28} />
          <span>oriel</span>
        </Link>
        <nav className="app-nav" aria-label="App">
          <AppNavLink href="/app" label="Rooms" icon={icons.rooms} />
          <AppNavLink href="/app/settings" label="Model keys" icon={icons.keys} />
        </nav>
        <div className="app-me">
          <span className="app-avatar">{initial}</span>
          <div className="app-me-text">
            <p className="app-me-name">{name}</p>
            <p className="app-me-email">{user.email}</p>
          </div>
        </div>
        <form action={signOut}>
          <button className="button app-signout" type="submit">Sign out</button>
        </form>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <Link href="/app" className="app-brand">
            <Mark size={24} />
            <span>oriel</span>
          </Link>
          <span className="app-avatar" aria-label={`Signed in as ${name}`}>{initial}</span>
        </header>
        <main className="app-main">{children}</main>
      </div>

      <nav className="app-tabbar" aria-label="App">
        <AppNavLink variant="tab" href="/app" label="Rooms" icon={icons.rooms} />
        <AppNavLink variant="tab" href="/app/settings" label="Keys" icon={icons.keys} />
      </nav>
    </div>
  );
}
