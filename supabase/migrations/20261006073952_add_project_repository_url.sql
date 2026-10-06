alter table public.projects
  add column if not exists repository_url text;

update public.projects
set repository_url = 'https://github.com/nafisajuliansahsaputra/spall-spill',
    updated_at = now()
where slug = 'spall-spill';

update public.projects
set repository_url = 'https://github.com/nafisajuliansahsaputra/attendance-system',
    updated_at = now()
where slug = 'smart-attendance-system';

update public.projects
set repository_url = 'https://github.com/nafisajuliansahsaputra/bast',
    updated_at = now()
where slug = 'bast-management-system';

update public.projects
set repository_url = null,
    updated_at = now()
where slug = '5am-vision';
