import type {
  MetadataRoute,
} from "next";

import {
  locales,
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getPublishedProjectSitemapEntries,
  getPublishedProjects,
} from "@/lib/public-projects";

import {
  getProjectPrimaryVisualUrl,
  getProjectSecondaryVisualUrl,
} from "@/lib/public-media";

import {
  getAbsoluteUrl,
} from "@/lib/site-url";

import { isPlaygroundPublic } from "@/lib/public-visibility";
import { engineeringNotes, engineeringNotesPublishedOn } from "@/lib/engineering-notes";

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

const staticImagePaths: Record<string, string[]> = {
  "/": [
    "/images/natsx-portrait-hero-bases.png",
  ],
  "/work": [
    "/images/work-thumbnails/spall.webp",
    "/images/work-thumbnails/vision.webp",
    "/images/work-thumbnails/bast.webp",
    "/images/work-thumbnails/attendance.webp",
  ],
  "/about": [
    "/images/natsx-abt.webp",
  ],
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, publishedProjects] =
    await Promise.all([
      getPublishedProjectSitemapEntries(),
      getPublishedProjects("en"),
    ]);

  // Cover assets are not always rendered in an HTML <img>. Publishing them
  // in the sitemap makes these already-public visuals discoverable as images.
  const imagesBySlug = new Map(
    publishedProjects.map((project) => [
      project.slug,
      Array.from(
        new Set([
          getProjectPrimaryVisualUrl(project),
          getProjectSecondaryVisualUrl(project),
        ].filter(
          (url): url is string =>
            Boolean(url) && /^https:\/\//i.test(url!),
        )),
      ),
    ]),
  );

  const staticRoutes:
    MetadataRoute.Sitemap =
    staticPages
      .filter((page) => isPlaygroundPublic || page.path !== "/playground")
      .flatMap(
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

            images: staticImagePaths[page.path]?.map(
              (imagePath) => getAbsoluteUrl(imagePath),
            ),

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

            images: imagesBySlug.get(project.slug),

            alternates: {
              languages:
                alternates,
            },
          }),
        );
      },
    );

  // Original English-only technical articles have no untranslated
  // /id or /de counterparts, so they deliberately omit hreflang alternates.
  const engineeringRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/engineering"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...engineeringNotes.map((note) => ({
      url: getAbsoluteUrl("/engineering/" + note.slug),
      lastModified: new Date(engineeringNotesPublishedOn + "T00:00:00+07:00"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [
    ...staticRoutes,
    ...projectRoutes,
    ...engineeringRoutes,
  ];
}