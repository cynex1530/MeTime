-- ============================================================================
-- Me Time — demo seed data (LOCAL / STAGING ONLY — do not run in production)
--
-- Mirrors the sample data from the design prototype:
--   * 4 demo accounts (customer / artist / manager / second owner)
--   * 8 salons across the design's categories
--   * artists, services, working hours, and two upcoming bookings
--
-- All demo accounts sign in with the password: password123
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Demo auth users (works on local Supabase; the on_auth_user_created trigger
-- creates the matching public.profiles rows)
-- ----------------------------------------------------------------------------

-- NOTE: the token columns (confirmation_token, recovery_token, email_change,
-- email_change_token_new) MUST be '' and not NULL — GoTrue (Supabase Auth)
-- scans them into non-nullable strings on login and returns a 500
-- (unexpected_failure) if they are NULL.
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'customer@metime.app',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Alex Morgan","role":"customer"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'marco@fadeco.com',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Marco Rossi","role":"artist"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated', 'owner@metime.app',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Jordan Lee","role":"manager"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004',
   'authenticated', 'authenticated', 'owner2@metime.app',
   crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Sam Rivera","role":"manager"}', now(), now(), '', '', '', '');

insert into auth.identities
  (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select id::text, id,
       jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
       'email', now(), now(), now()
  from auth.users
 where id in ('10000000-0000-0000-0000-000000000001',
              '10000000-0000-0000-0000-000000000002',
              '10000000-0000-0000-0000-000000000003',
              '10000000-0000-0000-0000-000000000004');

update public.profiles set phone = '+1 555 0142' where id = '10000000-0000-0000-0000-000000000002';

-- ----------------------------------------------------------------------------
-- Salons (from the prototype's SALONS list)
-- ----------------------------------------------------------------------------

insert into public.salons
  (id, owner_id, name, area, city, description, audience, tag, sub_services) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003',
   'Fade & Co.', 'Downtown', 'San Francisco, CA',
   'A modern barbershop built on precision cuts and good conversation. Walk-ins welcome, but our regulars book ahead for the chair by the window.',
   'him', 'Barbershop', '{Haircut,Beard,Shave}'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004',
   'Sharp Studio', 'SoMa', 'San Francisco, CA',
   'Full-service grooming lounge — cuts, hot-towel shaves, and skin treatments in a calm, minimal space.',
   'him', 'Grooming', '{Haircut,Beard,Treatment}'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004',
   'Bloom Hair Bar', 'Hayes Valley', 'San Francisco, CA',
   'Color specialists and cutters obsessed with healthy hair. Complimentary tea and a scalp massage with every visit.',
   'her', 'Hair salon', '{Color,Styling,Treatment}'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004',
   'Polish Room', 'Marina', 'San Francisco, CA',
   'Clean, quiet nail studio. Gel, structured manicures and hand-painted art by appointment only.',
   'her', 'Nail studio', '{}'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004',
   'Flutter Lash', 'Nob Hill', 'San Francisco, CA',
   'Lash artists and brow experts helping you wake up ready. Gentle, meticulous, and always on time.',
   'her', 'Lash & brow', '{Wax}'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004',
   'Ink Theory', 'Mission', 'San Francisco, CA',
   'Custom tattoos and fine-line work in a private, sterile studio. Book a consult and bring your ideas.',
   'both', 'Tattoo studio', '{}'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004',
   'Glow Solarium', 'Downtown', 'San Francisco, CA',
   'Premium tanning beds and spray tans with skin-safe tech and expert guidance for an even, natural glow.',
   'both', 'Solarium', '{}'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004',
   'Calm Room', 'Pacific Heights', 'San Francisco, CA',
   'Deep tissue, Swedish and sports massage from licensed therapists. Leave lighter than you came.',
   'both', 'Massage', '{}');

insert into public.salon_categories (salon_id, category_id) values
  ('20000000-0000-0000-0000-000000000001', 'barber'),
  ('20000000-0000-0000-0000-000000000001', 'beard'),
  ('20000000-0000-0000-0000-000000000002', 'barber'),
  ('20000000-0000-0000-0000-000000000002', 'beard'),
  ('20000000-0000-0000-0000-000000000002', 'skincare'),
  ('20000000-0000-0000-0000-000000000003', 'hair'),
  ('20000000-0000-0000-0000-000000000004', 'nails'),
  ('20000000-0000-0000-0000-000000000005', 'lashes'),
  ('20000000-0000-0000-0000-000000000005', 'waxing'),
  ('20000000-0000-0000-0000-000000000006', 'tattoo'),
  ('20000000-0000-0000-0000-000000000007', 'solarium'),
  ('20000000-0000-0000-0000-000000000008', 'massage');

-- ----------------------------------------------------------------------------
-- Artists (Fade & Co. team + Ink Theory team from the prototype)
-- Marco is linked to the demo artist auth account.
-- ----------------------------------------------------------------------------

insert into public.artists
  (id, salon_id, profile_id, display_name, title, bio, email, years_experience, rating) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002', 'Marco Rossi', 'Master barber',
   'Master barber, 8 years turning good hair into great days.', 'marco@fadeco.com', 8, 4.9),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
   null, 'Danny Kim', 'Barber', null, 'danny@fadeco.com', 5, 4.8),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001',
   null, 'Ava Stone', 'Stylist', null, 'ava@fadeco.com', 4, 4.9),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000006',
   null, 'Lena Voss', 'Fine-line artist', null, 'lena@inktheory.com', 7, 5.0),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006',
   null, 'Rae Ortiz', 'Custom artist', null, 'rae@inktheory.com', 6, 4.9);

update public.artists set phone = '+1 555 0142' where id = '30000000-0000-0000-0000-000000000001';
update public.artists set phone = '+1 555 0143' where id = '30000000-0000-0000-0000-000000000002';
update public.artists set phone = '+1 555 0144' where id = '30000000-0000-0000-0000-000000000003';
update public.artists set phone = '+1 555 0199' where id = '30000000-0000-0000-0000-000000000004';
update public.artists set phone = '+1 555 0198' where id = '30000000-0000-0000-0000-000000000005';

-- ----------------------------------------------------------------------------
-- Services
-- ----------------------------------------------------------------------------

insert into public.services (id, artist_id, name, duration_minutes, price_cents) values
  -- Marco (barber)
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Classic Cut', 45,  3500),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Skin Fade',   50,  4000),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Cut + Beard', 60,  5500),
  -- Danny (barber)
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Classic Cut', 45,  3500),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'Skin Fade',   50,  4000),
  -- Ava (stylist)
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', 'Cut & Style', 60,  6000),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', 'Blowout',     45,  4500),
  -- Lena (tattoo)
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004', 'Small Tattoo',  120, 12000),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000004', 'Custom Piece',  180, 25000),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000004', 'Consultation',  30,  0),
  -- Rae (tattoo)
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000005', 'Small Tattoo',  120, 12000);

-- ----------------------------------------------------------------------------
-- Working hours — Mon–Fri, 09:00–18:00 for every artist (weekday 1–5)
-- ----------------------------------------------------------------------------

insert into public.working_hours (artist_id, weekday, opens_at, closes_at)
select a.id, d, '09:00'::time, '18:00'::time
  from public.artists a
 cross join generate_series(1, 5) as d;

-- One vacation for Marco (matches the prototype's Jul 20–27 time off)
insert into public.time_off (artist_id, starts_on, ends_on, reason)
values ('30000000-0000-0000-0000-000000000001',
        date_trunc('month', now())::date + 19,
        date_trunc('month', now())::date + 26,
        'Vacation');

-- ----------------------------------------------------------------------------
-- Bookings — two upcoming appointments for the demo customer
-- ----------------------------------------------------------------------------

insert into public.bookings
  (customer_id, salon_id, artist_id, service_id, service_name, duration_minutes,
   price_cents, customer_name, customer_phone, starts_at, ends_at)
values
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002',
   'Skin Fade', 50, 4000, 'Alex Morgan', '+1 555 0142',
   (now()::date + 2) + time '14:00', (now()::date + 2) + time '14:50'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006',
   '30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000008',
   'Small Tattoo', 120, 12000, 'Alex Morgan', '+1 555 0199',
   (now()::date + 6) + time '11:00', (now()::date + 6) + time '13:00');

-- ----------------------------------------------------------------------------
-- Reviews — give the salons their design ratings (approximate)
-- ----------------------------------------------------------------------------

insert into public.reviews (customer_id, salon_id, rating, comment) values
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 5, 'Best fade in the city.'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006', 5, 'Lena is an incredible artist.');
