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

      home:
        "NATSX home",

      portrait:
        "Portrait of Nafisa Juliansah Saputra",

      mainNavigation:
        "Main navigation",

      mobileNavigation:
        "Main navigation menu",

      footerNavigation:
        "Footer navigation",

      openMenu:
        "Open navigation menu",

      closeMenu:
        "Close navigation menu",

      changeLanguage:
        "Change language",

      languageSelector:
        "Language selector",
    },

    identity: {
      digitalCreator:
        "Full-Stack Developer",
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

      playground:
        "Playground",

      contact:
        "Kontak",
    },

    accessibility: {
      skipToMain:
        "Lewati ke konten utama",

      home:
        "Beranda NATSX",

      portrait:
        "Potret Nafisa Juliansah Saputra",

      mainNavigation:
        "Navigasi utama",

      mobileNavigation:
        "Menu navigasi utama",

      footerNavigation:
        "Navigasi footer",

      openMenu:
        "Buka menu navigasi",

      closeMenu:
        "Tutup menu navigasi",

      changeLanguage:
        "Ganti bahasa",

      languageSelector:
        "Pemilih bahasa",
    },

    identity: {
      digitalCreator:
        "Full-Stack Developer",
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

      home:
        "NATSX Startseite",

      portrait:
        "Porträt von Nafisa Juliansah Saputra",

      mainNavigation:
        "Hauptnavigation",

      mobileNavigation:
        "Mobiles Navigationsmenü",

      footerNavigation:
        "Footer-Navigation",

      openMenu:
        "Navigationsmenü öffnen",

      closeMenu:
        "Navigationsmenü schließen",

      changeLanguage:
        "Sprache ändern",

      languageSelector:
        "Sprachauswahl",
    },

    identity: {
      digitalCreator:
        "Full-Stack Developer",
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