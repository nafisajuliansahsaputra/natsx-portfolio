-- =========================================================
-- HARDEN DEFAULT DATA API PRIVILEGES
-- =========================================================
--
-- New objects in the public schema should not automatically
-- become reachable through the Supabase Data API.
--
-- Grant access explicitly in future migrations when needed.
-- =========================================================

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete
  on tables
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute
  on functions
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select
  on sequences
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute
  on functions
  from public;