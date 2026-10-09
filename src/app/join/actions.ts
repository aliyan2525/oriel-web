"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase";

export type JoinState = {
  status: "idle" | "success" | "duplicate" | "error";
  message?: string;
  email?: string;
};

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  name: z.string().trim().max(120).optional(),
  university: z.string().trim().max(120).optional(),
  weeklyPlans: z.enum(["1-2", "3-5", "6+", ""]).optional(),
  // Honeypot: people leave this empty, bots often fill it in.
  website: z.string().optional(),
});

const SUCCESS = "You're on the list. We'll be in touch.";

function field(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function joinWaitlist(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const parsed = schema.safeParse({
    email: field(formData, "email") ?? "",
    name: field(formData, "name"),
    university: field(formData, "university"),
    weeklyPlans: field(formData, "weeklyPlans"),
    website: field(formData, "website"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check your entries.",
      email: field(formData, "email"),
    };
  }

  const { email, name, university, weeklyPlans, website } = parsed.data;
  if (website) return { status: "success", message: SUCCESS };

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("waitlist_signups").insert({
      email,
      name: name || null,
      university: university || null,
      weekly_plans: weeklyPlans || null,
    });

    if (error?.code === "23505") {
      return { status: "duplicate", message: "You're already on the list. We'll be in touch." };
    }
    if (error) throw new Error(`insert failed: ${error.code ?? "unknown"}`);
    return { status: "success", message: SUCCESS };
  } catch (err) {
    // Log the failure without the visitor's email address.
    console.error("waitlist_signup_failed", err instanceof Error ? err.message : "unknown");
    return { status: "error", message: "Something went wrong. Please try again.", email };
  }
}
