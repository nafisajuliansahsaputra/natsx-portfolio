import type {
  Locale,
} from "@/i18n/config";

export const TRANSLATION_TARGET_LOCALES = [
  "id",
  "de",
] as const satisfies readonly Locale[];

export type TranslationTargetLocale =
  (typeof TRANSLATION_TARGET_LOCALES)[number];

export type TranslationMode =
  | "missing"
  | "overwrite";

export const PORTFOLIO_SECTION_TYPES = [
  "overview",
  "narrative",
  "statement",
  "image",
  "gallery",
  "metrics",
  "quote",
  "finale",
] as const;

export type PortfolioSectionType =
  (typeof PORTFOLIO_SECTION_TYPES)[number];

export type PortfolioTranslationProject = {
  title: string;
  period: string;
  summary: string;
  categories: string[];
  roles: string[];
};

export type PortfolioTranslationImage = {
  alt: string;
  caption: string;
};

export type PortfolioTranslationGalleryItem = {
  id: string;
  alt: string;
  caption: string;
};

export type PortfolioTranslationMetricItem = {
  id: string;
  value: string;
  label: string;
  detail: string;
};

export type PortfolioTranslationQuote = {
  text: string;
  source: string;
  context: string;
};

export type PortfolioTranslationFinale = {
  title: string;
  body: string;
  ctaLabel: string;

  /*
   * Hanya ALT yang boleh
   * diterjemahkan.
   *
   * Asset dan CTA URL tetap
   * shared dan tidak pernah
   * diberikan ke AI.
   */
  mediaAlt: string;

  /*
   * Memberi tahu model bahwa
   * shared media memang ada
   * tanpa mengirim asset-nya.
   */
  hasMedia: boolean;
};

export type PortfolioTranslationSection = {
  id: string;

  sectionType:
    PortfolioSectionType;

  eyebrow: string;
  heading: string;
  body: string;

  image:
    | PortfolioTranslationImage
    | null;

  gallery:
    PortfolioTranslationGalleryItem[];

  metrics:
    PortfolioTranslationMetricItem[];

  quote:
    | PortfolioTranslationQuote
    | null;

  finale:
    | PortfolioTranslationFinale
    | null;
};

export type PortfolioTranslationPayload = {
  project:
    PortfolioTranslationProject;

  sections:
    PortfolioTranslationSection[];
};