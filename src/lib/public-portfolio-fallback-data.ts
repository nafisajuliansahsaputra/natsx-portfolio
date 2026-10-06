/*
 * Emergency public snapshot.
 *
 * Generated from the live portfolio database so public routes can keep
 * rendering when Supabase API/egress is temporarily restricted.
 *
 * This file is deliberately data-only. CMS writes still go to Supabase;
 * the normal cached loaders remain the primary source whenever available.
 */

export const FALLBACK_PROJECT_ROWS = [
  {
    "id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "slug": "spall-spill",
    "title": "Spall Spill",
    "project_number": "01",
    "year": 2026,
    "period": "2026 / Ongoing",
    "summary": "Spall Spill is a creator- and owner-centric identity and structured discovery platform in active production implementation, with authentication, onboarding, Working-state persistence, Product/Resource draft foundations, publication foundations, URL safety, media sanitization, and security/testing infrastructure already integrated.",
    "categories": [
      "Product Design",
      "Web Development",
      "Creative Direction"
    ],
    "roles": [
      "Full-Stack Developer",
      "Product Designer"
    ],
    "tech_stack": [
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Supabase",
      "Cloudflare R2",
      "Vitest",
      "Playwright"
    ],
    "engineering_highlights": [
      "Tested PostgreSQL RLS and authenticated server-side mutation boundaries",
      "Draft-to-preview-to-publish workflow with staged first-publication transactions",
      "Stale-write protection for concurrent editing",
      "Destination-safety scanning and dedicated media sanitization services",
      "CI gates with Vitest, Playwright, pgTAP, type checks, and security scanning"
    ],
    "project_status": "In Development",
    "featured": true,
    "sort_order": 0,
    "live_url": null,
    "repository_url": "https://github.com/nafisajuliansahsaputra/spall-spill",
    "accent_color": "#234233",
    "secondary_color": "#F4EFE6",
    "hero_image_path": "projects/4d3fc40f-2366-49e8-9578-d9a7df99f34c/covers/hero/5eba666b-bee7-4366-bad4-7f5af838c65a.png",
    "card_image_path": "projects/4d3fc40f-2366-49e8-9578-d9a7df99f34c/covers/card/0375037a-ab15-49c9-9dbc-9748a89b0524.png",
    "updated_at": "2026-10-06 17:28:39.312185+00",
    "published_at": "2026-08-19 16:25:16.177384+00"
  },
  {
    "id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "slug": "5am-vision",
    "title": "5AM Vision",
    "project_number": "02",
    "year": 2026,
    "period": "2026 / Brand Build",
    "summary": "A modern creative agency identity system built around early ambition, collective growth, and a clear editorial presence.",
    "categories": [
      "Brand Identity",
      "Art Direction",
      "Digital Design"
    ],
    "roles": [
      "Brand Designer",
      "Art Director",
      "UI Designer"
    ],
    "tech_stack": [
          "Figma",
          "Adobe Illustrator",
          "Adobe Photoshop"
    ],
    "engineering_highlights": [],
    "project_status": "Complete",
    "featured": true,
    "sort_order": 2,
    "live_url": "https://fiveamvision.vercel.app/",
    "repository_url": null,
    "accent_color": "#0d1f3a",
    "secondary_color": "#FFFFFF",
    "hero_image_path": null,
    "card_image_path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/covers/card/fa681995-15a5-4810-b311-f7089c75afe9.png",
    "updated_at": "2026-10-06 07:59:18.991803+00",
    "published_at": "2026-08-19 16:25:16.177384+00"
  },
  {
    "id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "slug": "bast-management-system",
    "title": "BAST — Berita Acara Serah Terima Management System",
    "project_number": "03",
    "year": 2024,
    "period": "2024",
    "summary": "BAST is a full-stack web application for managing Berita Acara Serah Terima documents and related administrative data through a structured digital workflow.",
    "categories": [
      "Full-Stack Development",
      "UI/UX"
    ],
    "roles": [
      "Full-Stack Developer",
      "UI/UX Designer"
    ],
    "tech_stack": [
          "Laravel",
          "PHP",
          "React",
          "TypeScript",
          "Inertia.js",
          "Tailwind CSS",
          "Vite",
          "Pest"
    ],
    "engineering_highlights": [
          "Server-side RBAC across Super Admin, Admin, and Staff workflows",
          "Backend-validated document lifecycle with revision, cancellation, archive, and restore transitions",
          "Server-side PDF generation with automatic document numbering",
          "UUID route identifiers to avoid exposing incremental database IDs",
          "Activity logging and two-factor authentication",
          "Automated quality gates with Pest, Larastan/PHPStan, linting, and TypeScript checks"
    ],
    "project_status": "Complete",
    "featured": true,
    "sort_order": 3,
    "live_url": "https://bast.site.je/",
    "repository_url": "https://github.com/nafisajuliansahsaputra/bast",
    "accent_color": "#1d5d8f",
    "secondary_color": "#F8FAFB",
    "hero_image_path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/covers/hero/7752464e-b7ac-47fd-b538-d5da729dd14e.png",
    "card_image_path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/covers/card/5df15b4c-efa8-43c4-899d-6a81cbb09059.png",
    "updated_at": "2026-10-06 08:48:10.789483+00",
    "published_at": "2026-08-22 15:55:34.225+00"
  },
  {
    "id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "slug": "smart-attendance-system",
    "title": "Smart Attendance System",
    "project_number": "04",
    "year": 2025,
    "period": "2025 / Academic Project",
    "summary": "A full-stack, hardware-ready school attendance system combining RFID-based identity, 1:1 face verification, configurable attendance sessions, role-based staff workflows, device integration, and derived reporting through one centralized attendance model.",
    "categories": [
      "Full-Stack Development",
      "System Architecture",
      "Product Design",
      "Computer Vision Integration"
    ],
    "roles": [
      "Full-Stack Developer",
      "Product Designer",
      "System Architect"
    ],
    "tech_stack": [
          "Next.js",
          "React",
          "TypeScript",
          "PostgreSQL",
          "Supabase",
          "Python",
          "FastAPI",
          "OpenCV",
          "Vitest",
          "pytest"
    ],
    "engineering_highlights": [
          "Atomic and idempotent attendance persistence",
          "Authenticated Device API designed for real RFID and camera hardware",
          "Server-side RBAC for system admin, homeroom teacher, and operator roles",
          "RFID identity with 1:1 face verification rather than broad face search",
          "Private FastAPI biometric service using YuNet and SFace",
          "Automated web and Python quality gates with Vitest and pytest"
    ],
    "project_status": "Complete",
    "featured": true,
    "sort_order": 4,
    "live_url": "https://attendance-system-85872qh2v-nafisajuliansahsaputras-projects.vercel.app",
    "repository_url": "https://github.com/nafisajuliansahsaputra/attendance-system",
    "accent_color": "#2c7a57",
    "secondary_color": "#EDF5F0",
    "hero_image_path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/covers/hero/68c7184e-bd74-4ee8-9986-9271ae2829e9.png",
    "card_image_path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/covers/card/dc2cb815-4b01-47d7-a549-cb61bfb27db2.png",
    "updated_at": "2026-10-06 07:59:18.991803+00",
    "published_at": "2026-09-16 13:12:46.69+00"
  },
  {
    "id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "slug": "natsx-controller",
    "title": "NATSX Controller",
    "project_number": "05",
    "year": 2026,
    "period": "2026",
    "summary": "An Android-to-Windows controller system that turns a phone into an Xbox 360-compatible gamepad through a shared cross-platform protocol, multi-touch input, transport health logic, and automatic connection recovery.",
    "categories": ["Systems Engineering", "Mobile Development", "Windows Development", "Networking"],
    "roles": ["Software Developer", "Systems Engineer", "Product Designer"],
    "tech_stack": ["Kotlin", "C#", ".NET", "WPF", "Android", "UDP", "Bluetooth RFCOMM", "USB AOA", "HIDMaestro", "GitHub Actions"],
    "engineering_highlights": [
      "Cross-language Kotlin and C# protocol with shared framing, sequencing, integrity, and authenticated session semantics",
      "Smart Connection Manager designed around USB Direct, Wi-Fi, and Bluetooth with health scoring, hysteresis, cooldowns, and failover",
      "Independent Android multi-touch input engine with analog processing and full-state gamepad snapshots",
      "Windows controller-session safety with authoritative transport ownership, stale-state rejection, and neutral watchdog behavior",
      "Trusted local pairing and reconnect foundations without cloud accounts or internet dependency",
      "Automated Android and Windows build/test pipelines plus deterministic protocol and connection-policy coverage"
    ],
    "project_status": "Complete",
    "featured": false,
    "sort_order": 5,
    "live_url": null,
    "repository_url": "https://github.com/nafisajuliansahsaputra/natsx-controller",
    "accent_color": "#6D5BD0",
    "secondary_color": "#EDF6E8",
    "hero_image_path": null,
    "card_image_path": null,
    "updated_at": "2026-10-06 15:59:00+00",
    "published_at": "2026-10-06 15:59:00+00"
  }

];

export const FALLBACK_PROJECT_TRANSLATION_ROWS = [
  {
    "project_id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "locale": "de",
    "title": "NATSX Controller",
    "period": "2026",
    "summary": "Ein Android-zu-Windows-Controller-System, das ein Smartphone über ein gemeinsames plattformübergreifendes Protokoll, Multi-Touch-Eingabe, Verbindungsbewertung und automatische Wiederherstellung in ein Xbox-360-kompatibles Gamepad verwandelt.",
    "categories": ["Systems Engineering", "Mobile Development", "Windows Development", "Networking"],
    "roles": ["Software Developer", "Systems Engineer", "Product Designer"]
  },
  {
    "project_id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "locale": "en",
    "title": "NATSX Controller",
    "period": "2026",
    "summary": "An Android-to-Windows controller system that turns a phone into an Xbox 360-compatible gamepad through a shared cross-platform protocol, multi-touch input, transport health logic, and automatic connection recovery.",
    "categories": ["Systems Engineering", "Mobile Development", "Windows Development", "Networking"],
    "roles": ["Software Developer", "Systems Engineer", "Product Designer"]
  },
  {
    "project_id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "locale": "id",
    "title": "NATSX Controller",
    "period": "2026",
    "summary": "Sistem controller Android-ke-Windows yang mengubah ponsel menjadi gamepad kompatibel Xbox 360 melalui protokol lintas platform, input multi-touch, logika kesehatan koneksi, dan pemulihan koneksi otomatis.",
    "categories": ["Systems Engineering", "Mobile Development", "Windows Development", "Networking"],
    "roles": ["Software Developer", "Systems Engineer", "Product Designer"]
  },
  {
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "locale": "de",
    "title": "5AM Vision",
    "period": "2026 / Markenaufbau",
    "summary": "Ein modernes Identitätssystem für eine Kreativagentur – geprägt von frühem Ehrgeiz, gemeinschaftlichem Wachstum und einer klaren redaktionellen Präsenz.",
    "categories": [
      "Markenidentität",
      "Art Direction",
      "Digitales Design"
    ],
    "roles": [
      "Markendesigner",
      "Art Director",
      "UI-Designer"
    ]
  },
  {
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "locale": "en",
    "title": "5AM Vision",
    "period": "2026 / Brand Build",
    "summary": "A modern creative agency identity system built around early ambition, collective growth, and a clear editorial presence.",
    "categories": [
      "Brand Identity",
      "Art Direction",
      "Digital Design"
    ],
    "roles": [
      "Brand Designer",
      "Art Director",
      "UI Designer"
    ]
  },
  {
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "locale": "id",
    "title": "5AM Vision",
    "period": "2026 / Pengembangan Brand",
    "summary": "Sistem identitas agensi kreatif modern yang dibangun dari ambisi di pagi buta, pertumbuhan bersama, dan kehadiran editorial yang kuat.",
    "categories": [
      "Identitas Brand",
      "Art Direction",
      "Digital Design"
    ],
    "roles": [
      "Brand Designer",
      "Art Director",
      "UI Designer"
    ]
  },
  {
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "locale": "de",
    "title": "Spall Spill",
    "period": "2026 / Aktive Entwicklung",
    "summary": "Spall Spill ist eine owner- und creator-zentrierte Identity- und Discovery-Plattform in aktiver Production-Implementierung. Authentication, Onboarding, Working-State-Persistenz, Product/Resource-Draft-Grundlagen, Publication-Grundlagen, URL-Safety, Media-Sanitization sowie Security- und Testing-Infrastruktur sind bereits integriert.",
    "categories": [
      "Product Design",
      "Product Strategy",
      "Web Development"
    ],
    "roles": [
      "Full-Stack Developer",
      "Product Designer"
    ],
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "locale": "en",
    "title": "Spall Spill",
    "period": "2026 / Active Development",
    "summary": "Spall Spill is a creator- and owner-centric identity and structured discovery platform in active production implementation, with authentication, onboarding, Working-state persistence, Product/Resource draft foundations, publication foundations, URL safety, media sanitization, and security/testing infrastructure already integrated.",
    "categories": [
      "Product Design",
      "Product Strategy",
      "Web Development"
    ],
    "roles": [
      "Full-Stack Developer",
      "Product Designer"
    ],
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "locale": "id",
    "title": "Spall Spill",
    "period": "2026 / Pengembangan Aktif",
    "summary": "Spall Spill adalah platform identity dan structured discovery untuk creator dan owner yang sedang dalam pengembangan produksi aktif, dengan authentication, onboarding, Working-state persistence, fondasi draft Product/Resource, fondasi publication, URL safety, media sanitization, serta infrastructure security/testing yang sudah terintegrasi.",
    "categories": [
      "Product Design",
      "Product Strategy",
      "Web Development"
    ],
    "roles": [
      "Full-Stack Developer",
      "Product Designer"
    ],
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "locale": "de",
    "title": "Smart Attendance System",
    "period": "2025 / Akademisches Projekt",
    "summary": "Ein hardwaretaugliches Full-Stack-Schulverwaltungssystem für Anwesenheit, das RFID-basierte Identität, 1:1-Gesichtsverifizierung, konfigurierbare Anwesenheitssitzungen, rollenbasierte Workflows für Mitarbeitende, Geräteintegration und abgeleitete Berichte in einem zentralen Anwesenheitsmodell verbindet.",
    "categories": [
      "Full-Stack-Entwicklung",
      "Systemarchitektur",
      "Produktdesign",
      "Computer-Vision-Integration"
    ],
    "roles": [
      "Full-Stack-Entwickler",
      "Produktdesigner",
      "Systemarchitekt"
    ]
  },
  {
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "locale": "id",
    "title": "Smart Attendance System",
    "period": "2025 / Proyek Akademik",
    "summary": "Sistem absensi sekolah full-stack yang siap terhubung ke perangkat, memadukan identitas berbasis RFID, verifikasi wajah 1:1, sesi absensi yang dapat dikonfigurasi, alur kerja staf berbasis peran, integrasi perangkat, dan pelaporan turunan melalui satu model absensi terpusat.",
    "categories": [
      "Pengembangan Full-Stack",
      "Arsitektur Sistem",
      "Desain Produk",
      "Integrasi Computer Vision"
    ],
    "roles": [
      "Developer Full-Stack",
      "Desainer Produk",
      "Arsitek Sistem"
    ]
  },
  {
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "locale": "de",
    "title": "BAST — Berita Acara Serah Terima Management System",
    "period": "2024",
    "summary": "BAST ist eine Full-Stack-Webanwendung zur Verwaltung von Berita Acara Serah Terima-Dokumenten und den zugehörigen Verwaltungsdaten in einem strukturierten digitalen Workflow.",
    "categories": [
      "Full-Stack-Entwicklung",
      "UI/UX"
    ],
    "roles": [
      "Full-Stack-Entwickler",
      "UI/UX-Designer"
    ]
  },
  {
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "locale": "en",
    "title": "BAST — Berita Acara Serah Terima Management System",
    "period": "2024",
    "summary": "BAST is a full-stack web application for managing Berita Acara Serah Terima documents and related administrative data through a structured digital workflow.",
    "categories": [
      "Full-Stack Development",
      "UI/UX"
    ],
    "roles": [
      "Full-Stack Developer",
      "UI/UX Designer"
    ]
  },
  {
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "locale": "id",
    "title": "BAST — Berita Acara Serah Terima Management System",
    "period": "2024",
    "summary": "BAST adalah aplikasi web full-stack untuk mengelola dokumen Berita Acara Serah Terima dan data administratif terkait melalui workflow digital yang terstruktur.",
    "categories": [
      "Pengembangan Full-Stack",
      "UI/UX"
    ],
    "roles": [
      "Full-Stack Developer",
      "UI/UX Designer"
    ]
  }
];

export const FALLBACK_SECTION_ROWS = [
  {
    "id": "fd2f2859-8779-4d31-948e-35f29dbced10",
    "project_id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "section_type": "overview",
    "eyebrow": "01 / PROJECT OVERVIEW",
    "heading": "Turning a phone into a real controller pipeline.",
    "body": "I built NATSX Controller as a local Android-to-Windows gamepad system rather than a simple remote-control interface. The Android app owns touch input and gamepad state, while the Windows receiver owns session safety, connection authority, and virtual-controller output.\n\nThe project combines mobile development, Windows desktop engineering, networking, protocol design, connection recovery, and low-level controller integration in one product.",
    "content": {},
    "theme": "light",
    "sort_order": 0,
    "is_visible": true,
    "created_at": "2026-10-06 15:59:00+00"
  },
  {
    "id": "4149a4c5-c896-402e-ae72-ec3ccf3e67e1",
    "project_id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "section_type": "narrative",
    "eyebrow": "02 / THE CHALLENGE",
    "heading": "Keeping input stable while the connection changes underneath it.",
    "body": "A controller cannot afford stuck buttons, duplicated state, or a complete device reset whenever Wi-Fi drops or another transport becomes healthier. The system therefore separates virtual-controller lifetime from transport lifetime and treats every connection as a candidate that must prove it is healthy before taking authority.\n\nThat requirement shaped the protocol, watchdog behavior, reconnect logic, transport scoring, and handover rules.",
    "content": {},
    "theme": "light",
    "sort_order": 1,
    "is_visible": true,
    "created_at": "2026-10-06 15:59:00+00"
  },
  {
    "id": "26589653-1543-4b44-92ed-62073e9eaf02",
    "project_id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "section_type": "statement",
    "eyebrow": "03 / CORE PRINCIPLE",
    "heading": "One controller state. Multiple transports. No stuck input.",
    "body": null,
    "content": {},
    "theme": "accent",
    "sort_order": 2,
    "is_visible": true,
    "created_at": "2026-10-06 15:59:00+00"
  },
  {
    "id": "f421eb09-eb7b-4bb1-979b-0feec2c42c70",
    "project_id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "section_type": "narrative",
    "eyebrow": "04 / ENGINEERING",
    "heading": "A transport-independent protocol shared by Kotlin and C#.",
    "body": "The Android and Windows sides encode the same complete GamepadState contract with shared sequence, timestamp, integrity, handshake, and session semantics. Full-state snapshots make recovery safer than relying only on button-edge events.\n\nSmart Connection Manager evaluates USB Direct, Wi-Fi, and Bluetooth using latency, jitter, loss, silence, hysteresis, cooldown, and failure history so switching is based on link health rather than a brittle static priority.",
    "content": {},
    "theme": "light",
    "sort_order": 3,
    "is_visible": true,
    "created_at": "2026-10-06 15:59:00+00"
  },
  {
    "id": "136a8c2e-68ef-44d0-8183-2899e537b250",
    "project_id": "c0a7d3f6-6b2a-4e7a-9b4e-9c1f5e3d8a21",
    "section_type": "metrics",
    "eyebrow": "05 / ENGINEERING SCOPE",
    "heading": "Built across mobile, desktop, protocol, transport, and safety boundaries.",
    "body": "The project demonstrates native Android input engineering, C#/.NET Windows development, cross-language protocol design, authenticated local connectivity, automatic failover logic, USB/Bluetooth/Wi-Fi transport work, virtual gamepad integration, and automated testing.",
    "content": {},
    "theme": "dark",
    "sort_order": 4,
    "is_visible": true,
    "created_at": "2026-10-06 15:59:00+00"
  },
  {
    "id": "b5987f45-3b33-44c5-aa44-3a170f78637b",
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "section_type": "overview",
    "eyebrow": "01 / PROJECT OVERVIEW",
    "heading": "Building the identity from zero",
    "body": "I developed 5AM Vision’s identity from the ground up, shaping the visual direction and building a system that could work across brand, content, apparel, campaign materials, and digital applications.\r\n\r\nMy role covered brand identity, art direction, visual design, and the development of the wider brand language—from the core identity to how it appears across real touchpoints.",
    "content": {},
    "theme": "light",
    "sort_order": 0,
    "is_visible": true,
    "created_at": "2026-09-08 09:01:09.826863+00"
  },
  {
    "id": "f1163f6f-cd55-4e00-af5e-f192a1784f60",
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "section_type": "narrative",
    "eyebrow": "02 / THE CHALLENGE",
    "heading": "Giving ambition a clear visual direction.",
    "body": "The challenge was to create an identity that felt ambitious and disciplined without becoming overly corporate or generic.\r\n\r\n5AM needed to feel young, sharp, and contemporary, while still being structured enough to work consistently across different formats, audiences, and future creative output.",
    "content": {},
    "theme": "light",
    "sort_order": 1,
    "is_visible": true,
    "created_at": "2026-09-08 09:02:09.3092+00"
  },
  {
    "id": "26b54768-cbef-4c97-8417-bc7a61087e6c",
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "section_type": "statement",
    "eyebrow": "03 / DESIGN PRINCIPLE",
    "heading": "Disciplined enough to feel intentional. Flexible enough to keep moving.",
    "body": null,
    "content": {},
    "theme": "accent",
    "sort_order": 2,
    "is_visible": true,
    "created_at": "2026-09-08 09:02:48.435593+00"
  },
  {
    "id": "3f9796a0-84b6-4338-bd77-10c9070bc698",
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "section_type": "narrative",
    "eyebrow": "04 / CREATIVE DIRECTION",
    "heading": "Turning the idea into a visual system.",
    "body": "I built the direction around a restrained navy-led palette, bold typography, generous spacing, and a modular graphic language.\r\n\r\nThe goal was to create contrast between discipline and energy: a system that feels controlled in its structure, but still flexible enough for editorial layouts, campaigns, social content, and physical applications.",
    "content": {},
    "theme": "light",
    "sort_order": 3,
    "is_visible": true,
    "created_at": "2026-09-08 09:03:10.704999+00"
  },
  {
    "id": "b65b1707-fd93-4f9d-b001-3ffeddc57d6d",
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "section_type": "gallery",
    "eyebrow": "05 / IDENTITY SYSTEM",
    "heading": "A system, not just a logo.",
    "body": "The core identity brings the logo, typography, color, spacing, and graphic elements into one consistent framework.\r\n\r\nEach part was designed to support the others, allowing the brand to stay recognizable without relying on the logo alone.",
    "content": {
      "gallery": {
        "items": [
          {
            "id": "01ec05aa-540d-48a8-af43-775fcb296e3b",
            "alt": "",
            "size": "large",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/b65b1707-fd93-4f9d-b001-3ffeddc57d6d/gallery/89e95737-b67f-4cdb-99ec-3b53fbd5139c.png",
              "size": 140715,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "Logo.png"
            },
            "caption": ""
          },
          {
            "id": "d475548f-f9c5-4052-a775-23d27b9bd9ad",
            "alt": "",
            "size": "wide",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/b65b1707-fd93-4f9d-b001-3ffeddc57d6d/gallery/bf50d4ac-9106-4998-a839-5a7e705c3ec6.png",
              "size": 83058,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "Second.png"
            },
            "caption": ""
          },
          {
            "id": "34aac3b0-4659-4f84-8a98-21dd1c4782f9",
            "alt": "",
            "size": "wide",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/b65b1707-fd93-4f9d-b001-3ffeddc57d6d/gallery/20fc2b35-c795-43ff-a642-afda6cbf37ff.png",
              "size": 64493,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "Slogan.png"
            },
            "caption": ""
          },
          {
            "id": "038cb551-067a-419c-b304-092f6abc69a9",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/b65b1707-fd93-4f9d-b001-3ffeddc57d6d/gallery/c1eff367-fb91-4e2a-aee6-91bc9b7d436e.png",
              "size": 48420,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "Third.png"
            },
            "caption": ""
          },
          {
            "id": "b631cabd-36f9-4085-9b51-d861a928a6dd",
            "alt": "",
            "size": "large",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/b65b1707-fd93-4f9d-b001-3ffeddc57d6d/gallery/4f1968d2-e611-4554-bc80-de6c0e0d1237.png",
              "size": 1517649,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "Pattern.png"
            },
            "caption": ""
          },
          {
            "id": "47a53299-41fb-4a05-be4d-63acc447db12",
            "alt": "",
            "size": "tall",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/b65b1707-fd93-4f9d-b001-3ffeddc57d6d/gallery/16b308d7-addf-4d11-bc46-765ca1a2d7ce.png",
              "size": 109836,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "typeface.png"
            },
            "caption": ""
          },
          {
            "id": "53fca492-035e-48bb-8dc7-570b7ea278ec",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/b65b1707-fd93-4f9d-b001-3ffeddc57d6d/gallery/8d4fe51f-e6af-40a2-9a38-663e8a1cf6d9.png",
              "size": 27200,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "Pallete.png"
            },
            "caption": ""
          }
        ],
        "layout": "bento"
      }
    },
    "theme": "light",
    "sort_order": 4,
    "is_visible": true,
    "created_at": "2026-09-08 15:38:23.307317+00"
  },
  {
    "id": "227807c9-c812-4643-b37c-665ae1de97fe",
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "section_type": "gallery",
    "eyebrow": "06 — BRAND APPLICATIONS",
    "heading": "Designed to live across every touchpoint.",
    "body": "I tested the system through the places the brand would actually appear—editorial posters, apparel, lanyards, social content, campaign graphics, and supporting brand assets.\r\n\r\nEach application keeps the same visual logic while allowing the composition and tone to shift with the context.",
    "content": {
      "gallery": {
        "items": [
          {
            "id": "1ab8b5ad-f40e-4825-97bc-8bedfa48110a",
            "alt": "",
            "size": "large",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/280d0e30-8a28-42a9-a6c4-bb735da68d9a.png",
              "size": 8403583,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "build.png"
            },
            "caption": ""
          },
          {
            "id": "c55d720b-2279-4319-8de9-296db7a43841",
            "alt": "",
            "size": "wide",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/60bd96bb-6a0d-4018-a33b-fe2bb26dc29d.png",
              "size": 6657062,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "lanyard.png"
            },
            "caption": ""
          },
          {
            "id": "db8e5751-163a-4fd8-b645-1247bf43f31d",
            "alt": "",
            "size": "tall",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/888749e2-2cf2-4a9b-9ed5-885b6bf3ce0c.png",
              "size": 2314528,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "aven.png"
            },
            "caption": ""
          },
          {
            "id": "28f051af-c787-4b07-89b1-5eaa7c6d64c0",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/40cae283-17a2-4e2e-8106-5e498946bbbb.png",
              "size": 4893576,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "card.png"
            },
            "caption": ""
          },
          {
            "id": "1bb154bd-1983-4e8c-be58-fcdc42dcf1b3",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/bd42bd26-49ed-4080-a2a2-a249109b9b72.png",
              "size": 1788658,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "site.png"
            },
            "caption": ""
          },
          {
            "id": "74cf7f91-7cf2-4588-bda2-75d583431979",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/6cf208ca-0010-41bb-86a3-03a3a8f5affb.png",
              "size": 6108945,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "book.png"
            },
            "caption": ""
          },
          {
            "id": "4207a9ad-51d3-442e-be7f-6fa279751f7f",
            "alt": "",
            "size": "tall",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/7b1fc950-f640-4a1d-8b18-1060814d8d4e.png",
              "size": 7319188,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "shirt.png"
            },
            "caption": ""
          },
          {
            "id": "8900e420-c258-415e-879d-47fe73ce2687",
            "alt": "",
            "size": "wide",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/a0e75326-ba2f-4e55-baad-fd8b9175a4c7.png",
              "size": 5092636,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "ig.png"
            },
            "caption": ""
          },
          {
            "id": "a8e5ad7d-7cd1-428c-ab0f-82ff6f778174",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/227807c9-c812-4643-b37c-665ae1de97fe/gallery/550de3a6-9da4-402c-add3-dafdedeebce0.png",
              "size": 4738714,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "billboard.png"
            },
            "caption": ""
          }
        ],
        "layout": "bento"
      }
    },
    "theme": "light",
    "sort_order": 6,
    "is_visible": true,
    "created_at": "2026-09-08 09:17:02.32236+00"
  },
  {
    "id": "02d774c3-8a10-446e-ad39-464d6d5d9fa4",
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "section_type": "narrative",
    "eyebrow": "07 / EXPANDING THE SYSTEM",
    "heading": "Building beyond the core identity.",
    "body": "Beyond the core identity, I extended the system into Aven, 5AM Vision’s character, along with a broader set of visual assets designed to support content, campaigns, and future creative direction.\r\n\r\nThis helped move the project from a static identity into a flexible brand world with enough structure to stay consistent and enough room to keep evolving.",
    "content": {},
    "theme": "light",
    "sort_order": 7,
    "is_visible": true,
    "created_at": "2026-09-08 09:17:29.944382+00"
  },
  {
    "id": "060eaa6e-09a1-4f8d-8c7e-27002b1a80ba",
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "section_type": "finale",
    "eyebrow": null,
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "body": "The final identity gives 5AM Vision a clear visual foundation while leaving enough flexibility to grow across new content, campaigns, physical applications, and future creative work.",
        "media": {
          "alt": "5AM Vision identity presented through editorial campaign visuals, apparel, brand applications, and Aven.",
          "kind": "image",
          "asset": {
            "path": "projects/1ac99e20-1aba-4d72-a593-7c8ab3ebe355/sections/060eaa6e-09a1-4f8d-8c7e-27002b1a80ba/finale/5b485870-cc0b-46ee-ac05-a84b2847f824.png",
            "size": 3979523,
            "bucket": "portfolio-media",
            "mimeType": "image/png",
            "originalName": "aven final.png"
          }
        },
        "title": "One system. Many expressions.",
        "ctaUrl": "",
        "ctaLabel": ""
      }
    },
    "theme": "accent",
    "sort_order": 8,
    "is_visible": true,
    "created_at": "2026-09-08 09:18:02.142645+00"
  },
  {
    "id": "caebe8ec-2add-46b9-806c-69bd0adf2550",
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "section_type": "overview",
    "eyebrow": "CURRENT IMPLEMENTATION",
    "heading": "Active production implementation is underway.",
    "body": "Spall Spill has moved beyond product definition into active implementation. The current codebase already includes authentication and session foundations, Handle claiming, Basic Identity Working persistence, profile media foundations, Identity connections, Product and Resource draft foundations, stable Spill references, private preview, staged publication foundations, public-reader foundations, a dedicated URL safety scanner, a media sanitizer service, and automated CI/security gates.\n\nThe product remains In Development because the final first-publication wiring, remaining public/click/media transport, Product publication preparation, universal workspace handoff, browser/journey verification, live-provider verification, and release hardening are still being completed.",
    "content": {},
    "theme": "light",
    "sort_order": 0,
    "is_visible": true,
    "created_at": "2026-08-19 16:25:16.177384+00",
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "id": "9ac44139-0190-491a-88d6-cde0c2505d19",
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "section_type": "narrative",
    "eyebrow": "What Spall Spill Is",
    "heading": "Identity for presence. Spill for structured discovery.",
    "body": "Every owner can publish a public Identity that works on its own: a personal or business presence built from structured profile, social, link, contact, media, text, and Spill CTA capabilities.\n\nA Spill is the owner-scoped discovery layer behind that Identity. It can contain structured Product and Resource entities, each with its own persistent reference, lifecycle, public detail, and destination behavior.\n\nProduct represents a recognizable recommendation connected to one or more marketplace destinations. Resource represents structured material such as a menu, price list, catalog, portfolio, media kit, document, or external website. The entity remains stable even when the destination changes.",
    "content": {},
    "theme": "dark",
    "sort_order": 1,
    "is_visible": true,
    "created_at": "2026-08-19 16:25:16.177384+00"
  },
  {
    "id": "12acaef2-11f2-4a8a-9d78-84d2a47605de",
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "section_type": "statement",
    "eyebrow": "Core Product Principle",
    "heading": "One owner. One Identity. One Spill. Multiple structured ways to be discovered.",
    "body": null,
    "content": {},
    "theme": "accent",
    "sort_order": 2,
    "is_visible": true,
    "created_at": "2026-08-20 03:51:47.907451+00"
  },
  {
    "id": "d98260fd-acdf-4722-872d-126156ea3b88",
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "section_type": "narrative",
    "eyebrow": "Universal Capability Model",
    "heading": "The product adapts to intent without turning intent into a permanent account type.",
    "body": "Onboarding can begin from Personal, Affiliate / Product Recommendations, Business / UMKM, Creator, or Other. That choice changes guidance, starter composition, and workspace emphasis — not permission.\n\nA Personal user can later add Products. A Business owner can later publish Resources or Products. A Creator can begin with Identity only and expand into Spill when it becomes useful. Capability expansion is additive, so users do not need account migration or full re-onboarding when their needs change.\n\nThe same principle continues after onboarding: actual usage, navigation exposure, and authorization remain separate concepts.",
    "content": {},
    "theme": "light",
    "sort_order": 3,
    "is_visible": true,
    "created_at": "2026-08-19 16:25:16.177384+00"
  },
  {
    "id": "a46b887e-905d-4db1-839c-ef463dadee38",
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "section_type": "metrics",
    "eyebrow": "IMPLEMENTATION PROGRESS",
    "heading": "Core product foundations are already built into the active codebase.",
    "body": "The project is now measured by implemented system boundaries and verified engineering foundations, not only by product-definition scope.",
    "content": {
      "metrics": {
        "items": [
          {
            "id": "owner-foundation",
            "label": "Owner & Identity foundation",
            "value": "BUILT",
            "detail": "Authentication/session handling, Handle claim, Basic Identity Working persistence, starter composition, profile media foundation, and Identity connections are implemented."
          },
          {
            "id": "spill-foundation",
            "label": "Spill data foundation",
            "value": "BUILT",
            "detail": "Product and Resource draft foundations, stable non-reused Spill references, private preview, and staged publication foundations are present in the active repository."
          },
          {
            "id": "safety",
            "label": "Safety & verification",
            "value": "GATED",
            "detail": "URL safety scanning, media sanitization, PostgreSQL security tests, CI, SAST, secret scanning, and dependency scanning are integrated while final public transport and live-provider verification remain open."
          }
        ],
        "columns": 3
      }
    },
    "theme": "light",
    "sort_order": 4,
    "is_visible": true,
    "created_at": "2026-08-19 16:25:16.177384+00",
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "id": "a711695d-4c28-49f5-9f1d-5d1dfde8d596",
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "section_type": "narrative",
    "eyebrow": "Behavior Before Interface",
    "heading": "The hard part is not drawing screens. It is defining what every state means.",
    "body": "Spall Spill separates Draft, Working, Saved, Published, Hidden, and Archived behavior so editing never silently changes the public state. Autosave protects work, while publication remains explicit.\n\nPersistent Spill references are stable and never recycled. Exact reference lookup such as #27 has priority over fuzzy search, while normal keyword discovery remains forgiving and scoped to the current owner's Spill.\n\nIdentity, Product, and Resource are treated as durable product entities rather than temporary collections of links. Authentication is kept separate from authorization, owner preview is excluded from normal audience analytics, and marketplace clicks are recorded as outbound actions rather than assumed purchases.",
    "content": {},
    "theme": "dark",
    "sort_order": 5,
    "is_visible": true,
    "created_at": "2026-08-19 16:25:16.177384+00"
  },
  {
    "id": "b16aba10-d3ae-4439-a053-1c49a3570f5c",
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "section_type": "finale",
    "eyebrow": "CURRENT FRONTIER",
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "title": "From product definition into active production implementation.",
        "body": "The clean production codebase is already carrying the core owner, identity, draft, preview, safety, and publication foundations. The next work is focused on final first-publication wiring, public/click/media transport, Product publication preparation, universal workspace handoff, remaining browser/journey verification, live-provider verification where available, and release hardening.",
        "ctaUrl": "https://github.com/nafisajuliansahsaputra/spall-spill",
        "ctaLabel": "View source code"
      }
    },
    "theme": "light",
    "sort_order": 6,
    "is_visible": true,
    "created_at": "2026-08-19 16:25:16.177384+00",
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "id": "28d53292-d1a3-4378-8b51-bb925feea767",
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "section_type": "overview",
    "eyebrow": "01 / PROJECT OVERVIEW",
    "heading": "Building attendance around verified identity",
    "body": "I developed Smart Attendance System as a full-stack school attendance platform that combines RFID-based identity, 1:1 face verification, configurable attendance sessions, staff workflows, device integration, and derived reporting.\r\n\r\nMy work covered the product logic, system architecture, web application, Device API, database and authorization model, biometric verification service, administrative tools, homeroom workflows, reporting, and automated testing.",
    "content": {},
    "theme": "light",
    "sort_order": 0,
    "is_visible": true,
    "created_at": "2026-09-16 13:01:52.703724+00"
  },
  {
    "id": "e3873a18-61c4-4501-b6b0-21426b5d6733",
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "section_type": "narrative",
    "eyebrow": "02 / THE CHALLENGE",
    "heading": "Making attendance trustworthy, not just recordable.",
    "body": "Scanning an RFID card can identify who is expected to attend, but it cannot prove who is actually holding the card.\r\n\r\nThe system also needed to evaluate face verification, active attendance sessions, participant eligibility, arrival timing, duplicate scans, and staff permissions before an attempt could become a valid attendance record.\r\n\r\nI treated these as system-level rules rather than interface-specific logic, so the same attendance decisions remain consistent across the public simulator, staff workflows, and hardware-facing device integration.",
    "content": {},
    "theme": "light",
    "sort_order": 1,
    "is_visible": true,
    "created_at": "2026-09-16 13:03:07.049841+00"
  },
  {
    "id": "e9b3d00a-21cb-4f42-8afa-28d721469977",
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "section_type": "statement",
    "eyebrow": "03 / CORE PRINCIPLE",
    "heading": "Identify the card. Verify the person. Trust the record.",
    "body": null,
    "content": {},
    "theme": "accent",
    "sort_order": 2,
    "is_visible": true,
    "created_at": "2026-09-16 13:04:23.684578+00"
  },
  {
    "id": "02567c5d-bb36-4533-972e-818ed979b249",
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "section_type": "narrative",
    "eyebrow": "04 / SYSTEM DESIGN",
    "heading": "Keeping attendance truth on the server.",
    "body": "I separated device input, identity resolution, face verification, attendance rules, persistence, and reporting so no browser screen or hardware client could decide attendance on its own.\r\n\r\nRFID resolves the expected student, face verification confirms that identity when required, and the attendance engine evaluates the active session, participant eligibility, timing, duplicate scans, and verification result before creating a canonical attendance record.\r\n\r\nRaw device events, verification attempts, accepted attendance, teacher confirmations, and reporting data remain separate so the system stays auditable and easier to maintain.",
    "content": {},
    "theme": "light",
    "sort_order": 3,
    "is_visible": true,
    "created_at": "2026-09-16 13:05:11.001568+00"
  },
  {
    "id": "322df4d9-62f0-4f8e-8134-bd04fa9988ec",
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "section_type": "image",
    "eyebrow": "05 / ARCHITECTURE",
    "heading": "One attendance engine behind every entry point.",
    "body": "The public simulator and hardware-facing Device API enter the system through different paths, but both depend on the same attendance rules and data boundaries.\r\n\r\nThis keeps device integration separate from the logic that decides whether an attendance attempt is valid, while allowing verification, persistence, staff workflows, and reporting to stay consistent across the product.",
    "content": {
      "image": {
        "alt": "",
        "asset": {
          "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/322df4d9-62f0-4f8e-8134-bd04fa9988ec/a989d9be-91f9-4b7c-bde9-20feff6a0f23.png",
          "size": 3256562,
          "bucket": "portfolio-media",
          "mimeType": "image/png",
          "originalName": "sfdfsfsfdfsdf.png"
        },
        "caption": ""
      }
    },
    "theme": "light",
    "sort_order": 4,
    "is_visible": true,
    "created_at": "2026-09-16 13:05:49.694528+00"
  },
  {
    "id": "9ccc9047-b530-4dc1-9540-0043209e8ac3",
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "section_type": "gallery",
    "eyebrow": "06 / PRODUCT WORKFLOW",
    "heading": "Designed across every part of the attendance workflow.",
    "body": "I designed separate interfaces for verification, administration, student identity management, schedule configuration, homeroom reconciliation, and reporting while keeping the underlying attendance decisions and authorization rules centralized.",
    "content": {
      "gallery": {
        "items": [
          {
            "id": "aed5889f-c58a-4f6f-9700-8dee40f147cf",
            "alt": "",
            "size": "large",
            "asset": {
              "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/9ccc9047-b530-4dc1-9540-0043209e8ac3/gallery/f7dc50a5-1a52-48f8-9416-50387d337d4a.png",
              "size": 1642283,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "1.png"
            },
            "caption": ""
          },
          {
            "id": "e87887bd-d572-4239-9ec9-98d86c0d3fe5",
            "alt": "",
            "size": "tall",
            "asset": {
              "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/9ccc9047-b530-4dc1-9540-0043209e8ac3/gallery/f195bc60-b129-4850-b3a2-b272782b5242.png",
              "size": 993411,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "2.png"
            },
            "caption": ""
          },
          {
            "id": "5135d3eb-b29c-4259-87e4-b0746d1db764",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/9ccc9047-b530-4dc1-9540-0043209e8ac3/gallery/8fea57bc-40fd-4b37-9b21-6971f7c7ec88.png",
              "size": 1836276,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "3.png"
            },
            "caption": ""
          },
          {
            "id": "0084ff37-03a3-4ae6-9146-91cf0ce485d1",
            "alt": "",
            "size": "tall",
            "asset": {
              "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/9ccc9047-b530-4dc1-9540-0043209e8ac3/gallery/6030592a-a24d-49c1-b4c5-51cc29eb6040.png",
              "size": 1061987,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "4.png"
            },
            "caption": ""
          },
          {
            "id": "bf875eed-d428-4f27-b7ce-e34fe2cf3c6c",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/9ccc9047-b530-4dc1-9540-0043209e8ac3/gallery/decd239e-c8b6-4594-820c-f4ed85fd2348.png",
              "size": 361318,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "6.png"
            },
            "caption": ""
          },
          {
            "id": "ba7c4e78-191c-41de-9051-abf633e929b6",
            "alt": "",
            "size": "wide",
            "asset": {
              "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/9ccc9047-b530-4dc1-9540-0043209e8ac3/gallery/a5b2d657-2654-4000-8553-b1d049970b9b.png",
              "size": 597744,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "5.png"
            },
            "caption": ""
          },
          {
            "id": "897390f2-f5dd-44a4-8743-790632d90e4e",
            "alt": "",
            "size": "wide",
            "asset": {
              "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/9ccc9047-b530-4dc1-9540-0043209e8ac3/gallery/d7b28197-11ed-472a-b0e6-e67ce7e755a1.png",
              "size": 405456,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "8.png"
            },
            "caption": ""
          },
          {
            "id": "611218af-dbfc-42d0-af09-5cfcd52cbf9a",
            "alt": "",
            "size": "wide",
            "asset": {
              "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/9ccc9047-b530-4dc1-9540-0043209e8ac3/gallery/4956cb17-d72b-4031-b37e-5a099831661e.png",
              "size": 469866,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "9.png"
            },
            "caption": ""
          }
        ],
        "layout": "bento"
      }
    },
    "theme": "light",
    "sort_order": 5,
    "is_visible": true,
    "created_at": "2026-09-16 13:07:41.148523+00"
  },
  {
    "id": "065e6f3f-57e7-404e-a73c-3ebe4d9aad88",
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "section_type": "metrics",
    "eyebrow": "07 / SYSTEM SCOPE",
    "heading": "Built beyond the attendance screen.",
    "body": "The system connects identity, biometrics, scheduling, authorization, device communication, attendance rules, and reporting as one operational product.",
    "content": {},
    "theme": "dark",
    "sort_order": 6,
    "is_visible": true,
    "created_at": "2026-09-16 13:08:45.377733+00"
  },
  {
    "id": "226db64d-e48d-4d7d-8b99-cf52c3a41fe7",
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "section_type": "finale",
    "eyebrow": "08 / FINAL SHOWCASE",
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "body": "Smart Attendance System brings RFID identity, 1:1 face verification, configurable attendance sessions, staff workflows, hardware-ready device communication, and derived reporting into one consistent attendance model.",
        "media": {
          "alt": "Smart Attendance System presented through its live verification terminal and administrative dashboard.",
          "kind": "image",
          "asset": {
            "path": "projects/5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0/sections/226db64d-e48d-4d7d-8b99-cf52c3a41fe7/finale/be24d7ba-3c30-4454-b540-484ab0c6714a.png",
            "size": 1698344,
            "bucket": "portfolio-media",
            "mimeType": "image/png",
            "originalName": "ChatGPT Image Sep 16, 2026, 05_48_18 PM.png"
          }
        },
        "title": "From verification to a trusted attendance record.",
        "ctaUrl": "https://attendance-system-85872qh2v-nafisajuliansahsaputras-projects.vercel.app",
        "ctaLabel": "Try the live demo"
      }
    },
    "theme": "accent",
    "sort_order": 7,
    "is_visible": true,
    "created_at": "2026-09-16 13:09:51.014582+00"
  },
  {
    "id": "1188ffca-1903-41d9-863a-8a155875497f",
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "section_type": "overview",
    "eyebrow": "PROJECT OVERVIEW",
    "heading": "A digital workflow for handover administration",
    "body": "BAST is a full-stack web application designed to manage Berita Acara Serah Terima documents and the administrative data connected to them.\n\nThe system brings document creation, record management, status tracking, history, and day-to-day administrative actions into one structured workflow so each handover can be managed from a clear operational context.",
    "content": {},
    "theme": "light",
    "sort_order": 0,
    "is_visible": true,
    "created_at": "2026-08-23 13:23:17.151675+00"
  },
  {
    "id": "d8a39959-33f3-4e90-8426-bbe849ae647c",
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "section_type": "statement",
    "eyebrow": "01 / PURPOSE",
    "heading": "Administrative handover should move through a system, not a scattered set of files.",
    "body": null,
    "content": {},
    "theme": "accent",
    "sort_order": 1,
    "is_visible": true,
    "created_at": "2026-08-23 13:23:58.576607+00"
  },
  {
    "id": "c058dfb2-a892-4cdd-b607-427c819d6908",
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "section_type": "image",
    "eyebrow": "02 / THE SYSTEM",
    "heading": "Built around the complete document workflow.",
    "body": "A centralized workspace for managing handover documents, administrative data, document status, and day-to-day system activity.",
    "content": {
      "image": {
        "alt": "",
        "asset": {
          "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c058dfb2-a892-4cdd-b607-427c819d6908/d94ba65c-8ac7-444f-840d-6084ad00c953.png",
          "size": 955241,
          "bucket": "portfolio-media",
          "mimeType": "image/png",
          "originalName": "Untitled-1.png"
        },
        "caption": ""
      }
    },
    "theme": "light",
    "sort_order": 2,
    "is_visible": true,
    "created_at": "2026-08-23 13:25:16.971814+00"
  },
  {
    "id": "0b33f772-5bd9-4ab5-a814-03752f596f61",
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "section_type": "narrative",
    "eyebrow": "03 / WORKFLOW LOGIC",
    "heading": "The document state defines what can happen next.",
    "body": "BAST treats each document as part of an administrative lifecycle rather than as a standalone file. Its current state determines which actions are relevant while keeping the related information connected throughout the process.\n\nThe workflow covers Draft, Finalized, Completed, and Archived documents while still supporting exceptional conditions such as Cancelled and Reopened when the administrative process requires them.",
    "content": {},
    "theme": "light",
    "sort_order": 3,
    "is_visible": true,
    "created_at": "2026-08-23 13:26:11.564904+00"
  },
  {
    "id": "c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51",
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "section_type": "gallery",
    "eyebrow": "04 / PRODUCT EXPERIENCE",
    "heading": "One workflow, across every stage.",
    "body": "Each interface represents a different part of the same administrative process — from creating and reviewing records to document output, history, status control, and management.",
    "content": {
      "gallery": {
        "items": [
          {
            "id": "e1727f6e-3f17-4fd1-ac52-74579810a76a",
            "alt": "",
            "size": "large",
            "asset": {
              "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51/gallery/a084da09-f68f-4ec1-808f-bb89ce74db4d.png",
              "size": 1562291,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "bast.png"
            },
            "caption": ""
          },
          {
            "id": "78703d81-32d0-42e0-af83-c386644bcecf",
            "alt": "",
            "size": "wide",
            "asset": {
              "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51/gallery/18948645-1aa9-4515-b98a-80e09f039653.png",
              "size": 568018,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "arsip.png"
            },
            "caption": ""
          },
          {
            "id": "00245990-693a-43e9-b97f-fcfc0117a553",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51/gallery/f40d3349-1ffc-423b-a345-b80634a089e1.png",
              "size": 329073,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "bbast.png"
            },
            "caption": ""
          },
          {
            "id": "a8129773-0b3f-43dd-b542-63b763e9774d",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51/gallery/47259f33-4f37-481c-b8d5-4372a7d06ec9.png",
              "size": 513617,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "Untitled-2.png"
            },
            "caption": ""
          },
          {
            "id": "6498194f-5f52-44b3-9bfb-ce29c8d64fd3",
            "alt": "",
            "size": "tall",
            "asset": {
              "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51/gallery/c93f4e1d-9b18-44b9-8920-085949a34614.png",
              "size": 760791,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "Untitled-4.png"
            },
            "caption": ""
          },
          {
            "id": "dcaec08f-d196-4b07-9511-0601321feaf5",
            "alt": "",
            "size": "large",
            "asset": {
              "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51/gallery/7749ee1d-c959-4ae3-91d8-0f67524ee6a1.png",
              "size": 2047879,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "dasda.png"
            },
            "caption": ""
          },
          {
            "id": "5a9b358d-f0af-4eb9-8b66-ca4ffe7d201b",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51/gallery/1c3aaf5c-0abe-460e-9ca0-7e560f237768.png",
              "size": 522511,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "545.png"
            },
            "caption": ""
          },
          {
            "id": "c754c42a-b7c4-4a39-b170-2b44eb2858cb",
            "alt": "",
            "size": "small",
            "asset": {
              "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51/gallery/a012eaa0-4ce5-44ed-be83-b0b1da7bd912.png",
              "size": 605109,
              "bucket": "portfolio-media",
              "mimeType": "image/png",
              "originalName": "fdsgs.png"
            },
            "caption": ""
          }
        ],
        "layout": "bento"
      }
    },
    "theme": "light",
    "sort_order": 4,
    "is_visible": true,
    "created_at": "2026-08-23 13:27:27.437545+00"
  },
  {
    "id": "69f64413-51f0-49df-9d89-32b0afb3594a",
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "section_type": "metrics",
    "eyebrow": "05 / SYSTEM AT A GLANCE",
    "heading": "A focused system for a real administrative process.",
    "body": "The application combines role-based access, state-driven document handling, responsive interfaces, and a live full-stack workflow.",
    "content": {
      "metrics": {
        "items": [
          {
            "id": "stack",
            "label": "Full-stack application",
            "value": "FULL",
            "detail": "Interface, application logic, data handling, and deployment work as one system."
          },
          {
            "id": "roles",
            "label": "User roles",
            "value": "03",
            "detail": "Access and actions are structured around different responsibilities in the administrative workflow."
          },
          {
            "id": "lifecycle",
            "label": "Document lifecycle",
            "value": "STATE",
            "detail": "Available actions follow the current document state instead of treating every record the same way."
          },
          {
            "id": "deployment",
            "label": "Deployed project",
            "value": "LIVE",
            "detail": "The application is available as a live web project for direct exploration."
          }
        ],
        "columns": 4
      }
    },
    "theme": "dark",
    "sort_order": 5,
    "is_visible": true,
    "created_at": "2026-08-23 13:28:57.641573+00"
  },
  {
    "id": "59f4ab22-0e83-4b71-9e13-9cc98aad59e3",
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "section_type": "narrative",
    "eyebrow": "06 / SYSTEM DESIGN",
    "heading": "The interface follows the work behind the document.",
    "body": "The main design challenge was translating an administrative process into an interface that stays understandable as records move between states and responsibilities.\n\nThat meant keeping document status visible, connecting related administrative information, making available actions predictable, and maintaining consistency across desktop and smaller screens. The result is a workflow that prioritizes clarity over unnecessary interface complexity.",
    "content": {},
    "theme": "light",
    "sort_order": 6,
    "is_visible": true,
    "created_at": "2026-08-23 13:29:27.569291+00"
  },
  {
    "id": "434f62be-69f2-4c63-825e-89b9334577dd",
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "section_type": "finale",
    "eyebrow": "07 / FINAL RESULT",
    "heading": "A clearer way to manage handover administration.",
    "body": "BAST turns document handling into a connected workflow where records, status, actions, and history remain part of the same system.",
    "content": {
      "finale": {
        "body": "BAST brings document handling, administrative records, workflow state, and day-to-day management into one focused full-stack experience.",
        "media": {
          "alt": "BAST management system displayed on laptop and mobile device mockups.",
          "kind": "image",
          "asset": {
            "path": "projects/b578d54c-21cd-46b7-83df-584133ccb5f9/sections/434f62be-69f2-4c63-825e-89b9334577dd/finale/f3527f19-aa4e-4258-904f-09cc426c16d2.png",
            "size": 10065144,
            "bucket": "portfolio-media",
            "mimeType": "image/png",
            "originalName": "gdfddfdf.png"
          }
        },
        "title": "A clearer way to manage handover administration.",
        "ctaUrl": "https://bast.site.je/",
        "ctaLabel": "View live project"
      }
    },
    "theme": "accent",
    "sort_order": 7,
    "is_visible": true,
    "created_at": "2026-08-23 13:30:04.725378+00"
  }
];

export const FALLBACK_SECTION_TRANSLATION_ROWS = [
  {
    "section_id": "02567c5d-bb36-4533-972e-818ed979b249",
    "locale": "de",
    "eyebrow": "04 / SYSTEMDESIGN",
    "heading": "Die Wahrheit über Anwesenheit auf dem Server bewahren.",
    "body": "Ich habe Geräteeingaben, Identitätsauflösung, Gesichtsverifizierung, Anwesenheitsregeln, Persistenz und Berichte voneinander getrennt, damit weder eine Browseransicht noch ein Hardware-Client eigenständig über Anwesenheit entscheiden kann.\r\n\r\nRFID ermittelt den erwarteten Schüler, die Gesichtsverifizierung bestätigt diese Identität, wenn erforderlich, und die Anwesenheits-Engine prüft aktive Sitzung, Teilnahmeberechtigung, Zeitpunkt, doppelte Scans und Verifizierungsergebnis, bevor sie einen maßgeblichen Anwesenheitseintrag erstellt.\r\n\r\nRohe Geräteereignisse, Verifizierungsversuche, bestätigte Anwesenheit, Bestätigungen durch Lehrkräfte und Berichtsdaten bleiben getrennt. So bleibt das System prüfbar und leichter zu warten.",
    "content": {}
  },
  {
    "section_id": "02567c5d-bb36-4533-972e-818ed979b249",
    "locale": "en",
    "eyebrow": "04 / SYSTEM DESIGN",
    "heading": "Keeping attendance truth on the server.",
    "body": "I separated device input, identity resolution, face verification, attendance rules, persistence, and reporting so no browser screen or hardware client could decide attendance on its own.\r\n\r\nRFID resolves the expected student, face verification confirms that identity when required, and the attendance engine evaluates the active session, participant eligibility, timing, duplicate scans, and verification result before creating a canonical attendance record.\r\n\r\nRaw device events, verification attempts, accepted attendance, teacher confirmations, and reporting data remain separate so the system stays auditable and easier to maintain.",
    "content": {}
  },
  {
    "section_id": "02567c5d-bb36-4533-972e-818ed979b249",
    "locale": "id",
    "eyebrow": "04 / DESAIN SISTEM",
    "heading": "Menjaga kebenaran absensi di server.",
    "body": "Saya memisahkan input perangkat, resolusi identitas, verifikasi wajah, aturan absensi, persistensi, dan pelaporan agar tidak ada layar browser atau klien hardware yang dapat menentukan absensi secara mandiri.\r\n\r\nRFID menentukan siswa yang diharapkan hadir, verifikasi wajah mengonfirmasi identitas tersebut jika diperlukan, dan mesin absensi mengevaluasi sesi aktif, kelayakan peserta, waktu, pemindaian duplikat, serta hasil verifikasi sebelum membuat catatan absensi kanonis.\r\n\r\nEvent mentah dari perangkat, percobaan verifikasi, absensi yang diterima, konfirmasi guru, dan data pelaporan tetap dipisahkan agar sistem mudah diaudit dan dipelihara.",
    "content": {}
  },
  {
    "section_id": "02d774c3-8a10-446e-ad39-464d6d5d9fa4",
    "locale": "de",
    "eyebrow": "07 / DAS SYSTEM ERWEITERN",
    "heading": "Über die grundlegende Identität hinausgehen.",
    "body": "Über die grundlegende Identität hinaus habe ich das System auf Aven, den Charakter von 5AM Vision, sowie auf ein breiteres Set visueller Elemente ausgeweitet, die Inhalte, Kampagnen und zukünftige Creative Direction unterstützen.\r\n\r\nSo entwickelte sich das Projekt von einer statischen Identität zu einer flexiblen Markenwelt – mit genügend Struktur für Konsistenz und genügend Raum für Weiterentwicklung.",
    "content": {}
  },
  {
    "section_id": "02d774c3-8a10-446e-ad39-464d6d5d9fa4",
    "locale": "en",
    "eyebrow": "07 / EXPANDING THE SYSTEM",
    "heading": "Building beyond the core identity.",
    "body": "Beyond the core identity, I extended the system into Aven, 5AM Vision’s character, along with a broader set of visual assets designed to support content, campaigns, and future creative direction.\r\n\r\nThis helped move the project from a static identity into a flexible brand world with enough structure to stay consistent and enough room to keep evolving.",
    "content": {}
  },
  {
    "section_id": "02d774c3-8a10-446e-ad39-464d6d5d9fa4",
    "locale": "id",
    "eyebrow": "07 / MEMPERLUAS SISTEM",
    "heading": "Membangun melampaui identitas inti.",
    "body": "Di luar identitas inti, saya memperluas sistem ini ke Aven, karakter milik 5AM Vision, bersama rangkaian aset visual yang lebih luas untuk mendukung konten, kampanye, dan creative direction di masa depan.\r\n\r\nHal ini membantu mengembangkan proyek dari identitas statis menjadi dunia brand yang fleksibel—cukup terstruktur untuk tetap konsisten dan cukup luas untuk terus berkembang.",
    "content": {}
  },
  {
    "section_id": "060eaa6e-09a1-4f8d-8c7e-27002b1a80ba",
    "locale": "de",
    "eyebrow": null,
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "body": "Die finale Identität gibt 5AM Vision ein klares visuelles Fundament und lässt zugleich genügend Flexibilität für neue Inhalte, Kampagnen, physische Anwendungen und zukünftige kreative Arbeiten.",
        "media": {
          "alt": "Die Identität von 5AM Vision präsentiert durch redaktionelle Kampagnenvisuals, Apparel, Markenanwendungen und Aven."
        },
        "title": "Ein System. Viele Ausdrucksformen."
      }
    }
  },
  {
    "section_id": "060eaa6e-09a1-4f8d-8c7e-27002b1a80ba",
    "locale": "en",
    "eyebrow": null,
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "body": "The final identity gives 5AM Vision a clear visual foundation while leaving enough flexibility to grow across new content, campaigns, physical applications, and future creative work.",
        "media": {
          "alt": "5AM Vision identity presented through editorial campaign visuals, apparel, brand applications, and Aven."
        },
        "title": "One system. Many expressions."
      }
    }
  },
  {
    "section_id": "060eaa6e-09a1-4f8d-8c7e-27002b1a80ba",
    "locale": "id",
    "eyebrow": null,
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "body": "Identitas final memberi 5AM Vision fondasi visual yang jelas, sekaligus menyisakan fleksibilitas untuk berkembang melalui konten baru, kampanye, aplikasi fisik, dan karya kreatif di masa depan.",
        "media": {
          "alt": "Identitas 5AM Vision ditampilkan melalui visual kampanye editorial, apparel, aplikasi brand, dan Aven."
        },
        "title": "Satu sistem. Banyak ekspresi."
      }
    }
  },
  {
    "section_id": "065e6f3f-57e7-404e-a73c-3ebe4d9aad88",
    "locale": "de",
    "eyebrow": "07 / SYSTEMUMFANG",
    "heading": "Über die Anwesenheitsansicht hinaus entwickelt.",
    "body": "Das System verbindet Identität, Biometrie, Stundenplanung, Autorisierung, Gerätekommunikation, Anwesenheitsregeln und Berichte zu einem operativen Gesamtprodukt.",
    "content": {}
  },
  {
    "section_id": "065e6f3f-57e7-404e-a73c-3ebe4d9aad88",
    "locale": "en",
    "eyebrow": "07 / SYSTEM SCOPE",
    "heading": "Built beyond the attendance screen.",
    "body": "The system connects identity, biometrics, scheduling, authorization, device communication, attendance rules, and reporting as one operational product.",
    "content": {}
  },
  {
    "section_id": "065e6f3f-57e7-404e-a73c-3ebe4d9aad88",
    "locale": "id",
    "eyebrow": "07 / CAKUPAN SISTEM",
    "heading": "Dibangun lebih dari sekadar layar absensi.",
    "body": "Sistem ini menghubungkan identitas, biometrik, penjadwalan, otorisasi, komunikasi perangkat, aturan absensi, dan pelaporan sebagai satu produk operasional.",
    "content": {}
  },
  {
    "section_id": "0b33f772-5bd9-4ab5-a814-03752f596f61",
    "locale": "de",
    "eyebrow": "03 / WORKFLOW-LOGIK",
    "heading": "Der Dokumentstatus bestimmt, was als Nächstes möglich ist.",
    "body": "BAST behandelt jedes Dokument als Teil eines administrativen Lebenszyklus und nicht als isolierte Datei. Der aktuelle Status bestimmt die relevanten Aktionen, während zugehörige Informationen während des gesamten Prozesses verbunden bleiben.\n\nDer Workflow umfasst Draft, Finalized, Completed und Archived und unterstützt bei Bedarf auch Ausnahmezustände wie Cancelled und Reopened.",
    "content": {}
  },
  {
    "section_id": "0b33f772-5bd9-4ab5-a814-03752f596f61",
    "locale": "en",
    "eyebrow": "03 / WORKFLOW LOGIC",
    "heading": "The document state defines what can happen next.",
    "body": "BAST treats each document as part of an administrative lifecycle rather than as a standalone file. Its current state determines which actions are relevant while keeping the related information connected throughout the process.\n\nThe workflow covers Draft, Finalized, Completed, and Archived documents while still supporting exceptional conditions such as Cancelled and Reopened when the administrative process requires them.",
    "content": {}
  },
  {
    "section_id": "0b33f772-5bd9-4ab5-a814-03752f596f61",
    "locale": "id",
    "eyebrow": "03 / WORKFLOW LOGIC",
    "heading": "Status dokumen menentukan apa yang dapat dilakukan selanjutnya.",
    "body": "BAST memperlakukan setiap dokumen sebagai bagian dari lifecycle administratif, bukan sebagai file yang berdiri sendiri. Status saat ini menentukan tindakan mana yang relevan sekaligus menjaga informasi terkait tetap terhubung sepanjang proses.\n\nWorkflow mencakup dokumen Draft, Finalized, Completed, dan Archived, serta tetap mendukung kondisi khusus seperti Cancelled dan Reopened ketika proses administratif membutuhkannya.",
    "content": {}
  },
  {
    "section_id": "1188ffca-1903-41d9-863a-8a155875497f",
    "locale": "de",
    "eyebrow": "PROJEKTÜBERBLICK",
    "heading": "Ein digitaler Workflow für die Übergabeverwaltung",
    "body": "BAST ist eine Full-Stack-Webanwendung zur Verwaltung von Berita Acara Serah Terima-Dokumenten und den damit verbundenen Verwaltungsdaten.\n\nDas System verbindet Dokumenterstellung, Datensatzverwaltung, Statusverfolgung, Historie und tägliche Verwaltungsaktionen in einem strukturierten Workflow, sodass jede Übergabe in einem klaren operativen Kontext verwaltet werden kann.",
    "content": {}
  },
  {
    "section_id": "1188ffca-1903-41d9-863a-8a155875497f",
    "locale": "en",
    "eyebrow": "PROJECT OVERVIEW",
    "heading": "A digital workflow for handover administration",
    "body": "BAST is a full-stack web application designed to manage Berita Acara Serah Terima documents and the administrative data connected to them.\n\nThe system brings document creation, record management, status tracking, history, and day-to-day administrative actions into one structured workflow so each handover can be managed from a clear operational context.",
    "content": {}
  },
  {
    "section_id": "1188ffca-1903-41d9-863a-8a155875497f",
    "locale": "id",
    "eyebrow": "PROJECT OVERVIEW",
    "heading": "Workflow digital untuk administrasi serah terima",
    "body": "BAST adalah aplikasi web full-stack yang dirancang untuk mengelola dokumen Berita Acara Serah Terima beserta data administratif yang terhubung dengannya.\n\nSistem ini menyatukan pembuatan dokumen, pengelolaan data, pelacakan status, riwayat, dan aktivitas administratif sehari-hari ke dalam satu workflow terstruktur agar setiap proses serah terima dapat dikelola dalam konteks operasional yang jelas.",
    "content": {}
  },
  {
    "section_id": "12acaef2-11f2-4a8a-9d78-84d2a47605de",
    "locale": "de",
    "eyebrow": "Zentrales Produktprinzip",
    "heading": "Ein Owner. Eine Identity. Ein Spill. Mehrere strukturierte Wege, entdeckt zu werden.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "12acaef2-11f2-4a8a-9d78-84d2a47605de",
    "locale": "en",
    "eyebrow": "Core Product Principle",
    "heading": "One owner. One Identity. One Spill. Multiple structured ways to be discovered.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "12acaef2-11f2-4a8a-9d78-84d2a47605de",
    "locale": "id",
    "eyebrow": "Prinsip Produk Utama",
    "heading": "Satu owner. Satu Identity. Satu Spill. Banyak cara terstruktur untuk ditemukan.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "226db64d-e48d-4d7d-8b99-cf52c3a41fe7",
    "locale": "de",
    "eyebrow": "08 / ABSCHLIESSENDE PRÄSENTATION",
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "body": "Smart Attendance System verbindet RFID-Identität, 1:1-Gesichtsverifizierung, konfigurierbare Anwesenheitssitzungen, Workflows für Mitarbeitende, hardwaretaugliche Gerätekommunikation und abgeleitete Berichte in einem konsistenten Anwesenheitsmodell.",
        "media": {
          "alt": "Smart Attendance System präsentiert über sein Live-Verifizierungsterminal und sein Administrations-Dashboard."
        },
        "title": "Von der Verifizierung zum vertrauenswürdigen Anwesenheitseintrag.",
        "ctaLabel": "Live-Demo ausprobieren"
      }
    }
  },
  {
    "section_id": "226db64d-e48d-4d7d-8b99-cf52c3a41fe7",
    "locale": "en",
    "eyebrow": "08 / FINAL SHOWCASE",
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "body": "Smart Attendance System brings RFID identity, 1:1 face verification, configurable attendance sessions, staff workflows, hardware-ready device communication, and derived reporting into one consistent attendance model.",
        "media": {
          "alt": "Smart Attendance System presented through its live verification terminal and administrative dashboard."
        },
        "title": "From verification to a trusted attendance record.",
        "ctaLabel": "Try the live demo"
      }
    }
  },
  {
    "section_id": "226db64d-e48d-4d7d-8b99-cf52c3a41fe7",
    "locale": "id",
    "eyebrow": "08 / SHOWCASE AKHIR",
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "body": "Smart Attendance System menyatukan identitas RFID, verifikasi wajah 1:1, sesi absensi yang dapat dikonfigurasi, alur kerja staf, komunikasi perangkat yang siap terhubung ke hardware, dan pelaporan turunan ke dalam satu model absensi yang konsisten.",
        "media": {
          "alt": "Smart Attendance System ditampilkan melalui terminal verifikasi langsung dan dashboard administrasi."
        },
        "title": "Dari verifikasi menjadi catatan absensi yang tepercaya.",
        "ctaLabel": "Coba demo langsung"
      }
    }
  },
  {
    "section_id": "227807c9-c812-4643-b37c-665ae1de97fe",
    "locale": "de",
    "eyebrow": "06 — MARKENANWENDUNGEN",
    "heading": "Für jeden Kontaktpunkt gestaltet.",
    "body": "Ich habe das System an den Orten getestet, an denen die Marke tatsächlich sichtbar werden würde – auf redaktionellen Postern, Apparel, Lanyards, in Social Content, Kampagnengrafiken und ergänzenden Markenmaterialien.\r\n\r\nJede Anwendung folgt derselben visuellen Logik und erlaubt zugleich, Komposition und Tonalität an den jeweiligen Kontext anzupassen.",
    "content": {}
  },
  {
    "section_id": "227807c9-c812-4643-b37c-665ae1de97fe",
    "locale": "en",
    "eyebrow": "06 — BRAND APPLICATIONS",
    "heading": "Designed to live across every touchpoint.",
    "body": "I tested the system through the places the brand would actually appear—editorial posters, apparel, lanyards, social content, campaign graphics, and supporting brand assets.\r\n\r\nEach application keeps the same visual logic while allowing the composition and tone to shift with the context.",
    "content": {}
  },
  {
    "section_id": "227807c9-c812-4643-b37c-665ae1de97fe",
    "locale": "id",
    "eyebrow": "06 — APLIKASI BRAND",
    "heading": "Dirancang untuk hadir di setiap touchpoint.",
    "body": "Saya menguji sistem ini melalui berbagai tempat di mana brand benar-benar akan hadir—poster editorial, apparel, lanyard, konten sosial, grafis kampanye, dan aset brand pendukung.\r\n\r\nSetiap aplikasi mempertahankan logika visual yang sama, sekaligus memungkinkan komposisi dan tone bergeser sesuai konteks.",
    "content": {}
  },
  {
    "section_id": "26b54768-cbef-4c97-8417-bc7a61087e6c",
    "locale": "de",
    "eyebrow": "03 / DESIGNPRINZIP",
    "heading": "Diszipliniert genug für klare Absicht. Flexibel genug, um in Bewegung zu bleiben.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "26b54768-cbef-4c97-8417-bc7a61087e6c",
    "locale": "en",
    "eyebrow": "03 / DESIGN PRINCIPLE",
    "heading": "Disciplined enough to feel intentional. Flexible enough to keep moving.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "26b54768-cbef-4c97-8417-bc7a61087e6c",
    "locale": "id",
    "eyebrow": "03 / PRINSIP DESAIN",
    "heading": "Cukup disiplin untuk terasa terarah. Cukup fleksibel untuk terus bergerak.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "28d53292-d1a3-4378-8b51-bb925feea767",
    "locale": "de",
    "eyebrow": "01 / PROJEKTÜBERBLICK",
    "heading": "Anwesenheit auf verifizierter Identität aufbauen",
    "body": "Ich habe Smart Attendance System als Full-Stack-Plattform für die Anwesenheitsverwaltung an Schulen entwickelt. Sie verbindet RFID-basierte Identität, 1:1-Gesichtsverifizierung, konfigurierbare Anwesenheitssitzungen, Workflows für Mitarbeitende, Geräteintegration und abgeleitete Berichte.\r\n\r\nMein Aufgabenbereich umfasste die Produktlogik, die Systemarchitektur, die Webanwendung, die Device API, das Datenbank- und Autorisierungsmodell, den Dienst zur biometrischen Verifizierung, administrative Werkzeuge, Workflows für Klassenleitungen, Berichte und automatisierte Tests.",
    "content": {}
  },
  {
    "section_id": "28d53292-d1a3-4378-8b51-bb925feea767",
    "locale": "en",
    "eyebrow": "01 / PROJECT OVERVIEW",
    "heading": "Building attendance around verified identity",
    "body": "I developed Smart Attendance System as a full-stack school attendance platform that combines RFID-based identity, 1:1 face verification, configurable attendance sessions, staff workflows, device integration, and derived reporting.\r\n\r\nMy work covered the product logic, system architecture, web application, Device API, database and authorization model, biometric verification service, administrative tools, homeroom workflows, reporting, and automated testing.",
    "content": {}
  },
  {
    "section_id": "28d53292-d1a3-4378-8b51-bb925feea767",
    "locale": "id",
    "eyebrow": "01 / GAMBARAN PROYEK",
    "heading": "Membangun absensi berdasarkan identitas terverifikasi",
    "body": "Saya mengembangkan Smart Attendance System sebagai platform absensi sekolah full-stack yang memadukan identitas berbasis RFID, verifikasi wajah 1:1, sesi absensi yang dapat dikonfigurasi, alur kerja staf, integrasi perangkat, dan pelaporan turunan.\r\n\r\nPekerjaan saya mencakup logika produk, arsitektur sistem, aplikasi web, API Perangkat, model database dan otorisasi, layanan verifikasi biometrik, perangkat administrasi, alur kerja wali kelas, pelaporan, dan pengujian otomatis.",
    "content": {}
  },
  {
    "section_id": "322df4d9-62f0-4f8e-8134-bd04fa9988ec",
    "locale": "de",
    "eyebrow": "05 / ARCHITEKTUR",
    "heading": "Eine Anwesenheits-Engine für jeden Zugangspunkt.",
    "body": "Der öffentliche Simulator und die hardwareseitige Device API gelangen über unterschiedliche Wege ins System, greifen jedoch auf dieselben Anwesenheitsregeln und Datenabgrenzungen zurück.\r\n\r\nSo bleibt die Geräteintegration von der Logik getrennt, die über die Gültigkeit eines Anwesenheitsversuchs entscheidet. Gleichzeitig bleiben Verifizierung, Persistenz, Workflows für Mitarbeitende und Berichte im gesamten Produkt konsistent.",
    "content": {}
  },
  {
    "section_id": "322df4d9-62f0-4f8e-8134-bd04fa9988ec",
    "locale": "en",
    "eyebrow": "05 / ARCHITECTURE",
    "heading": "One attendance engine behind every entry point.",
    "body": "The public simulator and hardware-facing Device API enter the system through different paths, but both depend on the same attendance rules and data boundaries.\r\n\r\nThis keeps device integration separate from the logic that decides whether an attendance attempt is valid, while allowing verification, persistence, staff workflows, and reporting to stay consistent across the product.",
    "content": {}
  },
  {
    "section_id": "322df4d9-62f0-4f8e-8134-bd04fa9988ec",
    "locale": "id",
    "eyebrow": "05 / ARSITEKTUR",
    "heading": "Satu mesin absensi untuk setiap entry point.",
    "body": "Simulator publik dan API Perangkat yang terhubung ke hardware memasuki sistem melalui jalur yang berbeda, tetapi keduanya bergantung pada aturan absensi dan batasan data yang sama.\r\n\r\nDengan begitu, integrasi perangkat tetap terpisah dari logika yang menentukan apakah suatu percobaan absensi valid, sementara verifikasi, persistensi, alur kerja staf, dan pelaporan tetap konsisten di seluruh produk.",
    "content": {}
  },
  {
    "section_id": "3f9796a0-84b6-4338-bd77-10c9070bc698",
    "locale": "de",
    "eyebrow": "04 / CREATIVE DIRECTION",
    "heading": "Die Idee in ein visuelles System überführen.",
    "body": "Ich habe die Richtung auf einer zurückhaltenden, von Navy geprägten Farbpalette, markanter Typografie, großzügigen Abständen und einer modularen grafischen Sprache aufgebaut.\r\n\r\nZiel war es, einen Kontrast zwischen Disziplin und Energie zu schaffen: ein System, das in seiner Struktur kontrolliert wirkt und zugleich flexibel genug für redaktionelle Layouts, Kampagnen, Social Content und physische Anwendungen bleibt.",
    "content": {}
  },
  {
    "section_id": "3f9796a0-84b6-4338-bd77-10c9070bc698",
    "locale": "en",
    "eyebrow": "04 / CREATIVE DIRECTION",
    "heading": "Turning the idea into a visual system.",
    "body": "I built the direction around a restrained navy-led palette, bold typography, generous spacing, and a modular graphic language.\r\n\r\nThe goal was to create contrast between discipline and energy: a system that feels controlled in its structure, but still flexible enough for editorial layouts, campaigns, social content, and physical applications.",
    "content": {}
  },
  {
    "section_id": "3f9796a0-84b6-4338-bd77-10c9070bc698",
    "locale": "id",
    "eyebrow": "04 / CREATIVE DIRECTION",
    "heading": "Mengubah ide menjadi sistem visual.",
    "body": "Saya membangun arah visual ini melalui palet warna bernuansa navy yang restrained, tipografi bold, ruang yang luas, dan bahasa grafis modular.\r\n\r\nTujuannya adalah menciptakan kontras antara disiplin dan energi: sebuah sistem yang terasa terkendali dalam strukturnya, namun tetap cukup fleksibel untuk layout editorial, kampanye, konten sosial, dan aplikasi fisik.",
    "content": {}
  },
  {
    "section_id": "434f62be-69f2-4c63-825e-89b9334577dd",
    "locale": "de",
    "eyebrow": "07 / FINALES ERGEBNIS",
    "heading": "Ein klarerer Weg zur Verwaltung von Übergaben.",
    "body": "BAST verwandelt die Dokumentverwaltung in einen verbundenen Workflow, in dem Datensätze, Status, Aktionen und Historie Teil desselben Systems bleiben.",
    "content": {
      "finale": {
        "body": "BAST verbindet Dokumentverwaltung, Verwaltungsdaten, Workflow-Status und tägliche Verwaltung in einer fokussierten Full-Stack-Erfahrung.",
        "media": {
          "alt": "BAST Management System auf Laptop- und Smartphone-Mockups dargestellt."
        },
        "title": "Ein klarerer Weg zur Verwaltung von Übergaben.",
        "ctaUrl": "https://bast.site.je/",
        "ctaLabel": "Live-Projekt ansehen"
      }
    }
  },
  {
    "section_id": "434f62be-69f2-4c63-825e-89b9334577dd",
    "locale": "en",
    "eyebrow": "07 / FINAL RESULT",
    "heading": "A clearer way to manage handover administration.",
    "body": "BAST turns document handling into a connected workflow where records, status, actions, and history remain part of the same system.",
    "content": {
      "finale": {
        "body": "BAST brings document handling, administrative records, workflow state, and day-to-day management into one focused full-stack experience.",
        "media": {
          "alt": "BAST management system displayed on laptop and mobile device mockups."
        },
        "title": "A clearer way to manage handover administration.",
        "ctaUrl": "https://bast.site.je/",
        "ctaLabel": "View live project"
      }
    }
  },
  {
    "section_id": "434f62be-69f2-4c63-825e-89b9334577dd",
    "locale": "id",
    "eyebrow": "07 / FINAL RESULT",
    "heading": "Cara yang lebih jelas untuk mengelola administrasi serah terima.",
    "body": "BAST mengubah pengelolaan dokumen menjadi workflow yang terhubung, sehingga data, status, tindakan, dan riwayat tetap berada dalam satu sistem.",
    "content": {
      "finale": {
        "body": "BAST menyatukan pengelolaan dokumen, data administratif, workflow state, dan manajemen sehari-hari dalam satu pengalaman full-stack yang fokus.",
        "media": {
          "alt": "Sistem manajemen BAST ditampilkan pada mockup laptop dan perangkat mobile."
        },
        "title": "Cara yang lebih jelas untuk mengelola administrasi serah terima.",
        "ctaUrl": "https://bast.site.je/",
        "ctaLabel": "Lihat proyek live"
      }
    }
  },
  {
    "section_id": "59f4ab22-0e83-4b71-9e13-9cc98aad59e3",
    "locale": "de",
    "eyebrow": "06 / SYSTEMDESIGN",
    "heading": "Die Oberfläche folgt der Arbeit hinter dem Dokument.",
    "body": "Die zentrale Designaufgabe bestand darin, einen Verwaltungsprozess in eine Oberfläche zu übersetzen, die verständlich bleibt, während Datensätze zwischen Zuständen und Verantwortlichkeiten wechseln.\n\nDafür müssen Dokumentstatus sichtbar, zusammengehörige Verwaltungsinformationen verbunden, verfügbare Aktionen vorhersehbar und die Erfahrung auf Desktop sowie kleineren Bildschirmen konsistent bleiben. Das Ergebnis ist ein Workflow, der Klarheit über unnötige Interface-Komplexität stellt.",
    "content": {}
  },
  {
    "section_id": "59f4ab22-0e83-4b71-9e13-9cc98aad59e3",
    "locale": "en",
    "eyebrow": "06 / SYSTEM DESIGN",
    "heading": "The interface follows the work behind the document.",
    "body": "The main design challenge was translating an administrative process into an interface that stays understandable as records move between states and responsibilities.\n\nThat meant keeping document status visible, connecting related administrative information, making available actions predictable, and maintaining consistency across desktop and smaller screens. The result is a workflow that prioritizes clarity over unnecessary interface complexity.",
    "content": {}
  },
  {
    "section_id": "59f4ab22-0e83-4b71-9e13-9cc98aad59e3",
    "locale": "id",
    "eyebrow": "06 / SYSTEM DESIGN",
    "heading": "Interface mengikuti pekerjaan yang ada di balik dokumen.",
    "body": "Tantangan desain utamanya adalah menerjemahkan proses administratif menjadi interface yang tetap mudah dipahami ketika data berpindah antar-status dan tanggung jawab.\n\nArtinya, status dokumen harus selalu jelas, informasi administratif yang saling berkaitan tetap terhubung, tindakan yang tersedia dapat diprediksi, dan pengalaman tetap konsisten di desktop maupun layar yang lebih kecil. Hasilnya adalah workflow yang mengutamakan kejelasan dibanding kompleksitas interface yang tidak perlu.",
    "content": {}
  },
  {
    "section_id": "69f64413-51f0-49df-9d89-32b0afb3594a",
    "locale": "de",
    "eyebrow": "05 / DAS SYSTEM AUF EINEN BLICK",
    "heading": "Ein fokussiertes System für einen realen Verwaltungsprozess.",
    "body": "Die Anwendung verbindet rollenbasierten Zugriff, statusgesteuerte Dokumentverwaltung, responsive Oberflächen und einen live bereitgestellten Full-Stack-Workflow.",
    "content": {
      "metrics": {
        "copyById": {
          "roles": {
            "label": "Benutzerrollen",
            "value": "03",
            "detail": "Zugriff und Aktionen orientieren sich an unterschiedlichen Verantwortlichkeiten im Verwaltungsworkflow."
          },
          "stack": {
            "label": "Full-Stack-Anwendung",
            "value": "FULL",
            "detail": "Interface, Anwendungslogik, Datenverarbeitung und Deployment arbeiten als ein zusammenhängendes System."
          },
          "lifecycle": {
            "label": "Dokumenten-Lifecycle",
            "value": "STATE",
            "detail": "Verfügbare Aktionen folgen dem aktuellen Dokumentstatus, anstatt jeden Datensatz gleich zu behandeln."
          },
          "deployment": {
            "label": "Live-Projekt",
            "value": "LIVE",
            "detail": "Die Anwendung ist als live bereitgestelltes Webprojekt direkt verfügbar."
          }
        }
      }
    }
  },
  {
    "section_id": "69f64413-51f0-49df-9d89-32b0afb3594a",
    "locale": "en",
    "eyebrow": "05 / SYSTEM AT A GLANCE",
    "heading": "A focused system for a real administrative process.",
    "body": "The application combines role-based access, state-driven document handling, responsive interfaces, and a live full-stack workflow.",
    "content": {}
  },
  {
    "section_id": "69f64413-51f0-49df-9d89-32b0afb3594a",
    "locale": "id",
    "eyebrow": "05 / SYSTEM AT A GLANCE",
    "heading": "Sistem yang fokus untuk proses administratif yang nyata.",
    "body": "Aplikasi ini menggabungkan role-based access, pengelolaan dokumen berbasis state, interface responsif, dan workflow full-stack yang live.",
    "content": {
      "metrics": {
        "copyById": {
          "roles": {
            "label": "Peran pengguna",
            "value": "03",
            "detail": "Akses dan tindakan disusun berdasarkan tanggung jawab yang berbeda dalam workflow administratif."
          },
          "stack": {
            "label": "Aplikasi full-stack",
            "value": "FULL",
            "detail": "Interface, application logic, pengelolaan data, dan deployment bekerja sebagai satu sistem."
          },
          "lifecycle": {
            "label": "Lifecycle dokumen",
            "value": "STATE",
            "detail": "Tindakan yang tersedia mengikuti status dokumen saat ini, bukan memperlakukan semua data dengan cara yang sama."
          },
          "deployment": {
            "label": "Proyek live",
            "value": "LIVE",
            "detail": "Aplikasi tersedia sebagai proyek web live yang dapat dieksplorasi secara langsung."
          }
        }
      }
    }
  },
  {
    "section_id": "9ac44139-0190-491a-88d6-cde0c2505d19",
    "locale": "de",
    "eyebrow": "Was Spall Spill Ist",
    "heading": "Identity für Präsenz. Spill für strukturierte Discovery.",
    "body": "Jeder Owner kann eine öffentliche Identity veröffentlichen, die eigenständig funktioniert: eine persönliche oder geschäftliche Präsenz aus strukturierten Profil-, Social-, Link-, Contact-, Media-, Text- und Spill-CTA-Funktionen.\n\nEin Spill ist die owner-spezifische Discovery-Ebene hinter dieser Identity. Er kann strukturierte Product- und Resource-Entities enthalten, jeweils mit eigener persistenter Referenz, Lifecycle, öffentlichem Detail und Destination-Verhalten.\n\nProduct steht für eine erkennbare Empfehlung mit einer oder mehreren Marketplace-Destinations. Resource steht für strukturierte Inhalte wie Menü, Preisliste, Katalog, Portfolio, Media Kit, Dokument oder externe Website. Die Entity bleibt stabil, auch wenn sich die Destination ändert.",
    "content": {}
  },
  {
    "section_id": "9ac44139-0190-491a-88d6-cde0c2505d19",
    "locale": "en",
    "eyebrow": "What Spall Spill Is",
    "heading": "Identity for presence. Spill for structured discovery.",
    "body": "Every owner can publish a public Identity that works on its own: a personal or business presence built from structured profile, social, link, contact, media, text, and Spill CTA capabilities.\n\nA Spill is the owner-scoped discovery layer behind that Identity. It can contain structured Product and Resource entities, each with its own persistent reference, lifecycle, public detail, and destination behavior.\n\nProduct represents a recognizable recommendation connected to one or more marketplace destinations. Resource represents structured material such as a menu, price list, catalog, portfolio, media kit, document, or external website. The entity remains stable even when the destination changes.",
    "content": {}
  },
  {
    "section_id": "9ac44139-0190-491a-88d6-cde0c2505d19",
    "locale": "id",
    "eyebrow": "Apa Itu Spall Spill",
    "heading": "Identity untuk presence. Spill untuk structured discovery.",
    "body": "Setiap owner dapat mempublikasikan Identity publik yang bisa berdiri sendiri: presence personal atau bisnis yang dibangun dari profile, social, link, contact, media, text, dan Spill CTA yang terstruktur.\n\nSpill adalah layer discovery milik owner di balik Identity tersebut. Di dalamnya dapat terdapat entity Product dan Resource yang terstruktur, masing-masing dengan persistent reference, lifecycle, public detail, dan destination behavior sendiri.\n\nProduct mewakili rekomendasi yang dapat dikenali dan terhubung ke satu atau beberapa marketplace destination. Resource mewakili materi terstruktur seperti menu, price list, catalog, portfolio, media kit, document, atau website eksternal. Identitas entity tetap stabil walaupun destination-nya berubah.",
    "content": {}
  },
  {
    "section_id": "9ccc9047-b530-4dc1-9540-0043209e8ac3",
    "locale": "de",
    "eyebrow": "06 / PRODUKTWORKFLOW",
    "heading": "Jeden Teil des Anwesenheitsworkflows gestaltet.",
    "body": "Ich habe separate Benutzeroberflächen für Verifizierung, Administration, Verwaltung von Schüleridentitäten, Konfiguration von Stundenplänen, Abstimmung durch Klassenleitungen und Berichte gestaltet. Die zugrunde liegenden Anwesenheitsentscheidungen und Autorisierungsregeln bleiben dabei zentralisiert.",
    "content": {}
  },
  {
    "section_id": "9ccc9047-b530-4dc1-9540-0043209e8ac3",
    "locale": "en",
    "eyebrow": "06 / PRODUCT WORKFLOW",
    "heading": "Designed across every part of the attendance workflow.",
    "body": "I designed separate interfaces for verification, administration, student identity management, schedule configuration, homeroom reconciliation, and reporting while keeping the underlying attendance decisions and authorization rules centralized.",
    "content": {}
  },
  {
    "section_id": "9ccc9047-b530-4dc1-9540-0043209e8ac3",
    "locale": "id",
    "eyebrow": "06 / ALUR KERJA PRODUK",
    "heading": "Merancang setiap bagian dari alur kerja absensi.",
    "body": "Saya merancang antarmuka terpisah untuk verifikasi, administrasi, pengelolaan identitas siswa, konfigurasi jadwal, rekonsiliasi wali kelas, dan pelaporan, sembari menjaga keputusan absensi serta aturan otorisasi tetap terpusat.",
    "content": {}
  },
  {
    "section_id": "a46b887e-905d-4db1-839c-ef463dadee38",
    "locale": "de",
    "eyebrow": "Implementierungsfortschritt",
    "heading": "Die zentralen Produktgrundlagen sind bereits in der aktiven Codebasis umgesetzt.",
    "body": "Der Fortschritt wird jetzt an implementierten Systemgrenzen und verifizierten Engineering-Grundlagen gemessen, nicht nur am Umfang der Produktdefinition.",
    "content": {
      "metrics": {
        "copyById": {
          "owner-foundation": {
            "label": "Owner- & Identity-Grundlage",
            "value": "BUILT",
            "detail": "Authentication/Session Handling, Handle Claim, Basic Identity Working Persistence, Starter Composition, Profile-Media-Grundlage und Identity Connections sind implementiert."
          },
          "spill-foundation": {
            "label": "Spill-Datengrundlage",
            "value": "BUILT",
            "detail": "Product- und Resource-Draft-Grundlagen, stabile nicht wiederverwendete Spill-Referenzen, Private Preview und Staged-Publication-Grundlagen sind in der aktiven Repository vorhanden."
          },
          "safety": {
            "label": "Safety & Verification",
            "value": "GATED",
            "detail": "URL-Safety-Scanning, Media-Sanitization, PostgreSQL-Security-Tests, CI, SAST, Secret-Scanning und Dependency-Scanning sind integriert; finaler Public Transport und Live-Provider-Verifikation bleiben offen."
          }
        }
      }
    },
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "a46b887e-905d-4db1-839c-ef463dadee38",
    "locale": "en",
    "eyebrow": "Implementation Progress",
    "heading": "Core product foundations are already built into the active codebase.",
    "body": "The project is now measured by implemented system boundaries and verified engineering foundations, not only by product-definition scope.",
    "content": {
      "metrics": {
        "copyById": {
          "owner-foundation": {
            "label": "Owner & Identity foundation",
            "value": "BUILT",
            "detail": "Authentication/session handling, Handle claim, Basic Identity Working persistence, starter composition, profile media foundation, and Identity connections are implemented."
          },
          "spill-foundation": {
            "label": "Spill data foundation",
            "value": "BUILT",
            "detail": "Product and Resource draft foundations, stable non-reused Spill references, private preview, and staged publication foundations are present in the active repository."
          },
          "safety": {
            "label": "Safety & verification",
            "value": "GATED",
            "detail": "URL safety scanning, media sanitization, PostgreSQL security tests, CI, SAST, secret scanning, and dependency scanning are integrated while final public transport and live-provider verification remain open."
          }
        }
      }
    },
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "a46b887e-905d-4db1-839c-ef463dadee38",
    "locale": "id",
    "eyebrow": "Progress Implementasi",
    "heading": "Fondasi inti produk sudah dibangun di codebase aktif.",
    "body": "Progres proyek sekarang dinilai dari system boundary yang sudah diimplementasikan dan fondasi engineering yang sudah diverifikasi, bukan hanya dari scope product definition.",
    "content": {
      "metrics": {
        "copyById": {
          "owner-foundation": {
            "label": "Fondasi Owner & Identity",
            "value": "BUILT",
            "detail": "Authentication/session handling, Handle claim, Basic Identity Working persistence, starter composition, fondasi profile media, dan Identity connections sudah diimplementasikan."
          },
          "spill-foundation": {
            "label": "Fondasi data Spill",
            "value": "BUILT",
            "detail": "Fondasi draft Product dan Resource, Spill reference yang stabil dan tidak didaur ulang, private preview, serta staged publication foundation sudah ada di repository aktif."
          },
          "safety": {
            "label": "Safety & verification",
            "value": "GATED",
            "detail": "URL safety scanning, media sanitization, PostgreSQL security tests, CI, SAST, secret scanning, dan dependency scanning sudah terintegrasi sementara final public transport dan live-provider verification masih terbuka."
          }
        }
      }
    },
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "a711695d-4c28-49f5-9f1d-5d1dfde8d596",
    "locale": "de",
    "eyebrow": "Verhalten Vor Interface",
    "heading": "Die schwierige Arbeit ist nicht das Zeichnen von Screens, sondern die Bedeutung jedes Zustands zu definieren.",
    "body": "Spall Spill trennt Draft-, Working-, Saved-, Published-, Hidden- und Archived-Verhalten, damit Editing den öffentlichen Zustand niemals still verändert. Autosave schützt Arbeit, während Publishing explizit bleibt.\n\nPersistente Spill-Referenzen bleiben stabil und werden nie wiederverwendet. Exakte Referenzen wie #27 haben Vorrang vor Fuzzy Search, während normale Keyword Discovery fehlertolerant und auf den Spill des aktuellen Owners begrenzt bleibt.\n\nIdentity, Product und Resource werden als dauerhafte Product Entities behandelt, nicht als temporäre Linksammlungen. Authentication bleibt von Authorization getrennt, Owner Preview wird nicht als normales Audience Analytics gezählt, und Marketplace Clicks gelten als Outbound Actions statt als angenommene Käufe.",
    "content": {}
  },
  {
    "section_id": "a711695d-4c28-49f5-9f1d-5d1dfde8d596",
    "locale": "en",
    "eyebrow": "Behavior Before Interface",
    "heading": "The hard part is not drawing screens. It is defining what every state means.",
    "body": "Spall Spill separates Draft, Working, Saved, Published, Hidden, and Archived behavior so editing never silently changes the public state. Autosave protects work, while publication remains explicit.\n\nPersistent Spill references are stable and never recycled. Exact reference lookup such as #27 has priority over fuzzy search, while normal keyword discovery remains forgiving and scoped to the current owner's Spill.\n\nIdentity, Product, and Resource are treated as durable product entities rather than temporary collections of links. Authentication is kept separate from authorization, owner preview is excluded from normal audience analytics, and marketplace clicks are recorded as outbound actions rather than assumed purchases.",
    "content": {}
  },
  {
    "section_id": "a711695d-4c28-49f5-9f1d-5d1dfde8d596",
    "locale": "id",
    "eyebrow": "Behavior Sebelum Interface",
    "heading": "Bagian tersulit bukan menggambar screen. Bagian tersulit adalah mendefinisikan arti setiap state.",
    "body": "Spall Spill memisahkan behavior Draft, Working, Saved, Published, Hidden, dan Archived supaya proses editing tidak pernah diam-diam mengubah public state. Autosave melindungi pekerjaan, sementara publication tetap harus eksplisit.\n\nPersistent Spill reference bersifat stabil dan tidak pernah didaur ulang. Exact reference seperti #27 memiliki prioritas di atas fuzzy search, sementara keyword discovery biasa tetap forgiving dan dibatasi pada Spill milik owner yang sedang dibuka.\n\nIdentity, Product, dan Resource diperlakukan sebagai product entity yang tahan lama, bukan sekadar kumpulan link sementara. Authentication dipisahkan dari authorization, owner preview tidak dihitung sebagai normal audience analytics, dan marketplace click dicatat sebagai outbound action — bukan diasumsikan sebagai purchase.",
    "content": {}
  },
  {
    "section_id": "b16aba10-d3ae-4439-a053-1c49a3570f5c",
    "locale": "de",
    "eyebrow": "Aktueller Frontier",
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "title": "Von der Produktdefinition zur aktiven Production-Implementierung.",
        "body": "Die saubere Production-Codebasis trägt bereits die zentralen Grundlagen für Owner, Identity, Draft, Preview, Safety und Publication. Die nächsten Arbeiten konzentrieren sich auf das finale First-Publication-Wiring, Public/Click/Media-Transport, Product-Publication-Vorbereitung, Universal-Workspace-Handoff, verbleibende Browser/Journey-Verifikation, Live-Provider-Verifikation soweit verfügbar und Release-Hardening.",
        "ctaUrl": "https://github.com/nafisajuliansahsaputra/spall-spill",
        "ctaLabel": "Source Code ansehen"
      }
    },
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "b16aba10-d3ae-4439-a053-1c49a3570f5c",
    "locale": "en",
    "eyebrow": "Current Frontier",
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "title": "From product definition into active production implementation.",
        "body": "The clean production codebase is already carrying the core owner, identity, draft, preview, safety, and publication foundations. The next work is focused on final first-publication wiring, public/click/media transport, Product publication preparation, universal workspace handoff, remaining browser/journey verification, live-provider verification where available, and release hardening.",
        "ctaUrl": "https://github.com/nafisajuliansahsaputra/spall-spill",
        "ctaLabel": "View source code"
      }
    },
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "b16aba10-d3ae-4439-a053-1c49a3570f5c",
    "locale": "id",
    "eyebrow": "Frontier Saat Ini",
    "heading": null,
    "body": null,
    "content": {
      "finale": {
        "title": "Dari product definition menuju implementasi produksi aktif.",
        "body": "Clean production codebase sekarang sudah membawa fondasi utama owner, identity, draft, preview, safety, dan publication. Pekerjaan berikutnya berfokus pada final first-publication wiring, public/click/media transport, Product publication preparation, universal workspace handoff, sisa browser/journey verification, live-provider verification jika tersedia, dan release hardening.",
        "ctaUrl": "https://github.com/nafisajuliansahsaputra/spall-spill",
        "ctaLabel": "Lihat source code"
      }
    },
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "b5987f45-3b33-44c5-aa44-3a170f78637b",
    "locale": "de",
    "eyebrow": "01 / PROJEKTÜBERBLICK",
    "heading": "Die Identität von Grund auf entwickeln",
    "body": "Ich habe die Identität von 5AM Vision von Grund auf entwickelt, die visuelle Richtung definiert und ein System aufgebaut, das über Marke, Inhalte, Apparel, Kampagnenmaterialien und digitale Anwendungen hinweg funktioniert.\r\n\r\nMeine Rolle umfasste Markenidentität, Art Direction, visuelles Design und die Entwicklung der übergreifenden Markensprache – von der grundlegenden Identität bis zu ihrer Umsetzung an realen Kontaktpunkten.",
    "content": {}
  },
  {
    "section_id": "b5987f45-3b33-44c5-aa44-3a170f78637b",
    "locale": "en",
    "eyebrow": "01 / PROJECT OVERVIEW",
    "heading": "Building the identity from zero",
    "body": "I developed 5AM Vision’s identity from the ground up, shaping the visual direction and building a system that could work across brand, content, apparel, campaign materials, and digital applications.\r\n\r\nMy role covered brand identity, art direction, visual design, and the development of the wider brand language—from the core identity to how it appears across real touchpoints.",
    "content": {}
  },
  {
    "section_id": "b5987f45-3b33-44c5-aa44-3a170f78637b",
    "locale": "id",
    "eyebrow": "01 / RINGKASAN PROYEK",
    "heading": "Membangun identitas dari nol",
    "body": "Saya mengembangkan identitas 5AM Vision dari awal, membentuk arah visual dan membangun sistem yang dapat digunakan di berbagai kebutuhan brand, konten, apparel, materi kampanye, dan aplikasi digital.\r\n\r\nPeran saya mencakup identitas brand, art direction, visual design, serta pengembangan bahasa brand secara menyeluruh—mulai dari identitas inti hingga penerapannya di berbagai touchpoint nyata.",
    "content": {}
  },
  {
    "section_id": "b65b1707-fd93-4f9d-b001-3ffeddc57d6d",
    "locale": "de",
    "eyebrow": "05 / IDENTITÄTSSYSTEM",
    "heading": "Ein System, nicht nur ein Logo.",
    "body": "Die grundlegende Identität bringt Logo, Typografie, Farbe, Abstände und grafische Elemente in einem konsistenten Rahmen zusammen.\r\n\r\nJeder Bestandteil wurde so gestaltet, dass er die anderen unterstützt. So bleibt die Marke erkennbar, ohne allein auf das Logo angewiesen zu sein.",
    "content": {}
  },
  {
    "section_id": "b65b1707-fd93-4f9d-b001-3ffeddc57d6d",
    "locale": "en",
    "eyebrow": "05 / IDENTITY SYSTEM",
    "heading": "A system, not just a logo.",
    "body": "The core identity brings the logo, typography, color, spacing, and graphic elements into one consistent framework.\r\n\r\nEach part was designed to support the others, allowing the brand to stay recognizable without relying on the logo alone.",
    "content": {}
  },
  {
    "section_id": "b65b1707-fd93-4f9d-b001-3ffeddc57d6d",
    "locale": "id",
    "eyebrow": "05 / SISTEM IDENTITAS",
    "heading": "Sebuah sistem, bukan sekadar logo.",
    "body": "Identitas inti menyatukan logo, tipografi, warna, spacing, dan elemen grafis ke dalam satu kerangka yang konsisten.\r\n\r\nSetiap bagian dirancang untuk mendukung bagian lainnya, sehingga brand tetap mudah dikenali tanpa hanya mengandalkan logo.",
    "content": {}
  },
  {
    "section_id": "c058dfb2-a892-4cdd-b607-427c819d6908",
    "locale": "de",
    "eyebrow": "02 / DAS SYSTEM",
    "heading": "Entwickelt für den vollständigen Dokumenten-Workflow.",
    "body": "Ein zentraler Arbeitsbereich zur Verwaltung von Übergabedokumenten, Verwaltungsdaten, Dokumentenstatus und täglichen Systemaktivitäten.",
    "content": {}
  },
  {
    "section_id": "c058dfb2-a892-4cdd-b607-427c819d6908",
    "locale": "en",
    "eyebrow": "02 / THE SYSTEM",
    "heading": "Built around the complete document workflow.",
    "body": "A centralized workspace for managing handover documents, administrative data, document status, and day-to-day system activity.",
    "content": {}
  },
  {
    "section_id": "c058dfb2-a892-4cdd-b607-427c819d6908",
    "locale": "id",
    "eyebrow": "02 / THE SYSTEM",
    "heading": "Dibangun di sekitar workflow dokumen yang lengkap.",
    "body": "Workspace terpusat untuk mengelola dokumen serah terima, data administratif, status dokumen, dan aktivitas sistem sehari-hari.",
    "content": {}
  },
  {
    "section_id": "c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51",
    "locale": "de",
    "eyebrow": "04 / PRODUKTERLEBNIS",
    "heading": "Ein Workflow über jede Phase hinweg.",
    "body": "Jede Oberfläche repräsentiert einen anderen Teil desselben Verwaltungsprozesses – von der Erstellung und Prüfung von Datensätzen bis zu Dokumentausgabe, Historie, Statuskontrolle und Verwaltung.",
    "content": {}
  },
  {
    "section_id": "c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51",
    "locale": "en",
    "eyebrow": "04 / PRODUCT EXPERIENCE",
    "heading": "One workflow, across every stage.",
    "body": "Each interface represents a different part of the same administrative process — from creating and reviewing records to document output, history, status control, and management.",
    "content": {}
  },
  {
    "section_id": "c7ddf08d-a4f2-4fd0-b518-fe5d371d7a51",
    "locale": "id",
    "eyebrow": "04 / PRODUCT EXPERIENCE",
    "heading": "Satu workflow, di setiap tahap.",
    "body": "Setiap interface merepresentasikan bagian yang berbeda dari proses administratif yang sama — mulai dari pembuatan dan peninjauan data hingga output dokumen, riwayat, kontrol status, dan pengelolaan.",
    "content": {}
  },
  {
    "section_id": "caebe8ec-2add-46b9-806c-69bd0adf2550",
    "locale": "de",
    "eyebrow": "Aktuelle Implementierung",
    "heading": "Die aktive Production-Implementierung läuft bereits.",
    "body": "Spall Spill ist über die reine Produktdefinition hinaus und befindet sich in aktiver Implementierung. Die aktuelle Codebasis enthält bereits Authentication- und Session-Grundlagen, Handle Claiming, Basic Identity Working Persistence, Profile-Media-Grundlagen, Identity Connections, Product- und Resource-Draft-Grundlagen, stabile Spill-Referenzen, Private Preview, Staged-Publication-Grundlagen, Public-Reader-Grundlagen, einen dedizierten URL-Safety-Scanner, einen Media-Sanitizer-Service sowie automatisierte CI- und Security-Gates.\n\nDas Projekt bleibt In Development, weil das finale First-Publication-Wiring, verbleibender Public/Click/Media-Transport, Product-Publication-Vorbereitung, Universal-Workspace-Handoff, Browser/Journey-Verifikation, Live-Provider-Verifikation und Release-Hardening noch abgeschlossen werden.",
    "content": {},
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "caebe8ec-2add-46b9-806c-69bd0adf2550",
    "locale": "en",
    "eyebrow": "CURRENT IMPLEMENTATION",
    "heading": "Active production implementation is underway.",
    "body": "Spall Spill has moved beyond product definition into active implementation. The current codebase already includes authentication and session foundations, Handle claiming, Basic Identity Working persistence, profile media foundations, Identity connections, Product and Resource draft foundations, stable Spill references, private preview, staged publication foundations, public-reader foundations, a dedicated URL safety scanner, a media sanitizer service, and automated CI/security gates.\n\nThe product remains In Development because the final first-publication wiring, remaining public/click/media transport, Product publication preparation, universal workspace handoff, browser/journey verification, live-provider verification, and release hardening are still being completed.",
    "content": {},
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "caebe8ec-2add-46b9-806c-69bd0adf2550",
    "locale": "id",
    "eyebrow": "Implementasi Saat Ini",
    "heading": "Implementasi produksi aktif sudah berjalan.",
    "body": "Spall Spill sudah bergerak melewati tahap product definition dan masuk ke implementasi aktif. Codebase saat ini sudah mencakup fondasi authentication dan session, Handle claim, Basic Identity Working persistence, fondasi profile media, Identity connections, fondasi draft Product dan Resource, Spill reference yang stabil, private preview, fondasi staged publication, fondasi public reader, URL safety scanner khusus, media sanitizer service, serta automated CI/security gates.\n\nStatus proyek tetap In Development karena final first-publication wiring, sisa public/click/media transport, Product publication preparation, universal workspace handoff, browser/journey verification, live-provider verification, dan release hardening masih dikerjakan.",
    "content": {},
    "updated_at": "2026-10-06 17:28:39.312185+00"
  },
  {
    "section_id": "d8a39959-33f3-4e90-8426-bbe849ae647c",
    "locale": "de",
    "eyebrow": "01 / ZWECK",
    "heading": "Übergabeverwaltung sollte durch ein System laufen, nicht durch verstreute Dateien.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "d8a39959-33f3-4e90-8426-bbe849ae647c",
    "locale": "en",
    "eyebrow": "01 / PURPOSE",
    "heading": "Administrative handover should move through a system, not a scattered set of files.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "d8a39959-33f3-4e90-8426-bbe849ae647c",
    "locale": "id",
    "eyebrow": "01 / PURPOSE",
    "heading": "Administrasi serah terima seharusnya berjalan melalui sebuah sistem, bukan kumpulan file yang terpencar.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "d98260fd-acdf-4722-872d-126156ea3b88",
    "locale": "de",
    "eyebrow": "Universelles Capability-Modell",
    "heading": "Das Produkt passt sich an den Intent an, ohne ihn in einen permanenten Account-Typ zu verwandeln.",
    "body": "Onboarding kann mit Personal, Affiliate / Product Recommendations, Business / UMKM, Creator oder Other beginnen. Diese Auswahl beeinflusst Guidance, Starter Composition und Workspace-Betonung — nicht die Berechtigungen.\n\nEin Personal-User kann später Products hinzufügen. Ein Business-Owner kann Resources oder Products veröffentlichen. Creator können nur mit Identity starten und Spill später ergänzen. Capability Expansion ist additiv, sodass kein Account-Migration oder vollständiges Re-Onboarding nötig ist.\n\nAuch danach bleiben tatsächliche Nutzung, Navigation Exposure und Authorization getrennte Konzepte.",
    "content": {}
  },
  {
    "section_id": "d98260fd-acdf-4722-872d-126156ea3b88",
    "locale": "en",
    "eyebrow": "Universal Capability Model",
    "heading": "The product adapts to intent without turning intent into a permanent account type.",
    "body": "Onboarding can begin from Personal, Affiliate / Product Recommendations, Business / UMKM, Creator, or Other. That choice changes guidance, starter composition, and workspace emphasis — not permission.\n\nA Personal user can later add Products. A Business owner can later publish Resources or Products. A Creator can begin with Identity only and expand into Spill when it becomes useful. Capability expansion is additive, so users do not need account migration or full re-onboarding when their needs change.\n\nThe same principle continues after onboarding: actual usage, navigation exposure, and authorization remain separate concepts.",
    "content": {}
  },
  {
    "section_id": "d98260fd-acdf-4722-872d-126156ea3b88",
    "locale": "id",
    "eyebrow": "Universal Capability Model",
    "heading": "Produk beradaptasi pada intent tanpa menjadikan intent sebagai tipe akun permanen.",
    "body": "Onboarding dapat dimulai dari Personal, Affiliate / Product Recommendations, Business / UMKM, Creator, atau Other. Pilihan itu mengubah guidance, starter composition, dan penekanan workspace — bukan permission.\n\nUser Personal nantinya tetap bisa menambah Product. Owner Business dapat mempublikasikan Resource ataupun Product. Creator bisa mulai dari Identity saja lalu menggunakan Spill ketika memang berguna. Capability expansion bersifat additive, jadi user tidak membutuhkan migrasi akun atau full re-onboarding ketika kebutuhannya berubah.\n\nPrinsip yang sama berlanjut setelah onboarding: actual usage, navigation exposure, dan authorization tetap merupakan konsep yang terpisah.",
    "content": {}
  },
  {
    "section_id": "e3873a18-61c4-4501-b6b0-21426b5d6733",
    "locale": "de",
    "eyebrow": "02 / DIE HERAUSFORDERUNG",
    "heading": "Anwesenheit vertrauenswürdig machen – nicht nur erfassbar.",
    "body": "Das Scannen einer RFID-Karte kann identifizieren, wer erwartet wird, aber nicht beweisen, wer die Karte tatsächlich hält.\r\n\r\nDas System musste außerdem Gesichtsverifizierung, aktive Anwesenheitssitzungen, Teilnahmeberechtigung, Ankunftszeit, doppelte Scans und Berechtigungen der Mitarbeitenden prüfen, bevor aus einem Versuch ein gültiger Anwesenheitseintrag werden konnte.\r\n\r\nIch habe diese Aspekte als Regeln auf Systemebene behandelt statt als Logik einzelner Benutzeroberflächen. So bleiben dieselben Anwesenheitsentscheidungen im öffentlichen Simulator, in den Workflows für Mitarbeitende und in der hardwareseitigen Geräteintegration konsistent.",
    "content": {}
  },
  {
    "section_id": "e3873a18-61c4-4501-b6b0-21426b5d6733",
    "locale": "en",
    "eyebrow": "02 / THE CHALLENGE",
    "heading": "Making attendance trustworthy, not just recordable.",
    "body": "Scanning an RFID card can identify who is expected to attend, but it cannot prove who is actually holding the card.\r\n\r\nThe system also needed to evaluate face verification, active attendance sessions, participant eligibility, arrival timing, duplicate scans, and staff permissions before an attempt could become a valid attendance record.\r\n\r\nI treated these as system-level rules rather than interface-specific logic, so the same attendance decisions remain consistent across the public simulator, staff workflows, and hardware-facing device integration.",
    "content": {}
  },
  {
    "section_id": "e3873a18-61c4-4501-b6b0-21426b5d6733",
    "locale": "id",
    "eyebrow": "02 / TANTANGAN",
    "heading": "Membuat absensi dapat dipercaya, bukan sekadar tercatat.",
    "body": "Memindai kartu RFID dapat mengidentifikasi siapa yang diharapkan hadir, tetapi tidak dapat membuktikan siapa yang sebenarnya memegang kartu tersebut.\r\n\r\nSistem ini juga perlu mengevaluasi verifikasi wajah, sesi absensi aktif, kelayakan peserta, waktu kedatangan, pemindaian duplikat, dan izin staf sebelum sebuah percobaan dapat menjadi catatan absensi yang valid.\r\n\r\nSaya memperlakukan semua hal ini sebagai aturan tingkat sistem, bukan logika khusus antarmuka, sehingga keputusan absensi tetap konsisten di simulator publik, alur kerja staf, dan integrasi perangkat yang terhubung ke hardware.",
    "content": {}
  },
  {
    "section_id": "e9b3d00a-21cb-4f42-8afa-28d721469977",
    "locale": "de",
    "eyebrow": "03 / KERNPRINZIP",
    "heading": "Karte identifizieren. Person verifizieren. Eintrag vertrauen.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "e9b3d00a-21cb-4f42-8afa-28d721469977",
    "locale": "en",
    "eyebrow": "03 / CORE PRINCIPLE",
    "heading": "Identify the card. Verify the person. Trust the record.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "e9b3d00a-21cb-4f42-8afa-28d721469977",
    "locale": "id",
    "eyebrow": "03 / PRINSIP UTAMA",
    "heading": "Identifikasi kartunya. Verifikasi orangnya. Percayai catatannya.",
    "body": null,
    "content": {}
  },
  {
    "section_id": "f1163f6f-cd55-4e00-af5e-f192a1784f60",
    "locale": "de",
    "eyebrow": "02 / DIE HERAUSFORDERUNG",
    "heading": "Ehrgeiz eine klare visuelle Richtung geben.",
    "body": "Die Herausforderung bestand darin, eine Identität zu schaffen, die ehrgeizig und diszipliniert wirkt, ohne übermäßig corporate oder beliebig zu werden.\r\n\r\n5AM sollte jung, präzise und zeitgemäß wirken und zugleich strukturiert genug sein, um konsistent über unterschiedliche Formate, Zielgruppen und zukünftige kreative Inhalte hinweg zu funktionieren.",
    "content": {}
  },
  {
    "section_id": "f1163f6f-cd55-4e00-af5e-f192a1784f60",
    "locale": "en",
    "eyebrow": "02 / THE CHALLENGE",
    "heading": "Giving ambition a clear visual direction.",
    "body": "The challenge was to create an identity that felt ambitious and disciplined without becoming overly corporate or generic.\r\n\r\n5AM needed to feel young, sharp, and contemporary, while still being structured enough to work consistently across different formats, audiences, and future creative output.",
    "content": {}
  },
  {
    "section_id": "f1163f6f-cd55-4e00-af5e-f192a1784f60",
    "locale": "id",
    "eyebrow": "02 / TANTANGAN",
    "heading": "Memberi ambisi sebuah arah visual yang jelas.",
    "body": "Tantangannya adalah menciptakan identitas yang terasa ambisius dan disiplin tanpa menjadi terlalu korporat atau generik.\r\n\r\n5AM perlu terasa muda, tajam, dan kontemporer, sekaligus cukup terstruktur untuk digunakan secara konsisten di berbagai format, audiens, dan output kreatif di masa depan.",
    "content": {}
  }
];

export const FALLBACK_WORK_CATEGORY_ROWS = [
  {
    "id": "f8ca1b31-b84a-4320-bc5d-20722ba1f4ba",
    "name": "Development",
    "slug": "development",
    "sort_order": 0,
    "is_visible": true
  },
  {
    "id": "e033d5f3-8e9f-498d-aba7-12f5b30a4eb2",
    "name": "Design",
    "slug": "design",
    "sort_order": 1,
    "is_visible": true
  }
];

export const FALLBACK_PROJECT_CATEGORY_ROWS = [
  {
    "project_id": "1ac99e20-1aba-4d72-a593-7c8ab3ebe355",
    "category_id": "e033d5f3-8e9f-498d-aba7-12f5b30a4eb2"
  },
  {
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "category_id": "e033d5f3-8e9f-498d-aba7-12f5b30a4eb2"
  },
  {
    "project_id": "4d3fc40f-2366-49e8-9578-d9a7df99f34c",
    "category_id": "f8ca1b31-b84a-4320-bc5d-20722ba1f4ba"
  },
  {
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "category_id": "e033d5f3-8e9f-498d-aba7-12f5b30a4eb2"
  },
  {
    "project_id": "5d0d7ad9-0f95-4bb2-9a55-e2861d62dfe0",
    "category_id": "f8ca1b31-b84a-4320-bc5d-20722ba1f4ba"
  },
  {
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "category_id": "e033d5f3-8e9f-498d-aba7-12f5b30a4eb2"
  },
  {
    "project_id": "b578d54c-21cd-46b7-83df-584133ccb5f9",
    "category_id": "f8ca1b31-b84a-4320-bc5d-20722ba1f4ba"
  }
];
