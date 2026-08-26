-- =========================================================
-- HARDEN EXISTING PORTFOLIO TABLE PRIVILEGES
-- =========================================================
--
-- RLS remains the authorization layer for row-level access.
-- This migration removes broad PostgreSQL privileges that were
-- granted by the initial schema migration and restores only the
-- privileges actually required by the public portfolio and admin UI.
--
-- Public visitors:
-- - SELECT published/visible portfolio data through RLS
--
-- Authenticated users:
-- - SELECT own admin membership through RLS
-- - CRUD portfolio content only when admin RLS policies allow it
--
-- Explicitly NOT granted to anon/authenticated:
-- - TRUNCATE
-- - TRIGGER
-- - REFERENCES
-- =========================================================

revoke all privileges
on table public.admin_users
from anon, authenticated;

revoke all privileges
on table public.projects
from anon, authenticated;

revoke all privileges
on table public.project_sections
from anon, authenticated;

revoke all privileges
on table public.project_translations
from anon, authenticated;

revoke all privileges
on table public.project_section_translations
from anon, authenticated;

-- Admin membership is intentionally read-only from the application.
grant select
on table public.admin_users
to authenticated;

-- Public portfolio reads.
grant select
on table public.projects
to anon;

grant select
on table public.project_sections
to anon;

grant select
on table public.project_translations
to anon;

grant select
on table public.project_section_translations
to anon;

-- Authenticated admin application access.
-- RLS policies still decide whether each row operation is allowed.
grant select, insert, update, delete
on table public.projects
to authenticated;

grant select, insert, update, delete
on table public.project_sections
to authenticated;

grant select, insert, update, delete
on table public.project_translations
to authenticated;

grant select, insert, update, delete
on table public.project_section_translations
to authenticated;