import {
  notFound,
} from "next/navigation";

import {
  PlaygroundPageContent,
} from "@/app/playground/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

import {
  getPlaygroundMessages,
} from "@/i18n/playground-messages";

import {
  createLocalizedPageMetadata,
} from "@/lib/page-metadata";

import { isPlaygroundPublic } from "@/lib/public-visibility";

type LocalizedPlaygroundPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: LocalizedPlaygroundPageProps) {
  const {
    locale,
  } = await params;

  if (
    !isPlaygroundPublic ||
    !isLocalizedLocale(
      locale,
    )
  ) {
    notFound();
  }

  const copy =
    getPlaygroundMessages(
      locale,
    );

  return createLocalizedPageMetadata({
    title:
      "Playground",

    description:
      copy.hero.description,

    path:
      "/playground",

    locale,
  });
}

export default async function LocalizedPlaygroundPage({
  params,
}: LocalizedPlaygroundPageProps) {
  const {
    locale,
  } = await params;

  if (
    !isPlaygroundPublic ||
    !isLocalizedLocale(
      locale,
    )
  ) {
    notFound();
  }

  return (
    <PlaygroundPageContent
      locale={
        locale
      }
    />
  );
}