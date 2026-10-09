/**
 * The layer around an agent: decides whether it should act, ask its owner, or stay quiet.
 * Pure functions with no I/O, so every rule can be tested without a model or a database.
 * Rules are ordered; the first one that applies wins.
 */

/** What caused the agent to be considered. Agents speak only when addressed. */
export type Trigger = "mention" | "reply_to_agent" | "room_message";

/** Things an agent might do. Anything outside the room is never automatic. */
export type Action = "reply" | "propose" | "remember" | "share_info" | "external_write" | "spend";

/** How much the owner lets the agent do without asking. */
export type Autonomy = "quiet" | "helpful" | "trusted";

export type SilenceReason = "paused" | "not_addressed" | "rate_limited";
export type NoticeReason = "no_billing_key" | "turn_limit" | "cap_reached";

export type Decision =
  | { kind: "respond" }
  | { kind: "silent"; reason: SilenceReason }
  | { kind: "notice"; reason: NoticeReason; message: string };

export type DecisionInput = {
  trigger: Trigger;
  paused: boolean;
  hasPayerKey: boolean;
  /** Tokens left under the room's monthly cap. Null means no cap. */
  capRemainingTokens: number | null;
  /** Upper bound on tokens the next turn can use: prompt plus reply. */
  estimatedTurnTokens: number;
  repliesInLastMinute: number;
  rateLimitPerMinute: number;
  threadAgentTurns: number;
  maxThreadAgentTurns: number;
};

const NOTICE_TEXT: Record<NoticeReason, string> = {
  no_billing_key: "This agent has no key to run on. Its owner can add one in agent settings.",
  turn_limit: "This thread has reached its agent turn limit.",
  cap_reached: "This room has used its monthly token cap, so agents pause until next month.",
};

function notice(reason: NoticeReason): Decision {
  return { kind: "notice", reason, message: NOTICE_TEXT[reason] };
}

/**
 * Whether the agent should respond to the latest message at all.
 * Notices should be posted once per condition, not on every message. The caller handles that.
 */
export function decide(input: DecisionInput): Decision {
  if (input.paused) return { kind: "silent", reason: "paused" };
  if (input.trigger === "room_message") return { kind: "silent", reason: "not_addressed" };
  if (!input.hasPayerKey) return notice("no_billing_key");
  if (input.threadAgentTurns >= input.maxThreadAgentTurns) return notice("turn_limit");
  if (input.capRemainingTokens !== null && input.capRemainingTokens < input.estimatedTurnTokens) {
    return notice("cap_reached");
  }
  if (input.repliesInLastMinute >= input.rateLimitPerMinute) {
    return { kind: "silent", reason: "rate_limited" };
  }
  return { kind: "respond" };
}

export type Gate = "allow" | "ask" | "deny";

/**
 * Whether one action may run. External writes and spending always ask the owner,
 * whatever the autonomy setting says.
 */
export function gateAction(autonomy: Autonomy, action: Action, scopeAllows = false): Gate {
  if (action === "external_write" || action === "spend") return "ask";
  switch (action) {
    case "reply":
      return "allow";
    case "propose":
      return autonomy === "quiet" ? "deny" : "allow";
    case "remember":
      return autonomy === "trusted" ? "allow" : "ask";
    case "share_info":
      return scopeAllows ? "allow" : "ask";
  }
}
