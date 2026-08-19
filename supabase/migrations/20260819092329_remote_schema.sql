set local check_function_bodies = off;

alter default privileges for role "postgres" in schema "public" revoke all on sequences from "anon";

alter default privileges for role "postgres" in schema "public" revoke all on sequences from "authenticated";

alter default privileges for role "postgres" in schema "public" revoke all on sequences from "service_role";

alter default privileges for role "postgres" in schema "public" revoke all on tables from "anon";

alter default privileges for role "postgres" in schema "public" revoke all on tables from "authenticated";

alter default privileges for role "postgres" in schema "public" revoke all on tables from "service_role";

create schema "private";

create table "public"."admin_users" (
  "user_id"    uuid                     not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "admin_users_pkey" primary key (user_id)
);

alter table "public"."admin_users"
  enable row level security;

create table "public"."project_sections" (
  "id"           uuid                     not null default gen_random_uuid(),
  "project_id"   uuid                     not null,
  "section_type" text                     not null,
  "eyebrow"      text,
  "heading"      text,
  "body"         text,
  "content"      jsonb                    not null default '{}'::jsonb,
  "theme"        text                     not null default 'light'::text,
  "sort_order"   integer                  not null default 0,
  "is_visible"   boolean                  not null default true,
  "created_at"   timestamp with time zone not null default now(),
  "updated_at"   timestamp with time zone not null default now(),
  constraint "project_sections_pkey" primary key (id),
  constraint "project_sections_theme_check" check ((theme = ANY (ARRAY['light'::text, 'dark'::text, 'accent'::text])))
);

alter table "public"."project_sections"
  enable row level security;

create table "public"."projects" (
  "id"              uuid                     not null default gen_random_uuid(),
  "slug"            text                     not null,
  "title"           text                     not null,
  "project_number"  text                     not null default '01'::text,
  "year"            integer                  not null default (EXTRACT(year from now()))::integer,
  "period"          text,
  "summary"         text                     not null default ''::text,
  "categories"      text[]                   not null default '{}'::text[],
  "roles"           text[]                   not null default '{}'::text[],
  "status"          text                     not null default 'draft'::text,
  "featured"        boolean                  not null default false,
  "sort_order"      integer                  not null default 0,
  "live_url"        text,
  "accent_color"    text                     not null default '#5961ED'::text,
  "secondary_color" text,
  "hero_image_path" text,
  "card_image_path" text,
  "published_at"    timestamp with time zone,
  "created_at"      timestamp with time zone not null default now(),
  "updated_at"      timestamp with time zone not null default now(),
  constraint "projects_pkey" primary key (id),
  constraint "projects_slug_check" check ((slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text)),
  constraint "projects_slug_key" unique (slug),
  constraint "projects_status_check" check ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))),
  constraint "projects_year_check" check (((year >= 2000) AND (year <= 2100)))
);

alter table "public"."projects"
  enable row level security;

create or replace function private.is_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path to ''
  AS $function$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$function$;

create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
  set search_path to ''
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

alter table "public"."admin_users"
  add constraint "admin_users_user_id_fkey" foreign key (user_id) references auth.users(id) on delete cascade;

alter table "public"."project_sections"
  add constraint "project_sections_project_id_fkey" foreign key (project_id) references public.projects(id) on delete cascade;

create index project_sections_project_sort_idx on public.project_sections using btree (project_id, sort_order);

create trigger set_project_sections_updated_at
  before update on public.project_sections
  for each row
  execute function public.set_updated_at();

create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

create policy "Admins can read own membership" on "public"."admin_users"
  for select
  to "authenticated"
  using ((user_id = ( select auth.uid() as uid)));

create policy "Admins can delete sections" on "public"."project_sections"
  for delete
  to "authenticated"
  using (( select private.is_admin() as is_admin));

create policy "Admins can insert sections" on "public"."project_sections"
  for insert
  to "authenticated"
  with check (( SELECT private.is_admin() AS is_admin));

create policy "Admins can update sections" on "public"."project_sections"
  for update
  to "authenticated"
  using (( select private.is_admin() as is_admin))
  with check (( SELECT private.is_admin() AS is_admin));

create policy "Public can read visible published sections" on "public"."project_sections"
  for select
  to "anon", "authenticated"
  using ((((is_visible = true) AND (exists ( select 1
   from public.projects
  where ((projects.id = project_sections.project_id) AND (projects.status = 'published'::text))))) or ( select private.is_admin() as is_admin)));

create policy "Admins can delete projects" on "public"."projects"
  for delete
  to "authenticated"
  using (( select private.is_admin() as is_admin));

create policy "Admins can insert projects" on "public"."projects"
  for insert
  to "authenticated"
  with check (( SELECT private.is_admin() AS is_admin));

create policy "Admins can update projects" on "public"."projects"
  for update
  to "authenticated"
  using (( select private.is_admin() as is_admin))
  with check (( SELECT private.is_admin() AS is_admin));

create policy "Public can read published projects" on "public"."projects"
  for select
  to "anon", "authenticated"
  using (((status = 'published'::text) or ( select private.is_admin() as is_admin)));

revoke all on function "private"."is_admin"() from public;

grant execute on function "private"."is_admin"() to "anon", "authenticated", "postgres";

grant execute on function "public"."set_updated_at"() to public, "anon", "authenticated", "postgres", "service_role";

grant create, usage on schema "private" to "postgres";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."admin_users" to "anon", "authenticated", "postgres", "service_role";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."project_sections" to "anon", "authenticated", "postgres", "service_role";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."projects" to "anon", "authenticated", "postgres", "service_role";

alter default privileges for role "postgres" in schema "public" grant select, update, usage on sequences to "anon";

alter default privileges for role "postgres" in schema "public" grant select, update, usage on sequences to "authenticated";

alter default privileges for role "postgres" in schema "public" grant select, update, usage on sequences to "service_role";

alter default privileges for role "postgres" in schema "public" grant execute on FUNCTIONS to "anon";

alter default privileges for role "postgres" in schema "public" grant execute on FUNCTIONS to "authenticated";

alter default privileges for role "postgres" in schema "public" grant execute on FUNCTIONS to "service_role";

alter default privileges for role "postgres" in schema "public" grant delete, insert, maintain, references, select, trigger, truncate, update on tables to "anon";

alter default privileges for role "postgres" in schema "public" grant delete, insert, maintain, references, select, trigger, truncate, update on tables to "authenticated";

alter default privileges for role "postgres" in schema "public" grant delete, insert, maintain, references, select, trigger, truncate, update on tables to "service_role";

-- =========================================================
-- PORTFOLIO MEDIA STORAGE POLICIES
-- =========================================================

create policy "portfolio_media_admin_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'portfolio-media'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "portfolio_media_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "portfolio_media_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'portfolio-media'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "portfolio_media_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);