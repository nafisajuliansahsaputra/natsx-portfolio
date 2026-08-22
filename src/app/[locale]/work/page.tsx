import {
  notFound,
} from "next/navigation";

import {
  WorkPageContent,
} from "@/app/work/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

import {
  getWorkMessages,
} from "@/i18n/work-messages";

import {
  createLocalizedPageMetadata,
} from "@/lib/page-metadata";

type LocalizedWorkPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate =
  3600;

export async function generateMetadata({
  params,
}: LocalizedWorkPageProps) {
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
    getWorkMessages(
      locale,
    );

  return createLocalizedPageMetadata({
    title:
      copy.hero.heading,

    description:
      copy.hero.description,

    path:
      "/work",

    locale,
  });
}

export default async function LocalizedWorkPage({
  params,
}: LocalizedWorkPageProps) {
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
    <WorkPageContent
      locale={
        locale
      }
    />
  );
}