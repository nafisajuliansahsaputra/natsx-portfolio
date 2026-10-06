alter table public.projects
  add column if not exists project_status text not null default 'In Development';

update public.projects
set project_status = 'In Development',
    updated_at = now()
where slug = 'spall-spill';

update public.projects
set project_status = 'Complete',
    updated_at = now()
where slug = '5am-vision';

update public.projects
set project_status = 'Reconstruction',
    updated_at = now()
where slug = 'bast-management-system';

update public.projects
set project_status = 'V1 Complete',
    updated_at = now()
where slug = 'smart-attendance-system';
