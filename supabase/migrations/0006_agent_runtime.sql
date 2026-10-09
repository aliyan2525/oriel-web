-- Agent runtime: encrypted provider keys, the facts each agent holds, token caps, and live messages.

-- Caps are counted in tokens. Converting to money needs each provider's current prices, which are not set here.
alter table public.rooms drop column if exists monthly_cap_cents;
alter table public.rooms add column monthly_token_cap integer
  check (monthly_token_cap is null or monthly_token_cap >= 0);

alter table public.agents
  add column provider text not null default 'anthropic' check (provider in ('anthropic', 'openai-compatible')),
  add column model text not null default 'claude-haiku-5-5' check (char_length(model) between 1 and 80),
  add column persona text not null default 'a helpful assistant' check (char_length(persona) between 1 and 200),
  add column host_pays_consent boolean not null default false,
  add column max_reply_tokens integer not null default 400 check (max_reply_tokens between 50 and 1000);

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null check (provider in ('anthropic', 'openai-compatible')),
  base_url text check (base_url is null or char_length(base_url) <= 300),
  ciphertext text not null,
  iv text not null,
  tag text not null,
  last4 text not null check (char_length(last4) = 4),
  created_at timestamptz not null default now(),
  unique (owner_id, provider)
);
alter table public.api_keys enable row level security;

-- Owners manage their own keys, but no client can read the ciphertext, iv, or tag.
revoke all on public.api_keys from anon, authenticated;
grant select (id, owner_id, provider, base_url, last4, created_at) on public.api_keys to authenticated;
grant insert (owner_id, provider, base_url, ciphertext, iv, tag, last4) on public.api_keys to authenticated;
grant update (provider, base_url, ciphertext, iv, tag, last4) on public.api_keys to authenticated;
grant delete on public.api_keys to authenticated;

create policy "Owners read their key details" on public.api_keys for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Owners add keys" on public.api_keys for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Owners replace keys" on public.api_keys for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners delete keys" on public.api_keys for delete to authenticated
  using (owner_id = (select auth.uid()));

create table public.agent_facts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  category text not null check (category in ('availability', 'plans', 'profile')),
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);
create index agent_facts_agent_idx on public.agent_facts (agent_id);
alter table public.agent_facts enable row level security;

-- Only the owner reads or edits an agent's facts. Other members get answers, never the raw facts.
create policy "Owners manage their agent's facts" on public.agent_facts for all to authenticated
  using (exists (select 1 from public.agents a where a.id = agent_facts.agent_id and a.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.agents a where a.id = agent_facts.agent_id and a.owner_id = (select auth.uid())));

-- Live updates: clients subscribe to new messages in rooms they belong to (row-level security applies).
alter publication supabase_realtime add table public.messages;
