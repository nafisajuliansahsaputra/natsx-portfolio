import type {
  Locale,
} from "@/i18n/config";

const projectMessages = {
  en: {
    back:
      "All Work",

    project:
      "Project",

    details: {
      year:
        "Year",

      period:
        "Period",

      role:
        "Role",

      project:
        "Project",

      visitLive:
        "Visit Live",

      caseStudy:
        "Case Study",
    },

    empty: {
      label:
        "CASE STUDY / COMING SOON",

      heading:
        "Story in progress",

      description:
        "This project is published, but its detailed case study is still being prepared.",
    },

    next:
      "Next Project",

    metadataFallback:
      "A project case study by NATSX.",
  },

  id: {
    back:
      "Semua Karya",

    project:
      "Proyek",

    details: {
      year:
        "Tahun",

      period:
        "Periode",

      role:
        "Peran",

      project:
        "Proyek",

      visitLive:
        "Kunjungi Website",

      caseStudy:
        "Studi Kasus",
    },

    empty: {
      label:
        "STUDI KASUS / SEGERA HADIR",

      heading:
        "Cerita masih disiapkan",

      description:
        "Proyek ini telah dipublikasikan, tetapi studi kasus lengkapnya masih dalam proses penyusunan.",
    },

    next:
      "Proyek Berikutnya",

    metadataFallback:
      "Studi kasus proyek oleh NATSX.",
  },

  de: {
    back:
      "Alle Projekte",

    project:
      "Projekt",

    details: {
      year:
        "Jahr",

      period:
        "Zeitraum",

      role:
        "Rolle",

      project:
        "Projekt",

      visitLive:
        "Website besuchen",

      caseStudy:
        "Case Study",
    },

    empty: {
      label:
        "CASE STUDY / DEMNÄCHST",

      heading:
        "Die Story entsteht",

      description:
        "Dieses Projekt ist bereits veröffentlicht, die ausführliche Case Study wird jedoch noch vorbereitet.",
    },

    next:
      "Nächstes Projekt",

    metadataFallback:
      "Eine Projekt-Case-Study von NATSX.",
  },
} as const;

export function getProjectMessages(
  locale: Locale,
) {
  return projectMessages[
    locale
  ];
}