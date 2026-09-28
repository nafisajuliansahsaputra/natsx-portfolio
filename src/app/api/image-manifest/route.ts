import {
  unstable_cache,
} from "next/cache";

import {
  PORTFOLIO_MEDIA_BUCKET,
} from "@/lib/portfolio-media";

import {
  PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  PUBLIC_PORTFOLIO_CACHE_TAG,
} from "@/lib/portfolio-cache";

import {
  getPortfolioMediaPublicUrl,
} from "@/lib/public-media";

import {
  getPublishedProjects,
} from "@/lib/public-projects";

type ManifestItem = {
  url:
    string;

  size:
    number;

  group:
    "project-cover";
};

async function loadImageManifest() {
  /*
   * The global preloader only needs lightweight project covers.
   * Do not enumerate project sections or gallery media here:
   * that previously made a homepage background task aware of
   * every large portfolio asset.
   */
  const projects =
    await getPublishedProjects(
      "en",
    );

  const items =
    new Map<
      string,
      ManifestItem
    >();

  projects.forEach(
    (
      project,
    ) => {
      [
        project
          .heroImagePath,
        project
          .cardImagePath,
      ].forEach(
        (
          path,
        ) => {
          if (
            !path
          ) {
            return;
          }

          const url =
            getPortfolioMediaPublicUrl(
              PORTFOLIO_MEDIA_BUCKET,
              path,
            );

          items.set(
            url,
            {
              url,
              size:
                0,
              group:
                "project-cover",
            },
          );
        },
      );
    },
  );

  return Array.from(
    items.values(),
  );
}

const getCachedImageManifest =
  unstable_cache(
    loadImageManifest,
    [
      "natsx-global-image-manifest-v2",
    ],
    {
      tags: [
        PUBLIC_PORTFOLIO_CACHE_TAG,
      ],

      revalidate:
        PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
    },
  );

export async function GET() {
  const images =
    await getCachedImageManifest();

  return Response.json(
    {
      images,
    },
    {
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
