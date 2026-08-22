import type {
  Metadata,
} from "next";

import type {
  Locale,
} from "@/i18n/config";

import {
  localizePath,
} from "@/i18n/config";

import {
  getAbsoluteUrl,
} from "@/lib/site-url";

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
};

type CreateLocalizedPageMetadataOptions =
  CreatePageMetadataOptions & {
    locale: Locale;
  };

function getOpenGraphLocale(
  locale: Locale,
) {
  switch (
    locale
  ) {
    case "id":
      return "id_ID";

    case "de":
      return "de_DE";

    default:
      return "en_US";
  }
}

function getAlternateOpenGraphLocales(
  locale: Locale,
) {
  switch (
    locale
  ) {
    case "id":
      return [
        "en_US",
        "de_DE",
      ];

    case "de":
      return [
        "en_US",
        "id_ID",
      ];

    default:
      return [
        "id_ID",
        "de_DE",
      ];
  }
}

function getLanguageAlternates(
  path: string,
) {
  const englishUrl =
    getAbsoluteUrl(
      localizePath(
        path,
        "en",
      ),
    );

  return {
    en:
      englishUrl,

    id:
      getAbsoluteUrl(
        localizePath(
          path,
          "id",
        ),
      ),

    de:
      getAbsoluteUrl(
        localizePath(
          path,
          "de",
        ),
      ),

    "x-default":
      englishUrl,
  };
}

export function createLocalizedPageMetadata({
  title,
  description,
  path,
  locale,
  absoluteTitle = false,
}: CreateLocalizedPageMetadataOptions): Metadata {
  const canonical =
    getAbsoluteUrl(
      localizePath(
        path,
        locale,
      ),
    );

  const socialTitle =
    absoluteTitle
      ? title
      : `${title} — NATSX`;

  return {
    title:
      absoluteTitle
        ? {
            absolute:
              title,
          }
        : title,

    description,

    robots: {
      index:
        true,

      follow:
        true,

      googleBot: {
        index:
          true,

        follow:
          true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },

    alternates: {
      canonical,

      languages:
        getLanguageAlternates(
          path,
        ),
    },

    openGraph: {
      type:
        "website",

      title:
        socialTitle,

      description,

      url:
        canonical,

      siteName:
        "NATSX",

      locale:
        getOpenGraphLocale(
          locale,
        ),

      alternateLocale:
        getAlternateOpenGraphLocales(
          locale,
        ),
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        socialTitle,

      description,
    },
  };
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: CreatePageMetadataOptions): Metadata {
  return createLocalizedPageMetadata({
    title,
    description,
    path,
    absoluteTitle,
    locale:
      "en",
  });
}