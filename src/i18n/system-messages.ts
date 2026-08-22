import type {
  Locale,
} from "@/i18n/config";

const systemMessages = {
  en: {
    notFound: {
      label:
        "Error / 404",

      status:
        "Page not found / NATSX",

      eyebrow:
        "Wrong turn?",

      headingLine1:
        "Looks like this idea",

      headingLine2:
        "never made it to",

      headingLine3:
        "production",

      description:
        "The page you're looking for doesn't exist, has moved, or is still somewhere between an idea and a finished project.",

      backHome:
        "Back Home",

      exploreWork:
        "Explore Work",

      identity:
        "NATSX / Digital Creator",
    },

    error: {
      eyebrow:
        "SYSTEM / TEMPORARY ERROR",

      headingLine1:
        "Something",

      headingLine2:
        "went wrong",

      description:
        "The portfolio couldn't load this content right now. Try the request again or return to the homepage.",

      retry:
        "Try again",

      backHome:
        "Back home",
    },
  },

  id: {
    notFound: {
      label:
        "Error / 404",

      status:
        "Halaman tidak ditemukan / NATSX",

      eyebrow:
        "Salah jalan?",

      headingLine1:
        "Sepertinya ide ini",

      headingLine2:
        "tidak pernah sampai",

      headingLine3:
        "ke produksi",

      description:
        "Halaman yang kamu cari tidak tersedia, telah dipindahkan, atau masih berada di antara sebuah ide dan proyek yang selesai.",

      backHome:
        "Kembali ke Beranda",

      exploreWork:
        "Jelajahi Karya",

      identity:
        "NATSX / Kreator Digital",
    },

    error: {
      eyebrow:
        "SISTEM / ERROR SEMENTARA",

      headingLine1:
        "Terjadi",

      headingLine2:
        "kesalahan",

      description:
        "Portfolio tidak dapat memuat konten ini untuk sementara. Coba lagi atau kembali ke beranda.",

      retry:
        "Coba lagi",

      backHome:
        "Kembali ke beranda",
    },
  },

  de: {
    notFound: {
      label:
        "Fehler / 404",

      status:
        "Seite nicht gefunden / NATSX",

      eyebrow:
        "Falsch abgebogen?",

      headingLine1:
        "Sieht so aus, als hätte",

      headingLine2:
        "es diese Idee nie bis",

      headingLine3:
        "zur Umsetzung geschafft",

      description:
        "Die gesuchte Seite existiert nicht, wurde verschoben oder befindet sich noch irgendwo zwischen einer Idee und einem fertigen Projekt.",

      backHome:
        "Zur Startseite",

      exploreWork:
        "Projekte entdecken",

      identity:
        "NATSX / Digital Creator",
    },

    error: {
      eyebrow:
        "SYSTEM / VORÜBERGEHENDER FEHLER",

      headingLine1:
        "Etwas ist",

      headingLine2:
        "schiefgelaufen",

      description:
        "Das Portfolio konnte diesen Inhalt gerade nicht laden. Versuche es erneut oder kehre zur Startseite zurück.",

      retry:
        "Erneut versuchen",

      backHome:
        "Zur Startseite",
    },
  },
} as const;

export function getSystemMessages(
  locale: Locale,
) {
  return systemMessages[
    locale
  ];
}