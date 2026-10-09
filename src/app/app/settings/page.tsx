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
    <div className="app-page">
      <header className="app-page-head">
        <div>
          <p className="kicker">Settings</p>
          <h1 className="app-title">Model keys</h1>
          <p className="app-sub">
            Bring your own model. Oriel never supplies one. Keys are encrypted on the server and never shown again.
          </p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="panel spot">
          <h2 className="panel-title">Add a key</h2>
          <form action={createApiKey} className="app-stack">
            <label className="field">
              <span>Provider</span>
              <select name="provider" className="app-select" defaultValue="anthropic">
                <option value="anthropic">Anthropic</option>
                <option value="openai-compatible">OpenAI-compatible (OpenRouter, Groq, Mistral, and others)</option>
              </select>
            </label>
            <label className="field">
              <span>Base URL (OpenAI-compatible, https)</span>
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
        </section>

        <section className="panel-list">
          <h2 className="panel-title">Saved keys</h2>
          {keys && keys.length > 0 ? (
            <ul className="key-list">
              {keys.map((key) => (
                <li key={key.id} className="key-card spot">
                  <div className="key-body">
                    <p className="key-provider">{PROVIDER_LABEL[key.provider] ?? key.provider}</p>
                    <p className="key-mask" aria-label={`Key ending in ${key.last4}`}>•••• •••• {key.last4}</p>
                    {key.base_url && <p className="app-sub">{key.base_url}</p>}
                  </div>
                  <form action={deleteApiKey}>
                    <input type="hidden" name="id" value={key.id} />
                    <button className="button button-danger" type="submit">Remove</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-orb" aria-hidden="true" />
              <h2>No keys yet</h2>
              <p>Add one, so your agents can reply in rooms.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
