-- =========================================================
-- PROJECT MULTILINGUAL CONTENT
-- =========================================================
--
-- Structural / technical project data tetap berada di:
--
-- public.projects
-- public.project_sections
--
-- Copy yang dapat diterjemahkan disimpan secara terpisah.
--
-- Supported locales:
-- en = English
-- id = Bahasa Indonesia
-- de = Deutsch
--
-- Existing project / section columns tetap dipertahankan
-- sebagai legacy + safe fallback selama migrasi sistem.
-- =========================================================


-- =========================================================
-- PROJECT TRANSLATIONS
-- =========================================================

create table public.project_translations (
  project_id uuid not null,

  locale text not null,

  title text,

  period text,

  summary text,

  categories text[],

  roles text[],

  created_at timestamp with time zone
    not null
    default now(),

  updated_at timestamp with time zone
    not null
    default now(),

  constraint project_translations_pkey
    primary key (
      project_id,
      locale
    ),

  constraint project_translations_project_id_fkey
    foreign key (
      project_id
    )
    references public.projects (
      id
    )
    on delete cascade,

  constraint project_translations_locale_check
    check (
      locale in (
        'en',
        'id',
        'de'
      )
    )
);


alter table public.project_translations
  enable row level security;


create index project_translations_locale_project_idx
  on public.project_translations (
    locale,
    project_id
  );


create trigger set_project_translations_updated_at
  before update
  on public.project_translations
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- PROJECT SECTION TRANSLATIONS
-- =========================================================

create table public.project_section_translations (
  section_id uuid not null,

  locale text not null,

  eyebrow text,

  heading text,

  body text,

  /*
   * Hanya locale-specific overrides.
   *
   * Jangan duplikasi asset/media object ke sini.
   *
   * Contoh nantinya:
   *
   * image:
   * {
   *   "image": {
   *     "alt": "...",
   *     "caption": "..."
   *   }
   * }
   *
   * quote:
   * {
   *   "quote": {
   *     "text": "...",
   *     "source": "...",
   *     "context": "..."
   *   }
   * }
   *
   * Base project_sections.content tetap menjadi
   * source of truth untuk media dan struktur.
   */
  content jsonb
    not null
    default '{}'::jsonb,

  created_at timestamp with time zone
    not null
    default now(),

  updated_at timestamp with time zone
    not null
    default now(),

  constraint project_section_translations_pkey
    primary key (
      section_id,
      locale
    ),

  constraint project_section_translations_section_id_fkey
    foreign key (
      section_id
    )
    references public.project_sections (
      id
    )
    on delete cascade,

  constraint project_section_translations_locale_check
    check (
      locale in (
        'en',
        'id',
        'de'
      )
    )
);


alter table public.project_section_translations
  enable row level security;


create index project_section_translations_locale_section_idx
  on public.project_section_translations (
    locale,
    section_id
  );


create trigger set_project_section_translations_updated_at
  before update
  on public.project_section_translations
  for each row
  execute function public.set_updated_at();


-- =========================================================
-- PROJECT TRANSLATION RLS
-- =========================================================

create policy
  "Admins can insert project translations"
on public.project_translations
for insert
to authenticated
with check (
  (
    select private.is_admin()
  )
);


create policy
  "Admins can update project translations"
on public.project_translations
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


create policy
  "Admins can delete project translations"
on public.project_translations
for delete
to authenticated
using (
  (
    select private.is_admin()
  )
);


create policy
  "Public can read published project translations"
on public.project_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects
    where
      projects.id =
        project_translations.project_id
      and projects.status =
        'published'
  )
  or (
    select private.is_admin()
  )
);


-- =========================================================
-- PROJECT SECTION TRANSLATION RLS
-- =========================================================

create policy
  "Admins can insert section translations"
on public.project_section_translations
for insert
to authenticated
with check (
  (
    select private.is_admin()
  )
);


create policy
  "Admins can update section translations"
on public.project_section_translations
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


create policy
  "Admins can delete section translations"
on public.project_section_translations
for delete
to authenticated
using (
  (
    select private.is_admin()
  )
);


create policy
  "Public can read visible published section translations"
on public.project_section_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.project_sections
    join public.projects
      on projects.id =
        project_sections.project_id
    where
      project_sections.id =
        project_section_translations.section_id
      and project_sections.is_visible =
        true
      and projects.status =
        'published'
  )
  or (
    select private.is_admin()
  )
);


-- =========================================================
-- TABLE PRIVILEGES
-- =========================================================

grant select
on table public.project_translations
to anon;


grant select,
      insert,
      update,
      delete
on table public.project_translations
to authenticated;


grant all privileges
on table public.project_translations
to postgres,
   service_role;


grant select
on table public.project_section_translations
to anon;


grant select,
      insert,
      update,
      delete
on table public.project_section_translations
to authenticated;


grant all privileges
on table public.project_section_translations
to postgres,
   service_role;


-- =========================================================
-- BACKFILL EXISTING ENGLISH PROJECT COPY
-- =========================================================
--
-- Existing project copy saat ini adalah English.
--
-- Kita copy ke translation table supaya English nanti
-- punya row resmi tanpa merusak legacy fields.
-- =========================================================

insert into public.project_translations (
  project_id,
  locale,
  title,
  period,
  summary,
  categories,
  roles
)
select
  id,
  'en',
  title,
  period,
  summary,
  categories,
  roles
from public.projects
on conflict (
  project_id,
  locale
)
do nothing;


-- =========================================================
-- BACKFILL EXISTING ENGLISH SECTION COPY
-- =========================================================
--
-- eyebrow / heading / body aman untuk dipindahkan.
--
-- content sengaja TIDAK disalin penuh.
--
-- Alasannya:
-- project_sections.content sekarang juga mengandung
-- media asset reference yang harus tetap shared antara
-- semua bahasa.
--
-- Public renderer nantinya akan merge translation
-- overrides ke base content.
-- =========================================================

insert into public.project_section_translations (
  section_id,
  locale,
  eyebrow,
  heading,
  body
)
select
  id,
  'en',
  eyebrow,
  heading,
  body
from public.project_sections
on conflict (
  section_id,
  locale
)
do nothing;