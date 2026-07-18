-- ============================================================================
-- Fix for "Sign in failed … status 500 / unexpected_failure" on the seeded
-- demo accounts.
--
-- When auth.users rows are inserted via SQL, Supabase Auth (GoTrue) fails on
-- login if the token columns are NULL — it scans them into non-nullable Go
-- strings and 500s. This sets them to empty strings for the demo accounts.
--
-- Run once in the Supabase SQL Editor if you seeded before this fix.
-- Safe to run repeatedly.
-- ============================================================================

update auth.users
set
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
where email in (
  'customer@metime.app',
  'marco@fadeco.com',
  'owner@metime.app',
  'owner2@metime.app'
);
