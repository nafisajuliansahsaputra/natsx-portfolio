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
  createPublicClient,
} from "@/lib/supabase/public";

type ManifestItem = {
  url:
    string;

  size:
    number;

  group:
    "project-cover" |
    "project-media";
};

type ProjectRow = {
  id:
    string;

  hero_image_path:
    string | null;

  card_image_path:
    string | null;
};

type SectionRow = {
  content:
    unknown;
};

function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}

function collectMediaAssets(
  value:
    unknown,
  assets:
    Map<
      string,
      number
    >,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    value.forEach(
      (
        item,
      ) => {
        collectMediaAssets(
          item,
          assets,
        );
      },
    );

    return;
  }

  if (
    !isRecord(
      value,
    )
  ) {
    return;
  }

  if (
    value.bucket ===
      PORTFOLIO_MEDIA_BUCKET &&
    typeof value.path ===
      "string" &&
    value.path
  ) {
    const size =
      typeof value.size ===
        "number" &&
      Number.isFinite(
        value.size,
      )
        ? value.size
        : 0;

    assets.set(
      value.path,
      Math.max(
        assets.get(
          value.path,
        ) ??
          0,
        size,
      ),
    );
  }

  Object.values(
    value,
  ).forEach(
    (
      nested,
    ) => {
      collectMediaAssets(
        nested,
        assets,
      );
    },
  );
}

async function loadImageManifest() {
  const supabase =
    createPublicClient();

  const {
    data:
      projectsData,
    error:
      projectsError,
  } =
    await supabase
      .from(
        "projects",
      )
      .select(
        "id,hero_image_path,card_image_path",
      )
      .eq(
        "status",
        "published",
      );

  if (
    projectsError
  ) {
    throw new Error(
      `Failed to load image manifest projects: ${projectsError.message}`,
    );
  }

  const projects =
    (
      projectsData ??
      []
    ) as unknown as
      ProjectRow[];

  const projectIds =
    projects.map(
      (
        project,
      ) =>
        project.id,
    );

  const sectionsResult =
    projectIds.length >
      0
      ? await supabase
          .from(
            "project_sections",
          )
          .select(
            "content",
          )
          .in(
            "project_id",
            projectIds,
          )
          .eq(
            "is_visible",
            true,
          )
      : {
          data:
            [] as SectionRow[],

          error:
            null,
        };

  if (
    sectionsResult.error
  ) {
    throw new Error(
      `Failed to load image manifest sections: ${sectionsResult.error.message}`,
    );
  }

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
          .hero_image_path,
        project
          .card_image_path,
      ].forEach(
        (
          path,
        ) => {
          if (!path) {
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

  const mediaAssets =
    new Map<
      string,
      number
    >();

  (
    sectionsResult.data ??
    []
  ).forEach(
    (
      row,
    ) => {
      const section =
        row as unknown as
          SectionRow;

      collectMediaAssets(
        section.content,
        mediaAssets,
      );
    },
  );

  mediaAssets.forEach(
    (
      size,
      path,
    ) => {
      const url =
        getPortfolioMediaPublicUrl(
          PORTFOLIO_MEDIA_BUCKET,
          path,
        );

      items.set(
        url,
        {
          url,
          size,
          group:
            "project-media",
        },
      );
    },
  );

  return Array.from(
    items.values(),
  ).sort(
    (
      left,
      right,
    ) => {
      if (
        left.group !==
        right.group
      ) {
        return left.group ===
          "project-cover"
          ? -1
          : 1;
      }

      return (
        left.size -
        right.size
      );
    },
  );
}

const getCachedImageManifest =
  unstable_cache(
    loadImageManifest,
    [
      "natsx-global-image-manifest-v1",
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
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
