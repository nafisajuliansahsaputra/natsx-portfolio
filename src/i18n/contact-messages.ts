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
        "Have a product",

      headingLine2:
        "worth building",

      description:
        "I'm open to selected full-stack development, product engineering, and digital product work where technical depth, reliability, and thoughtful interfaces matter.",

      disciplinesLine1:
        "Full-Stack Development / Product Engineering",

      disciplinesLine2:
        "APIs & Integrations / UI & Product Design",
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
        "For web applications, product systems, APIs, integrations, and engineering work with a clear problem to solve and room to build it properly.",

      professionalProfile:
        "Professional profile",

      viewCv:
        "View CV",
    },

    collaboration: {
      label:
        "What I can help build",

      items: [
        "Web Applications",
        "Full-Stack Development",
        "APIs & Integrations",
        "Product Engineering",
        "UI / UX & Product Design",
        "Interactive Digital Experiences",
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
        "Punya produk",

      headingLine2:
        "yang ingin dibangun",

      description:
        "Saya terbuka untuk pekerjaan full-stack development, product engineering, dan proyek digital terpilih yang membutuhkan kedalaman teknis, reliability, serta interface yang matang.",

      disciplinesLine1:
        "Full-Stack Development / Product Engineering",

      disciplinesLine2:
        "API & Integrasi / UI & Product Design",
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
        "Untuk web application, product system, API, integration, dan pekerjaan engineering dengan masalah yang jelas serta ruang untuk membangunnya dengan benar.",

      professionalProfile:
        "Profil profesional",

      viewCv:
        "Lihat CV",
    },

    collaboration: {
      label:
        "Yang bisa saya bantu bangun",

      items: [
        "Web Application",
        "Full-Stack Development",
        "API & Integrasi",
        "Product Engineering",
        "UI / UX & Product Design",
        "Interactive Digital Experience",
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
        "Ein Produkt,",

      headingLine2:
        "das wir bauen sollten",

      description:
        "Ich bin offen für ausgewählte Full-Stack-Development-, Product-Engineering- und digitale Produktprojekte, bei denen technische Tiefe, Zuverlässigkeit und durchdachte Interfaces zählen.",

      disciplinesLine1:
        "Full-Stack Development / Product Engineering",

      disciplinesLine2:
        "APIs & Integrationen / UI & Product Design",
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
        "Für Webanwendungen, Produktsysteme, APIs, Integrationen und Engineering-Aufgaben mit einem klaren Problem und genug Raum, es sauber zu lösen.",

      professionalProfile:
        "Berufliches Profil",

      viewCv:
        "CV ansehen",
    },

    collaboration: {
      label:
        "Was ich mitentwickeln kann",

      items: [
        "Webanwendungen",
        "Full-Stack Development",
        "APIs & Integrationen",
        "Product Engineering",
        "UI / UX & Product Design",
        "Interaktive digitale Erlebnisse",
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