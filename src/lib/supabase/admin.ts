import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for the agent runtime only. It bypasses row-level security, so it must
 * never be imported by components or passed to the browser. Every query it runs is chosen by the server.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
