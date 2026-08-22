import {
  notFound,
} from "next/navigation";

import {
  ContactPageContent,
} from "@/app/contact/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

import {
  getContactMessages,
} from "@/i18n/contact-messages";

import {
  createLocalizedPageMetadata,
} from "@/lib/page-metadata";

type LocalizedContactPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: LocalizedContactPageProps) {
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
    getContactMessages(
      locale,
    );

  const title =
    locale === "id"
      ? "Kontak"
      : "Kontakt";

  return createLocalizedPageMetadata({
    title,

    description:
      copy.hero.description,

    path:
      "/contact",

    locale,
  });
}

export default async function LocalizedContactPage({
  params,
}: LocalizedContactPageProps) {
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
    <ContactPageContent
      locale={
        locale
      }
    />
  );
}