/**
 * Model providers. Each one takes the user's own key and returns text plus token counts.
 * The app never supplies a model or a key of its own.
 */
export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatRequest = { model: string; system: string; messages: ChatMessage[]; maxTokens: number };
export type ChatResult = { text: string; inputTokens: number; outputTokens: number };
export type ProviderCall = (request: ChatRequest) => Promise<ChatResult>;

/** Carries only the status code, never the key or the response body. */
export class ProviderError extends Error {
  constructor(public readonly status: number) {
    super(`Model provider returned ${status}`);
  }
}

export function anthropicCall(apiKey: string, fetchImpl: typeof fetch = fetch): ProviderCall {
  return async (request) => {
    const res = await fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens,
        system: request.system,
        messages: request.messages,
      }),
    });
    if (!res.ok) throw new ProviderError(res.status);
    const data = await res.json();
    const text = (data.content ?? [])
      .filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text)
      .join("");
    return { text, inputTokens: data.usage?.input_tokens ?? 0, outputTokens: data.usage?.output_tokens ?? 0 };
  };
}

/** Any service that speaks the OpenAI chat format: OpenRouter, Groq, Mistral, DeepSeek, and others. */
export function openAiCompatibleCall(baseUrl: string, apiKey: string, fetchImpl: typeof fetch = fetch): ProviderCall {
  return async (request) => {
    const res = await fetchImpl(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens,
        messages: [{ role: "system", content: request.system }, ...request.messages],
      }),
    });
    if (!res.ok) throw new ProviderError(res.status);
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content ?? "",
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
    };
  };
}

/**
 * Base URLs are fetched by the server, so they must be public HTTPS addresses.
 * Otherwise a user could point the server at internal services.
 */
export function validateBaseUrl(raw: string): string {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Base URL must use https");
  const host = url.hostname.toLowerCase();
  const isPrivate =
    host === "localhost" ||
    host.endsWith(".internal") ||
    host === "::1" ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (isPrivate) throw new Error("Base URL must be a public address");
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}
