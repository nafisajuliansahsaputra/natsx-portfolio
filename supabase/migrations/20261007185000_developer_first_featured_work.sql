-- Make the homepage Selected Work set developer-first while keeping 5AM Vision in the full archive.

update public.projects
set
  featured = case
    when slug in (
      'smart-attendance-system',
      'natsx-controller',
      'bast-management-system',
      'spall-spill'
    ) then true
    when slug = '5am-vision' then false
    else featured
  end,
  updated_at = now()
where slug in (
  'smart-attendance-system',
  'natsx-controller',
  'bast-management-system',
  'spall-spill',
  '5am-vision'
);
