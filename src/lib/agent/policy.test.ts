import { describe, expect, it } from "vitest";
import { type Autonomy, type DecisionInput, decide, gateAction } from "./policy";

const addressed: DecisionInput = {
  trigger: "mention",
  paused: false,
  hasPayerKey: true,
  capRemainingCents: null,
  estimatedTurnCents: 2,
  repliesInLastMinute: 0,
  rateLimitPerMinute: 3,
  threadAgentTurns: 0,
  maxThreadAgentTurns: 20,
};

describe("decide: when an agent responds", () => {
  it("responds when mentioned with a key, budget, and quota available", () => {
    expect(decide(addressed)).toEqual({ kind: "respond" });
  });

  it("responds to a human replying to the agent", () => {
    expect(decide({ ...addressed, trigger: "reply_to_agent" })).toEqual({ kind: "respond" });
  });

  it("stays silent for ordinary room chatter", () => {
    expect(decide({ ...addressed, trigger: "room_message" })).toEqual({
      kind: "silent",
      reason: "not_addressed",
    });
  });

  it("checks paused before anything else", () => {
    expect(decide({ ...addressed, paused: true, hasPayerKey: false })).toEqual({
      kind: "silent",
      reason: "paused",
    });
  });

  it("explains when no key is available", () => {
    const result = decide({ ...addressed, hasPayerKey: false });
    expect(result).toMatchObject({ kind: "notice", reason: "no_billing_key" });
  });

  it("stops at the thread turn limit", () => {
    const result = decide({ ...addressed, threadAgentTurns: 20 });
    expect(result).toMatchObject({ kind: "notice", reason: "turn_limit" });
  });

  it("stops when the cap cannot cover the next turn", () => {
    const result = decide({ ...addressed, capRemainingCents: 1, estimatedTurnCents: 2 });
    expect(result).toMatchObject({ kind: "notice", reason: "cap_reached" });
  });

  it("allows a turn that lands exactly on the cap", () => {
    expect(decide({ ...addressed, capRemainingCents: 2, estimatedTurnCents: 2 })).toEqual({
      kind: "respond",
    });
  });

  it("rate limits silently rather than posting a notice", () => {
    expect(decide({ ...addressed, repliesInLastMinute: 3 })).toEqual({
      kind: "silent",
      reason: "rate_limited",
    });
  });
});

describe("gateAction: what an agent may do on its own", () => {
  const autonomies: Autonomy[] = ["quiet", "helpful", "trusted"];

  it.each(autonomies)("never runs external writes or spending automatically (%s)", (autonomy) => {
    expect(gateAction(autonomy, "external_write", true)).toBe("ask");
    expect(gateAction(autonomy, "spend", true)).toBe("ask");
  });

  it.each(autonomies)("always replies when addressed (%s)", (autonomy) => {
    expect(gateAction(autonomy, "reply")).toBe("allow");
  });

  it("proposes only when the agent is not quiet", () => {
    expect(gateAction("quiet", "propose")).toBe("deny");
    expect(gateAction("helpful", "propose")).toBe("allow");
    expect(gateAction("trusted", "propose")).toBe("allow");
  });

  it("remembers things on its own only when trusted", () => {
    expect(gateAction("helpful", "remember")).toBe("ask");
    expect(gateAction("trusted", "remember")).toBe("allow");
  });

  it("shares information only inside the member's scope", () => {
    expect(gateAction("trusted", "share_info", false)).toBe("ask");
    expect(gateAction("trusted", "share_info", true)).toBe("allow");
  });
});
