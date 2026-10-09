"use client";

import { useActionState } from "react";
import { joinWaitlist, type JoinState } from "@/app/join/actions";
import { ShareInvite } from "@/components/share-invite";

const initialState: JoinState = { status: "idle" };

export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [state, formAction, isPending] = useActionState(joinWaitlist, initialState);

  if (state.status === "success" || state.status === "duplicate") {
    return (
      <div className="success-stack">
        <p className="form-success" role="status">
          {state.message}
        </p>
        <ShareInvite />
      </div>
    );
  }

  return (
    <form action={formAction} className="waitlist-form">
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="next"
          required
          maxLength={254}
          defaultValue={state.email}
        />
      </label>

      {!compact && (
        <>
          <label className="field">
            <span>Name (optional)</span>
            <input name="name" autoComplete="name" enterKeyHint="next" maxLength={120} />
          </label>
          <label className="field">
            <span>University (optional)</span>
            <input name="university" enterKeyHint="done" maxLength={120} />
          </label>
          <label className="field">
            <span>How many plans do you coordinate a week?</span>
            <select name="weeklyPlans" defaultValue="">
              <option value="">Prefer not to say</option>
              <option value="1-2">1 to 2</option>
              <option value="3-5">3 to 5</option>
              <option value="6+">6 or more</option>
            </select>
          </label>
        </>
      )}

      <input
        className="honeypot"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button className="button button-primary" type="submit" disabled={isPending}>
        {isPending ? "Joining..." : "Join the waitlist"}
      </button>

      {state.status === "error" && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
