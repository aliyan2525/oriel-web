"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { status: "idle" | "sent" | "error"; message?: string };

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  next: z.string().startsWith("/").max(200),
  mode: z.enum(["signin", "signup"]),
});

/**
 * Sends a passwordless link. Sign-up may create the account; sign-in never does.
 * Sign-in always gives the same reply, so it can't reveal which emails have accounts.
 */
export async function sendMagicLink(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? ""),
    next: String(formData.get("next") ?? "/app"),
    mode: String(formData.get("mode") ?? "signin"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check your entries." };

  const { email, next, mode } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: mode === "signup",
    },
  });
  if (error && mode === "signup") {
    return { status: "error", message: "We could not create your account. Please wait a minute and try again." };
  }
  return { status: "sent", message: "Check your email for a sign-in link." };
}

/** Starts Google sign-in. Supabase handles the OAuth exchange; the callback route finishes the session. */
export async function signInWithGoogle(formData: FormData) {
  const next = String(formData.get("next") ?? "/app");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${site.url}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}
