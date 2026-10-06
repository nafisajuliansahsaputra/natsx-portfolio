update public.projects
set project_status = 'Complete',
    updated_at = now()
where slug in (
  '5am-vision',
  'bast-management-system',
  'smart-attendance-system'
);

update public.projects
set project_status = 'In Development',
    updated_at = now()
where slug = 'spall-spill';
