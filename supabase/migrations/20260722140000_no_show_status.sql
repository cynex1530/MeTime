-- ============================================================================
-- Add a 'no_show' booking status. The artist / salon owner can mark a past
-- appointment as a no-show from the Schedule screen. Postgres 12+ allows
-- ADD VALUE inside a migration transaction as long as it isn't used in the
-- same transaction (it isn't here).
-- ============================================================================

alter type public.booking_status add value if not exists 'no_show';
