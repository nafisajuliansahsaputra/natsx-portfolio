import {
  notFound,
} from "next/navigation";

import {
  AboutPageContent,
} from "@/app/about/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

import {
  getAboutMessages,
} from "@/i18n/about-messages";

import {
  createLocalizedPageMetadata,
} from "@/lib/page-metadata";

type LocalizedAboutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: LocalizedAboutPageProps) {
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
    getAboutMessages(
      locale,
    );

  const title =
    locale === "id"
      ? "Tentang Nafisa Juliansah Saputra"
      : "Über Nafisa Juliansah Saputra";

  return createLocalizedPageMetadata({
    title,

    description:
      `Nafisa Juliansah Saputra (NATSX). ${copy.profile.paragraphs[0]}`,

    path:
      "/about",

    locale,
  });
}

export default async function LocalizedAboutPage({
  params,
}: LocalizedAboutPageProps) {
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
    <AboutPageContent
      locale={
        locale
      }
    />
  );
}