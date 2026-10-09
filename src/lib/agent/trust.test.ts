import { describe, expect, it } from "vitest";
import { effectiveLevel, type OwnerFacts, sharedContext, shareAllowed, TRUST_LEVELS } from "./trust";

const facts: OwnerFacts = {
  availability: ["free Thursday after 7pm"],
  plans: ["dinner planned for Friday"],
  profile: ["prefers vegetarian food"],
};

describe("shareAllowed", () => {
  it("never shares anything at level none", () => {
    expect(shareAllowed("none", "availability")).toBe(false);
  });

  it("shares availability only at the availability level", () => {
    expect(shareAllowed("availability", "availability")).toBe(true);
    expect(shareAllowed("availability", "plans")).toBe(false);
    expect(shareAllowed("availability", "profile")).toBe(false);
  });

  it("is monotonic: a higher level never shares less", () => {
    for (const category of ["availability", "plans", "profile"] as const) {
      const allowed = TRUST_LEVELS.map((level) => shareAllowed(level, category));
      expect(allowed).toEqual([...allowed].sort());
    }
  });
});

describe("sharedContext: what reaches the model", () => {
  it("returns nothing at level none", () => {
    expect(sharedContext(facts, "none")).toEqual([]);
  });

  it("returns only availability lines at the availability level", () => {
    expect(sharedContext(facts, "availability")).toEqual(["[availability] free Thursday after 7pm"]);
  });

  it("adds plans at the plans level but never profile details", () => {
    const lines = sharedContext(facts, "plans");
    expect(lines).toContain("[plans] dinner planned for Friday");
    expect(lines.join("\n")).not.toContain("vegetarian");
  });

  it("returns everything at the profile level", () => {
    expect(sharedContext(facts, "profile")).toHaveLength(3);
  });
});

describe("effectiveLevel", () => {
  it("treats a missing row as none", () => {
    expect(effectiveLevel(null)).toBe("none");
    expect(effectiveLevel(undefined)).toBe("none");
  });

  it("rejects unknown stored values rather than trusting them", () => {
    expect(effectiveLevel("everything")).toBe("none");
  });

  it("passes known levels through", () => {
    expect(effectiveLevel("plans")).toBe("plans");
  });
});
