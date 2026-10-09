import { describe, expect, it } from "vitest";
import type { ChatRequest } from "./providers";
import { buildPrompt, runTurn } from "./turn";

const base = {
  persona: "Sara's assistant",
  transcript: [{ author: "Ali", body: "Who is free Thursday?" }],
  model: "test-model",
  maxTokens: 200,
};

describe("buildPrompt: what the model is allowed to know", () => {
  it("includes only the lines it was given", () => {
    const { system } = buildPrompt({ ...base, sharedLines: ["[availability] free Thursday after 7pm"] });
    expect(system).toContain("free Thursday after 7pm");
    expect(system).not.toContain("vegetarian");
  });

  it("says plainly when there is nothing to share", () => {
    const { system } = buildPrompt({ ...base, sharedLines: [] });
    expect(system).toContain("may share no facts");
  });

  it("keeps the conversation as the user turns, with authors", () => {
    const { messages } = buildPrompt({ ...base, sharedLines: [] });
    expect(messages).toEqual([{ role: "user", content: "Ali: Who is free Thursday?" }]);
  });
});

describe("runTurn", () => {
  it("passes the built prompt to the provider and returns its result", async () => {
    let seen: ChatRequest | undefined;
    const fake = async (req: ChatRequest) => {
      seen = req;
      return { text: "Thursday works", inputTokens: 40, outputTokens: 4 };
    };
    const result = await runTurn({ ...base, sharedLines: ["[availability] free Thursday"] }, fake);
    expect(result.text).toBe("Thursday works");
    expect(seen?.maxTokens).toBe(200);
    expect(seen?.system).toContain("free Thursday");
  });
});
