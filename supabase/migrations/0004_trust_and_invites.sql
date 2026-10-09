-- Invite codes, per-friend trust levels, and the join function.

alter table public.rooms add column invite_code text not null unique
  default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

create table public.friend_trust (
  room_id uuid not null references public.rooms (id) on delete cascade,
  friend_id uuid not null references public.profiles (id) on delete cascade,
  level text not null default 'none' check (level in ('none', 'availability', 'plans', 'profile')),
  updated_at timestamptz not null default now(),
  primary key (room_id, friend_id)
);
alter table public.friend_trust enable row level security;

create policy "Hosts and the friend read trust levels"
  on public.friend_trust for select to authenticated
  using (
    friend_id = (select auth.uid())
    or exists (select 1 from public.rooms r where r.id = friend_trust.room_id and r.host_id = (select auth.uid()))
  );
create policy "Hosts set trust for room members"
  on public.friend_trust for insert to authenticated
  with check (
    exists (select 1 from public.rooms r where r.id = friend_trust.room_id and r.host_id = (select auth.uid()))
    and exists (select 1 from public.room_members m where m.room_id = friend_trust.room_id and m.profile_id = friend_trust.friend_id)
  );
create policy "Hosts change trust levels"
  on public.friend_trust for update to authenticated
  using (exists (select 1 from public.rooms r where r.id = friend_trust.room_id and r.host_id = (select auth.uid())))
  with check (exists (select 1 from public.rooms r where r.id = friend_trust.room_id and r.host_id = (select auth.uid())));
create policy "Hosts remove trust rows"
  on public.friend_trust for delete to authenticated
  using (exists (select 1 from public.rooms r where r.id = friend_trust.room_id and r.host_id = (select auth.uid())));

-- Joining is the one place a non-member can write membership. It requires the invite code.
create or replace function public.join_room_by_code(_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  _room uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in before joining a room';
  end if;
  select r.id into _room from public.rooms r where r.invite_code = _code;
  if _room is null then
    raise exception 'That invite is not valid';
  end if;
  insert into public.room_members (room_id, profile_id)
  values (_room, (select auth.uid()))
  on conflict do nothing;
  return _room;
end;
$$;
revoke execute on function public.join_room_by_code(text) from public, anon;
grant execute on function public.join_room_by_code(text) to authenticated;
