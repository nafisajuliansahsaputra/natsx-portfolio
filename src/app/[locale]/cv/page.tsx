import {
  notFound,
} from "next/navigation";

import {
  CvPageContent,
} from "@/app/cv/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

import {
  getCvMessages,
} from "@/i18n/cv-messages";

import {
  createLocalizedPageMetadata,
} from "@/lib/page-metadata";

type LocalizedCvPageProps = {
  params: Promise<{
    locale: string;
  }>;

  searchParams: Promise<{
    lang?:
      | string
      | string[];
  }>;
};

export async function generateMetadata({
  params,
}: LocalizedCvPageProps) {
  const {
    locale,
  } = await params;

  if (
    !isLocalizedLocale(
      locale,
    )
  ) {
    notFound();
  }

  const copy =
    getCvMessages(
      locale,
    );

  return createLocalizedPageMetadata({
    title:
      "CV",

    description:
      copy.hero.description,

    path:
      "/cv",

    locale,
  });
}

export default async function LocalizedCvPage({
  params,
  searchParams,
}: LocalizedCvPageProps) {
  const {
    locale,
  } = await params;

  if (
    !isLocalizedLocale(
      locale,
    )
  ) {
    notFound();
  }

  return (
    <CvPageContent
      locale={
        locale
      }
      searchParams={
        searchParams
      }
    />
  );
}