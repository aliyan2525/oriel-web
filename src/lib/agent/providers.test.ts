import { describe, expect, it } from "vitest";
import { anthropicCall, openAiCompatibleCall, ProviderError, validateBaseUrl } from "./providers";

const request = { model: "test-model", system: "be brief", messages: [{ role: "user" as const, content: "hi" }], maxTokens: 100 };

function fakeFetch(body: unknown, status = 200) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  return { impl, calls };
}

describe("anthropicCall", () => {
  it("sends the user's key in the header and reads text and usage", async () => {
    const { impl, calls } = fakeFetch({
      content: [{ type: "text", text: "Hello" }],
      usage: { input_tokens: 12, output_tokens: 3 },
    });
    const result = await anthropicCall("sk-ant-test", impl)(request);
    expect(calls[0].url).toBe("https://api.anthropic.com/v1/messages");
    expect((calls[0].init.headers as Record<string, string>)["x-api-key"]).toBe("sk-ant-test");
    expect(result).toEqual({ text: "Hello", inputTokens: 12, outputTokens: 3 });
  });

  it("throws a status-only error on failure, without the key", async () => {
    const { impl } = fakeFetch({ error: "bad key sk-ant-test" }, 401);
    const error = await anthropicCall("sk-ant-test", impl)(request).catch((e) => e);
    expect(error).toBeInstanceOf(ProviderError);
    expect(error.status).toBe(401);
    expect(error.message).not.toContain("sk-ant-test");
  });
});

describe("openAiCompatibleCall", () => {
  it("posts to the chosen base URL and reads the first choice", async () => {
    const { impl, calls } = fakeFetch({
      choices: [{ message: { content: "Sure" } }],
      usage: { prompt_tokens: 7, completion_tokens: 2 },
    });
    const result = await openAiCompatibleCall("https://api.example.com/v1", "k", impl)(request);
    expect(calls[0].url).toBe("https://api.example.com/v1/chat/completions");
    expect(result).toEqual({ text: "Sure", inputTokens: 7, outputTokens: 2 });
  });
});

describe("validateBaseUrl", () => {
  it("accepts a public https address and trims the trailing slash", () => {
    expect(validateBaseUrl("https://openrouter.ai/api/v1/")).toBe("https://openrouter.ai/api/v1");
  });

  it.each([
    "http://example.com",
    "https://localhost:8080",
    "https://127.0.0.1",
    "https://10.0.0.5",
    "https://192.168.1.10",
    "https://172.16.0.1",
    "https://169.254.169.254",
    "https://service.internal",
  ])("refuses %s", (url) => {
    expect(() => validateBaseUrl(url)).toThrow();
  });
});
