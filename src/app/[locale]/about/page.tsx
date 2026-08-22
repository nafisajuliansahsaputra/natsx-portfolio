import {
  notFound,
} from "next/navigation";

import {
  AboutPageContent,
} from "@/app/about/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

type LocalizedAboutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

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