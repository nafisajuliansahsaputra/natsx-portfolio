import type {
  Locale,
} from "@/i18n/config";

const projectMessages = {
  en: {
    back:
      "All Work",

    project:
      "Project",

    notFoundTitle:
      "Project Not Found",

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

      technicalOverview:
        "Technical Overview",

      status:
        "Status",

      stack:
        "Stack",

      database:
        "Database",

      testing:
        "Testing",

      liveDemo:
        "Live Demo",

      sourceCode:
        "Source Code",

      engineeringHighlights:
        "Engineering Highlights",
    },

    sections: {
      generic:
        "Section",

      overview:
        "Project Overview",

      narrative:
        "Process",

      statement:
        "Statement",

      image:
        "Project Image",

      gallery:
        "Gallery",

      metrics:
        "Results",

      quote:
        "Quote",

      finale:
        "Final Showcase",

      imageAlt:
        "Project image",

      galleryImageAlt:
        "Gallery image",
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

    notFoundTitle:
      "Proyek Tidak Ditemukan",

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

      technicalOverview:
        "Ringkasan Teknis",

      status:
        "Status",

      stack:
        "Stack",

      database:
        "Database",

      testing:
        "Testing",

      liveDemo:
        "Demo Langsung",

      sourceCode:
        "Kode Sumber",

      engineeringHighlights:
        "Sorotan Engineering",
    },

    sections: {
      generic:
        "Bagian",

      overview:
        "Ringkasan Proyek",

      narrative:
        "Proses",

      statement:
        "Pernyataan",

      image:
        "Gambar Proyek",

      gallery:
        "Galeri",

      metrics:
        "Hasil",

      quote:
        "Kutipan",

      finale:
        "Penutup",

      imageAlt:
        "Gambar proyek",

      galleryImageAlt:
        "Gambar galeri",
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

    notFoundTitle:
      "Projekt nicht gefunden",

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

      technicalOverview:
        "Technischer Überblick",

      status:
        "Status",

      stack:
        "Stack",

      database:
        "Datenbank",

      testing:
        "Testing",

      liveDemo:
        "Live-Demo",

      sourceCode:
        "Quellcode",

      engineeringHighlights:
        "Engineering-Highlights",
    },

    sections: {
      generic:
        "Abschnitt",

      overview:
        "Projektübersicht",

      narrative:
        "Prozess",

      statement:
        "Aussage",

      image:
        "Projektbild",

      gallery:
        "Galerie",

      metrics:
        "Ergebnisse",

      quote:
        "Zitat",

      finale:
        "Abschluss",

      imageAlt:
        "Projektbild",

      galleryImageAlt:
        "Galeriebild",
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