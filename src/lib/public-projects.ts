import {
  cache,
} from "react";

import {
  unstable_cache,
} from "next/cache";

import {
  PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  PUBLIC_PORTFOLIO_CACHE_TAG,
} from "@/lib/portfolio-cache";

import {
  createPublicClient,
} from "@/lib/supabase/public";

const PUBLIC_PROJECT_FIELDS =
  "id,slug,title,project_number,year,period,summary,categories,roles,featured,sort_order,live_url,accent_color,secondary_color,updated_at,published_at";

const PUBLIC_SECTION_FIELDS =
  "id,project_id,section_type,eyebrow,heading,body,content,theme,sort_order,is_visible,created_at";

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

  updated_at: string;

  published_at:
    | string
    | null;
};

type PublicProjectSectionRow = {
  id: string;
  project_id: string;
  section_type: string;

  eyebrow:
    | string
    | null;

  heading:
    | string
    | null;

  body:
    | string
    | null;

  content: unknown;
  theme: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
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

  updatedAt: string;

  publishedAt:
    | string
    | null;
};

export type PublicProjectSection = {
  id: string;
  projectId: string;
  sectionType: string;
  eyebrow: string;
  heading: string;
  body: string;

  content: Record<
    string,
    unknown
  >;

  theme: string;
  sortOrder: number;
};

export type PublicProjectPageData = {
  project: PublicProject;

  sections:
    PublicProjectSection[];

  nextProject:
    | PublicProject
    | null;

  totalProjects: number;
};

function normalizeStringList(
  value:
    | unknown[]
    | null,
) {
  if (
    !Array.isArray(
      value,
    )
  ) {
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
    .map(
      (item) =>
        item.trim(),
    )
    .filter(
      Boolean,
    );
}

function normalizeContent(
  value: unknown,
): Record<
  string,
  unknown
> {
  if (
    typeof value !==
      "object" ||
    value === null ||
    Array.isArray(
      value,
    )
  ) {
    return {};
  }

  return value as Record<
    string,
    unknown
  >;
}

function normalizeProject(
  project:
    PublicProjectRow,
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

    updatedAt:
      project.updated_at,

    publishedAt:
      project.published_at,
  };
}

function normalizeSection(
  section:
    PublicProjectSectionRow,
): PublicProjectSection {
  return {
    id:
      section.id,

    projectId:
      section.project_id,

    sectionType:
      section.section_type,

    eyebrow:
      section.eyebrow
        ?.trim() ??
      "",

    heading:
      section.heading
        ?.trim() ??
      "",

    body:
      section.body
        ?.trim() ??
      "",

    content:
      normalizeContent(
        section.content,
      ),

    theme:
      section.theme,

    sortOrder:
      section.sort_order,
  };
}

function normalizeProjects(
  data: unknown,
) {
  return (
    (data ??
      []) as unknown as
      PublicProjectRow[]
  ).map(
    normalizeProject,
  );
}

/*
 * =========================
 * PUBLISHED PROJECTS
 * =========================
 */

async function loadPublishedProjects(): Promise<
  PublicProject[]
> {
  const supabase =
    createPublicClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "projects",
    )
    .select(
      PUBLIC_PROJECT_FIELDS,
    )
    .eq(
      "status",
      "published",
    )
    .order(
      "sort_order",
      {
        ascending:
          true,
      },
    );

  if (error) {
    throw new Error(
      `Gagal memuat published projects: ${error.message}`,
    );
  }

  return normalizeProjects(
    data,
  );
}

const getCachedPublishedProjects =
  unstable_cache(
    loadPublishedProjects,
    [
      "natsx-published-projects",
    ],
    {
      tags: [
        PUBLIC_PORTFOLIO_CACHE_TAG,
      ],

      revalidate:
        PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
    },
  );

export async function getPublishedProjects(): Promise<
  PublicProject[]
> {
  return getCachedPublishedProjects();
}

/*
 * =========================
 * FEATURED PROJECTS
 * =========================
 */

async function loadFeaturedProjects(
  limit: number,
): Promise<
  PublicProject[]
> {
  const supabase =
    createPublicClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "projects",
    )
    .select(
      PUBLIC_PROJECT_FIELDS,
    )
    .eq(
      "status",
      "published",
    )
    .eq(
      "featured",
      true,
    )
    .order(
      "sort_order",
      {
        ascending:
          true,
      },
    )
    .limit(
      limit,
    );

  if (error) {
    throw new Error(
      `Gagal memuat featured projects: ${error.message}`,
    );
  }

  return normalizeProjects(
    data,
  );
}

const getCachedFeaturedProjects =
  unstable_cache(
    loadFeaturedProjects,
    [
      "natsx-featured-projects",
    ],
    {
      tags: [
        PUBLIC_PORTFOLIO_CACHE_TAG,
      ],

      revalidate:
        PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
    },
  );

export async function getFeaturedProjects(
  limit = 3,
): Promise<
  PublicProject[]
> {
  const safeLimit =
    Math.max(
      1,
      Math.floor(
        limit,
      ),
    );

  return getCachedFeaturedProjects(
    safeLimit,
  );
}

/*
 * =========================
 * PROJECT DETAIL
 * =========================
 */

async function loadPublishedProjectPage(
  slug: string,
): Promise<
  PublicProjectPageData | null
> {
  const supabase =
    createPublicClient();

  const {
    data:
      projectData,

    error:
      projectError,
  } = await supabase
    .from(
      "projects",
    )
    .select(
      PUBLIC_PROJECT_FIELDS,
    )
    .eq(
      "slug",
      slug,
    )
    .eq(
      "status",
      "published",
    )
    .maybeSingle();

  if (
    projectError
  ) {
    throw new Error(
      `Gagal memuat project: ${projectError.message}`,
    );
  }

  if (
    !projectData
  ) {
    return null;
  }

  const project =
    normalizeProject(
      projectData as unknown as PublicProjectRow,
    );

  const [
    sectionResult,
    projectListResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "project_sections",
        )
        .select(
          PUBLIC_SECTION_FIELDS,
        )
        .eq(
          "project_id",
          project.id,
        )
        .eq(
          "is_visible",
          true,
        )
        .order(
          "sort_order",
          {
            ascending:
              true,
          },
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "projects",
        )
        .select(
          PUBLIC_PROJECT_FIELDS,
        )
        .eq(
          "status",
          "published",
        )
        .order(
          "sort_order",
          {
            ascending:
              true,
          },
        ),
    ]);

  if (
    sectionResult.error
  ) {
    throw new Error(
      `Gagal memuat project sections: ${sectionResult.error.message}`,
    );
  }

  if (
    projectListResult.error
  ) {
    throw new Error(
      `Gagal memuat project archive: ${projectListResult.error.message}`,
    );
  }

  const sections = (
    (sectionResult.data ??
      []) as unknown as
      PublicProjectSectionRow[]
  ).map(
    normalizeSection,
  );

  const projects =
    normalizeProjects(
      projectListResult.data,
    );

  const currentIndex =
    projects.findIndex(
      (item) =>
        item.id ===
        project.id,
    );

  let nextProject:
    | PublicProject
    | null =
    null;

  if (
    projects.length >
      1 &&
    currentIndex !==
      -1
  ) {
    nextProject =
      projects[
        (currentIndex +
          1) %
          projects.length
      ];
  }

  return {
    project,
    sections,
    nextProject,

    totalProjects:
      projects.length,
  };
}

const getCachedPublishedProjectPage =
  unstable_cache(
    loadPublishedProjectPage,
    [
      "natsx-published-project-page",
    ],
    {
      tags: [
        PUBLIC_PORTFOLIO_CACHE_TAG,
      ],

      revalidate:
        PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
    },
  );

/*
 * React cache tetap dipakai supaya
 * generateMetadata() dan page render
 * pada request yang sama tidak
 * melakukan pekerjaan identik dua kali.
 */
export const getPublishedProjectPage =
  cache(
    getCachedPublishedProjectPage,
  );

/*
 * =========================
 * PROJECT YEAR RANGE
 * =========================
 */

export function getPublicProjectYearRange(
  source:
    PublicProject[],
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
    years.length ===
    0
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
    earliest ===
    latest
  ) {
    return String(
      latest,
    );
  }

  return `${earliest}—${latest}`;
}