import {
  createPublicClient,
} from "@/lib/supabase/public";

type PublicProjectRow = {
  id: string;

  slug: string;

  title: string;

  project_number: string;

  year: number;

  period:
    | string
    | null;

  summary:
    | string
    | null;

  categories:
    | unknown[]
    | null;

  roles:
    | unknown[]
    | null;

  featured: boolean;

  sort_order: number;

  live_url:
    | string
    | null;

  accent_color:
    | string
    | null;

  secondary_color:
    | string
    | null;
};

export type PublicProject = {
  id: string;

  slug: string;

  number: string;

  title: string;

  year: string;

  period: string;

  summary: string;

  disciplines: string[];

  roles: string[];

  featured: boolean;

  sortOrder: number;

  website:
    | string
    | null;

  accentColor: string;

  secondaryColor:
    | string
    | null;
};

function normalizeStringList(
  value:
    | unknown[]
    | null,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
        "string",
    )
    .map((item) =>
      item.trim(),
    )
    .filter(Boolean);
}

function normalizeProject(
  project: PublicProjectRow,
): PublicProject {
  return {
    id:
      project.id,

    slug:
      project.slug,

    number:
      project.project_number,

    title:
      project.title,

    year:
      String(
        project.year,
      ),

    period:
      project.period ??
      String(
        project.year,
      ),

    summary:
      project.summary ??
      "",

    disciplines:
      normalizeStringList(
        project.categories,
      ),

    roles:
      normalizeStringList(
        project.roles,
      ),

    featured:
      project.featured,

    sortOrder:
      project.sort_order,

    website:
      project.live_url,

    accentColor:
      project.accent_color ||
      "#5961ED",

    secondaryColor:
      project.secondary_color,
  };
}

export async function getPublishedProjects(): Promise<
  PublicProject[]
> {
  const supabase =
    createPublicClient();

  const {
    data,
    error,
  } = await supabase
    .from("projects")
    .select(
      [
        "id",
        "slug",
        "title",
        "project_number",
        "year",
        "period",
        "summary",
        "categories",
        "roles",
        "featured",
        "sort_order",
        "live_url",
        "accent_color",
        "secondary_color",
      ].join(","),
    )
    .eq(
      "status",
      "published",
    )
    .order(
      "sort_order",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `Gagal memuat published projects: ${error.message}`,
    );
  }

  return (
    (
      data ??
      []
    ) as unknown as PublicProjectRow[]
  ).map(
    normalizeProject,
  );
}

export function getPublicProjectYearRange(
  source: PublicProject[],
) {
  const years =
    source
      .map(
        (project) =>
          Number(
            project.year,
          ),
      )
      .filter(
        Number.isFinite,
      );

  if (
    years.length === 0
  ) {
    return "";
  }

  const earliest =
    Math.min(
      ...years,
    );

  const latest =
    Math.max(
      ...years,
    );

  if (
    earliest === latest
  ) {
    return String(
      latest,
    );
  }

  return `${earliest}—${latest}`;
}