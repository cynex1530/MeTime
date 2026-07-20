-- Store the reviewer's name on the review so dashboards can show it without a
-- profiles join (which RLS blocks for other users).
alter table public.reviews add column if not exists customer_name text;
