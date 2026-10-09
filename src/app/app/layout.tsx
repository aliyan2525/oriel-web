import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

/** Pick a display name: the account's name if set, otherwise the part of the email before the @. */
function displayNameFor(email: string | undefined, metadata: Record<string, unknown> | undefined): string {
  const fromProvider = [metadata?.full_name, metadata?.name].find((v): v is string => typeof v === "string" && v.trim() !== "");
  const name = fromProvider?.trim() ?? "";
  const fallback = (email?.split("@")[0] ?? "").trim();
  return (name || fallback || "Member").slice(0, 60);
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").upsert(
    { id: user.id, display_name: displayNameFor(user.email, user.user_metadata) },
    { onConflict: "id", ignoreDuplicates: true },
  );

  return (
    <div className="app-shell">
      <header className="app-bar container">
        <Link href="/app" className="logo">
          oriel
        </Link>
        <nav className="app-nav" aria-label="App">
          <Link href="/app/settings" className="button button-secondary">Model keys</Link>
        </nav>
        <form action={signOut}>
          <button className="button button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </header>
      <main className="container app-main">{children}</main>
    </div>
  );
}
