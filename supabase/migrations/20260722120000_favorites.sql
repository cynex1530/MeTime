-- ============================================================================
-- favorites — a customer's saved artists (Favorites tab / quick re-booking)
-- One row per (customer, artist). RLS: a customer only sees/edits their own.
-- ============================================================================

create table if not exists public.favorites (
  customer_id uuid not null references public.profiles (id) on delete cascade,
  artist_id   uuid not null references public.artists (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (customer_id, artist_id)
);

create index if not exists favorites_customer_idx on public.favorites (customer_id, created_at desc);

alter table public.favorites enable row level security;

create policy "favorites: owner reads"
  on public.favorites for select
  using (customer_id = auth.uid());

create policy "favorites: owner writes"
  on public.favorites for all
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
