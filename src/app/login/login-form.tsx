"use client";

import { useActionState } from "react";
import { type AuthState, sendMagicLink } from "./actions";

const initialState: AuthState = { status: "idle" };

export function AuthForm({ next, mode }: { next: string; mode: "signin" | "signup" }) {
  const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

  if (state.status === "sent") {
    return (
      <p className="form-success" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="waitlist-form">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="mode" value={mode} />
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required inputMode="email" autoComplete="email" enterKeyHint="send" maxLength={254} />
      </label>
      <button className="button button-primary" type="submit" disabled={isPending}>
        {isPending ? "Sending..." : mode === "signup" ? "Create my account" : "Email me a sign-in link"}
      </button>
      {state.status === "error" && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
