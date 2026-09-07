-- =========================================================
-- NATSX — DYNAMIC WORK CATEGORIES
-- =========================================================
--
-- Existing projects.categories remains untouched.
-- It continues to represent detailed disciplines.
--
-- New structure:
--
-- public.work_categories
-- public.project_work_categories
--
-- A project can belong to multiple work categories.
-- =========================================================


-- =========================================================
-- WORK CATEGORIES
-- =========================================================

create table public.work_categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  slug text not null,

  sort_order integer not null default 0,

  is_visible boolean not null default true,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint work_categories_name_check
    check (
      char_length(trim(name)) between 1 and 60
    ),

  constraint work_categories_slug_check
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint work_categories_slug_key
    unique (slug),

  constraint work_categories_sort_order_check
    check (
      sort_order >= 0
    )
);


alter table public.work_categories
  enable row level security;


create index work_categories_sort_idx
  on public.work_categories (
    sort_order,
    created_at
  );


create trigger set_work_categories_updated_at
  before update
  on public.work_categories
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- PROJECT ↔ CATEGORY RELATION
-- =========================================================

create table public.project_work_categories (
  project_id uuid not null,

  category_id uuid not null,

  created_at timestamptz not null default now(),

  constraint project_work_categories_pkey
    primary key (
      project_id,
      category_id
    ),

  constraint project_work_categories_project_id_fkey
    foreign key (
      project_id
    )
    references public.projects (
      id
    )
    on delete cascade,

  constraint project_work_categories_category_id_fkey
    foreign key (
      category_id
    )
    references public.work_categories (
      id
    )
    on delete cascade
);


alter table public.project_work_categories
  enable row level security;


create index project_work_categories_category_idx
  on public.project_work_categories (
    category_id,
    project_id
  );


-- =========================================================
-- CATEGORY RLS
-- =========================================================

create policy "Public can read visible work categories"
on public.work_categories
for select
to anon, authenticated
using (
  is_visible = true
  or (
    select private.is_admin()
  )
);


create policy "Admins can insert work categories"
on public.work_categories
for insert
to authenticated
with check (
  (
    select private.is_admin()
  )
);


create policy "Admins can update work categories"
on public.work_categories
for update
to authenticated
using (
  (
    select private.is_admin()
  )
)
with check (
  (
    select private.is_admin()
  )
);


create policy "Admins can delete work categories"
on public.work_categories
for delete
to authenticated
using (
  (
    select private.is_admin()
  )
);


-- =========================================================
-- PROJECT CATEGORY RLS
-- =========================================================

create policy "Public can read published project category links"
on public.project_work_categories
for select
to anon, authenticated
using (
  (
    exists (
      select 1
      from public.projects
      where
        projects.id =
          project_work_categories.project_id
        and projects.status = 'published'
    )

    and

    exists (
      select 1
      from public.work_categories
      where
        work_categories.id =
          project_work_categories.category_id
        and work_categories.is_visible = true
    )
  )

  or

  (
    select private.is_admin()
  )
);


create policy "Admins can insert project category links"
on public.project_work_categories
for insert
to authenticated
with check (
  (
    select private.is_admin()
  )
);


create policy "Admins can delete project category links"
on public.project_work_categories
for delete
to authenticated
using (
  (
    select private.is_admin()
  )
);


-- =========================================================
-- PRIVILEGES
-- =========================================================

grant select
on public.work_categories
to anon;

grant select
on public.project_work_categories
to anon;


grant
  select,
  insert,
  update,
  delete
on public.work_categories
to authenticated;


grant
  select,
  insert,
  delete
on public.project_work_categories
to authenticated;


grant all
on public.work_categories
to postgres, service_role;

grant all
on public.project_work_categories
to postgres, service_role;


-- =========================================================
-- INITIAL CATEGORIES
-- =========================================================
--
-- These are only starter records.
-- Dashboard can rename, hide, reorder,
-- add, or delete them later.
-- =========================================================

insert into public.work_categories (
  name,
  slug,
  sort_order,
  is_visible
)
values
  (
    'Development',
    'development',
    0,
    true
  ),
  (
    'Design',
    'design',
    1,
    true
  ),
  (
    'Motion',
    'motion',
    2,
    true
  ),
  (
    'Photography',
    'photography',
    3,
    true
  )
on conflict (slug)
do nothing;


-- =========================================================
-- INITIAL PROJECT MAPPING
-- =========================================================
--
-- Safe backfill based on project slug.
-- No generated UUID is hardcoded.
-- =========================================================


-- Spall Spill
-- Development + Design

insert into public.project_work_categories (
  project_id,
  category_id
)
select
  projects.id,
  work_categories.id
from public.projects
cross join public.work_categories
where
  projects.slug = 'spall-spill'
  and work_categories.slug in (
    'development',
    'design'
  )
on conflict do nothing;


-- 5AM Vision
-- Design

insert into public.project_work_categories (
  project_id,
  category_id
)
select
  projects.id,
  work_categories.id
from public.projects
cross join public.work_categories
where
  projects.slug = '5am-vision'
  and work_categories.slug = 'design'
on conflict do nothing;


-- BAST Management System
-- Development + Design

insert into public.project_work_categories (
  project_id,
  category_id
)
select
  projects.id,
  work_categories.id
from public.projects
cross join public.work_categories
where
  projects.slug = 'bast-management-system'
  and work_categories.slug in (
    'development',
    'design'
  )
on conflict do nothing;


-- Ibnu Ham Rempah
-- Design

insert into public.project_work_categories (
  project_id,
  category_id
)
select
  projects.id,
  work_categories.id
from public.projects
cross join public.work_categories
where
  projects.slug = 'ibnu-ham-rempah'
  and work_categories.slug = 'design'
on conflict do nothing;


-- NATSX Motion Studies
-- Motion + Design

insert into public.project_work_categories (
  project_id,
  category_id
)
select
  projects.id,
  work_categories.id
from public.projects
cross join public.work_categories
where
  projects.slug = 'natsx-motion-studies'
  and work_categories.slug in (
    'motion',
    'design'
  )
on conflict do nothing;


-- Nusantara Stay
-- Design

insert into public.project_work_categories (
  project_id,
  category_id
)
select
  projects.id,
  work_categories.id
from public.projects
cross join public.work_categories
where
  projects.slug = 'nusantara-stay'
  and work_categories.slug = 'design'
on conflict do nothing;