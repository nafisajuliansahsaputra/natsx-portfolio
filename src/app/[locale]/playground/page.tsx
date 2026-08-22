import {
  notFound,
} from "next/navigation";

import {
  PlaygroundPageContent,
} from "@/app/playground/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

type LocalizedPlaygroundPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocalizedPlaygroundPage({
  params,
}: LocalizedPlaygroundPageProps) {
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
    <PlaygroundPageContent
      locale={
        locale
      }
    />
  );
}