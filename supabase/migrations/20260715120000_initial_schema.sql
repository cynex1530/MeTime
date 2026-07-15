-- ============================================================================
-- Me Time — Beauty & Grooming booking marketplace
-- Initial database schema for Supabase (Postgres)
--
-- Three roles share one app:
--   customer — discovers salons/artists, books appointments
--   artist   — manages own bookings, services, hours, public profile
--   manager  — salon owner: everything an artist has + locations + team
--
-- Apply with the Supabase CLI (`supabase db push` / `supabase migration up`)
-- or paste into the SQL editor of your Supabase project.
-- ============================================================================

create extension if not exists btree_gist;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type public.user_role as enum ('customer', 'artist', 'manager');

-- Audience filter used by the Him / Her / Anyone toggle on the customer Home
create type public.audience as enum ('him', 'her', 'both');

create type public.booking_status as enum ('confirmed', 'completed', 'cancelled');

-- ----------------------------------------------------------------------------
-- profiles — one row per auth user, created automatically on signup
-- ----------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null default 'customer',
  full_name   text not null default '',
  email       text not null default '',
  phone       text,
  avatar_url  text,
  city        text not null default 'San Francisco, CA',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- categories — the Home-screen grid tiles (Barber, Hair Salon, Nails, …)
-- Reference data seeded below; `audience` drives the Him / Her toggle.
-- ----------------------------------------------------------------------------

create table public.categories (
  id         text primary key,                -- 'barber', 'hair', 'nails', …
  name       text not null,
  audience   public.audience not null default 'both',
  image_url  text,
  sort_order int not null default 0
);

-- ----------------------------------------------------------------------------
-- salons — a location owned by a manager ("Locations" tab)
-- ----------------------------------------------------------------------------

create table public.salons (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles (id) on delete cascade,
  name            text not null,
  area            text,                        -- e.g. 'Downtown'
  city            text not null default 'San Francisco, CA',
  description     text,
  audience        public.audience not null default 'both',
  tag             text,                        -- e.g. 'Barbershop'
  cover_image_url text,
  sub_services    text[] not null default '{}',-- chips: Haircut, Beard, Color, …
  latitude        double precision,
  longitude       double precision,
  rating          numeric(2,1) not null default 0,  -- denormalized from reviews
  reviews_count   int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index salons_owner_idx on public.salons (owner_id);

-- Which categories a salon appears under in the customer flow
create table public.salon_categories (
  salon_id    uuid not null references public.salons (id) on delete cascade,
  category_id text not null references public.categories (id) on delete cascade,
  primary key (salon_id, category_id)
);

-- ----------------------------------------------------------------------------
-- artists — a worker attached to a salon. `profile_id` links to the auth user
-- once the artist has an account (managers create artists with an email +
-- temp password, so it may briefly be null until the invite is accepted).
-- ----------------------------------------------------------------------------

create table public.artists (
  id               uuid primary key default gen_random_uuid(),
  salon_id         uuid not null references public.salons (id) on delete cascade,
  profile_id       uuid unique references public.profiles (id) on delete set null,
  display_name     text not null,
  title            text,                       -- e.g. 'Master barber'
  bio              text,
  email            text,
  years_experience int not null default 0,
  rating           numeric(2,1) not null default 0,
  photo_url        text,                       -- discovery photo, portrait 3:4
  slot_minutes     int not null default 60 check (slot_minutes in (30, 45, 60, 90)),
  on_vacation      boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index artists_salon_idx on public.artists (salon_id);

-- ----------------------------------------------------------------------------
-- services — what an artist offers (name / duration / price rows)
-- ----------------------------------------------------------------------------

create table public.services (
  id               uuid primary key default gen_random_uuid(),
  artist_id        uuid not null references public.artists (id) on delete cascade,
  name             text not null,
  duration_minutes int not null check (duration_minutes > 0),
  price_cents      int not null default 0 check (price_cents >= 0), -- 0 = Free
  currency         text not null default 'USD',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create index services_artist_idx on public.services (artist_id);

-- ----------------------------------------------------------------------------
-- working_hours — weekly schedule per artist (Working days + Opens/Closes)
-- weekday: 0 = Sunday … 6 = Saturday (matches JS Date.getDay())
-- ----------------------------------------------------------------------------

create table public.working_hours (
  id        uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists (id) on delete cascade,
  weekday   smallint not null check (weekday between 0 and 6),
  opens_at  time not null default '09:00',
  closes_at time not null default '18:00',
  unique (artist_id, weekday),
  check (closes_at > opens_at)
);

-- ----------------------------------------------------------------------------
-- time_off — vacations / blocked date ranges per artist ("Add time off")
-- ----------------------------------------------------------------------------

create table public.time_off (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references public.artists (id) on delete cascade,
  starts_on  date not null,
  ends_on    date not null,
  reason     text,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create index time_off_artist_idx on public.time_off (artist_id);

-- ----------------------------------------------------------------------------
-- bookings — an appointment. Service details are snapshotted so history
-- survives later edits to the service catalog.
-- ----------------------------------------------------------------------------

create table public.bookings (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references public.profiles (id) on delete set null,
  salon_id         uuid references public.salons (id) on delete set null,
  artist_id        uuid references public.artists (id) on delete set null,
  service_id       uuid references public.services (id) on delete set null,
  -- snapshot fields
  service_name     text not null,
  duration_minutes int not null,
  price_cents      int not null default 0,
  currency         text not null default 'USD',
  customer_name    text not null default '',
  customer_phone   text,
  -- schedule
  starts_at        timestamptz not null,
  ends_at          timestamptz not null,
  status           public.booking_status not null default 'confirmed',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (ends_at > starts_at),
  -- no double-booking: an artist can't hold two confirmed overlapping slots
  constraint bookings_no_overlap exclude using gist (
    artist_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed')
);

create index bookings_customer_idx on public.bookings (customer_id, starts_at);
create index bookings_artist_idx   on public.bookings (artist_id, starts_at);
create index bookings_salon_idx    on public.bookings (salon_id, starts_at);

-- ----------------------------------------------------------------------------
-- reviews — feed the salon rating / review count shown on salon cards
-- ----------------------------------------------------------------------------

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid unique references public.bookings (id) on delete set null,
  customer_id uuid references public.profiles (id) on delete set null,
  salon_id    uuid not null references public.salons (id) on delete cascade,
  artist_id   uuid references public.artists (id) on delete set null,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

create index reviews_salon_idx on public.reviews (salon_id);

-- ============================================================================
-- Triggers & functions
-- ============================================================================

-- Create a profile row whenever an auth user signs up. The app passes
-- `full_name` and `role` in auth signup options.data (user metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'customer')
  )
  on conflict (id) do nothing;

  -- If a manager pre-created this artist by email, link the accounts.
  update public.artists
     set profile_id = new.id
   where profile_id is null
     and email is not null
     and lower(email) = lower(coalesce(new.email, ''));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch  before update on public.profiles  for each row execute function public.touch_updated_at();
create trigger salons_touch    before update on public.salons    for each row execute function public.touch_updated_at();
create trigger artists_touch   before update on public.artists   for each row execute function public.touch_updated_at();
create trigger bookings_touch  before update on public.bookings  for each row execute function public.touch_updated_at();

-- Recompute a salon's denormalized rating whenever its reviews change
create or replace function public.refresh_salon_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid := coalesce(new.salon_id, old.salon_id);
begin
  update public.salons s
     set rating        = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.salon_id = sid), 0),
         reviews_count = (select count(*) from public.reviews r where r.salon_id = sid)
   where s.id = sid;
  return coalesce(new, old);
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_salon_rating();

-- ----------------------------------------------------------------------------
-- RLS helper functions (security definer so policies don't recurse)
-- ----------------------------------------------------------------------------

create or replace function public.my_role()
returns public.user_role
language sql stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.owns_salon(sid uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.salons where id = sid and owner_id = auth.uid()
  );
$$;

create or replace function public.is_my_artist_row(aid uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.artists where id = aid and profile_id = auth.uid()
  );
$$;

-- True when the current user manages the salon this artist works at
create or replace function public.manages_artist(aid uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.artists a
      join public.salons s on s.id = a.salon_id
     where a.id = aid and s.owner_id = auth.uid()
  );
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.salons           enable row level security;
alter table public.salon_categories enable row level security;
alter table public.artists          enable row level security;
alter table public.services         enable row level security;
alter table public.working_hours    enable row level security;
alter table public.time_off         enable row level security;
alter table public.bookings         enable row level security;
alter table public.reviews          enable row level security;

-- profiles: you can read/update yourself; salon owners can read the profiles
-- of artists on their team (for the Team screen)
create policy "profiles: read own"
  on public.profiles for select
  using (id = auth.uid()
         or exists (select 1 from public.artists a
                     where a.profile_id = profiles.id
                       and public.manages_artist(a.id)));

create policy "profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- categories: public reference data
create policy "categories: readable by everyone"
  on public.categories for select
  using (true);

-- salons: everyone can browse; only the owning manager can write
create policy "salons: readable by everyone"
  on public.salons for select
  using (true);

create policy "salons: managers insert own"
  on public.salons for insert
  with check (owner_id = auth.uid() and public.my_role() = 'manager');

create policy "salons: owner updates"
  on public.salons for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "salons: owner deletes"
  on public.salons for delete
  using (owner_id = auth.uid());

-- salon_categories: follow the salon
create policy "salon_categories: readable by everyone"
  on public.salon_categories for select
  using (true);

create policy "salon_categories: owner writes"
  on public.salon_categories for all
  using (public.owns_salon(salon_id))
  with check (public.owns_salon(salon_id));

-- artists: everyone can browse (customer discovery); the salon owner manages
-- the team; an artist can update their own public profile
create policy "artists: readable by everyone"
  on public.artists for select
  using (true);

create policy "artists: salon owner inserts"
  on public.artists for insert
  with check (public.owns_salon(salon_id));

create policy "artists: salon owner or self updates"
  on public.artists for update
  using (public.owns_salon(salon_id) or profile_id = auth.uid())
  with check (public.owns_salon(salon_id) or profile_id = auth.uid());

create policy "artists: salon owner deletes"
  on public.artists for delete
  using (public.owns_salon(salon_id));

-- services / working_hours / time_off: public read (needed to build the
-- booking form); the artist or their salon owner writes
create policy "services: readable by everyone"
  on public.services for select
  using (true);

create policy "services: artist or owner writes"
  on public.services for all
  using (public.is_my_artist_row(artist_id) or public.manages_artist(artist_id))
  with check (public.is_my_artist_row(artist_id) or public.manages_artist(artist_id));

create policy "working_hours: readable by everyone"
  on public.working_hours for select
  using (true);

create policy "working_hours: artist or owner writes"
  on public.working_hours for all
  using (public.is_my_artist_row(artist_id) or public.manages_artist(artist_id))
  with check (public.is_my_artist_row(artist_id) or public.manages_artist(artist_id));

create policy "time_off: readable by everyone"
  on public.time_off for select
  using (true);

create policy "time_off: artist or owner writes"
  on public.time_off for all
  using (public.is_my_artist_row(artist_id) or public.manages_artist(artist_id))
  with check (public.is_my_artist_row(artist_id) or public.manages_artist(artist_id));

-- bookings: visible to the customer, the booked artist, and the salon owner
create policy "bookings: participants read"
  on public.bookings for select
  using (customer_id = auth.uid()
         or public.is_my_artist_row(artist_id)
         or public.owns_salon(salon_id));

create policy "bookings: customer creates own"
  on public.bookings for insert
  with check (customer_id = auth.uid());

create policy "bookings: participants update"
  on public.bookings for update
  using (customer_id = auth.uid()
         or public.is_my_artist_row(artist_id)
         or public.owns_salon(salon_id))
  with check (customer_id = auth.uid()
              or public.is_my_artist_row(artist_id)
              or public.owns_salon(salon_id));

create policy "bookings: artist or owner deletes"
  on public.bookings for delete
  using (public.is_my_artist_row(artist_id) or public.owns_salon(salon_id));

-- reviews: everyone reads; a customer reviews their own completed booking
create policy "reviews: readable by everyone"
  on public.reviews for select
  using (true);

create policy "reviews: customer creates own"
  on public.reviews for insert
  with check (customer_id = auth.uid()
              and exists (select 1 from public.bookings b
                           where b.id = booking_id
                             and b.customer_id = auth.uid()));

create policy "reviews: customer updates own"
  on public.reviews for update
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "reviews: customer deletes own"
  on public.reviews for delete
  using (customer_id = auth.uid());

-- ============================================================================
-- Storage — one public bucket for all app imagery (category tiles, salon
-- covers, artist portraits, discovery photos)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media: authenticated upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "media: owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and owner = auth.uid());

create policy "media: owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and owner = auth.uid());

-- ============================================================================
-- Reference data — categories from the design (Him / Her sets; `both`
-- categories appear in either set and under "Anyone")
-- ============================================================================

insert into public.categories (id, name, audience, sort_order) values
  ('barber',   'Barber',         'him',  1),
  ('beard',    'Beard & Shave',  'him',  2),
  ('skincare', 'Skincare',       'him',  3),
  ('hair',     'Hair Salon',     'her',  1),
  ('nails',    'Nails',          'her',  2),
  ('lashes',   'Lashes & Brows', 'her',  3),
  ('waxing',   'Waxing',         'her',  4),
  ('tattoo',   'Tattoo',         'both', 5),
  ('solarium', 'Solarium',       'both', 6),
  ('massage',  'Massage',        'both', 7);
