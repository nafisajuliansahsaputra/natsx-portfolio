import type {
  Locale,
} from "@/i18n/config";

const workMessages = {
  en: {
    hero: {
      label:
        "Work / Archive",

      index:
        "Selected projects / NATSX",

      heading:
        "Work",

      description:
        "A growing archive of projects across design, development, identity, and digital experiences.",

      projects:
        "Projects",

      period:
        "Period",
    },

    archive: {
      heading:
        "All Projects",

      current:
        "Current Archive",
    },

    empty: {
      label:
        "ARCHIVE",

      description:
        "Published projects will appear here.",

      contact:
        "Start a conversation",
    },

    closing: {
      label:
        "ONGOING ARCHIVE",

      description:
        "The archive keeps growing as new ideas become real projects.",

      contact:
        "Start a conversation",
    },
  },

  id: {
    hero: {
      label:
        "Karya / Arsip",

      index:
        "Karya pilihan / NATSX",

      heading:
        "Karya",

      description:
        "Arsip proyek yang terus berkembang, mencakup desain, development, identitas visual, dan pengalaman digital.",

      projects:
        "Proyek",

      period:
        "Periode",
    },

    archive: {
      heading:
        "Semua Proyek",

      current:
        "Arsip Saat Ini",
    },

    empty: {
      label:
        "ARSIP",

      description:
        "Proyek yang telah dipublikasikan akan muncul di sini.",

      contact:
        "Mulai percakapan",
    },

    closing: {
      label:
        "ARSIP BERKELANJUTAN",

      description:
        "Arsip ini terus bertambah seiring ide baru berkembang menjadi proyek nyata.",

      contact:
        "Mulai percakapan",
    },
  },

  de: {
    hero: {
      label:
        "Projekte / Archiv",

      index:
        "Ausgewählte Projekte / NATSX",

      heading:
        "Projekte",

      description:
        "Ein wachsendes Archiv von Projekten aus Design, Development, visueller Identität und digitalen Erlebnissen.",

      projects:
        "Projekte",

      period:
        "Zeitraum",
    },

    archive: {
      heading:
        "Alle Projekte",

      current:
        "Aktuelles Archiv",
    },

    empty: {
      label:
        "ARCHIV",

      description:
        "Veröffentlichte Projekte erscheinen hier.",

      contact:
        "Gespräch beginnen",
    },

    closing: {
      label:
        "FORTLAUFENDES ARCHIV",

      description:
        "Das Archiv wächst weiter, während neue Ideen zu realen Projekten werden.",

      contact:
        "Gespräch beginnen",
    },
  },
} as const;

export function getWorkMessages(
  locale: Locale,
) {
  return workMessages[
    locale
  ];
}