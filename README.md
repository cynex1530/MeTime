# Me Time — Beauty & Grooming Booking App

Mobile marketplace for booking personal-care services (barbers, hair, nails, lashes, tattoo, solarium, massage) with **three roles in one app**:

| Role | Tabs | What they do |
|---|---|---|
| **Customer** | Home · Bookings · Profile | Discover salons/artists, book appointments |
| **Artist** | Bookings · Services · Profile | Manage schedule, services, hours, public profile |
| **Salon owner** | Locations · Team · Bookings · Services · Profile | Everything an artist has + locations & team |

Built with **React Native (Expo + expo-router + TypeScript)** for iOS and Android, backed by **Supabase** (Postgres + Auth + Storage). Ships with **Light and Dark themes** implemented from the design handoff's full token map — the toggle lives on the Profile screen, persists across launches, and defaults to the OS appearance.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (or `supabase init && supabase start` locally).
2. Run the schema migration — either:
   - **CLI:** `supabase db push` (migrations live in `supabase/migrations/`), or
   - **Dashboard:** paste `supabase/migrations/20260715120000_initial_schema.sql` into the SQL editor and run it.
3. *(Optional, local/staging only)* run `supabase/seed.sql` for demo data — 8 salons, artists, services, and demo accounts (`customer@metime.app`, `marco@fadeco.com` (artist), `owner@metime.app` (manager) — all with password `password123`).

The migration creates: `profiles` (auto-created on signup with a `role`), `categories`, `salons`, `salon_categories`, `artists`, `services`, `working_hours`, `time_off`, `bookings` (with a no-double-booking exclusion constraint), `reviews` (auto-refreshes salon ratings), a public `media` storage bucket, and row-level security for all three roles.

## 2. Run the app

```bash
npm install
cp .env.example .env    # fill in your Supabase URL + anon key
npx expo start          # then press i (iOS) / a (Android), or scan with Expo Go
```

> **Demo mode:** with no `.env`, the app runs entirely on bundled sample data (the prototype's dataset) so every screen and both themes can be reviewed without a backend. Sign in with any email/password and pick a role at registration.

If dependency versions drift from your Expo SDK, run `npx expo install --fix`.

## Project layout

```
app/                    expo-router routes
  (auth)/               welcome · login · register (role selection)
  (customer)/           home · salons · salon/[id] · artists · book · success · bookings · booking/[id] · profile
  (artist)/             schedule · services · profile
  (manager)/            locations · team · + shared schedule/services/profile
src/
  theme/                design tokens (light/dark map) + ThemeProvider
  components/           ui primitives, bottom Sheet, Segmented, SwipeRow, FloatingTabBar, ImageSlot
  screens/              shared artist/manager screens
  lib/                  supabase client · data api (with sample-data fallback) · formatters
  hooks/useAuth.tsx     Supabase auth + demo mode
supabase/
  migrations/           schema (tables, RLS, triggers, storage)
  seed.sql              demo data
```

## Design notes

- Tokens (colors, radii, type scale, spacing) follow the handoff in `src/theme/tokens.ts`; dark theme reproduces the component-specific visibility rules (brighter card hairlines, light icon strokes, glass badges that keep dark text, `#4c4e55` active segment pill, etc.).
- Swipe-to-delete on the artist Schedule and manager Team rows reveals a full-word red **Delete** action (~112 px).
- Bottom sheets slide up with 28 px top radius, drag grabber, and tap-to-dismiss scrim.
- The floating tab bar hides on immersive customer screens (artist carousel, booking form, success).
- All imagery renders as theme-aware placeholders (`ImageSlot`) until wired to real uploads in the `media` bucket.
