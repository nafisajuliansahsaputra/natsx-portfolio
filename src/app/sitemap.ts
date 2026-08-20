import type {
  MetadataRoute,
} from "next";

import {
  getPublishedProjects,
} from "@/lib/public-projects";

import {
  getAbsoluteUrl,
} from "@/lib/site-url";

export const revalidate =
  300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects =
    await getPublishedProjects();

  const staticRoutes:
    MetadataRoute.Sitemap =
    [
      {
        url:
          getAbsoluteUrl(
            "/",
          ),

        changeFrequency:
          "weekly",

        priority:
          1,
      },

      {
        url:
          getAbsoluteUrl(
            "/work",
          ),

        changeFrequency:
          "weekly",

        priority:
          0.9,
      },

      {
        url:
          getAbsoluteUrl(
            "/about",
          ),

        changeFrequency:
          "monthly",

        priority:
          0.7,
      },

      {
        url:
          getAbsoluteUrl(
            "/playground",
          ),

        changeFrequency:
          "monthly",

        priority:
          0.7,
      },

      {
        url:
          getAbsoluteUrl(
            "/contact",
          ),

        changeFrequency:
          "monthly",

        priority:
          0.6,
      },

      {
        url:
          getAbsoluteUrl(
            "/cv",
          ),

        changeFrequency:
          "monthly",

        priority:
          0.6,
      },
    ];

  const projectRoutes:
    MetadataRoute.Sitemap =
    projects.map(
      (project) => ({
        url:
          getAbsoluteUrl(
            `/work/${project.slug}`,
          ),

        lastModified:
          new Date(
            project.updatedAt,
          ),

        changeFrequency:
          "monthly",

        priority:
          0.8,
      }),
    );

  return [
    ...staticRoutes,
    ...projectRoutes,
  ];
}