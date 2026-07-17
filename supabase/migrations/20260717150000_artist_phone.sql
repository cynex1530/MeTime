-- Customers call the artist instead of cancelling in-app, so artists need a
-- public contact number shown on the booking detail screen.
alter table public.artists add column phone text;
