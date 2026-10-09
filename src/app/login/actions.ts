"use server";

import { z } from "zod";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  next: z.string().startsWith("/").max(200),
});

/** Sends a passwordless sign-in link. Supabase creates the account on first use. */
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: String(formData.get("email") ?? ""),
    next: String(formData.get("next") ?? "/app"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check your entries." };

  const supabase = await createClient();
  const redirectTo = `${site.url}/auth/callback?next=${encodeURIComponent(parsed.data.next)}`;
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });
  if (error) return { status: "error", message: "We could not send the link. Please wait a minute and try again." };
  return { status: "sent", message: "Check your email for a sign-in link." };
}
