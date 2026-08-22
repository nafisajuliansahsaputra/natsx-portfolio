import type {
  Locale,
} from "@/i18n/config";

const contactMessages = {
  en: {
    hero: {
      label:
        "Contact",

      worldwide:
        "Available Worldwide",

      headingLine1:
        "Have an idea",

      headingLine2:
        "worth exploring",

      description:
        "I'm open to selected freelance work, creative collaborations, and digital projects where different disciplines can come together.",

      disciplinesLine1:
        "Design / Development",

      disciplinesLine2:
        "Motion / Creative Direction",
    },

    primary: {
      label:
        "Start a conversation",

      hint:
        "Best way to reach me",

      email:
        "Email",

      connect:
        "Let's connect ↗",

      portfolio:
        "Portfolio",

      explore:
        "Explore",

      work:
        "the work ↗",
    },

    availability: {
      label:
        "Availability",

      statusLines: [
        "Open to selected",
        "opportunities",
      ],

      description:
        "For projects with a clear idea, interesting problem, or enough room to create something thoughtful.",

      professionalProfile:
        "Professional profile",

      viewCv:
        "View CV",
    },

    collaboration: {
      label:
        "What we could make",

      items: [
        "Digital Products",
        "Web Experiences",
        "UI / UX Design",
        "Brand Identity",
        "Creative Direction",
        "Motion & Visuals",
      ],
    },

    social: {
      label:
        "Elsewhere",

      headingLine1:
        "A few other places",

      headingLine2:
        "you can find me",
    },

    closing: {
      label:
        "Still exploring?",

      headingLine1:
        "Take a look at",

      headingLine2:
        "what I've been making",

      action:
        "Explore the work",
    },
  },

  id: {
    hero: {
      label:
        "Kontak",

      worldwide:
        "Tersedia untuk kolaborasi global",

      headingLine1:
        "Punya ide",

      headingLine2:
        "yang layak digali",

      description:
        "Saya terbuka untuk freelance terpilih, kolaborasi kreatif, dan proyek digital yang memberi ruang bagi berbagai disiplin untuk bekerja bersama.",

      disciplinesLine1:
        "Design / Development",

      disciplinesLine2:
        "Motion / Creative Direction",
    },

    primary: {
      label:
        "Mulai percakapan",

      hint:
        "Cara terbaik menghubungi saya",

      email:
        "Email",

      connect:
        "Mari terhubung ↗",

      portfolio:
        "Portfolio",

      explore:
        "Jelajahi",

      work:
        "karya saya ↗",
    },

    availability: {
      label:
        "Ketersediaan",

      statusLines: [
        "Terbuka untuk",
        "peluang terpilih",
      ],

      description:
        "Untuk proyek dengan ide yang jelas, masalah yang menarik, atau ruang yang cukup untuk menciptakan sesuatu secara matang.",

      professionalProfile:
        "Profil profesional",

      viewCv:
        "Lihat CV",
    },

    collaboration: {
      label:
        "Yang bisa kita buat",

      items: [
        "Produk Digital",
        "Web Experience",
        "UI / UX Design",
        "Brand Identity",
        "Creative Direction",
        "Motion & Visual",
      ],
    },

    social: {
      label:
        "Temukan Saya",

      headingLine1:
        "Beberapa tempat lain",

      headingLine2:
        "untuk menemukan saya",
    },

    closing: {
      label:
        "Masih ingin melihat?",

      headingLine1:
        "Lihat lebih jauh",

      headingLine2:
        "apa yang telah saya buat",

      action:
        "Jelajahi karya",
    },
  },

  de: {
    hero: {
      label:
        "Kontakt",

      worldwide:
        "Weltweit verfügbar",

      headingLine1:
        "Eine Idee,",

      headingLine2:
        "die es wert ist",

      description:
        "Ich bin offen für ausgewählte Freelance-Projekte, kreative Zusammenarbeit und digitale Projekte, in denen verschiedene Disziplinen zusammenkommen.",

      disciplinesLine1:
        "Design / Development",

      disciplinesLine2:
        "Motion / Creative Direction",
    },

    primary: {
      label:
        "Gespräch beginnen",

      hint:
        "Am besten erreichbar über",

      email:
        "E-Mail",

      connect:
        "Kontakt aufnehmen ↗",

      portfolio:
        "Portfolio",

      explore:
        "Projekte",

      work:
        "entdecken ↗",
    },

    availability: {
      label:
        "Verfügbarkeit",

      statusLines: [
        "Offen für ausgewählte",
        "Möglichkeiten",
      ],

      description:
        "Für Projekte mit einer klaren Idee, einer interessanten Herausforderung oder genug Raum, um etwas Durchdachtes zu gestalten.",

      professionalProfile:
        "Berufliches Profil",

      viewCv:
        "CV ansehen",
    },

    collaboration: {
      label:
        "Was wir gestalten könnten",

      items: [
        "Digitale Produkte",
        "Web Experiences",
        "UI / UX Design",
        "Brand Identity",
        "Creative Direction",
        "Motion & Visuals",
      ],
    },

    social: {
      label:
        "Weitere Links",

      headingLine1:
        "Weitere Orte,",

      headingLine2:
        "an denen du mich findest",
    },

    closing: {
      label:
        "Noch neugierig?",

      headingLine1:
        "Entdecke,",

      headingLine2:
        "woran ich gearbeitet habe",

      action:
        "Projekte entdecken",
    },
  },
} as const;

export function getContactMessages(
  locale: Locale,
) {
  return contactMessages[
    locale
  ];
}