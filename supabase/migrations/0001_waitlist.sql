-- Waitlist sign-ups.
-- Anonymous visitors can insert a row. Nobody can read rows through the API;
-- review them in the Supabase dashboard or with a service-role backend.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 5 and 254),
  name text check (char_length(name) <= 120),
  university text check (char_length(university) <= 120),
  weekly_plans text check (weekly_plans in ('1-2', '3-5', '6+')),
  created_at timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

create policy "Anyone can join the waitlist"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);
