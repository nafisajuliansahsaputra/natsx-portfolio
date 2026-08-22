import {
  notFound,
} from "next/navigation";

import {
  WorkPageContent,
} from "@/app/work/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

type LocalizedWorkPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate =
  3600;

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