-- Per-artist daily schedule config used to generate customer booking slots:
-- open/close hours, plus an optional lunch break. slot length already lives in
-- artists.slot_minutes.
alter table public.artists
  add column if not exists open_hour     text not null default '09:00',
  add column if not exists close_hour    text not null default '18:00',
  add column if not exists lunch_start   text,
  add column if not exists lunch_minutes int;
