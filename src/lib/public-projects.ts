import {
  cache,
} from "react";

import {
  unstable_cache,
} from "next/cache";

import type {
  Locale,
} from "@/i18n/config";

import {
  PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  PUBLIC_PORTFOLIO_CACHE_TAG,
} from "@/lib/portfolio-cache";

import {
  createPublicClient,
} from "@/lib/supabase/public";

import {
  FALLBACK_PROJECT_ROWS,
  FALLBACK_PROJECT_TRANSLATION_ROWS,
  FALLBACK_SECTION_ROWS,
  FALLBACK_SECTION_TRANSLATION_ROWS,
} from "@/lib/public-portfolio-fallback-data";

import {
  shouldUsePublicPortfolioSnapshot,
} from "@/lib/public-portfolio-fallback-mode";

const PUBLIC_PROJECT_FIELDS =
  "id,slug,title,project_number,year,period,summary,categories,roles,featured,sort_order,live_url,accent_color,secondary_color,hero_image_path,card_image_path,updated_at,published_at";

const PUBLIC_PROJECT_NAVIGATION_FIELDS =
  "id,slug,title,project_number,categories,sort_order,accent_color";

const PUBLIC_PROJECT_SITEMAP_FIELDS =
  "slug,updated_at";

const PUBLIC_SECTION_FIELDS =
  "id,project_id,section_type,eyebrow,heading,body,content,theme,sort_order,is_visible,created_at";

const PROJECT_TRANSLATION_FIELDS =
  "project_id,locale,title,period,summary,categories,roles";

const SECTION_TRANSLATION_FIELDS =
  "section_id,locale,eyebrow,heading,body,content";

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

  hero_image_path:
    | string
    | null;

  card_image_path:
    | string
    | null;

  updated_at: string;

  published_at:
    | string
    | null;
};

type PublicProjectSitemapRow = {
  slug: string;
  updated_at: string;
};

type PublicProjectNavigationRow = {
  id: string;
  slug: string;
  title: string;
  project_number: string;

  categories:
    | unknown[]
    | null;

  sort_order: number;

  accent_color:
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

type ProjectTranslationRow = {
  project_id: string;
  locale: string;

  title:
    | string
    | null;

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
};

type SectionTranslationRow = {
  section_id: string;
  locale: string;

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
};

type ProjectTranslationBucket = {
  requested:
    | ProjectTranslationRow
    | null;

  english:
    | ProjectTranslationRow
    | null;
};

type SectionTranslationBucket = {
  requested:
    | SectionTranslationRow
    | null;

  english:
    | SectionTranslationRow
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

  heroImagePath:
    | string
    | null;

  cardImagePath:
    | string
    | null;

  updatedAt: string;

  publishedAt:
    | string
    | null;
};

export type PublicProjectSitemapEntry = {
  slug: string;
  updatedAt: string;
};

export type PublicProjectNavigation = {
  id: string;
  slug: string;
  number: string;
  title: string;
  disciplines: string[];
  sortOrder: number;
  accentColor: string;
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
    | PublicProjectNavigation
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

function mergeContent(
  base: unknown,
  override: unknown,
): Record<
  string,
  unknown
> {
  const baseRecord =
    normalizeContent(
      base,
    );

  const overrideRecord =
    normalizeContent(
      override,
    );

  const result: Record<
    string,
    unknown
  > = {
    ...baseRecord,
  };

  for (
    const [
      key,
      overrideValue,
    ] of Object.entries(
      overrideRecord,
    )
  ) {
    const baseValue =
      result[
        key
      ];

    const canMerge =
      typeof baseValue ===
        "object" &&
      baseValue !==
        null &&
      !Array.isArray(
        baseValue,
      ) &&
      typeof overrideValue ===
        "object" &&
      overrideValue !==
        null &&
      !Array.isArray(
        overrideValue,
      );

    result[
      key
    ] = canMerge
      ? mergeContent(
          baseValue,
          overrideValue,
        )
      : overrideValue;
  }

  return result;
}

function pickTranslatedText(
  requested:
    | string
    | null
    | undefined,

  english:
    | string
    | null
    | undefined,

  legacy:
    | string
    | null
    | undefined,
) {
  if (
    typeof requested ===
    "string"
  ) {
    return requested.trim();
  }

  if (
    typeof english ===
    "string"
  ) {
    return english.trim();
  }

  return legacy
    ?.trim() ??
    "";
}

function pickTranslatedTitle(
  requested:
    | string
    | null
    | undefined,

  english:
    | string
    | null
    | undefined,

  legacy: string,
) {
  const candidates = [
    requested,
    english,
    legacy,
  ];

  for (
    const candidate of
    candidates
  ) {
    if (
      typeof candidate !==
      "string"
    ) {
      continue;
    }

    const normalized =
      candidate.trim();

    if (
      normalized
    ) {
      return normalized;
    }
  }

  return legacy;
}

function pickTranslatedList(
  requested:
    | unknown[]
    | null
    | undefined,

  english:
    | unknown[]
    | null
    | undefined,

  legacy:
    | unknown[]
    | null,
) {
  if (
    Array.isArray(
      requested,
    )
  ) {
    return normalizeStringList(
      requested,
    );
  }

  if (
    Array.isArray(
      english,
    )
  ) {
    return normalizeStringList(
      english,
    );
  }

  return normalizeStringList(
    legacy,
  );
}

function buildProjectTranslationLookup(
  rows:
    ProjectTranslationRow[],

  locale: Locale,
) {
  const lookup =
    new Map<
      string,
      ProjectTranslationBucket
    >();

  for (
    const row of rows
  ) {
    const current =
      lookup.get(
        row.project_id,
      ) ?? {
        requested:
          null,

        english:
          null,
      };

    if (
      row.locale ===
      "en"
    ) {
      current.english =
        row;
    }

    if (
      row.locale ===
      locale
    ) {
      current.requested =
        row;
    }

    lookup.set(
      row.project_id,
      current,
    );
  }

  return lookup;
}

function buildSectionTranslationLookup(
  rows:
    SectionTranslationRow[],

  locale: Locale,
) {
  const lookup =
    new Map<
      string,
      SectionTranslationBucket
    >();

  for (
    const row of rows
  ) {
    const current =
      lookup.get(
        row.section_id,
      ) ?? {
        requested:
          null,

        english:
          null,
      };

    if (
      row.locale ===
      "en"
    ) {
      current.english =
        row;
    }

    if (
      row.locale ===
      locale
    ) {
      current.requested =
        row;
    }

    lookup.set(
      row.section_id,
      current,
    );
  }

  return lookup;
}

function normalizeProject(
  project:
    PublicProjectRow,

  translations?: ProjectTranslationBucket,
): PublicProject {
  const requested =
    translations
      ?.requested;

  const english =
    translations
      ?.english;

  const year =
    String(
      project.year,
    );

  const translatedPeriod =
    pickTranslatedText(
      requested
        ?.period,

      english
        ?.period,

      project.period,
    );

  return {
    id:
      project.id,

    slug:
      project.slug,

    number:
      project.project_number,

    title:
      pickTranslatedTitle(
        requested
          ?.title,

        english
          ?.title,

        project.title,
      ),

    year,

    period:
      translatedPeriod ||
      year,

    summary:
      pickTranslatedText(
        requested
          ?.summary,

        english
          ?.summary,

        project.summary,
      ),

    disciplines:
      pickTranslatedList(
        requested
          ?.categories,

        english
          ?.categories,

        project.categories,
      ),

    roles:
      pickTranslatedList(
        requested
          ?.roles,

        english
          ?.roles,

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

    heroImagePath:
      project
        .hero_image_path,

    cardImagePath:
      project
        .card_image_path,

    updatedAt:
      project.updated_at,

    publishedAt:
      project.published_at,
  };
}

function normalizeProjectNavigation(
  project:
    PublicProjectNavigationRow,

  translations?: ProjectTranslationBucket,
): PublicProjectNavigation {
  const requested =
    translations
      ?.requested;

  const english =
    translations
      ?.english;

  return {
    id:
      project.id,

    slug:
      project.slug,

    number:
      project.project_number,

    title:
      pickTranslatedTitle(
        requested
          ?.title,

        english
          ?.title,

        project.title,
      ),

    disciplines:
      pickTranslatedList(
        requested
          ?.categories,

        english
          ?.categories,

        project.categories,
      ),

    sortOrder:
      project.sort_order,

    accentColor:
      project.accent_color ||
      "#5961ED",
  };
}

function normalizeSection(
  section:
    PublicProjectSectionRow,

  translations?: SectionTranslationBucket,
): PublicProjectSection {
  const requested =
    translations
      ?.requested;

  const english =
    translations
      ?.english;

  const englishContent =
    mergeContent(
      section.content,
      english
        ?.content,
    );

  const localizedContent =
    mergeContent(
      englishContent,
      requested
        ?.content,
    );

  return {
    id:
      section.id,

    projectId:
      section.project_id,

    sectionType:
      section.section_type,

    eyebrow:
      pickTranslatedText(
        requested
          ?.eyebrow,

        english
          ?.eyebrow,

        section.eyebrow,
      ),

    heading:
      pickTranslatedText(
        requested
          ?.heading,

        english
          ?.heading,

        section.heading,
      ),

    body:
      pickTranslatedText(
        requested
          ?.body,

        english
          ?.body,

        section.body,
      ),

    content:
      localizedContent,

    theme:
      section.theme,

    sortOrder:
      section.sort_order,
  };
}

function getLocaleCandidates(
  locale: Locale,
) {
  return locale ===
    "en"
    ? [
        "en",
      ]
    : [
        "en",
        locale,
      ];
}

async function loadProjectTranslations(
  projectIds: string[],
  locale: Locale,
) {
  if (
    projectIds.length ===
    0
  ) {
    return [];
  }

  const supabase =
    createPublicClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "project_translations",
    )
    .select(
      PROJECT_TRANSLATION_FIELDS,
    )
    .in(
      "project_id",
      projectIds,
    )
    .in(
      "locale",
      getLocaleCandidates(
        locale,
      ),
    );

  if (error) {
    throw new Error(
      `Gagal memuat project translations: ${error.message}`,
    );
  }

  return (
    (data ??
      []) as unknown as
      ProjectTranslationRow[]
  );
}

async function loadSectionTranslations(
  sectionIds: string[],
  locale: Locale,
) {
  if (
    sectionIds.length ===
    0
  ) {
    return [];
  }

  const supabase =
    createPublicClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "project_section_translations",
    )
    .select(
      SECTION_TRANSLATION_FIELDS,
    )
    .in(
      "section_id",
      sectionIds,
    )
    .in(
      "locale",
      getLocaleCandidates(
        locale,
      ),
    );

  if (error) {
    throw new Error(
      `Gagal memuat section translations: ${error.message}`,
    );
  }

  return (
    (data ??
      []) as unknown as
      SectionTranslationRow[]
  );
}

function normalizeProjects(
  data: unknown,

  translations:
    ProjectTranslationRow[],

  locale: Locale,
) {
  const rows =
    (data ??
      []) as unknown as
      PublicProjectRow[];

  const translationLookup =
    buildProjectTranslationLookup(
      translations,
      locale,
    );

  return rows.map(
    (project) =>
      normalizeProject(
        project,
        translationLookup.get(
          project.id,
        ),
      ),
  );
}

function getFallbackPublishedProjects(
  locale: Locale,
): PublicProject[] {
  const localeCandidates =
    new Set(
      getLocaleCandidates(
        locale,
      ),
    );

  const translations =
    FALLBACK_PROJECT_TRANSLATION_ROWS
      .filter(
        (
          row,
        ) =>
          localeCandidates.has(
            row.locale,
          ),
      ) as unknown as
        ProjectTranslationRow[];

  return normalizeProjects(
    FALLBACK_PROJECT_ROWS as unknown as
      PublicProjectRow[],
    translations,
    locale,
  );
}

function getFallbackPublishedProjectSitemapEntries():
  PublicProjectSitemapEntry[] {
  return (
    FALLBACK_PROJECT_ROWS as unknown as
      PublicProjectRow[]
  ).map(
    (
      project,
    ) => ({
      slug:
        project.slug,

      updatedAt:
        project.updated_at,
    }),
  );
}

function getFallbackPublishedProjectPage(
  slug: string,
  locale: Locale,
): PublicProjectPageData | null {
  const rawProject =
    (
      FALLBACK_PROJECT_ROWS as unknown as
        PublicProjectRow[]
    ).find(
      (
        project,
      ) =>
        project.slug ===
        slug,
    );

  if (
    !rawProject
  ) {
    return null;
  }

  const rawSections =
    (
      FALLBACK_SECTION_ROWS as unknown as
        PublicProjectSectionRow[]
    )
      .filter(
        (
          section,
        ) =>
          section.project_id ===
          rawProject.id &&
          section.is_visible,
      )
      .sort(
        (
          left,
          right,
        ) =>
          left.sort_order -
          right.sort_order,
      );

  const rawProjects =
    (
      FALLBACK_PROJECT_ROWS as unknown as
        PublicProjectNavigationRow[]
    )
      .slice()
      .sort(
        (
          left,
          right,
        ) =>
          left.sort_order -
          right.sort_order,
      );

  const localeCandidates =
    new Set(
      getLocaleCandidates(
        locale,
      ),
    );

  const projectTranslations =
    FALLBACK_PROJECT_TRANSLATION_ROWS
      .filter(
        (
          row,
        ) =>
          localeCandidates.has(
            row.locale,
          ),
      ) as unknown as
        ProjectTranslationRow[];

  const sectionIdSet =
    new Set(
      rawSections.map(
        (
          section,
        ) =>
          section.id,
      ),
    );

  const sectionTranslations =
    FALLBACK_SECTION_TRANSLATION_ROWS
      .filter(
        (
          row,
        ) =>
          sectionIdSet.has(
            row.section_id,
          ) &&
          localeCandidates.has(
            row.locale,
          ),
      ) as unknown as
        SectionTranslationRow[];

  const projectLookup =
    buildProjectTranslationLookup(
      projectTranslations,
      locale,
    );

  const sectionLookup =
    buildSectionTranslationLookup(
      sectionTranslations,
      locale,
    );

  const project =
    normalizeProject(
      rawProject,
      projectLookup.get(
        rawProject.id,
      ),
    );

  const sections =
    rawSections.map(
      (
        section,
      ) =>
        normalizeSection(
          section,
          sectionLookup.get(
            section.id,
          ),
        ),
    );

  const projects =
    rawProjects.map(
      (
        item,
      ) =>
        normalizeProjectNavigation(
          item,
          projectLookup.get(
            item.id,
          ),
        ),
    );

  const currentIndex =
    projects.findIndex(
      (
        item,
      ) =>
        item.id ===
        project.id,
    );

  const nextProject =
    projects.length >
      1 &&
    currentIndex !==
      -1
      ? projects[
          (
            currentIndex +
            1
          ) %
            projects.length
        ]
      : null;

  return {
    project,
    sections,
    nextProject,

    totalProjects:
      projects.length,
  };
}

async function loadPublishedProjects(
  locale: Locale,
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

  const rows =
    (data ??
      []) as unknown as
      PublicProjectRow[];

  const translations =
    await loadProjectTranslations(
      rows.map(
        (
          project,
        ) =>
          project.id,
      ),
      locale,
    );

  return normalizeProjects(
    rows,
    translations,
    locale,
  );
}

const getCachedPublishedProjects =
  unstable_cache(
    loadPublishedProjects,
    [
      "natsx-published-projects-v2",
    ],
    {
      tags: [
        PUBLIC_PORTFOLIO_CACHE_TAG,
      ],

      revalidate:
        PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
    },
  );

export async function getPublishedProjects(
  locale: Locale =
    "en",
): Promise<
  PublicProject[]
> {
  if (
    shouldUsePublicPortfolioSnapshot()
  ) {
    return getFallbackPublishedProjects(
      locale,
    );
  }

  try {
    return await getCachedPublishedProjects(
      locale,
    );
  } catch {
    return getFallbackPublishedProjects(
      locale,
    );
  }
}

async function loadPublishedProjectSitemapEntries():
  Promise<
    PublicProjectSitemapEntry[]
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
      PUBLIC_PROJECT_SITEMAP_FIELDS,
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
      `Gagal memuat published project sitemap entries: ${error.message}`,
    );
  }

  const rows =
    (data ??
      []) as unknown as
      PublicProjectSitemapRow[];

  return rows.map(
    (
      project,
    ) => ({
      slug:
        project.slug,

      updatedAt:
        project.updated_at,
    }),
  );
}

const getCachedPublishedProjectSitemapEntries =
  unstable_cache(
    loadPublishedProjectSitemapEntries,
    [
      "natsx-published-project-sitemap-v1",
    ],
    {
      tags: [
        PUBLIC_PORTFOLIO_CACHE_TAG,
      ],

      revalidate:
        PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
    },
  );

export async function getPublishedProjectSitemapEntries():
  Promise<
    PublicProjectSitemapEntry[]
  > {
  if (
    shouldUsePublicPortfolioSnapshot()
  ) {
    return getFallbackPublishedProjectSitemapEntries();
  }

  try {
    return await getCachedPublishedProjectSitemapEntries();
  } catch {
    return getFallbackPublishedProjectSitemapEntries();
  }
}

async function loadFeaturedProjects(
  limit: number,
  locale: Locale,
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

  const rows =
    (data ??
      []) as unknown as
      PublicProjectRow[];

  const translations =
    await loadProjectTranslations(
      rows.map(
        (
          project,
        ) =>
          project.id,
      ),
      locale,
    );

  return normalizeProjects(
    rows,
    translations,
    locale,
  );
}

const getCachedFeaturedProjects =
  unstable_cache(
    loadFeaturedProjects,
    [
      "natsx-featured-projects-v2",
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
  locale: Locale =
    "en",
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

  if (
    shouldUsePublicPortfolioSnapshot()
  ) {
    return getFallbackPublishedProjects(
      locale,
    )
      .filter(
        (
          project,
        ) =>
          project.featured,
      )
      .slice(
        0,
        safeLimit,
      );
  }

  try {
    return await getCachedFeaturedProjects(
      safeLimit,
      locale,
    );
  } catch {
    return getFallbackPublishedProjects(
      locale,
    )
      .filter(
        (
          project,
        ) =>
          project.featured,
      )
      .slice(
        0,
        safeLimit,
      );
  }
}

async function loadPublishedProjectPage(
  slug: string,
  locale: Locale,
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

  const rawProject =
    projectData as unknown as
      PublicProjectRow;

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
          rawProject.id,
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
          PUBLIC_PROJECT_NAVIGATION_FIELDS,
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

  const rawSections =
    (sectionResult.data ??
      []) as unknown as
      PublicProjectSectionRow[];

  const rawProjects =
    (projectListResult.data ??
      []) as unknown as
      PublicProjectNavigationRow[];

  const [
    projectTranslations,
    sectionTranslations,
  ] =
    await Promise.all([
      loadProjectTranslations(
        rawProjects.map(
          (
            project,
          ) =>
            project.id,
        ),
        locale,
      ),

      loadSectionTranslations(
        rawSections.map(
          (
            section,
          ) =>
            section.id,
        ),
        locale,
      ),
    ]);

  const projectLookup =
    buildProjectTranslationLookup(
      projectTranslations,
      locale,
    );

  const sectionLookup =
    buildSectionTranslationLookup(
      sectionTranslations,
      locale,
    );

  const project =
    normalizeProject(
      rawProject,
      projectLookup.get(
        rawProject.id,
      ),
    );

  const sections =
    rawSections.map(
      (
        section,
      ) =>
        normalizeSection(
          section,
          sectionLookup.get(
            section.id,
          ),
        ),
    );

  const projects =
    rawProjects.map(
      (
        item,
      ) =>
        normalizeProjectNavigation(
          item,
          projectLookup.get(
            item.id,
          ),
        ),
    );

  const currentIndex =
    projects.findIndex(
      (item) =>
        item.id ===
        project.id,
    );

  let nextProject:
    | PublicProjectNavigation
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
      "natsx-published-project-page-v2",
    ],
    {
      tags: [
        PUBLIC_PORTFOLIO_CACHE_TAG,
      ],

      revalidate:
        PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS,
    },
  );

export const getPublishedProjectPage =
  cache(
    async (
      slug: string,
      locale: Locale =
        "en",
    ) => {
      if (
        shouldUsePublicPortfolioSnapshot()
      ) {
        return getFallbackPublishedProjectPage(
          slug,
          locale,
        );
      }

      try {
        return await getCachedPublishedProjectPage(
          slug,
          locale,
        );
      } catch {
        return getFallbackPublishedProjectPage(
          slug,
          locale,
        );
      }
    },
  );

export function getPublicProjectYearRange(
  source:
    PublicProject[],
) {
  const years =
    source
      .map(
        (
          project,
        ) =>
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