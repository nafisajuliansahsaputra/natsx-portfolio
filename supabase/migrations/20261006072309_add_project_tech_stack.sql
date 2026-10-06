alter table public.projects
  add column if not exists tech_stack text[] not null default '{}'::text[];
