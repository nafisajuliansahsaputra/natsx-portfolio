import type {
  Locale,
} from "@/i18n/config";

const homeMessages = {
  en: {
    hero: {
      titlePrimary:
        "Designing",

      titleSecondary:
        "Ideas",

      titleTertiary:
        "Into",

      titleQuaternary:
        "Experience",

      description:
        "Multidisciplinary digital creator working across design, development, motion, and visual experiences.",

      selectedWork:
        "Selected Work",

      aboutMe:
        "About Me",
    },

    selectedWork: {
      sectionLabel:
        "02 / Selected Work",

      headingLine1:
        "Selected",

      headingLine2:
        "Work",

      description:
        "A selection of projects across design, development, identity, and digital experiences.",

      current:
        "CURRENT",

      viewAll:
        "View All Work",

      viewProject:
        "View Project",

      selectedProject:
        "Selected Project",

      viewCaseStudy:
        "View case study",
    },

    capabilities: {
      sectionLabel:
        "03 / Capabilities",

      headingLine1:
        "Ideas across",

      headingLine2:
        "disciplines",

      intro:
        "I work across design, development, motion, and creative direction—connecting different disciplines to build complete digital experiences.",

      skillsLabel:
        "skills",

      items: {
        design: {
          title:
            "Design",

          description:
            "Creating clear and considered visual experiences across digital products, interfaces, and brand systems.",
        },

        development: {
          title:
            "Development",

          description:
            "Turning visual concepts into responsive and functional digital experiences with modern web technologies.",
        },

        motion: {
          title:
            "Motion",

          description:
            "Adding movement with purpose through motion graphics, interaction, editing, and visual storytelling.",
        },

        creative: {
          title:
            "Creative",

          description:
            "Shaping ideas beyond individual deliverables through direction, experimentation, and visual exploration.",
        },
      },
    },
  },

  id: {
    hero: {
      titlePrimary:
        "Merancang",

      titleSecondary:
        "Ide",

      titleTertiary:
        "Menjadi",

      titleQuaternary:
        "Pengalaman",

      description:
        "Kreator digital multidisiplin yang bekerja di bidang desain, development, motion, dan pengalaman visual.",

      selectedWork:
        "Karya Pilihan",

      aboutMe:
        "Tentang Saya",
    },

    selectedWork: {
      sectionLabel:
        "02 / Karya Pilihan",

      headingLine1:
        "Karya",

      headingLine2:
        "Pilihan",

      description:
        "Pilihan proyek yang mencakup desain, development, identitas visual, dan pengalaman digital.",

      current:
        "TERKINI",

      viewAll:
        "Lihat Semua Karya",

      viewProject:
        "Lihat Proyek",

      selectedProject:
        "Proyek Pilihan",

      viewCaseStudy:
        "Lihat studi kasus",
    },

    capabilities: {
      sectionLabel:
        "03 / Keahlian",

      headingLine1:
        "Ide lintas",

      headingLine2:
        "disiplin",

      intro:
        "Saya bekerja di antara desain, development, motion, dan creative direction—menghubungkan berbagai disiplin untuk membangun pengalaman digital yang utuh.",

      skillsLabel:
        "keahlian",

      items: {
        design: {
          title:
            "Desain",

          description:
            "Menciptakan pengalaman visual yang jelas dan terarah untuk produk digital, interface, dan sistem brand.",
        },

        development: {
          title:
            "Development",

          description:
            "Mengubah konsep visual menjadi pengalaman digital yang responsif dan fungsional dengan teknologi web modern.",
        },

        motion: {
          title:
            "Motion",

          description:
            "Menghadirkan gerak dengan tujuan melalui motion graphics, interaction, editing, dan visual storytelling.",
        },

        creative: {
          title:
            "Creative Direction",

          description:
            "Mengembangkan ide melampaui satu output melalui direction, eksperimen, dan eksplorasi visual.",
        },
      },
    },
  },

  de: {
    hero: {
      titlePrimary:
        "Ideen",

      titleSecondary:
        "gestalten",

      titleTertiary:
        "Erlebnisse",

      titleQuaternary:
        "schaffen",

      description:
        "Multidisziplinärer Digital Creator an der Schnittstelle von Design, Development, Motion und visuellen Erlebnissen.",

      selectedWork:
        "Projekte",

      aboutMe:
        "Über mich",
    },

    selectedWork: {
      sectionLabel:
        "02 / Ausgewählte Projekte",

      headingLine1:
        "Ausgewählte",

      headingLine2:
        "Projekte",

      description:
        "Eine Auswahl an Projekten aus Design, Development, visueller Identität und digitalen Erlebnissen.",

      current:
        "AKTUELL",

      viewAll:
        "Alle Projekte ansehen",

      viewProject:
        "Projekt ansehen",

      selectedProject:
        "Ausgewähltes Projekt",

      viewCaseStudy:
        "Case Study ansehen",
    },

    capabilities: {
      sectionLabel:
        "03 / Kompetenzen",

      headingLine1:
        "Disziplinen",

      headingLine2:
        "verbinden",

      intro:
        "Ich arbeite an der Schnittstelle von Design, Development, Motion und Creative Direction und verbinde diese Disziplinen zu ganzheitlichen digitalen Erlebnissen.",

      skillsLabel:
        "Kompetenzen",

      items: {
        design: {
          title:
            "Design",

          description:
            "Klare und durchdachte visuelle Erlebnisse für digitale Produkte, Interfaces und Markensysteme.",
        },

        development: {
          title:
            "Development",

          description:
            "Visuelle Konzepte mit modernen Webtechnologien in responsive und funktionale digitale Erlebnisse übersetzen.",
        },

        motion: {
          title:
            "Motion",

          description:
            "Bewegung gezielt einsetzen – mit Motion Graphics, Interaction, Editing und visuellem Storytelling.",
        },

        creative: {
          title:
            "Creative Direction",

          description:
            "Ideen über einzelne Deliverables hinaus durch Direction, Experimente und visuelle Exploration weiterentwickeln.",
        },
      },
    },
  },
} as const;

export function getHomeMessages(
  locale: Locale,
) {
  return homeMessages[
    locale
  ];
}