-- Keep the membership helper out of the public API. Policies still reference it by OID,
-- so moving it does not change what they allow.
create schema if not exists private;
alter function public.is_room_member(uuid) set schema private;
grant usage on schema private to authenticated;
grant execute on function private.is_room_member(uuid) to authenticated;
