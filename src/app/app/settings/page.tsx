import type { Metadata } from "next";
import { createApiKey, deleteApiKey } from "@/app/app/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Model keys" };

const PROVIDER_LABEL: Record<string, string> = {
  anthropic: "Anthropic",
  "openai-compatible": "OpenAI-compatible",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, provider, base_url, last4")
    .order("created_at", { ascending: true });

  return (
    <section className="app-section">
      <h1 className="app-title">Model keys</h1>
      <p className="lead">
        Bring your own key. Oriel never supplies a model. Keys are encrypted on the server, and only the last four characters are shown afterwards.
      </p>

      <form action={createApiKey} className="app-stack">
        <label className="field">
          <span>Provider</span>
          <select name="provider" className="app-select" defaultValue="anthropic">
            <option value="anthropic">Anthropic</option>
            <option value="openai-compatible">OpenAI-compatible (OpenRouter, Groq, Mistral, and others)</option>
          </select>
        </label>
        <label className="field">
          <span>Base URL (OpenAI-compatible only, https)</span>
          <input name="base_url" type="url" inputMode="url" placeholder="https://openrouter.ai/api/v1" maxLength={300} />
        </label>
        <label className="field">
          <span>API key</span>
          <input name="api_key" type="password" autoComplete="off" required minLength={20} maxLength={300} />
        </label>
        <button className="button button-primary" type="submit">
          Save key
        </button>
      </form>

      <ul className="app-stack">
        {(keys ?? []).map((key) => (
          <li key={key.id} className="trust-row">
            <p className="scope-name">
              {PROVIDER_LABEL[key.provider] ?? key.provider} · ending in {key.last4}
            </p>
            {key.base_url && <p className="scope-what">{key.base_url}</p>}
            <form action={deleteApiKey}>
              <input type="hidden" name="id" value={key.id} />
              <button className="button button-secondary" type="submit">
                Remove
              </button>
            </form>
          </li>
        ))}
        {(keys ?? []).length === 0 && <li className="scope-what">No keys yet.</li>}
      </ul>
    </section>
  );
}
