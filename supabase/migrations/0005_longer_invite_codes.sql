-- 16 hex characters (64 bits) per invite, up from 10. Applies to rooms created from now on.
alter table public.rooms alter column invite_code set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
