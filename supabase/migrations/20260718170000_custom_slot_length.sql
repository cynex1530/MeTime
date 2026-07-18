-- Allow custom slot lengths (previously restricted to 30/45/60/90). Any
-- positive number of minutes is now valid.
alter table public.artists drop constraint if exists artists_slot_minutes_check;
alter table public.artists add constraint artists_slot_minutes_check check (slot_minutes > 0);
