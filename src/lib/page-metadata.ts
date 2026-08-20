import type {
  Metadata,
} from "next";

import {
  getAbsoluteUrl,
} from "@/lib/site-url";

type CreatePageMetadataOptions = {
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({
  title,
  description,
  path,
}: CreatePageMetadataOptions): Metadata {
  const canonical =
    getAbsoluteUrl(path);

  const socialTitle =
    `${title} — NATSX`;

  return {
    title,

    description,

    alternates: {
      canonical,
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