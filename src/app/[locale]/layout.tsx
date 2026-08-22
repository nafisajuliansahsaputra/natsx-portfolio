import type {
  Metadata,
} from "next";

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
    (locale) => ({
      locale,
    }),
  );
}

export const metadata: Metadata = {
  /*
   * Temporary.
   *
   * ID / DE masih menggunakan
   * English content selama fase
   * infrastructure.
   *
   * Jangan index sampai seluruh
   * translation selesai.
   */
  robots: {
    index: false,
    follow: true,
  },
};

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
      data-locale={
        locale
      }
    >
      {children}
    </div>
  );
}