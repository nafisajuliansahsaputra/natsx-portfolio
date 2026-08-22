"use server";

import {
  revalidatePath,
  updateTag,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import type {
  Locale,
} from "@/i18n/config";

import {
  PUBLIC_PORTFOLIO_CACHE_TAG,
} from "@/lib/portfolio-cache";

import {
  getContentRecord,
  getGallerySectionMedia,
  getImageSectionMedia,
} from "@/lib/portfolio-media";

import {
  getMetricsSectionContent,
} from "@/lib/project-section-content";

import {
  createClient,
} from "@/lib/supabase/server";

export type SpecializedTranslationState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;
};

export type GalleryLocalizedCopyInput = {
  id: string;
  alt: string;
  caption: string;
};

export type MetricsLocalizedCopyInput = {
  id: string;
  value: string;
  label: string;
  detail: string;
};

type TranslationRow = {
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
    | Record<
        string,
        unknown
      >
    | null;
};

function isLocale(
  value: string,
): value is Locale {
  return (
    value === "en" ||
    value === "id" ||
    value === "de"
  );
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
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

function hasText(
  value:
    | string
    | null,
) {
  return Boolean(
    value?.trim(),
  );
}

function isEmptyRecord(
  value: Record<
    string,
    unknown
  >,
) {
  return (
    Object.keys(
      value,
    ).length ===
    0
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

  return supabase;
}

function revalidateProject(
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

async function readTranslation(
  supabase: Awaited<
    ReturnType<
      typeof getAdminClient
    >
  >,

  sectionId: string,
  locale: Locale,
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "project_section_translations",
      )
      .select(
        "eyebrow,heading,body,content",
      )
      .eq(
        "section_id",
        sectionId,
      )
      .eq(
        "locale",
        locale,
      )
      .maybeSingle();

  if (
    error
  ) {
    throw new Error(
      `Gagal membaca section translation: ${error.message}`,
    );
  }

  return data as
    | TranslationRow
    | null;
}

async function saveTranslationContent(
  supabase: Awaited<
    ReturnType<
      typeof getAdminClient
    >
  >,

  sectionId: string,
  locale: Locale,

  currentTranslation:
    | TranslationRow
    | null,

  nextContent: Record<
    string,
    unknown
  >,
) {
  const hasCoreCopy =
    Boolean(
      hasText(
        currentTranslation
          ?.eyebrow ??
          null,
      ) ||
        hasText(
          currentTranslation
            ?.heading ??
            null,
        ) ||
        hasText(
          currentTranslation
            ?.body ??
            null,
        ),
    );

  if (
    locale !== "en" &&
    !hasCoreCopy &&
    isEmptyRecord(
      nextContent,
    )
  ) {
    const {
      error,
    } =
      await supabase
        .from(
          "project_section_translations",
        )
        .delete()
        .eq(
          "section_id",
          sectionId,
        )
        .eq(
          "locale",
          locale,
        );

    if (
      error
    ) {
      throw new Error(
        `Gagal membersihkan translation: ${error.message}`,
      );
    }

    return;
  }

  const {
    error,
  } =
    await supabase
      .from(
        "project_section_translations",
      )
      .upsert(
        {
          section_id:
            sectionId,

          locale,

          content:
            nextContent,

          updated_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "section_id,locale",
        },
      );

  if (
    error
  ) {
    throw new Error(
      `Gagal menyimpan specialized translation: ${error.message}`,
    );
  }
}

/*
 * =========================================
 * IMAGE LOCALIZED COPY
 * =========================================
 */

export async function saveImageSectionLocalizedCopy(
  projectId: string,
  sectionId: string,
  localeValue: string,
  altValue: string,
  captionValue: string,
): Promise<
  SpecializedTranslationState
> {
  if (
    !isLocale(
      localeValue,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Bahasa image content tidak valid.",
    };
  }

  const locale =
    localeValue;

  const alt =
    altValue.trim();

  const caption =
    captionValue.trim();

  if (
    alt.length >
    500
  ) {
    return {
      status:
        "error",

      message:
        "Alt text maksimal 500 karakter.",
    };
  }

  if (
    caption.length >
    1000
  ) {
    return {
      status:
        "error",

      message:
        "Caption maksimal 1.000 karakter.",
    };
  }

  const supabase =
    await getAdminClient();

  const {
    data:
      section,

    error:
      sectionError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .select(
        "id,section_type,content",
      )
      .eq(
        "id",
        sectionId,
      )
      .eq(
        "project_id",
        projectId,
      )
      .maybeSingle();

  if (
    sectionError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membaca image section: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Image section tidak ditemukan.",
    };
  }

  if (
    section.section_type !==
    "image"
  ) {
    return {
      status:
        "error",

      message:
        "Localized image copy hanya dapat disimpan pada Image section.",
    };
  }

  const baseMedia =
    getImageSectionMedia(
      section.content,
    );

  if (
    !baseMedia
  ) {
    return {
      status:
        "error",

      message:
        "Upload shared image terlebih dahulu sebelum menyimpan alt atau caption.",
    };
  }

  let currentTranslation:
    | TranslationRow
    | null;

  try {
    currentTranslation =
      await readTranslation(
        supabase,
        sectionId,
        locale,
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
          : "Gagal membaca image translation.",
    };
  }

  const currentContent =
    getRecord(
      currentTranslation
        ?.content,
    );

  const nextContent = {
    ...currentContent,
  };

  if (
    !alt &&
    !caption
  ) {
    delete nextContent.image;
  } else {
    const imageCopy:
      Record<
        string,
        string
      > = {};

    if (
      alt
    ) {
      imageCopy.alt =
        alt;
    }

    if (
      caption
    ) {
      imageCopy.caption =
        caption;
    }

    nextContent.image =
      imageCopy;
  }

  if (
    locale === "en"
  ) {
    const baseContent =
      getContentRecord(
        section.content,
      );

    const nextBaseContent = {
      ...baseContent,

      image: {
        ...baseMedia,

        alt,

        caption,
      },
    };

    const {
      error:
        baseUpdateError,
    } =
      await supabase
        .from(
          "project_sections",
        )
        .update({
          content:
            nextBaseContent,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          sectionId,
        )
        .eq(
          "project_id",
          projectId,
        );

    if (
      baseUpdateError
    ) {
      return {
        status:
          "error",

        message:
          `Gagal menyinkronkan English image copy: ${baseUpdateError.message}`,
      };
    }
  }

  try {
    await saveTranslationContent(
      supabase,
      sectionId,
      locale,
      currentTranslation,
      nextContent,
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
          : "Gagal menyimpan image translation.",
    };
  }

  revalidateProject(
    projectId,
  );

  return {
    status:
      "success",

    message:
      locale ===
      "en"
        ? "English image alt dan caption berhasil disimpan."
        : alt ||
            caption
          ? `${locale.toUpperCase()} image alt dan caption berhasil disimpan.`
          : `${locale.toUpperCase()} image copy dikosongkan dan akan fallback ke English.`,
  };
}

/*
 * =========================================
 * GALLERY LOCALIZED COPY
 * =========================================
 */

export async function saveGallerySectionLocalizedCopy(
  projectId: string,
  sectionId: string,
  localeValue: string,
  copies:
    GalleryLocalizedCopyInput[],
): Promise<
  SpecializedTranslationState
> {
  if (
    !isLocale(
      localeValue,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Bahasa gallery content tidak valid.",
    };
  }

  if (
    !Array.isArray(
      copies,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Gallery copy tidak valid.",
    };
  }

  const locale =
    localeValue;

  const normalizedCopies =
    copies.map(
      (
        copy,
      ) => ({
        id:
          copy.id.trim(),

        alt:
          copy.alt.trim(),

        caption:
          copy.caption.trim(),
      }),
    );

  const ids =
    new Set<string>();

  for (
    const copy of
    normalizedCopies
  ) {
    if (
      !copy.id ||
      copy.id.length >
        100
    ) {
      return {
        status:
          "error",

        message:
          "Gallery item ID tidak valid.",
      };
    }

    if (
      ids.has(
        copy.id,
      )
    ) {
      return {
        status:
          "error",

        message:
          "Gallery copy memiliki item ID duplikat.",
      };
    }

    ids.add(
      copy.id,
    );

    if (
      copy.alt.length >
      500
    ) {
      return {
        status:
          "error",

        message:
          "Alt text gallery maksimal 500 karakter.",
      };
    }

    if (
      copy.caption.length >
      1000
    ) {
      return {
        status:
          "error",

        message:
          "Caption gallery maksimal 1.000 karakter.",
      };
    }
  }

  const supabase =
    await getAdminClient();

  const {
    data:
      section,

    error:
      sectionError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .select(
        "id,section_type,content",
      )
      .eq(
        "id",
        sectionId,
      )
      .eq(
        "project_id",
        projectId,
      )
      .maybeSingle();

  if (
    sectionError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membaca gallery section: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Gallery section tidak ditemukan.",
    };
  }

  if (
    section.section_type !==
    "gallery"
  ) {
    return {
      status:
        "error",

      message:
        "Localized gallery copy hanya dapat disimpan pada Gallery section.",
    };
  }

  const baseGallery =
    getGallerySectionMedia(
      section.content,
    );

  if (
    !baseGallery
  ) {
    return {
      status:
        "error",

      message:
        "Simpan shared gallery terlebih dahulu.",
    };
  }

  const baseIds =
    new Set(
      baseGallery.items.map(
        (
          item,
        ) =>
          item.id,
      ),
    );

  if (
    normalizedCopies.length !==
      baseGallery.items.length ||
    normalizedCopies.some(
      (
        copy,
      ) =>
        !baseIds.has(
          copy.id,
        ),
    )
  ) {
    return {
      status:
        "error",

      message:
        "Struktur gallery berubah. Simpan shared gallery terlebih dahulu sebelum menyimpan translation.",
    };
  }

  let currentTranslation:
    | TranslationRow
    | null;

  try {
    currentTranslation =
      await readTranslation(
        supabase,
        sectionId,
        locale,
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
          : "Gagal membaca gallery translation.",
    };
  }

  const currentContent =
    getRecord(
      currentTranslation
        ?.content,
    );

  const nextContent = {
    ...currentContent,
  };

  const nextGalleryContent = {
    ...getRecord(
      currentContent.gallery,
    ),
  };

  const copyById:
    Record<
      string,
      Record<
        string,
        string
      >
    > = {};

  for (
    const copy of
    normalizedCopies
  ) {
    const localizedItem:
      Record<
        string,
        string
      > = {};

    if (
      copy.alt
    ) {
      localizedItem.alt =
        copy.alt;
    }

    if (
      copy.caption
    ) {
      localizedItem.caption =
        copy.caption;
    }

    if (
      !isEmptyRecord(
        localizedItem,
      )
    ) {
      copyById[
        copy.id
      ] =
        localizedItem;
    }
  }

  if (
    isEmptyRecord(
      copyById,
    )
  ) {
    delete nextGalleryContent.copyById;
  } else {
    nextGalleryContent.copyById =
      copyById;
  }

  if (
    isEmptyRecord(
      nextGalleryContent,
    )
  ) {
    delete nextContent.gallery;
  } else {
    nextContent.gallery =
      nextGalleryContent;
  }

  if (
    locale === "en"
  ) {
    const copyLookup =
      new Map(
        normalizedCopies.map(
          (
            copy,
          ) =>
            [
              copy.id,
              copy,
            ] as const,
        ),
      );

    const baseContent =
      getContentRecord(
        section.content,
      );

    const nextBaseGallery:
      Record<
        string,
        unknown
      > = {
      ...getRecord(
        baseContent.gallery,
      ),

      items:
        baseGallery.items.map(
          (
            item,
          ) => {
            const copy =
              copyLookup.get(
                item.id,
              );

            return {
              ...item,

              alt:
                copy?.alt ??
                "",

              caption:
                copy?.caption ??
                "",
            };
          },
        ),
    };

    delete nextBaseGallery.copyById;

    const {
      error:
        baseUpdateError,
    } =
      await supabase
        .from(
          "project_sections",
        )
        .update({
          content: {
            ...baseContent,

            gallery:
              nextBaseGallery,
          },

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          sectionId,
        )
        .eq(
          "project_id",
          projectId,
        );

    if (
      baseUpdateError
    ) {
      return {
        status:
          "error",

        message:
          `Gagal menyinkronkan English gallery copy: ${baseUpdateError.message}`,
      };
    }
  }

  try {
    await saveTranslationContent(
      supabase,
      sectionId,
      locale,
      currentTranslation,
      nextContent,
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
          : "Gagal menyimpan gallery translation.",
    };
  }

  revalidateProject(
    projectId,
  );

  const hasLocalizedCopy =
    Object.keys(
      copyById,
    ).length >
    0;

  return {
    status:
      "success",

    message:
      locale ===
      "en"
        ? "English gallery alt dan caption berhasil disimpan."
        : hasLocalizedCopy
          ? `${locale.toUpperCase()} gallery alt dan caption berhasil disimpan.`
          : `${locale.toUpperCase()} gallery copy dikosongkan dan akan fallback ke English.`,
  };
}

/*
 * =========================================
 * METRICS LOCALIZED COPY
 * =========================================
 *
 * Shared:
 * metrics.columns
 * metrics.items[].id
 * item count / order
 *
 * Localized:
 * value
 * label
 * detail
 */

export async function saveMetricsSectionLocalizedCopy(
  projectId: string,
  sectionId: string,
  localeValue: string,
  copies:
    MetricsLocalizedCopyInput[],
): Promise<
  SpecializedTranslationState
> {
  if (
    !isLocale(
      localeValue,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Bahasa metrics content tidak valid.",
    };
  }

  if (
    !Array.isArray(
      copies,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Metrics copy tidak valid.",
    };
  }

  const locale =
    localeValue;

  const normalizedCopies =
    copies.map(
      (
        copy,
      ) => ({
        id:
          copy.id.trim(),

        value:
          copy.value.trim(),

        label:
          copy.label.trim(),

        detail:
          copy.detail.trim(),
      }),
    );

  const ids =
    new Set<string>();

  for (
    const copy of
    normalizedCopies
  ) {
    if (
      !copy.id ||
      copy.id.length >
        100
    ) {
      return {
        status:
          "error",

        message:
          "Metric item ID tidak valid.",
      };
    }

    if (
      ids.has(
        copy.id,
      )
    ) {
      return {
        status:
          "error",

        message:
          "Metrics copy memiliki item ID duplikat.",
      };
    }

    ids.add(
      copy.id,
    );

    if (
      copy.value.length >
      40
    ) {
      return {
        status:
          "error",

        message:
          "Metric value maksimal 40 karakter.",
      };
    }

    if (
      copy.label.length >
      120
    ) {
      return {
        status:
          "error",

        message:
          "Metric label maksimal 120 karakter.",
      };
    }

    if (
      copy.detail.length >
      300
    ) {
      return {
        status:
          "error",

        message:
          "Metric detail maksimal 300 karakter.",
      };
    }

    if (
      locale ===
        "en" &&
      (!copy.value ||
        !copy.label)
    ) {
      return {
        status:
          "error",

        message:
          "English metric value dan label wajib diisi.",
      };
    }
  }

  const supabase =
    await getAdminClient();

  const {
    data:
      section,

    error:
      sectionError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .select(
        "id,section_type,content",
      )
      .eq(
        "id",
        sectionId,
      )
      .eq(
        "project_id",
        projectId,
      )
      .maybeSingle();

  if (
    sectionError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membaca metrics section: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Metrics section tidak ditemukan.",
    };
  }

  if (
    section.section_type !==
    "metrics"
  ) {
    return {
      status:
        "error",

      message:
        "Localized metrics copy hanya dapat disimpan pada Metrics section.",
    };
  }

  const baseMetrics =
    getMetricsSectionContent(
      section.content,
    );

  const baseIds =
    new Set(
      baseMetrics.items.map(
        (
          item,
        ) =>
          item.id,
      ),
    );

  if (
    normalizedCopies.length !==
      baseMetrics.items.length ||
    normalizedCopies.some(
      (
        copy,
      ) =>
        !baseIds.has(
          copy.id,
        ),
    )
  ) {
    return {
      status:
        "error",

      message:
        "Struktur metrics berubah. Simpan shared metrics terlebih dahulu sebelum menyimpan translation.",
    };
  }

  let currentTranslation:
    | TranslationRow
    | null;

  try {
    currentTranslation =
      await readTranslation(
        supabase,
        sectionId,
        locale,
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
          : "Gagal membaca metrics translation.",
    };
  }

  const currentContent =
    getRecord(
      currentTranslation
        ?.content,
    );

  const nextContent = {
    ...currentContent,
  };

  const nextMetricsContent = {
    ...getRecord(
      currentContent.metrics,
    ),
  };

  const copyById:
    Record<
      string,
      Record<
        string,
        string
      >
    > = {};

  for (
    const copy of
    normalizedCopies
  ) {
    const localizedItem:
      Record<
        string,
        string
      > = {};

    if (
      copy.value
    ) {
      localizedItem.value =
        copy.value;
    }

    if (
      copy.label
    ) {
      localizedItem.label =
        copy.label;
    }

    if (
      copy.detail
    ) {
      localizedItem.detail =
        copy.detail;
    }

    if (
      !isEmptyRecord(
        localizedItem,
      )
    ) {
      copyById[
        copy.id
      ] =
        localizedItem;
    }
  }

  if (
    isEmptyRecord(
      copyById,
    )
  ) {
    delete nextMetricsContent.copyById;
  } else {
    nextMetricsContent.copyById =
      copyById;
  }

  if (
    isEmptyRecord(
      nextMetricsContent,
    )
  ) {
    delete nextContent.metrics;
  } else {
    nextContent.metrics =
      nextMetricsContent;
  }

  if (
    locale ===
    "en"
  ) {
    const copyLookup =
      new Map(
        normalizedCopies.map(
          (
            copy,
          ) =>
            [
              copy.id,
              copy,
            ] as const,
        ),
      );

    const baseContent =
      getContentRecord(
        section.content,
      );

    const nextBaseMetrics:
      Record<
        string,
        unknown
      > = {
      ...getRecord(
        baseContent.metrics,
      ),

      columns:
        baseMetrics.columns,

      items:
        baseMetrics.items.map(
          (
            item,
          ) => {
            const copy =
              copyLookup.get(
                item.id,
              );

            return {
              id:
                item.id,

              value:
                copy?.value ??
                item.value,

              label:
                copy?.label ??
                item.label,

              detail:
                copy?.detail ??
                item.detail,
            };
          },
        ),
    };

    delete nextBaseMetrics.copyById;

    const {
      error:
        baseUpdateError,
    } =
      await supabase
        .from(
          "project_sections",
        )
        .update({
          content: {
            ...baseContent,

            metrics:
              nextBaseMetrics,
          },

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          sectionId,
        )
        .eq(
          "project_id",
          projectId,
        );

    if (
      baseUpdateError
    ) {
      return {
        status:
          "error",

        message:
          `Gagal menyinkronkan English metrics copy: ${baseUpdateError.message}`,
      };
    }
  }

  try {
    await saveTranslationContent(
      supabase,
      sectionId,
      locale,
      currentTranslation,
      nextContent,
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
          : "Gagal menyimpan metrics translation.",
    };
  }

  revalidateProject(
    projectId,
  );

  const hasLocalizedCopy =
    Object.keys(
      copyById,
    ).length >
    0;

  return {
    status:
      "success",

    message:
      locale ===
      "en"
        ? "English metrics copy berhasil disimpan."
        : hasLocalizedCopy
          ? `${locale.toUpperCase()} metrics copy berhasil disimpan.`
          : `${locale.toUpperCase()} metrics copy dikosongkan dan akan fallback ke English.`,
  };
}