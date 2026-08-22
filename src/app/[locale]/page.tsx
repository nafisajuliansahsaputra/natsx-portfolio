import {
  notFound,
} from "next/navigation";

import HomePage from "@/components/home/HomePage";

import {
  isLocalizedLocale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import {
  createLocalizedPageMetadata,
} from "@/lib/page-metadata";

type LocalizedHomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate =
  3600;

export async function generateMetadata({
  params,
}: LocalizedHomePageProps) {
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
    getHomeMessages(
      locale,
    );

  return createLocalizedPageMetadata({
    title:
      "NATSX — Digital Creator",

    description:
      copy.hero.description,

    path:
      "/",

    locale,

    absoluteTitle:
      true,
  });
}

export default async function LocalizedHomePage({
  params,
}: LocalizedHomePageProps) {
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
    <HomePage
      locale={
        locale
      }
    />
  );
}