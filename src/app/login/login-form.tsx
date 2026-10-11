"use client";

import { useActionState } from "react";
import { type AuthState, sendMagicLink } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = { status: "idle" };

export function AuthForm({ next, mode }: { next: string; mode: "signin" | "signup" }) {
  const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

  if (state.status === "sent") {
    return (
      <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="mode" value={mode} />
      <div className="grid gap-2">
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          enterKeyHint="send"
          maxLength={254}
          className="h-11 rounded-xl border-lilac bg-white px-4 text-base"
        />
      </div>
      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? "Sending..." : mode === "signup" ? "Create my account" : "Email me a sign-in link"}
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
