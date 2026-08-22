import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import {
  generateProjectMetadata,
  ProjectPageContent,
} from "@/app/work/[slug]/page";

import {
  isLocalizedLocale,
} from "@/i18n/config";

type LocalizedProjectPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const revalidate =
  3600;

export async function generateMetadata({
  params,
}: LocalizedProjectPageProps): Promise<Metadata> {
  const {
    locale,
    slug,
  } = await params;

  if (
    !isLocalizedLocale(
      locale,
    )
  ) {
    return {
      title:
        "Project Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return generateProjectMetadata(
    slug,
    locale,
  );
}

export default async function LocalizedProjectPage({
  params,
}: LocalizedProjectPageProps) {
  const {
    locale,
    slug,
  } = await params;

  if (
    !isLocalizedLocale(
      locale,
    )
  ) {
    notFound();
  }

  return (
    <ProjectPageContent
      slug={
        slug
      }
      locale={
        locale
      }
    />
  );
}