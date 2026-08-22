import type {
  Metadata,
} from "next";

import ProjectPage, {
  generateMetadata as generateProjectMetadata,
} from "@/app/work/[slug]/page";

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
    slug,
  } = await params;

  return generateProjectMetadata({
    params:
      Promise.resolve({
        slug,
      }),
  });
}

export default async function LocalizedProjectPage({
  params,
}: LocalizedProjectPageProps) {
  const {
    slug,
  } = await params;

  return (
    <ProjectPage
      params={
        Promise.resolve({
          slug,
        })
      }
    />
  );
}