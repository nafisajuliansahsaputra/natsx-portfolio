import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocalizedLocale } from "@/i18n/config";
import { SmartCafeCaseStudy, smartCafeMetadata } from "@/app/work/smart-cafe-system/page";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) return { robots: { index: false, follow: false } };
  return smartCafeMetadata(locale);
}
export default async function LocalizedSmartCafePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocalizedLocale(locale)) notFound();
  return <SmartCafeCaseStudy locale={locale} />;
}
