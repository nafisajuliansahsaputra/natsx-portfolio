import type {
  Locale,
} from "@/i18n/config";

export const messages = {
  en: {
    navigation: {
      work:
        "Work",

      about:
        "About",

      playground:
        "Playground",

      contact:
        "Contact",
    },

    accessibility: {
      skipToMain:
        "Skip to main content",

      mainNavigation:
        "Main navigation",

      mobileNavigation:
        "Main navigation menu",

      openMenu:
        "Open navigation menu",

      closeMenu:
        "Close navigation menu",
    },

    language: {
      label:
        "Language",
    },

    footer: {
      designedBy:
        "Designed & built by",

      getInTouch:
        "Get in touch",

      elsewhere:
        "Elsewhere",

      profile:
        "Profile",

      viewCv:
        "View CV",

      backToTop:
        "Back to top",
    },
  },

  id: {
    navigation: {
      work:
        "Karya",

      about:
        "Tentang",

      /*
       * "Playground" dipertahankan
       * sebagai istilah kreatif /
       * bagian identitas situs.
       */
      playground:
        "Playground",

      contact:
        "Kontak",
    },

    accessibility: {
      skipToMain:
        "Lewati ke konten utama",

      mainNavigation:
        "Navigasi utama",

      mobileNavigation:
        "Menu navigasi utama",

      openMenu:
        "Buka menu navigasi",

      closeMenu:
        "Tutup menu navigasi",
    },

    language: {
      label:
        "Bahasa",
    },

    footer: {
      designedBy:
        "Dirancang & dibuat oleh",

      getInTouch:
        "Hubungi",

      elsewhere:
        "Lainnya",

      profile:
        "Profil",

      viewCv:
        "Lihat CV",

      backToTop:
        "Kembali ke atas",
    },
  },

  de: {
    navigation: {
      work:
        "Arbeiten",

      about:
        "Über mich",

      playground:
        "Playground",

      contact:
        "Kontakt",
    },

    accessibility: {
      skipToMain:
        "Zum Hauptinhalt",

      mainNavigation:
        "Hauptnavigation",

      mobileNavigation:
        "Mobiles Navigationsmenü",

      openMenu:
        "Navigationsmenü öffnen",

      closeMenu:
        "Navigationsmenü schließen",
    },

    language: {
      label:
        "Sprache",
    },

    footer: {
      designedBy:
        "Gestaltet & entwickelt von",

      getInTouch:
        "Kontakt",

      elsewhere:
        "Weitere Links",

      profile:
        "Profil",

      viewCv:
        "CV ansehen",

      backToTop:
        "Nach oben",
    },
  },
} as const;

export function getMessages(
  locale: Locale,
) {
  return messages[
    locale
  ];
}