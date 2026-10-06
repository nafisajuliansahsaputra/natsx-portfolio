alter table public.projects
  add column if not exists engineering_highlights text[] not null default '{}'::text[];

update public.projects
set engineering_highlights = array[
  'Tested PostgreSQL RLS and authenticated server-side mutation boundaries',
  'Draft-to-preview-to-publish workflow with staged first-publication transactions',
  'Stale-write protection for concurrent editing',
  'Destination-safety scanning and dedicated media sanitization services',
  'CI gates with Vitest, Playwright, pgTAP, type checks, and security scanning'
]::text[],
updated_at = now()
where slug = 'spall-spill';

update public.projects
set engineering_highlights = array[]::text[],
updated_at = now()
where slug = '5am-vision';

update public.projects
set engineering_highlights = array[
  'Server-side RBAC across Super Admin, Admin, and Staff workflows',
  'Backend-validated document lifecycle with revision, cancellation, archive, and restore transitions',
  'Server-side PDF generation with automatic document numbering',
  'UUID route identifiers to avoid exposing incremental database IDs',
  'Activity logging and two-factor authentication',
  'Automated quality gates with Pest, Larastan/PHPStan, linting, and TypeScript checks'
]::text[],
updated_at = now()
where slug = 'bast-management-system';

update public.projects
set engineering_highlights = array[
  'Atomic and idempotent attendance persistence',
  'Authenticated Device API designed for real RFID and camera hardware',
  'Server-side RBAC for system admin, homeroom teacher, and operator roles',
  'RFID identity with 1:1 face verification rather than broad face search',
  'Private FastAPI biometric service using YuNet and SFace',
  'Automated web and Python quality gates with Vitest and pytest'
]::text[],
updated_at = now()
where slug = 'smart-attendance-system';
