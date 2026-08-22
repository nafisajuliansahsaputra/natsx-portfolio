import {
  notFound,
} from "next/navigation";

import {
  ContactPageContent,
} from "@/app/contact/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

type LocalizedContactPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

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