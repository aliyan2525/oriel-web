import type { ChatMessage, ChatResult, ProviderCall } from "./providers";

export type TurnInput = {
  persona: string;
  /** Only the lines trust allows, from sharedContext(). Nothing else reaches the model. */
  sharedLines: string[];
  transcript: { author: string; body: string }[];
  model: string;
  maxTokens: number;
};

const RECENT_MESSAGES = 20;

/** Builds the system prompt and the recent conversation. Facts are limited to what is shared. */
export function buildPrompt(input: TurnInput): { system: string; messages: ChatMessage[] } {
  const facts =
    input.sharedLines.length > 0
      ? `Facts you may share:\n${input.sharedLines.map((line) => `- ${line}`).join("\n")}`
      : "You may share no facts about your owner in this conversation.";

  const system = [
    `You are ${input.persona}, an assistant that speaks for one person in a group chat.`,
    "Use only the facts listed below. If something is not listed, say you do not know. Never guess about anyone's schedule or preferences.",
    facts,
    "Keep replies short and friendly.",
  ].join("\n\n");

  const messages: ChatMessage[] = input.transcript
    .slice(-RECENT_MESSAGES)
    .map((message) => ({ role: "user", content: `${message.author}: ${message.body}` }));

  return { system, messages };
}

export async function runTurn(input: TurnInput, call: ProviderCall): Promise<ChatResult> {
  const { system, messages } = buildPrompt(input);
  return call({ model: input.model, system, messages, maxTokens: input.maxTokens });
}
