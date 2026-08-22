import {
  notFound,
} from "next/navigation";

import {
  CvPageContent,
} from "@/app/cv/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

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