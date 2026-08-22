import {
  notFound,
} from "next/navigation";

import {
  isLocalizedLocale,
  localizedLocales,
} from "@/i18n/config";

type LocaleLayoutProps = {
  children:
    React.ReactNode;

  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return localizedLocales.map(
    (
      locale,
    ) => ({
      locale,
    }),
  );
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
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
    <div
      lang={
        locale
      }
      data-locale={
        locale
      }
    >
      {
        children
      }
    </div>
  );
}