-- Core schema: profiles, rooms, membership, agents, messages, usage.
-- Row-level security is on for every table. Clients can only see rooms they belong to.
-- Agents and usage are written by server code, which enforces the policy layer.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  host_id uuid not null references public.profiles (id) on delete cascade,
  billing_mode text not null default 'host_pays' check (billing_mode in ('host_pays', 'member_pays')),
  monthly_cap_cents integer check (monthly_cap_cents is null or monthly_cap_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.room_members (
  room_id uuid not null references public.rooms (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, profile_id)
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  autonomy text not null default 'helpful' check (autonomy in ('quiet', 'helpful', 'trusted')),
  paused boolean not null default false,
  rate_limit_per_minute integer not null default 3 check (rate_limit_per_minute between 1 and 30),
  max_thread_agent_turns integer not null default 20 check (max_thread_agent_turns between 1 and 200),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  author_profile_id uuid references public.profiles (id) on delete set null,
  author_agent_id uuid references public.agents (id) on delete set null,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  check ((author_profile_id is null) <> (author_agent_id is null))
);

create table public.usage_events (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.rooms (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  payer_profile_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null,
  model text not null,
  input_tokens integer not null check (input_tokens >= 0),
  output_tokens integer not null check (output_tokens >= 0),
  cost_cents integer not null default 0 check (cost_cents >= 0),
  created_at timestamptz not null default now()
);

create index messages_room_created_idx on public.messages (room_id, created_at);
create index room_members_profile_idx on public.room_members (profile_id);
create index agents_room_idx on public.agents (room_id);
create index usage_events_room_created_idx on public.usage_events (room_id, created_at);
create index rooms_host_idx on public.rooms (host_id);

-- Membership check used by policies. Security definer avoids recursion through room_members' own policy.
create or replace function public.is_room_member(_room uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.room_members
    where room_id = _room and profile_id = (select auth.uid())
  );
$$;
revoke execute on function public.is_room_member(uuid) from public, anon;
grant execute on function public.is_room_member(uuid) to authenticated;

-- The host is always a member of their own room.
create or replace function public.add_host_as_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.room_members (room_id, profile_id) values (new.id, new.host_id);
  return new;
end;
$$;
revoke execute on function public.add_host_as_member() from public, anon, authenticated;
create trigger rooms_add_host_as_member
  after insert on public.rooms
  for each row execute function public.add_host_as_member();

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.agents enable row level security;
alter table public.messages enable row level security;
alter table public.usage_events enable row level security;

create policy "Profiles visible to self and room-mates"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.room_members mine
      join public.room_members theirs on theirs.room_id = mine.room_id
      where mine.profile_id = (select auth.uid()) and theirs.profile_id = profiles.id
    )
  );
create policy "Users create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Members read their rooms"
  on public.rooms for select to authenticated
  using (public.is_room_member(id));
create policy "Users create rooms they host"
  on public.rooms for insert to authenticated
  with check (host_id = (select auth.uid()));
create policy "Hosts update their rooms"
  on public.rooms for update to authenticated
  using (host_id = (select auth.uid())) with check (host_id = (select auth.uid()));
create policy "Hosts delete their rooms"
  on public.rooms for delete to authenticated
  using (host_id = (select auth.uid()));

create policy "Members read room membership"
  on public.room_members for select to authenticated
  using (public.is_room_member(room_id));

create policy "Members read agents in their rooms"
  on public.agents for select to authenticated
  using (public.is_room_member(room_id));
create policy "Members add their own agents"
  on public.agents for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.is_room_member(room_id));
create policy "Owners and hosts change agents"
  on public.agents for update to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (select 1 from public.rooms r where r.id = agents.room_id and r.host_id = (select auth.uid()))
  )
  with check (true);
create policy "Owners and hosts remove agents"
  on public.agents for delete to authenticated
  using (
    owner_id = (select auth.uid())
    or exists (select 1 from public.rooms r where r.id = agents.room_id and r.host_id = (select auth.uid()))
  );

create policy "Members read messages in their rooms"
  on public.messages for select to authenticated
  using (public.is_room_member(room_id));
create policy "Members post their own messages"
  on public.messages for insert to authenticated
  with check (
    author_profile_id = (select auth.uid())
    and author_agent_id is null
    and public.is_room_member(room_id)
  );

create policy "Payers and hosts read usage"
  on public.usage_events for select to authenticated
  using (
    payer_profile_id = (select auth.uid())
    or exists (select 1 from public.rooms r where r.id = usage_events.room_id and r.host_id = (select auth.uid()))
  );
