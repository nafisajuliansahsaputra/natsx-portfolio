"use server";

import {
  revalidatePath,
  updateTag,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  PUBLIC_PORTFOLIO_CACHE_TAG,
} from "@/lib/portfolio-cache";

import {
  getGallerySectionMedia,
  getImageSectionMedia,
} from "@/lib/portfolio-media";

import {
  getFinaleSectionContent,
  getMetricsSectionContent,
  getQuoteSectionContent,
} from "@/lib/project-section-content";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  translatePortfolioPayload,
} from "@/lib/translation/portfolio-translator";

import {
  PORTFOLIO_SECTION_TYPES,
  TRANSLATION_TARGET_LOCALES,
  type PortfolioSectionType,
  type PortfolioTranslationPayload,
  type PortfolioTranslationSection,
  type TranslationMode,
  type TranslationTargetLocale,
} from "@/lib/translation/types";

export type GenerateProjectTranslationState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;

  generatedLocales?:
    TranslationTargetLocale[];
};

type ProjectRow = {
  id: string;

  title: string;

  period:
    | string
    | null;

  summary:
    | string
    | null;

  categories:
    | string[]
    | null;

  roles:
    | string[]
    | null;
};

type SectionRow = {
  id: string;

  section_type:
    string;

  eyebrow:
    | string
    | null;

  heading:
    | string
    | null;

  body:
    | string
    | null;

  content:
    unknown;

  sort_order: number;
};

type ExistingProjectTranslationRow = {
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
    | string[]
    | null;

  roles:
    | string[]
    | null;
};

type ExistingSectionTranslationRow = {
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

  content:
    unknown;
};

function isRecord(
  value: unknown,
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

function getRecord(
  value: unknown,
): Record<
  string,
  unknown
> {
  return isRecord(
    value,
  )
    ? value
    : {};
}

function getRecordText(
  value:
    Record<
      string,
      unknown
    >,
  key: string,
) {
  return typeof value[
    key
  ] ===
    "string"
    ? (
        value[
          key
        ] as string
      )
    : null;
}

function normalizeText(
  value:
    | string
    | null
    | undefined,
) {
  const normalized =
    value?.trim() ??
    "";

  return normalized ||
    null;
}

function normalizeArray(
  value: unknown,
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
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      Boolean,
    );
}

function resolveText(
  existing:
    | string
    | null
    | undefined,

  generated: string,

  mode:
    TranslationMode,
) {
  const current =
    normalizeText(
      existing,
    );

  if (
    mode ===
      "missing" &&
    current
  ) {
    return current;
  }

  return normalizeText(
    generated,
  );
}

function resolveArray(
  existing: unknown,

  generated: string[],

  mode:
    TranslationMode,
) {
  const current =
    normalizeArray(
      existing,
    );

  if (
    mode ===
      "missing" &&
    current.length >
      0
  ) {
    return current;
  }

  const normalized =
    normalizeArray(
      generated,
    );

  return normalized.length >
    0
    ? normalized
    : null;
}

function isPortfolioSectionType(
  value: string,
): value is PortfolioSectionType {
  return PORTFOLIO_SECTION_TYPES.includes(
    value as
      PortfolioSectionType,
  );
}

function isTargetLocale(
  value: string,
): value is TranslationTargetLocale {
  return TRANSLATION_TARGET_LOCALES.includes(
    value as
      TranslationTargetLocale,
  );
}

function isTranslationMode(
  value: string,
): value is TranslationMode {
  return (
    value ===
      "missing" ||
    value ===
      "overwrite"
  );
}

async function getAdminClient() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },

    error:
      authenticationError,
  } =
    await supabase.auth.getUser();

  if (
    authenticationError ||
    !user
  ) {
    redirect(
      "/admin/login",
    );
  }

  const {
    data:
      adminUser,

    error:
      adminError,
  } =
    await supabase
      .from(
        "admin_users",
      )
      .select(
        "user_id",
      )
      .eq(
        "user_id",
        user.id,
      )
      .maybeSingle();

  if (
    adminError
  ) {
    throw new Error(
      `Gagal memverifikasi admin: ${adminError.message}`,
    );
  }

  if (
    !adminUser
  ) {
    redirect(
      "/admin/login?error=unauthorized",
    );
  }

  return {
    supabase,
    user,
  };
}

function refreshProject(
  projectId: string,
) {
  updateTag(
    PUBLIC_PORTFOLIO_CACHE_TAG,
  );

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    `/admin/projects/${projectId}`,
  );

  revalidatePath(
    `/admin/projects/${projectId}/sections`,
  );
}

function buildSourceSection(
  row:
    SectionRow,
): PortfolioTranslationSection {
  if (
    !isPortfolioSectionType(
      row.section_type,
    )
  ) {
    throw new Error(
      `Section "${row.id}" memakai type "${row.section_type}" yang belum didukung Translation Engine.`,
    );
  }

  const base:
    PortfolioTranslationSection = {
    id:
      row.id,

    sectionType:
      row.section_type,

    eyebrow:
      row.eyebrow ??
      "",

    heading:
      row.heading ??
      "",

    body:
      row.body ??
      "",

    image:
      null,

    gallery:
      [],

    metrics:
      [],

    quote:
      null,

    finale:
      null,
  };

  if (
    row.section_type ===
    "image"
  ) {
    const image =
      getImageSectionMedia(
        row.content,
      );

    if (
      image
    ) {
      base.image = {
        alt:
          image.alt,

        caption:
          image.caption,
      };
    }
  }

  if (
    row.section_type ===
    "gallery"
  ) {
    const gallery =
      getGallerySectionMedia(
        row.content,
      );

    if (
      gallery
    ) {
      base.gallery =
        gallery.items.map(
          (
            item,
          ) => ({
            id:
              item.id,

            alt:
              item.alt,

            caption:
              item.caption,
          }),
        );
    }
  }

  if (
    row.section_type ===
    "metrics"
  ) {
    const metrics =
      getMetricsSectionContent(
        row.content,
      );

    base.metrics =
      metrics.items.map(
        (
          item,
        ) => ({
          id:
            item.id,

          value:
            item.value,

          label:
            item.label,

          detail:
            item.detail,
        }),
      );
  }

  if (
    row.section_type ===
    "quote"
  ) {
    const quote =
      getQuoteSectionContent(
        row.content,
      );

    base.quote = {
      text:
        quote.text,

      source:
        quote.source,

      context:
        quote.context,
    };
  }

  if (
    row.section_type ===
    "finale"
  ) {
    const finale =
      getFinaleSectionContent(
        row.content,
      );

    base.finale = {
      title:
        finale.title,

      body:
        finale.body,

      ctaLabel:
        finale.ctaLabel,

      mediaAlt:
        finale.media
          ?.alt ??
        "",

      hasMedia:
        Boolean(
          finale.media,
        ),
    };
  }

  return base;
}

function setStringIfPresent(
  target:
    Record<
      string,
      string
    >,

  key: string,

  value:
    | string
    | null,
) {
  if (
    value
  ) {
    target[
      key
    ] =
      value;
  }
}

function buildLocalizedContent({
  existingContent,
  sourceSection,
  translatedSection,
  mode,
}: {
  existingContent:
    unknown;

  sourceSection:
    PortfolioTranslationSection;

  translatedSection:
    PortfolioTranslationSection;

  mode:
    TranslationMode;
}) {
  const current =
    getRecord(
      existingContent,
    );

  /*
   * Unknown future translation
   * namespaces tetap dipertahankan.
   */
  const next = {
    ...current,
  };

  const currentImage =
    getRecord(
      current.image,
    );

  const currentGallery =
    getRecord(
      current.gallery,
    );

  const currentMetrics =
    getRecord(
      current.metrics,
    );

  const currentQuote =
    getRecord(
      current.quote,
    );

  const currentFinale =
    getRecord(
      current.finale,
    );

  /*
   * Known specialized namespaces
   * dibangun ulang supaya AI tidak
   * pernah bisa menyimpan shared
   * asset/layout/URL.
   */
  delete next.image;
  delete next.gallery;
  delete next.metrics;
  delete next.quote;
  delete next.finale;

  if (
    sourceSection.sectionType ===
      "image" &&
    sourceSection.image &&
    translatedSection.image
  ) {
    const imageCopy:
      Record<
        string,
        string
      > = {};

    setStringIfPresent(
      imageCopy,
      "alt",
      resolveText(
        getRecordText(
          currentImage,
          "alt",
        ),
        translatedSection
          .image.alt,
        mode,
      ),
    );

    setStringIfPresent(
      imageCopy,
      "caption",
      resolveText(
        getRecordText(
          currentImage,
          "caption",
        ),
        translatedSection
          .image.caption,
        mode,
      ),
    );

    if (
      Object.keys(
        imageCopy,
      ).length >
      0
    ) {
      next.image =
        imageCopy;
    }
  }

  if (
    sourceSection.sectionType ===
    "gallery"
  ) {
    const currentCopyById =
      getRecord(
        currentGallery
          .copyById,
      );

    const translatedById =
      new Map(
        translatedSection
          .gallery
          .map(
            (
              item,
            ) => [
              item.id,
              item,
            ],
          ),
      );

    const copyById:
      Record<
        string,
        Record<
          string,
          string
        >
      > = {};

    for (
      const sourceItem of
      sourceSection.gallery
    ) {
      const generated =
        translatedById.get(
          sourceItem.id,
        );

      if (
        !generated
      ) {
        continue;
      }

      const existingItem =
        getRecord(
          currentCopyById[
            sourceItem.id
          ],
        );

      const itemCopy:
        Record<
          string,
          string
        > = {};

      setStringIfPresent(
        itemCopy,
        "alt",
        resolveText(
          getRecordText(
            existingItem,
            "alt",
          ),
          generated.alt,
          mode,
        ),
      );

      setStringIfPresent(
        itemCopy,
        "caption",
        resolveText(
          getRecordText(
            existingItem,
            "caption",
          ),
          generated.caption,
          mode,
        ),
      );

      if (
        Object.keys(
          itemCopy,
        ).length >
        0
      ) {
        copyById[
          sourceItem.id
        ] =
          itemCopy;
      }
    }

    if (
      Object.keys(
        copyById,
      ).length >
      0
    ) {
      next.gallery = {
        copyById,
      };
    }
  }

  if (
    sourceSection.sectionType ===
    "metrics"
  ) {
    const currentCopyById =
      getRecord(
        currentMetrics
          .copyById,
      );

    const translatedById =
      new Map(
        translatedSection
          .metrics
          .map(
            (
              item,
            ) => [
              item.id,
              item,
            ],
          ),
      );

    const copyById:
      Record<
        string,
        Record<
          string,
          string
        >
      > = {};

    for (
      const sourceItem of
      sourceSection.metrics
    ) {
      const generated =
        translatedById.get(
          sourceItem.id,
        );

      if (
        !generated
      ) {
        continue;
      }

      const existingItem =
        getRecord(
          currentCopyById[
            sourceItem.id
          ],
        );

      const itemCopy:
        Record<
          string,
          string
        > = {};

      setStringIfPresent(
        itemCopy,
        "value",
        resolveText(
          getRecordText(
            existingItem,
            "value",
          ),
          generated.value,
          mode,
        ),
      );

      setStringIfPresent(
        itemCopy,
        "label",
        resolveText(
          getRecordText(
            existingItem,
            "label",
          ),
          generated.label,
          mode,
        ),
      );

      setStringIfPresent(
        itemCopy,
        "detail",
        resolveText(
          getRecordText(
            existingItem,
            "detail",
          ),
          generated.detail,
          mode,
        ),
      );

      if (
        Object.keys(
          itemCopy,
        ).length >
        0
      ) {
        copyById[
          sourceItem.id
        ] =
          itemCopy;
      }
    }

    if (
      Object.keys(
        copyById,
      ).length >
      0
    ) {
      next.metrics = {
        copyById,
      };
    }
  }

  if (
    sourceSection.sectionType ===
      "quote" &&
    sourceSection.quote &&
    translatedSection.quote
  ) {
    const quoteCopy:
      Record<
        string,
        string
      > = {};

    setStringIfPresent(
      quoteCopy,
      "text",
      resolveText(
        getRecordText(
          currentQuote,
          "text",
        ),
        translatedSection
          .quote.text,
        mode,
      ),
    );

    setStringIfPresent(
      quoteCopy,
      "source",
      resolveText(
        getRecordText(
          currentQuote,
          "source",
        ),
        translatedSection
          .quote.source,
        mode,
      ),
    );

    setStringIfPresent(
      quoteCopy,
      "context",
      resolveText(
        getRecordText(
          currentQuote,
          "context",
        ),
        translatedSection
          .quote.context,
        mode,
      ),
    );

    if (
      Object.keys(
        quoteCopy,
      ).length >
      0
    ) {
      next.quote =
        quoteCopy;
    }
  }

  if (
    sourceSection.sectionType ===
      "finale" &&
    sourceSection.finale &&
    translatedSection.finale
  ) {
    const finaleCopy:
      Record<
        string,
        unknown
      > = {};

    const title =
      resolveText(
        getRecordText(
          currentFinale,
          "title",
        ),
        translatedSection
          .finale.title,
        mode,
      );

    const body =
      resolveText(
        getRecordText(
          currentFinale,
          "body",
        ),
        translatedSection
          .finale.body,
        mode,
      );

    const ctaLabel =
      resolveText(
        getRecordText(
          currentFinale,
          "ctaLabel",
        ),
        translatedSection
          .finale.ctaLabel,
        mode,
      );

    if (
      title
    ) {
      finaleCopy.title =
        title;
    }

    if (
      body
    ) {
      finaleCopy.body =
        body;
    }

    if (
      ctaLabel
    ) {
      finaleCopy.ctaLabel =
        ctaLabel;
    }

    /*
     * Shared media tidak pernah
     * masuk translation.
     *
     * Yang boleh hanyalah ALT.
     */
    if (
      sourceSection
        .finale
        .hasMedia
    ) {
      const currentMedia =
        getRecord(
          currentFinale
            .media,
        );

      const mediaAlt =
        resolveText(
          getRecordText(
            currentMedia,
            "alt",
          ),
          translatedSection
            .finale
            .mediaAlt,
          mode,
        );

      if (
        mediaAlt
      ) {
        finaleCopy.media = {
          alt:
            mediaAlt,
        };
      }
    }

    if (
      Object.keys(
        finaleCopy,
      ).length >
      0
    ) {
      next.finale =
        finaleCopy;
    }
  }

  return next;
}

export async function generateProjectTranslations(
  projectId: string,

  _previousState:
    GenerateProjectTranslationState,

  formData: FormData,
): Promise<
  GenerateProjectTranslationState
> {
  const requestedLocaleValues =
    formData
      .getAll(
        "target_locales",
      )
      .filter(
        (
          value,
        ): value is string =>
          typeof value ===
          "string",
      );

  const requestedSet =
    new Set(
      requestedLocaleValues,
    );

  const targetLocales =
    TRANSLATION_TARGET_LOCALES.filter(
      (
        locale,
      ) =>
        requestedSet.has(
          locale,
        ),
    );

  if (
    targetLocales.length ===
    0
  ) {
    return {
      status:
        "error",

      message:
        "Pilih minimal satu bahasa target.",
    };
  }

  const modeValue =
    formData.get(
      "translation_mode",
    );

  const mode =
    typeof modeValue ===
      "string" &&
    isTranslationMode(
      modeValue,
    )
      ? modeValue
      : "missing";

  const {
    supabase,
  } =
    await getAdminClient();

  const [
    projectResult,
    sectionsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "projects",
        )
        .select(
          `
            id,
            title,
            period,
            summary,
            categories,
            roles
          `,
        )
        .eq(
          "id",
          projectId,
        )
        .maybeSingle(),

      supabase
        .from(
          "project_sections",
        )
        .select(
          `
            id,
            section_type,
            eyebrow,
            heading,
            body,
            content,
            sort_order
          `,
        )
        .eq(
          "project_id",
          projectId,
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
    projectResult.error
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membaca project: ${projectResult.error.message}`,
    };
  }

  if (
    !projectResult.data
  ) {
    return {
      status:
        "error",

      message:
        "Project tidak ditemukan.",
    };
  }

  if (
    sectionsResult.error
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membaca sections: ${sectionsResult.error.message}`,
    };
  }

  const project =
    projectResult.data as unknown as
      ProjectRow;

  const sectionRows =
    (
      sectionsResult.data ??
      []
    ) as unknown as
      SectionRow[];

  let sourceSections:
    PortfolioTranslationSection[];

  try {
    sourceSections =
      sectionRows.map(
        buildSourceSection,
      );
  } catch (
    error
  ) {
    return {
      status:
        "error",

      message:
        error instanceof
        Error
          ? error.message
          : "Gagal menyiapkan source section.",
    };
  }

  const source:
    PortfolioTranslationPayload = {
    project: {
      title:
        project.title
          ?.trim() ??
        "",

      period:
        project.period
          ?.trim() ??
        "",

      summary:
        project.summary
          ?.trim() ??
        "",

      categories:
        normalizeArray(
          project.categories,
        ),

      roles:
        normalizeArray(
          project.roles,
        ),
    },

    sections:
      sourceSections,
  };

  if (
    !source.project
      .title
  ) {
    return {
      status:
        "error",

      message:
        "English project title wajib tersedia sebelum generate translation.",
    };
  }

  const sectionIds =
    sectionRows.map(
      (
        section,
      ) =>
        section.id,
    );

  const existingProjectPromise =
    supabase
      .from(
        "project_translations",
      )
      .select(
        `
          locale,
          title,
          period,
          summary,
          categories,
          roles
        `,
      )
      .eq(
        "project_id",
        projectId,
      )
      .in(
        "locale",
        targetLocales,
      );

  const existingSectionPromise =
    sectionIds.length >
      0
      ? supabase
          .from(
            "project_section_translations",
          )
          .select(
            `
              section_id,
              locale,
              eyebrow,
              heading,
              body,
              content
            `,
          )
          .in(
            "section_id",
            sectionIds,
          )
          .in(
            "locale",
            targetLocales,
          )
      : Promise.resolve({
          data:
            [],

          error:
            null,
        });

  let generatedEntries:
    [
      TranslationTargetLocale,
      PortfolioTranslationPayload,
    ][];

  const extraProtectedTerms =
    [
      project.title,
    ].filter(
      Boolean,
    );

  try {
    const generationPromise =
      Promise.all(
        targetLocales.map(
          async (
            locale,
          ) => {
            const translated =
              await translatePortfolioPayload({
                source,

                targetLocale:
                  locale,

                extraProtectedTerms,
              });

            return [
              locale,
              translated,
            ] as [
              TranslationTargetLocale,
              PortfolioTranslationPayload,
            ];
          },
        ),
      );

    const [
      generationResult,
      existingProjectResult,
      existingSectionResult,
    ] =
      await Promise.all([
        generationPromise,
        existingProjectPromise,
        existingSectionPromise,
      ]);

    if (
      existingProjectResult.error
    ) {
      return {
        status:
          "error",

        message:
          `Gagal membaca translation project lama: ${existingProjectResult.error.message}`,
      };
    }

    if (
      existingSectionResult.error
    ) {
      return {
        status:
          "error",

        message:
          `Gagal membaca translation section lama: ${existingSectionResult.error.message}`,
      };
    }

    generatedEntries =
      generationResult;

    const existingProjectRows =
      (
        existingProjectResult.data ??
        []
      ) as unknown as
        ExistingProjectTranslationRow[];

    const existingSectionRows =
      (
        existingSectionResult.data ??
        []
      ) as unknown as
        ExistingSectionTranslationRow[];

    const existingProjectMap =
      new Map<
        TranslationTargetLocale,
        ExistingProjectTranslationRow
      >();

    for (
      const row of
      existingProjectRows
    ) {
      if (
        isTargetLocale(
          row.locale,
        )
      ) {
        existingProjectMap.set(
          row.locale,
          row,
        );
      }
    }

    const existingSectionMap =
      new Map<
        string,
        ExistingSectionTranslationRow
      >();

    for (
      const row of
      existingSectionRows
    ) {
      if (
        !isTargetLocale(
          row.locale,
        )
      ) {
        continue;
      }

      existingSectionMap.set(
        `${row.section_id}:${row.locale}`,
        row,
      );
    }

    const projectRowsToSave =
      generatedEntries.map(
        ([
          locale,
          translated,
        ]) => {
          const existing =
            existingProjectMap.get(
              locale,
            );

          return {
            locale,

            title:
              resolveText(
                existing
                  ?.title,
                translated
                  .project
                  .title,
                mode,
              ),

            period:
              resolveText(
                existing
                  ?.period,
                translated
                  .project
                  .period,
                mode,
              ),

            summary:
              resolveText(
                existing
                  ?.summary,
                translated
                  .project
                  .summary,
                mode,
              ),

            categories:
              resolveArray(
                existing
                  ?.categories,
                translated
                  .project
                  .categories,
                mode,
              ),

            roles:
              resolveArray(
                existing
                  ?.roles,
                translated
                  .project
                  .roles,
                mode,
              ),
          };
        },
      );

    const sectionRowsToSave:
      {
        section_id:
          string;

        locale:
          TranslationTargetLocale;

        eyebrow:
          string | null;

        heading:
          string | null;

        body:
          string | null;

        content:
          Record<
            string,
            unknown
          >;
      }[] = [];

    for (
      const [
        locale,
        translated,
      ] of
      generatedEntries
    ) {
      const translatedById =
        new Map(
          translated.sections.map(
            (
              section,
            ) => [
              section.id,
              section,
            ],
          ),
        );

      for (
        const sourceSection of
        source.sections
      ) {
        const translatedSection =
          translatedById.get(
            sourceSection.id,
          );

        if (
          !translatedSection
        ) {
          return {
            status:
              "error",

            message:
              `Section "${sourceSection.id}" hilang dari hasil translation ${locale.toUpperCase()}.`,
          };
        }

        const existing =
          existingSectionMap.get(
            `${sourceSection.id}:${locale}`,
          );

        const content =
          buildLocalizedContent({
            existingContent:
              existing
                ?.content,

            sourceSection,

            translatedSection,

            mode,
          });

        sectionRowsToSave.push({
          section_id:
            sourceSection.id,

          locale,

          eyebrow:
            resolveText(
              existing
                ?.eyebrow,
              translatedSection
                .eyebrow,
              mode,
            ),

          heading:
            resolveText(
              existing
                ?.heading,
              translatedSection
                .heading,
              mode,
            ),

          body:
            resolveText(
              existing
                ?.body,
              translatedSection
                .body,
              mode,
            ),

          content,
        });
      }
    }

    /*
     * Satu RPC = satu transaction.
     *
     * Project translations +
     * section translations masuk
     * bersama-sama atau rollback
     * bersama-sama.
     */
    const {
      error:
        saveError,
    } =
      await supabase.rpc(
        "save_generated_project_translations",
        {
          p_project_id:
            projectId,

          p_project_rows:
            projectRowsToSave,

          p_section_rows:
            sectionRowsToSave,
        },
      );

    if (
      saveError
    ) {
      return {
        status:
          "error",

        message:
          `Translation berhasil dibuat tetapi gagal disimpan. Tidak ada partial write yang dipertahankan. ${saveError.message}`,
      };
    }
  } catch (
    error
  ) {
    return {
      status:
        "error",

      message:
        error instanceof
        Error
          ? `Translation Engine gagal: ${error.message}`
          : "Translation Engine gagal memproses project.",
    };
  }

  refreshProject(
    projectId,
  );

  const languageText =
    targetLocales
      .map(
        (
          locale,
        ) =>
          locale.toUpperCase(),
      )
      .join(
        " + ",
      );

  return {
    status:
      "success",

    generatedLocales:
      targetLocales,

    message:
      mode ===
        "overwrite"
        ? `${languageText} berhasil diregenerate dari English. Translation lama pada field yang didukung telah diperbarui.`
        : `${languageText} berhasil digenerate. Translation manual yang sudah terisi tetap dipertahankan.`,
  };
}