-- Add NATSX Controller as a public developer portfolio project.
-- The live database already contains the same recruiter-facing project data;
-- this migration keeps future rebuilds and fresh environments consistent.

insert into public.projects (
  slug,
  title,
  project_number,
  year,
  period,
  summary,
  categories,
  roles,
  status,
  featured,
  sort_order,
  live_url,
  accent_color,
  secondary_color,
  published_at,
  updated_at,
  tech_stack,
  repository_url,
  project_status,
  engineering_highlights
)
values (
  'natsx-controller',
  'NATSX Controller',
  '05',
  2026,
  '2026',
  'An Android-to-Windows controller system that turns a phone into an Xbox 360-compatible gamepad through a shared cross-platform protocol, multi-touch input, transport health logic, and automatic connection recovery.',
  array['Systems Engineering','Mobile Development','Windows Development','Networking']::text[],
  array['Software Developer','Systems Engineer','Product Designer']::text[],
  'published',
  false,
  5,
  null,
  '#6D5BD0',
  '#EDF6E8',
  now(),
  now(),
  array['Kotlin','C#','.NET','WPF','Android','UDP','Bluetooth RFCOMM','USB AOA','HIDMaestro','GitHub Actions']::text[],
  'https://github.com/nafisajuliansahsaputra/natsx-controller',
  'Complete',
  array[
    'Cross-language Kotlin and C# protocol with shared framing, sequencing, integrity, and authenticated session semantics',
    'Smart Connection Manager designed around USB Direct, Wi-Fi, and Bluetooth with health scoring, hysteresis, cooldowns, and failover',
    'Independent Android multi-touch input engine with analog processing and full-state gamepad snapshots',
    'Windows controller-session safety with authoritative transport ownership, stale-state rejection, and neutral watchdog behavior',
    'Trusted local pairing and reconnect foundations without cloud accounts or internet dependency',
    'Automated Android and Windows build/test pipelines plus deterministic protocol and connection-policy coverage'
  ]::text[]
)
on conflict (slug) do update set
  title = excluded.title,
  project_number = excluded.project_number,
  year = excluded.year,
  period = excluded.period,
  summary = excluded.summary,
  categories = excluded.categories,
  roles = excluded.roles,
  status = excluded.status,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  live_url = excluded.live_url,
  accent_color = excluded.accent_color,
  secondary_color = excluded.secondary_color,
  published_at = coalesce(public.projects.published_at, excluded.published_at),
  updated_at = now(),
  tech_stack = excluded.tech_stack,
  repository_url = excluded.repository_url,
  project_status = excluded.project_status,
  engineering_highlights = excluded.engineering_highlights;

insert into public.project_translations (
  project_id, locale, title, period, summary, categories, roles, updated_at
)
select
  p.id,
  v.locale,
  v.title,
  v.period,
  v.summary,
  v.categories,
  v.roles,
  now()
from public.projects p
cross join (
  values
    (
      'en'::text,
      'NATSX Controller'::text,
      '2026'::text,
      'An Android-to-Windows controller system that turns a phone into an Xbox 360-compatible gamepad through a shared cross-platform protocol, multi-touch input, transport health logic, and automatic connection recovery.'::text,
      array['Systems Engineering','Mobile Development','Windows Development','Networking']::text[],
      array['Software Developer','Systems Engineer','Product Designer']::text[]
    ),
    (
      'id'::text,
      'NATSX Controller'::text,
      '2026'::text,
      'Sistem controller Android-ke-Windows yang mengubah ponsel menjadi gamepad kompatibel Xbox 360 melalui protokol lintas platform, input multi-touch, logika kesehatan koneksi, dan pemulihan koneksi otomatis.'::text,
      array['Systems Engineering','Mobile Development','Windows Development','Networking']::text[],
      array['Software Developer','Systems Engineer','Product Designer']::text[]
    ),
    (
      'de'::text,
      'NATSX Controller'::text,
      '2026'::text,
      'Ein Android-zu-Windows-Controller-System, das ein Smartphone über ein gemeinsames plattformübergreifendes Protokoll, Multi-Touch-Eingabe, Verbindungsbewertung und automatische Wiederherstellung in ein Xbox-360-kompatibles Gamepad verwandelt.'::text,
      array['Systems Engineering','Mobile Development','Windows Development','Networking']::text[],
      array['Software Developer','Systems Engineer','Product Designer']::text[]
    )
) as v(locale,title,period,summary,categories,roles)
where p.slug = 'natsx-controller'
on conflict (project_id, locale) do update set
  title = excluded.title,
  period = excluded.period,
  summary = excluded.summary,
  categories = excluded.categories,
  roles = excluded.roles,
  updated_at = now();

insert into public.project_sections (
  project_id, section_type, eyebrow, heading, body, content, theme, sort_order, is_visible
)
select p.id, s.section_type, s.eyebrow, s.heading, s.body, '{}'::jsonb, s.theme, s.sort_order, true
from public.projects p
cross join (
  values
    (
      'overview'::text,
      '01 / PROJECT OVERVIEW'::text,
      'Turning a phone into a real controller pipeline.'::text,
      'I built NATSX Controller as a local Android-to-Windows gamepad system rather than a simple remote-control interface. The Android app owns touch input and gamepad state, while the Windows receiver owns session safety, connection authority, and virtual-controller output.\n\nThe project combines mobile development, Windows desktop engineering, networking, protocol design, connection recovery, and low-level controller integration in one product.'::text,
      'light'::text,
      0
    ),
    (
      'narrative'::text,
      '02 / THE CHALLENGE'::text,
      'Keeping input stable while the connection changes underneath it.'::text,
      'A controller cannot afford stuck buttons, duplicated state, or a complete device reset whenever Wi-Fi drops or another transport becomes healthier. The system therefore separates virtual-controller lifetime from transport lifetime and treats every connection as a candidate that must prove it is healthy before taking authority.\n\nThat requirement shaped the protocol, watchdog behavior, reconnect logic, transport scoring, and handover rules.'::text,
      'light'::text,
      1
    ),
    (
      'statement'::text,
      '03 / CORE PRINCIPLE'::text,
      'One controller state. Multiple transports. No stuck input.'::text,
      null::text,
      'accent'::text,
      2
    ),
    (
      'narrative'::text,
      '04 / ENGINEERING'::text,
      'A transport-independent protocol shared by Kotlin and C#.'::text,
      'The Android and Windows sides encode the same complete GamepadState contract with shared sequence, timestamp, integrity, handshake, and session semantics. Full-state snapshots make recovery safer than relying only on button-edge events.\n\nSmart Connection Manager evaluates USB Direct, Wi-Fi, and Bluetooth using latency, jitter, loss, silence, hysteresis, cooldown, and failure history so switching is based on link health rather than a brittle static priority.'::text,
      'light'::text,
      3
    ),
    (
      'metrics'::text,
      '05 / ENGINEERING SCOPE'::text,
      'Built across mobile, desktop, protocol, transport, and safety boundaries.'::text,
      'The project demonstrates native Android input engineering, C#/.NET Windows development, cross-language protocol design, authenticated local connectivity, automatic failover logic, USB/Bluetooth/Wi-Fi transport work, virtual gamepad integration, and automated testing.'::text,
      'dark'::text,
      4
    )
) as s(section_type,eyebrow,heading,body,theme,sort_order)
where p.slug = 'natsx-controller'
and not exists (
  select 1
  from public.project_sections existing
  where existing.project_id = p.id
    and existing.sort_order = s.sort_order
);
