import type {
  MetadataRoute,
} from "next";

import {
  locales,
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getPublishedProjects,
} from "@/lib/public-projects";

import {
  getAbsoluteUrl,
} from "@/lib/site-url";

export const revalidate =
  300;

const staticPages = [
  {
    path:
      "/",

    changeFrequency:
      "weekly",

    priority:
      1,
  },

  {
    path:
      "/work",

    changeFrequency:
      "weekly",

    priority:
      0.9,
  },

  {
    path:
      "/about",

    changeFrequency:
      "monthly",

    priority:
      0.7,
  },

  {
    path:
      "/playground",

    changeFrequency:
      "monthly",

    priority:
      0.7,
  },

  {
    path:
      "/contact",

    changeFrequency:
      "monthly",

    priority:
      0.6,
  },

  {
    path:
      "/cv",

    changeFrequency:
      "monthly",

    priority:
      0.6,
  },
] as const;

function getLocalizedUrl(
  path: string,
  locale: Locale,
) {
  return getAbsoluteUrl(
    localizePath(
      path,
      locale,
    ),
  );
}

function getLanguageAlternates(
  path: string,
) {
  const englishUrl =
    getLocalizedUrl(
      path,
      "en",
    );

  return {
    en:
      englishUrl,

    id:
      getLocalizedUrl(
        path,
        "id",
      ),

    de:
      getLocalizedUrl(
        path,
        "de",
      ),

    "x-default":
      englishUrl,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects =
    await getPublishedProjects(
      "en",
    );

  const staticRoutes:
    MetadataRoute.Sitemap =
    staticPages.flatMap(
      (
        page,
      ) => {
        const alternates =
          getLanguageAlternates(
            page.path,
          );

        return locales.map(
          (
            locale,
          ) => ({
            url:
              getLocalizedUrl(
                page.path,
                locale,
              ),

            changeFrequency:
              page.changeFrequency,

            priority:
              page.priority,

            alternates: {
              languages:
                alternates,
            },
          }),
        );
      },
    );

  const projectRoutes:
    MetadataRoute.Sitemap =
    projects.flatMap(
      (
        project,
      ) => {
        const path =
          `/work/${project.slug}`;

        const alternates =
          getLanguageAlternates(
            path,
          );

        return locales.map(
          (
            locale,
          ) => ({
            url:
              getLocalizedUrl(
                path,
                locale,
              ),

            lastModified:
              new Date(
                project.updatedAt,
              ),

            changeFrequency:
              "monthly" as const,

            priority:
              0.8,

            alternates: {
              languages:
                alternates,
            },
          }),
        );
      },
    );

  return [
    ...staticRoutes,
    ...projectRoutes,
  ];
}