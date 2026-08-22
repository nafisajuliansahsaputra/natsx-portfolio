import type {
  Locale,
} from "@/i18n/config";

const cvMessages = {
  en: {
    hero: {
      label:
        "CV / Resume",

      headingLine1:
        "Curriculum",

      headingLine2:
        "Vitae",

      description:
        "A closer look at my experience, background, skills, and selected professional work.",

      noteLine1:
        "Choose a CV language",

      noteLine2:
        "View or download",
    },

    language: {
      label:
        "Select CV language",

      versions:
        "03 / Versions",

      selected:
        "Selected",

      view:
        "View",
    },

    viewer: {
      eyebrow:
        "Currently viewing",

      openPdf:
        "Open PDF",

      download:
        "Download CV",

      fallbackTitle:
        "PDF Preview",

      fallbackDescription:
        "Your browser does not support embedded PDF preview.",

      fallbackAction:
        "Open CV",
    },

    closing: {
      label:
        "Prefer to talk?",

      heading:
        "A CV tells part of the story",

      action:
        "Start a conversation",
    },
  },

  id: {
    hero: {
      label:
        "CV / Resume",

      headingLine1:
        "Curriculum",

      headingLine2:
        "Vitae",

      description:
        "Gambaran lebih dekat mengenai pengalaman, latar belakang, keahlian, dan pekerjaan profesional pilihan saya.",

      noteLine1:
        "Pilih bahasa CV",

      noteLine2:
        "Lihat atau unduh",
    },

    language: {
      label:
        "Pilih bahasa CV",

      versions:
        "03 / Versi",

      selected:
        "Dipilih",

      view:
        "Lihat",
    },

    viewer: {
      eyebrow:
        "Sedang ditampilkan",

      openPdf:
        "Buka PDF",

      download:
        "Unduh CV",

      fallbackTitle:
        "Pratinjau PDF",

      fallbackDescription:
        "Browser Anda tidak mendukung pratinjau PDF tertanam.",

      fallbackAction:
        "Buka CV",
    },

    closing: {
      label:
        "Lebih suka berbicara langsung?",

      heading:
        "CV hanya menceritakan sebagian dari perjalanan",

      action:
        "Mulai percakapan",
    },
  },

  de: {
    hero: {
      label:
        "CV / Resume",

      headingLine1:
        "Curriculum",

      headingLine2:
        "Vitae",

      description:
        "Ein genauerer Einblick in meine Erfahrung, meinen Hintergrund, meine Fähigkeiten und ausgewählte berufliche Arbeiten.",

      noteLine1:
        "CV-Sprache wählen",

      noteLine2:
        "Ansehen oder herunterladen",
    },

    language: {
      label:
        "CV-Sprache auswählen",

      versions:
        "03 / Versionen",

      selected:
        "Ausgewählt",

      view:
        "Ansehen",
    },

    viewer: {
      eyebrow:
        "Aktuell angezeigt",

      openPdf:
        "PDF öffnen",

      download:
        "CV herunterladen",

      fallbackTitle:
        "PDF-Vorschau",

      fallbackDescription:
        "Dein Browser unterstützt keine eingebettete PDF-Vorschau.",

      fallbackAction:
        "CV öffnen",
    },

    closing: {
      label:
        "Lieber persönlich sprechen?",

      heading:
        "Ein CV erzählt nur einen Teil der Geschichte",

      action:
        "Gespräch beginnen",
    },
  },
} as const;

export function getCvMessages(
  locale: Locale,
) {
  return cvMessages[
    locale
  ];
}