import {
  notFound,
} from "next/navigation";

import HomePage from "@/components/home/HomePage";

import {
  isLocalizedLocale,
} from "@/i18n/config";

type LocalizedHomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const revalidate =
  3600;

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