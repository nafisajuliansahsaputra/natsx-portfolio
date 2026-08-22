import type {
  Locale,
} from "@/i18n/config";

type PlaygroundExperimentMessages = {
  title: string;
  category: string;
  description: string;
};

const playgroundMessages = {
  en: {
    hero: {
      label:
        "Playground / Experiments",

      meta:
        "Curious / Uncommissioned / Ongoing",

      headingLine1:
        "Where ideas",

      headingLine2:
        "get to wander",

      description:
        "A space for experiments, visual studies, motion, typography, and ideas explored outside structured project work.",

      noteLine1:
        "No fixed outcome.",

      noteLine2:
        "Just something worth trying.",
    },

    gallery: {
      label:
        "Current Experiments",

      collection:
        "Ongoing Collection",
    },

    manifesto: {
      label:
        "Why Playground?",

      headingLine1:
        "Not everything",

      headingLine2:
        "needs a brief to be",

      headingLine3:
        "worth making",

      paragraph1:
        "Some ideas exist simply because they are interesting enough to explore.",

      paragraph2:
        "The playground is where I can test those ideas, learn something new, break familiar patterns, and occasionally discover something worth carrying into real project work.",
    },

    closing: {
      label:
        "Looking for finished work?",

      headingLine1:
        "Experiments are one side.",

      headingLine2:
        "Projects are the other",

      action:
        "Explore selected work",
    },
  },

  id: {
    hero: {
      label:
        "Playground / Eksperimen",

      meta:
        "Eksploratif / Mandiri / Berkelanjutan",

      headingLine1:
        "Tempat ide",

      headingLine2:
        "bebas menjelajah",

      description:
        "Ruang untuk eksperimen, studi visual, motion, tipografi, dan ide yang dieksplorasi di luar proyek yang terstruktur.",

      noteLine1:
        "Tanpa hasil yang ditentukan.",

      noteLine2:
        "Hanya sesuatu yang layak dicoba.",
    },

    gallery: {
      label:
        "Eksperimen Saat Ini",

      collection:
        "Koleksi Berkelanjutan",
    },

    manifesto: {
      label:
        "Kenapa Playground?",

      headingLine1:
        "Tak semua hal",

      headingLine2:
        "butuh brief untuk",

      headingLine3:
        "layak dibuat",

      paragraph1:
        "Beberapa ide hadir hanya karena cukup menarik untuk dieksplorasi.",

      paragraph2:
        "Playground adalah tempat saya menguji ide tersebut, mempelajari sesuatu yang baru, keluar dari pola yang familiar, dan sesekali menemukan sesuatu yang layak dibawa ke proyek nyata.",
    },

    closing: {
      label:
        "Mencari karya yang lebih matang?",

      headingLine1:
        "Eksperimen adalah satu sisi.",

      headingLine2:
        "Proyek adalah sisi lainnya",

      action:
        "Jelajahi karya pilihan",
    },
  },

  de: {
    hero: {
      label:
        "Playground / Experimente",

      meta:
        "Neugierig / Frei / Fortlaufend",

      headingLine1:
        "Wo Ideen",

      headingLine2:
        "frei wandern",

      description:
        "Ein Raum für Experimente, visuelle Studien, Motion, Typografie und Ideen außerhalb strukturierter Projektarbeit.",

      noteLine1:
        "Kein festes Ergebnis.",

      noteLine2:
        "Nur etwas, das einen Versuch wert ist.",
    },

    gallery: {
      label:
        "Aktuelle Experimente",

      collection:
        "Fortlaufende Sammlung",
    },

    manifesto: {
      label:
        "Warum Playground?",

      headingLine1:
        "Nicht alles braucht",

      headingLine2:
        "ein Briefing, um",

      headingLine3:
        "entstehen zu dürfen",

      paragraph1:
        "Manche Ideen entstehen einfach, weil sie interessant genug sind, um weiter erkundet zu werden.",

      paragraph2:
        "Im Playground kann ich solche Ideen testen, Neues lernen, vertraute Muster durchbrechen und manchmal etwas entdecken, das später in reale Projekte einfließt.",
    },

    closing: {
      label:
        "Suchst du fertige Projekte?",

      headingLine1:
        "Experimente sind die eine Seite.",

      headingLine2:
        "Projekte die andere",

      action:
        "Ausgewählte Projekte ansehen",
    },
  },
} as const;

const playgroundExperimentMessages: Record<
  Locale,
  Record<
    string,
    PlaygroundExperimentMessages
  >
> = {
  en: {
    "generative-visual": {
      title:
        "Generative Visual",

      category:
        "AI / Visual Study",

      description:
        "Exploring composition, image systems, and unexpected visual directions through generative tools.",
    },

    "type-in-motion": {
      title:
        "Type in Motion",

      category:
        "Motion / Typography",

      description:
        "A study in rhythm, scale, timing, and how typography changes when it begins to move.",
    },

    "form-study": {
      title:
        "Form Study",

      category:
        "3D / Experiment",

      description:
        "Simple forms, proportion, light, and composition explored without the constraints of a final deliverable.",
    },

    "poster-system": {
      title:
        "Poster System",

      category:
        "Graphic / Typography",

      description:
        "An evolving graphic system built through type, structure, repetition, and visual tension.",
    },
  },

  id: {
    "generative-visual": {
      title:
        "Visual Generatif",

      category:
        "AI / Studi Visual",

      description:
        "Eksplorasi komposisi, sistem gambar, dan arah visual tak terduga melalui berbagai alat generatif.",
    },

    "type-in-motion": {
      title:
        "Tipografi dalam Gerak",

      category:
        "Motion / Tipografi",

      description:
        "Studi tentang ritme, skala, timing, dan bagaimana tipografi berubah ketika mulai bergerak.",
    },

    "form-study": {
      title:
        "Studi Bentuk",

      category:
        "3D / Eksperimen",

      description:
        "Eksplorasi bentuk sederhana, proporsi, cahaya, dan komposisi tanpa batasan dari sebuah hasil akhir.",
    },

    "poster-system": {
      title:
        "Sistem Poster",

      category:
        "Grafis / Tipografi",

      description:
        "Sistem grafis yang terus berkembang melalui tipografi, struktur, repetisi, dan ketegangan visual.",
    },
  },

  de: {
    "generative-visual": {
      title:
        "Generatives Visual",

      category:
        "KI / Visuelle Studie",

      description:
        "Eine Erkundung von Komposition, Bildsystemen und unerwarteten visuellen Richtungen mit generativen Werkzeugen.",
    },

    "type-in-motion": {
      title:
        "Typografie in Bewegung",

      category:
        "Motion / Typografie",

      description:
        "Eine Studie über Rhythmus, Maßstab, Timing und darüber, wie sich Typografie verändert, sobald sie sich bewegt.",
    },

    "form-study": {
      title:
        "Formstudie",

      category:
        "3D / Experiment",

      description:
        "Einfache Formen, Proportionen, Licht und Komposition werden ohne die Einschränkungen eines festgelegten Endergebnisses erkundet.",
    },

    "poster-system": {
      title:
        "Postersystem",

      category:
        "Grafik / Typografie",

      description:
        "Ein sich entwickelndes grafisches System aus Typografie, Struktur, Wiederholung und visueller Spannung.",
    },
  },
};

export function getPlaygroundMessages(
  locale: Locale,
) {
  return playgroundMessages[
    locale
  ];
}

export function getPlaygroundExperimentMessages(
  locale: Locale,
  slug: string,
): PlaygroundExperimentMessages | null {
  return (
    playgroundExperimentMessages[
      locale
    ][slug] ??
    playgroundExperimentMessages
      .en[slug] ??
    null
  );
}