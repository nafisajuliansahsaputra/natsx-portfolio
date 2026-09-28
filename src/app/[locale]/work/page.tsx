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
  params:
    Promise<{
      locale:
        string;
    }>;

  searchParams:
    Promise<{
      category?:
        | string
        | string[];
    }>;
};


export const revalidate =
  24 * 60 * 60;


function getRequestedCategory(
  value:
    | string
    | string[]
    | undefined,
) {
  if (
    typeof value !==
    "string"
  ) {
    return "all";
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  return normalized ||
    "all";
}


export async function generateMetadata({
  params,
}: LocalizedWorkPageProps) {
  const {
    locale,
  } =
    await params;

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
  searchParams,
}: LocalizedWorkPageProps) {
  const {
    locale,
  } =
    await params;

  const query =
    await searchParams;

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
      initialCategory={
        getRequestedCategory(
          query.category,
        )
      }
    />
  );
}