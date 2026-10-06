-- Sync Spall Spill portfolio copy with the active implementation state.

update public.projects
set
  period = '2026 / Ongoing',
  summary = 'Spall Spill is a creator- and owner-centric identity and structured discovery platform in active production implementation, with authentication, onboarding, Working-state persistence, Product/Resource draft foundations, publication foundations, URL safety, media sanitization, and security/testing infrastructure already integrated.',
  updated_at = now()
where slug = 'spall-spill';

update public.project_translations pt
set
  period = case pt.locale
    when 'en' then '2026 / Active Development'
    when 'id' then '2026 / Pengembangan Aktif'
    when 'de' then '2026 / Aktive Entwicklung'
    else pt.period
  end,
  summary = case pt.locale
    when 'en' then 'Spall Spill is a creator- and owner-centric identity and structured discovery platform in active production implementation, with authentication, onboarding, Working-state persistence, Product/Resource draft foundations, publication foundations, URL safety, media sanitization, and security/testing infrastructure already integrated.'
    when 'id' then 'Spall Spill adalah platform identity dan structured discovery untuk creator dan owner yang sedang dalam pengembangan produksi aktif, dengan authentication, onboarding, Working-state persistence, fondasi draft Product/Resource, fondasi publication, URL safety, media sanitization, serta infrastructure security/testing yang sudah terintegrasi.'
    when 'de' then 'Spall Spill ist eine owner- und creator-zentrierte Identity- und Discovery-Plattform in aktiver Production-Implementierung. Authentication, Onboarding, Working-State-Persistenz, Product/Resource-Draft-Grundlagen, Publication-Grundlagen, URL-Safety, Media-Sanitization sowie Security- und Testing-Infrastruktur sind bereits integriert.'
    else pt.summary
  end,
  updated_at = now()
where pt.project_id = (select id from public.projects where slug='spall-spill');

update public.project_sections
set eyebrow='CURRENT IMPLEMENTATION',
    heading='Active production implementation is underway.',
    body='Spall Spill has moved beyond product definition into active implementation. The current codebase already includes authentication and session foundations, Handle claiming, Basic Identity Working persistence, profile media foundations, Identity connections, Product and Resource draft foundations, stable Spill references, private preview, staged publication foundations, public-reader foundations, a dedicated URL safety scanner, a media sanitizer service, and automated CI/security gates.

The product remains In Development because the final first-publication wiring, remaining public/click/media transport, Product publication preparation, universal workspace handoff, browser/journey verification, live-provider verification, and release hardening are still being completed.'
where project_id=(select id from public.projects where slug='spall-spill') and sort_order=0;

update public.project_sections
set eyebrow='IMPLEMENTATION PROGRESS',
    heading='Core product foundations are already built into the active codebase.',
    body='The project is now measured by implemented system boundaries and verified engineering foundations, not only by product-definition scope.',
    content='{"metrics":{"items":[{"id":"owner-foundation","label":"Owner & Identity foundation","value":"BUILT","detail":"Authentication/session handling, Handle claim, Basic Identity Working persistence, starter composition, profile media foundation, and Identity connections are implemented."},{"id":"spill-foundation","label":"Spill data foundation","value":"BUILT","detail":"Product and Resource draft foundations, stable non-reused Spill references, private preview, and staged publication foundations are present in the active repository."},{"id":"safety","label":"Safety & verification","value":"GATED","detail":"URL safety scanning, media sanitization, PostgreSQL security tests, CI, SAST, secret scanning, and dependency scanning are integrated while final public transport and live-provider verification remain open."}],"columns":3}}'::jsonb
where project_id=(select id from public.projects where slug='spall-spill') and sort_order=4;

update public.project_sections
set eyebrow='CURRENT FRONTIER',
    heading=null,
    body=null,
    content='{"finale":{"title":"From product definition into active production implementation.","body":"The clean production codebase is already carrying the core owner, identity, draft, preview, safety, and publication foundations. The next work is focused on final first-publication wiring, public/click/media transport, Product publication preparation, universal workspace handoff, remaining browser/journey verification, live-provider verification where available, and release hardening.","ctaUrl":"https://github.com/nafisajuliansahsaputra/spall-spill","ctaLabel":"View source code"}}'::jsonb
where project_id=(select id from public.projects where slug='spall-spill') and sort_order=6;

update public.project_section_translations pst
set eyebrow='Current Implementation',
    heading='Active production implementation is underway.',
    body='Spall Spill has moved beyond product definition into active implementation. The current codebase already includes authentication and session foundations, Handle claiming, Basic Identity Working persistence, profile media foundations, Identity connections, Product and Resource draft foundations, stable Spill references, private preview, staged publication foundations, public-reader foundations, a dedicated URL safety scanner, a media sanitizer service, and automated CI/security gates.

The product remains In Development because the final first-publication wiring, remaining public/click/media transport, Product publication preparation, universal workspace handoff, browser/journey verification, live-provider verification, and release hardening are still being completed.'
where pst.locale='en'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=0);

update public.project_section_translations pst
set eyebrow='Implementasi Saat Ini',
    heading='Implementasi produksi aktif sudah berjalan.',
    body='Spall Spill sudah bergerak melewati tahap product definition dan masuk ke implementasi aktif. Codebase saat ini sudah mencakup fondasi authentication dan session, Handle claim, Basic Identity Working persistence, fondasi profile media, Identity connections, fondasi draft Product dan Resource, Spill reference yang stabil, private preview, fondasi staged publication, fondasi public reader, URL safety scanner khusus, media sanitizer service, serta automated CI/security gates.

Status proyek tetap In Development karena final first-publication wiring, sisa public/click/media transport, Product publication preparation, universal workspace handoff, browser/journey verification, live-provider verification, dan release hardening masih dikerjakan.'
where pst.locale='id'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=0);

update public.project_section_translations pst
set eyebrow='Aktuelle Implementierung',
    heading='Die aktive Production-Implementierung läuft bereits.',
    body='Spall Spill ist über die reine Produktdefinition hinaus und befindet sich in aktiver Implementierung. Die aktuelle Codebasis enthält bereits Authentication- und Session-Grundlagen, Handle Claiming, Basic Identity Working Persistence, Profile-Media-Grundlagen, Identity Connections, Product- und Resource-Draft-Grundlagen, stabile Spill-Referenzen, Private Preview, Staged-Publication-Grundlagen, Public-Reader-Grundlagen, einen dedizierten URL-Safety-Scanner, einen Media-Sanitizer-Service sowie automatisierte CI- und Security-Gates.

Das Projekt bleibt In Development, weil das finale First-Publication-Wiring, verbleibender Public/Click/Media-Transport, Product-Publication-Vorbereitung, Universal-Workspace-Handoff, Browser/Journey-Verifikation, Live-Provider-Verifikation und Release-Hardening noch abgeschlossen werden.'
where pst.locale='de'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=0);

update public.project_section_translations pst
set eyebrow='Implementation Progress',
    heading='Core product foundations are already built into the active codebase.',
    body='The project is now measured by implemented system boundaries and verified engineering foundations, not only by product-definition scope.',
    content='{"metrics":{"copyById":{"owner-foundation":{"label":"Owner & Identity foundation","value":"BUILT","detail":"Authentication/session handling, Handle claim, Basic Identity Working persistence, starter composition, profile media foundation, and Identity connections are implemented."},"spill-foundation":{"label":"Spill data foundation","value":"BUILT","detail":"Product and Resource draft foundations, stable non-reused Spill references, private preview, and staged publication foundations are present in the active repository."},"safety":{"label":"Safety & verification","value":"GATED","detail":"URL safety scanning, media sanitization, PostgreSQL security tests, CI, SAST, secret scanning, and dependency scanning are integrated while final public transport and live-provider verification remain open."}}}}'::jsonb
where pst.locale='en'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=4);

update public.project_section_translations pst
set eyebrow='Progress Implementasi',
    heading='Fondasi inti produk sudah dibangun di codebase aktif.',
    body='Progres proyek sekarang dinilai dari system boundary yang sudah diimplementasikan dan fondasi engineering yang sudah diverifikasi, bukan hanya dari scope product definition.',
    content='{"metrics":{"copyById":{"owner-foundation":{"label":"Fondasi Owner & Identity","value":"BUILT","detail":"Authentication/session handling, Handle claim, Basic Identity Working persistence, starter composition, fondasi profile media, dan Identity connections sudah diimplementasikan."},"spill-foundation":{"label":"Fondasi data Spill","value":"BUILT","detail":"Fondasi draft Product dan Resource, Spill reference yang stabil dan tidak didaur ulang, private preview, serta staged publication foundation sudah ada di repository aktif."},"safety":{"label":"Safety & verification","value":"GATED","detail":"URL safety scanning, media sanitization, PostgreSQL security tests, CI, SAST, secret scanning, dan dependency scanning sudah terintegrasi sementara final public transport dan live-provider verification masih terbuka."}}}}'::jsonb
where pst.locale='id'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=4);

update public.project_section_translations pst
set eyebrow='Implementierungsfortschritt',
    heading='Die zentralen Produktgrundlagen sind bereits in der aktiven Codebasis umgesetzt.',
    body='Der Fortschritt wird jetzt an implementierten Systemgrenzen und verifizierten Engineering-Grundlagen gemessen, nicht nur am Umfang der Produktdefinition.',
    content='{"metrics":{"copyById":{"owner-foundation":{"label":"Owner- & Identity-Grundlage","value":"BUILT","detail":"Authentication/Session Handling, Handle Claim, Basic Identity Working Persistence, Starter Composition, Profile-Media-Grundlage und Identity Connections sind implementiert."},"spill-foundation":{"label":"Spill-Datengrundlage","value":"BUILT","detail":"Product- und Resource-Draft-Grundlagen, stabile nicht wiederverwendete Spill-Referenzen, Private Preview und Staged-Publication-Grundlagen sind in der aktiven Repository vorhanden."},"safety":{"label":"Safety & Verification","value":"GATED","detail":"URL-Safety-Scanning, Media-Sanitization, PostgreSQL-Security-Tests, CI, SAST, Secret-Scanning und Dependency-Scanning sind integriert; finaler Public Transport und Live-Provider-Verifikation bleiben offen."}}}}'::jsonb
where pst.locale='de'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=4);

update public.project_section_translations pst
set eyebrow='Current Frontier',
    heading=null,
    body=null,
    content='{"finale":{"title":"From product definition into active production implementation.","body":"The clean production codebase is already carrying the core owner, identity, draft, preview, safety, and publication foundations. The next work is focused on final first-publication wiring, public/click/media transport, Product publication preparation, universal workspace handoff, remaining browser/journey verification, live-provider verification where available, and release hardening.","ctaUrl":"https://github.com/nafisajuliansahsaputra/spall-spill","ctaLabel":"View source code"}}'::jsonb
where pst.locale='en'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=6);

update public.project_section_translations pst
set eyebrow='Frontier Saat Ini',
    heading=null,
    body=null,
    content='{"finale":{"title":"Dari product definition menuju implementasi produksi aktif.","body":"Clean production codebase sekarang sudah membawa fondasi utama owner, identity, draft, preview, safety, dan publication. Pekerjaan berikutnya berfokus pada final first-publication wiring, public/click/media transport, Product publication preparation, universal workspace handoff, sisa browser/journey verification, live-provider verification jika tersedia, dan release hardening.","ctaUrl":"https://github.com/nafisajuliansahsaputra/spall-spill","ctaLabel":"Lihat source code"}}'::jsonb
where pst.locale='id'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=6);

update public.project_section_translations pst
set eyebrow='Aktueller Frontier',
    heading=null,
    body=null,
    content='{"finale":{"title":"Von der Produktdefinition zur aktiven Production-Implementierung.","body":"Die saubere Production-Codebasis trägt bereits die zentralen Grundlagen für Owner, Identity, Draft, Preview, Safety und Publication. Die nächsten Arbeiten konzentrieren sich auf das finale First-Publication-Wiring, Public/Click/Media-Transport, Product-Publication-Vorbereitung, Universal-Workspace-Handoff, verbleibende Browser/Journey-Verifikation, Live-Provider-Verifikation soweit verfügbar und Release-Hardening.","ctaUrl":"https://github.com/nafisajuliansahsaputra/spall-spill","ctaLabel":"Source Code ansehen"}}'::jsonb
where pst.locale='de'
  and pst.section_id=(select ps.id from public.project_sections ps join public.projects p on p.id=ps.project_id where p.slug='spall-spill' and ps.sort_order=6);
