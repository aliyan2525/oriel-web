"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm({ next }: { next: string }) {
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
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required inputMode="email" autoComplete="email" enterKeyHint="send" maxLength={254} />
      </label>
      <button className="button button-primary" type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Email me a sign-in link"}
      </button>
      {state.status === "error" && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
