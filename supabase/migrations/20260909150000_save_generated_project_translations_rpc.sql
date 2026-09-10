-- =========================================================
-- NATSX TRANSLATION ENGINE
-- ATOMIC GENERATED TRANSLATION SAVE
-- =========================================================
--
-- Tidak menambah table / column.
--
-- Function ini hanya menjadi
-- transaction boundary untuk:
--
-- public.project_translations
-- public.project_section_translations
--
-- Semua row tersimpan bersama-sama
-- atau rollback bersama-sama.
-- =========================================================


create or replace function
public.save_generated_project_translations(
  p_project_id uuid,
  p_project_rows jsonb,
  p_section_rows jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin

  -- =======================================================
  -- ADMIN ONLY
  -- =======================================================

  if not (
    select private.is_admin()
  ) then
    raise exception
      'Only portfolio administrators can save generated translations.'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- BASIC PAYLOAD VALIDATION
  -- =======================================================

  if jsonb_typeof(
    coalesce(
      p_project_rows,
      '[]'::jsonb
    )
  ) <> 'array' then
    raise exception
      'p_project_rows must be a JSON array.';
  end if;


  if jsonb_typeof(
    coalesce(
      p_section_rows,
      '[]'::jsonb
    )
  ) <> 'array' then
    raise exception
      'p_section_rows must be a JSON array.';
  end if;


  if not exists (
    select 1
    from public.projects
    where id = p_project_id
  ) then
    raise exception
      'Project does not exist.';
  end if;


  -- =======================================================
  -- PROJECT LOCALE VALIDATION
  -- =======================================================

  if exists (
    select 1
    from jsonb_to_recordset(
      coalesce(
        p_project_rows,
        '[]'::jsonb
      )
    ) as payload(
      locale text
    )
    where
      payload.locale not in (
        'id',
        'de'
      )
      or payload.locale is null
  ) then
    raise exception
      'Generated project translation contains an unsupported locale.';
  end if;


  -- =======================================================
  -- SECTION OWNERSHIP + LOCALE VALIDATION
  -- =======================================================

  if exists (
    select 1

    from jsonb_to_recordset(
      coalesce(
        p_section_rows,
        '[]'::jsonb
      )
    ) as payload(
      section_id uuid,
      locale text
    )

    left join public.project_sections
      on project_sections.id =
        payload.section_id
      and project_sections.project_id =
        p_project_id

    where
      payload.section_id is null
      or payload.locale is null
      or payload.locale not in (
        'id',
        'de'
      )
      or project_sections.id is null
  ) then
    raise exception
      'Generated section translation contains an invalid section or locale.';
  end if;


  -- =======================================================
  -- PROJECT TRANSLATIONS
  -- =======================================================

  insert into
    public.project_translations (
      project_id,
      locale,
      title,
      period,
      summary,
      categories,
      roles,
      updated_at
    )

  select
    p_project_id,

    payload.locale,

    nullif(
      btrim(
        payload.title
      ),
      ''
    ),

    nullif(
      btrim(
        payload.period
      ),
      ''
    ),

    nullif(
      btrim(
        payload.summary
      ),
      ''
    ),

    case
      when
        payload.categories is not null
        and cardinality(
          payload.categories
        ) > 0
      then
        payload.categories
      else
        null
    end,

    case
      when
        payload.roles is not null
        and cardinality(
          payload.roles
        ) > 0
      then
        payload.roles
      else
        null
    end,

    now()

  from jsonb_to_recordset(
    coalesce(
      p_project_rows,
      '[]'::jsonb
    )
  ) as payload(
    locale text,
    title text,
    period text,
    summary text,
    categories text[],
    roles text[]
  )

  on conflict (
    project_id,
    locale
  )

  do update set

    title =
      excluded.title,

    period =
      excluded.period,

    summary =
      excluded.summary,

    categories =
      excluded.categories,

    roles =
      excluded.roles,

    updated_at =
      now();


  -- =======================================================
  -- SECTION TRANSLATIONS
  -- =======================================================

  insert into
    public.project_section_translations (
      section_id,
      locale,
      eyebrow,
      heading,
      body,
      content,
      updated_at
    )

  select
    payload.section_id,

    payload.locale,

    nullif(
      btrim(
        payload.eyebrow
      ),
      ''
    ),

    nullif(
      btrim(
        payload.heading
      ),
      ''
    ),

    nullif(
      btrim(
        payload.body
      ),
      ''
    ),

    coalesce(
      payload.content,
      '{}'::jsonb
    ),

    now()

  from jsonb_to_recordset(
    coalesce(
      p_section_rows,
      '[]'::jsonb
    )
  ) as payload(
    section_id uuid,
    locale text,
    eyebrow text,
    heading text,
    body text,
    content jsonb
  )

  on conflict (
    section_id,
    locale
  )

  do update set

    eyebrow =
      excluded.eyebrow,

    heading =
      excluded.heading,

    body =
      excluded.body,

    content =
      excluded.content,

    updated_at =
      now();

end;
$$;


-- =========================================================
-- FUNCTION PRIVILEGES
-- =========================================================

revoke all
on function
public.save_generated_project_translations(
  uuid,
  jsonb,
  jsonb
)
from public;


revoke all
on function
public.save_generated_project_translations(
  uuid,
  jsonb,
  jsonb
)
from anon;


grant execute
on function
public.save_generated_project_translations(
  uuid,
  jsonb,
  jsonb
)
to authenticated;


grant execute
on function
public.save_generated_project_translations(
  uuid,
  jsonb,
  jsonb
)
to service_role;