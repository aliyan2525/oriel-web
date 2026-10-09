import { Mark } from "./mark";

export type StoryStep = "ask" | "propose" | "approve" | "review";

/** The oriel window, redrawn for each story step. Presentational only. */
export function StoryWindow({ step }: { step: StoryStep }) {
  const proposed = step !== "ask";
  const approving = step === "approve";
  const approved = step === "review";

  return (
    <div className="story-window" aria-hidden="true">
      <div className="oriel-glass">
        <header className="oriel-head">
          <Mark size={28} />
          <p className="oriel-title">Thursday dinner</p>
          <p className="oriel-sub">Sara · Ali · Zain</p>
        </header>

        <div className="oriel-thread">
          <p className="oriel-msg oriel-msg--you">Plan dinner this week.</p>
          {proposed && <p className="oriel-msg">Sara and Ali are free Thursday evening.</p>}
          {proposed && <p className="oriel-msg">Proposed: Thursday, 8:00 pm.</p>}
        </div>

        {proposed && (
          <div className={`oriel-approval${approved ? " is-approved" : ""}`}>
            <span className="oriel-approval-text">
              {approved ? "Approved · recorded in your log" : "Awaiting your approval"}
            </span>
            {!approved && <span className={`oriel-approve${approving ? " is-live" : ""}`}>Approve</span>}
          </div>
        )}

        <span className="oriel-sheen" />
      </div>
    </div>
  );
}
