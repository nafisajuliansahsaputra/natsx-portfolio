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
  MAX_PORTFOLIO_MEDIA_FILE_SIZE,
  MAX_PORTFOLIO_VIDEO_FILE_SIZE,
  PORTFOLIO_MEDIA_BUCKET,
  getContentRecord,
  getFinaleMediaKind,
  getFinaleSectionMedia,
  getGallerySectionMedia,
  getImageSectionMedia,
  getPortfolioImageServerLimit,
  isAllowedFinaleMediaMimeType,
  isAllowedImageMimeType,
  type FinaleSectionMedia,
  type GallerySectionMedia,
  type ImageSectionMedia,
} from "@/lib/portfolio-media";

import {
  isMetricsColumnCount,
  isQuoteAlignment,
  type FinaleSectionContent,
  type MetricsSectionContent,
  type QuoteSectionContent,
} from "@/lib/project-section-content";

import {
  createClient,
} from "@/lib/supabase/server";

const SECTION_TYPES = [
  "overview",
  "narrative",
  "statement",
  "image",
  "gallery",
  "metrics",
  "quote",
  "finale",
] as const;

const SECTION_THEMES = [
  "light",
  "dark",
  "accent",
] as const;

type SectionField =
  | "section_type"
  | "theme"
  | "eyebrow"
  | "heading"
  | "body";

export type SectionActionState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;

  errors?: Partial<
    Record<
      SectionField,
      string
    >
  >;
};

function getText(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(
      name,
    );

  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function isLocale(
  value: string,
): value is Locale {
  return (
    value === "en" ||
    value === "id" ||
    value === "de"
  );
}

function normalizeTranslationContent(
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

function validateTranslatedSectionCopy(
  formData: FormData,
) {
  const eyebrow =
    getText(
      formData,
      "eyebrow",
    );

  const heading =
    getText(
      formData,
      "heading",
    );

  const body =
    getText(
      formData,
      "body",
    );

  const errors:
    SectionActionState["errors"] =
    {};

  if (
    eyebrow.length >
    100
  ) {
    errors.eyebrow =
      "Eyebrow maksimal 100 karakter.";
  }

  if (
    heading.length >
    300
  ) {
    errors.heading =
      "Heading maksimal 300 karakter.";
  }

  if (
    body.length >
    10000
  ) {
    errors.body =
      "Body maksimal 10.000 karakter.";
  }

  return {
    eyebrow,
    heading,
    body,
    errors,
  };
}

function validateSharedSectionSettings(
  formData: FormData,
) {
  const sectionType =
    getText(
      formData,
      "section_type",
    );

  const theme =
    getText(
      formData,
      "theme",
    );

  const errors:
    SectionActionState["errors"] =
    {};

  if (
    !SECTION_TYPES.includes(
      sectionType as
        (typeof SECTION_TYPES)[number],
    )
  ) {
    errors.section_type =
      "Jenis section tidak valid.";
  }

  if (
    !SECTION_THEMES.includes(
      theme as
        (typeof SECTION_THEMES)[number],
    )
  ) {
    errors.theme =
      "Tema section tidak valid.";
  }

  return {
    sectionType,
    theme,
    errors,
  };
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

function validateSection(
  formData: FormData,
) {
  const sectionType =
    getText(
      formData,
      "section_type",
    );

  const theme =
    getText(
      formData,
      "theme",
    );

  const eyebrow =
    getText(
      formData,
      "eyebrow",
    );

  const heading =
    getText(
      formData,
      "heading",
    );

  const body =
    getText(
      formData,
      "body",
    );

  const errors:
    SectionActionState["errors"] =
    {};

  if (
    !SECTION_TYPES.includes(
      sectionType as
        (typeof SECTION_TYPES)[number],
    )
  ) {
    errors.section_type =
      "Jenis section tidak valid.";
  }

  if (
    !SECTION_THEMES.includes(
      theme as
        (typeof SECTION_THEMES)[number],
    )
  ) {
    errors.theme =
      "Tema section tidak valid.";
  }

  if (
    eyebrow.length >
    100
  ) {
    errors.eyebrow =
      "Eyebrow maksimal 100 karakter.";
  }

  if (
    heading.length >
    300
  ) {
    errors.heading =
      "Heading maksimal 300 karakter.";
  }

  if (
    body.length >
    10000
  ) {
    errors.body =
      "Body maksimal 10.000 karakter.";
  }

  return {
    values: {
      sectionType,
      theme,
      eyebrow,
      heading,
      body,
    },

    errors,
  };
}

function revalidateSectionPages(
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

function validateImageMedia(
  projectId: string,
  sectionId: string,
  media: ImageSectionMedia,
) {
  if (
    media.asset.bucket !==
    PORTFOLIO_MEDIA_BUCKET
  ) {
    return "Bucket media tidak valid.";
  }

  const expectedPrefix =
    `projects/${projectId}` +
    `/sections/${sectionId}/`;

  if (
    !media.asset.path.startsWith(
      expectedPrefix,
    )
  ) {
    return "Path media tidak valid untuk section ini.";
  }

  if (
    !isAllowedImageMimeType(
      media.asset.mimeType,
    )
  ) {
    return "Format gambar tidak didukung.";
  }

  const serverImageLimit =
    getPortfolioImageServerLimit(
      media.asset.mimeType,
    );

  if (
    !Number.isFinite(
      media.asset.size,
    ) ||
    media.asset.size <=
      0 ||
    media.asset.size >
      serverImageLimit
  ) {
    return (
      "Ukuran gambar tidak valid atau melewati batas aman " +
      "media publik setelah optimasi."
    );
  }

  if (
    !media.asset.originalName ||
    media.asset.originalName
      .length > 255
  ) {
    return "Nama file gambar tidak valid.";
  }

  if (
    media.alt
      .trim()
      .length > 500
  ) {
    return "Alt text maksimal 500 karakter.";
  }

  if (
    media.caption
      .trim()
      .length > 1000
  ) {
    return "Caption maksimal 1.000 karakter.";
  }

  return null;
}

function validateGalleryMedia(
  projectId: string,
  sectionId: string,
  gallery: GallerySectionMedia,
) {
  const itemIds =
    new Set<string>();

  const assetPaths =
    new Set<string>();

  for (
    const item of
    gallery.items
  ) {
    if (
      !item.id ||
      item.id.length >
        100
    ) {
      return "Gallery item ID tidak valid.";
    }

    if (
      itemIds.has(
        item.id,
      )
    ) {
      return "Gallery memiliki item ID duplikat.";
    }

    itemIds.add(
      item.id,
    );

    const mediaError =
      validateImageMedia(
        projectId,
        sectionId,
        {
          asset:
            item.asset,

          alt:
            item.alt,

          caption:
            item.caption,
        },
      );

    if (
      mediaError
    ) {
      return mediaError;
    }

    if (
      assetPaths.has(
        item.asset.path,
      )
    ) {
      return "Gallery memiliki file duplikat.";
    }

    assetPaths.add(
      item.asset.path,
    );
  }

  return null;
}

function validateMetricsContent(
  metrics: MetricsSectionContent,
) {
  if (
    !isMetricsColumnCount(
      metrics.columns,
    )
  ) {
    return "Jumlah kolom metrics tidak valid.";
  }

  if (
    !Array.isArray(
      metrics.items,
    ) ||
    metrics.items.length >
      12
  ) {
    return "Metrics maksimal berisi 12 item.";
  }

  const ids =
    new Set<string>();

  for (
    const item of
    metrics.items
  ) {
    if (
      !item.id ||
      item.id.length >
        100
    ) {
      return "Metric item ID tidak valid.";
    }

    if (
      ids.has(
        item.id,
      )
    ) {
      return "Metric memiliki ID duplikat.";
    }

    ids.add(
      item.id,
    );

    const value =
      item.value.trim();

    const label =
      item.label.trim();

    const detail =
      item.detail.trim();

    if (
      !value
    ) {
      return "Setiap metric wajib memiliki Value.";
    }

    if (
      value.length >
      40
    ) {
      return "Value metric maksimal 40 karakter.";
    }

    if (
      !label
    ) {
      return "Setiap metric wajib memiliki Label.";
    }

    if (
      label.length >
      120
    ) {
      return "Label metric maksimal 120 karakter.";
    }

    if (
      detail.length >
      300
    ) {
      return "Detail metric maksimal 300 karakter.";
    }
  }

  return null;
}

function validateQuoteContent(
  quote: QuoteSectionContent,
) {
  const text =
    quote.text.trim();

  const source =
    quote.source.trim();

  const context =
    quote.context.trim();

  if (
    !text
  ) {
    return "Quote text wajib diisi.";
  }

  if (
    text.length >
    2000
  ) {
    return "Quote maksimal 2.000 karakter.";
  }

  if (
    source.length >
    160
  ) {
    return "Source maksimal 160 karakter.";
  }

  if (
    context.length >
    200
  ) {
    return "Context maksimal 200 karakter.";
  }

  if (
    !isQuoteAlignment(
      quote.alignment,
    )
  ) {
    return "Alignment quote tidak valid.";
  }

  return null;
}

function isValidFinaleCtaUrl(
  value: string,
) {
  if (
    value.startsWith(
      "/",
    ) &&
    !value.startsWith(
      "//",
    )
  ) {
    return true;
  }

  try {
    const url =
      new URL(
        value,
      );

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:" ||
      url.protocol ===
        "mailto:"
    );
  } catch {
    return false;
  }
}

function validateFinaleMedia(
  projectId: string,
  sectionId: string,
  media: FinaleSectionMedia,
) {
  if (
    media.asset.bucket !==
    PORTFOLIO_MEDIA_BUCKET
  ) {
    return "Bucket finale media tidak valid.";
  }

  const expectedPrefix =
    `projects/${projectId}` +
    `/sections/${sectionId}` +
    `/finale/`;

  if (
    !media.asset.path.startsWith(
      expectedPrefix,
    )
  ) {
    return "Path finale media tidak valid.";
  }

  if (
    !isAllowedFinaleMediaMimeType(
      media.asset.mimeType,
    )
  ) {
    return "Format finale media tidak didukung.";
  }

  const expectedKind =
    getFinaleMediaKind(
      media.asset.mimeType,
    );

  if (
    !expectedKind ||
    media.kind !==
      expectedKind
  ) {
    return "Jenis finale media tidak valid.";
  }

  const finaleSizeLimit =
    expectedKind ===
      "image"
      ? getPortfolioImageServerLimit(
          media.asset.mimeType,
        )
      : MAX_PORTFOLIO_VIDEO_FILE_SIZE;

  if (
    !Number.isFinite(
      media.asset.size,
    ) ||
    media.asset.size <=
      0 ||
    media.asset.size >
      finaleSizeLimit
  ) {
    return (
      expectedKind ===
        "image"
        ? "Ukuran finale image melewati batas aman media publik setelah optimasi."
        : "Ukuran finale video tidak valid atau melebihi 12 MB. Gunakan streaming/CDN untuk video yang lebih besar."
    );
  }

  if (
    !media.asset.originalName ||
    media.asset.originalName
      .length > 255
  ) {
    return "Nama file finale media tidak valid.";
  }

  if (
    media.alt
      .trim()
      .length > 500
  ) {
    return "Media description maksimal 500 karakter.";
  }

  return null;
}

function validateFinaleContent(
  projectId: string,
  sectionId: string,
  finale: FinaleSectionContent,
) {
  const title =
    finale.title.trim();

  const body =
    finale.body.trim();

  const ctaLabel =
    finale.ctaLabel.trim();

  const ctaUrl =
    finale.ctaUrl.trim();

  if (
    !title
  ) {
    return "Finale title wajib diisi.";
  }

  if (
    title.length >
    300
  ) {
    return "Finale title maksimal 300 karakter.";
  }

  if (
    body.length >
    2000
  ) {
    return "Finale description maksimal 2.000 karakter.";
  }

  if (
    ctaLabel.length >
    120
  ) {
    return "CTA label maksimal 120 karakter.";
  }

  if (
    ctaUrl.length >
    2000
  ) {
    return "CTA URL terlalu panjang.";
  }

  if (
    Boolean(
      ctaLabel,
    ) !==
    Boolean(
      ctaUrl,
    )
  ) {
    return "CTA label dan CTA URL harus diisi bersamaan.";
  }

  if (
    ctaUrl &&
    !isValidFinaleCtaUrl(
      ctaUrl,
    )
  ) {
    return "CTA URL tidak valid.";
  }

  if (
    finale.media
  ) {
    return validateFinaleMedia(
      projectId,
      sectionId,
      finale.media,
    );
  }

  return null;
}

/*
 * Recovery-first retention policy
 * --------------------------------
 * removeStoragePath() is reserved for rollback of a newly uploaded file when
 * the matching database write fails. Successfully published/replaced/detached
 * media is never deleted automatically; it remains available for recovery
 * until a separate audited cleanup is run after backup.
 */

async function removeStoragePath(
  supabase: Awaited<
    ReturnType<
      typeof getAdminClient
    >
  >,
  path: string,
) {
  return supabase.storage
    .from(
      PORTFOLIO_MEDIA_BUCKET,
    )
    .remove([
      path,
    ]);
}

/*
 * =========================
 * CREATE SECTION
 * =========================
 */

export async function createSection(
  projectId: string,
  _previousState:
    SectionActionState,
  formData: FormData,
): Promise<
  SectionActionState
> {
  const {
    values,
    errors,
  } =
    validateSection(
      formData,
    );

  if (
    Object.keys(
      errors,
    ).length >
    0
  ) {
    return {
      status:
        "error",

      message:
        "Periksa kembali informasi section.",

      errors,
    };
  }

  const supabase =
    await getAdminClient();

  const {
    data:
      project,

    error:
      projectError,
  } =
    await supabase
      .from(
        "projects",
      )
      .select(
        "id",
      )
      .eq(
        "id",
        projectId,
      )
      .maybeSingle();

  if (
    projectError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal memeriksa project: ${projectError.message}`,
    };
  }

  if (
    !project
  ) {
    return {
      status:
        "error",

      message:
        "Project tidak ditemukan.",
    };
  }

  const {
    data:
      lastSection,

    error:
      orderError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .select(
        "sort_order",
      )
      .eq(
        "project_id",
        projectId,
      )
      .order(
        "sort_order",
        {
          ascending:
            false,
        },
      )
      .limit(
        1,
      )
      .maybeSingle();

  if (
    orderError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menentukan urutan section: ${orderError.message}`,
    };
  }

  const nextSortOrder =
    (
      lastSection
        ?.sort_order ??
      -1
    ) + 1;

  const {
    data:
      createdSection,

    error:
      insertError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .insert({
        project_id:
          projectId,

        section_type:
          values.sectionType,

        eyebrow:
          values.eyebrow ||
          null,

        heading:
          values.heading ||
          null,

        body:
          values.body ||
          null,

        content: {},

        theme:
          values.theme,

        sort_order:
          nextSortOrder,

        is_visible:
          true,
      })
      .select(
        "id",
      )
      .single();

  if (
    insertError ||
    !createdSection
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membuat section: ${
          insertError
            ?.message ??
          "Section tidak berhasil dibuat."
        }`,
    };
  }

  const {
    error:
      translationError,
  } =
    await supabase
      .from(
        "project_section_translations",
      )
      .insert({
        section_id:
          createdSection.id,

        locale:
          "en",

        eyebrow:
          values.eyebrow ||
          null,

        heading:
          values.heading ||
          null,

        body:
          values.body ||
          null,

        content: {},
      });

  if (
    translationError
  ) {
    /*
     * Section baru belum punya
     * media, jadi aman rollback
     * kalau EN translation gagal.
     */
    await supabase
      .from(
        "project_sections",
      )
      .delete()
      .eq(
        "id",
        createdSection.id,
      );

    return {
      status:
        "error",

      message:
        `Gagal membuat English section translation: ${translationError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Section baru berhasil ditambahkan.",
  };
}

/*
 * =========================
 * LEGACY UPDATE SECTION
 * =========================
 *
 * Dipertahankan sementara
 * supaya tidak merusak caller
 * lama yang mungkin masih ada.
 */

export async function updateSection(
  projectId: string,
  sectionId: string,
  _previousState:
    SectionActionState,
  formData: FormData,
): Promise<
  SectionActionState
> {
  const {
    values,
    errors,
  } =
    validateSection(
      formData,
    );

  const isVisible =
    formData.get(
      "is_visible",
    ) ===
    "on";

  if (
    Object.keys(
      errors,
    ).length >
    0
  ) {
    return {
      status:
        "error",

      message:
        "Periksa kembali informasi section.",

      errors,
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
        "id",
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
        `Gagal membaca section: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Section tidak ditemukan.",
    };
  }

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        section_type:
          values.sectionType,

        eyebrow:
          values.eyebrow ||
          null,

        heading:
          values.heading ||
          null,

        body:
          values.body ||
          null,

        theme:
          values.theme,

        is_visible:
          isVisible,

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
    updateError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menyimpan section: ${updateError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Perubahan section berhasil disimpan.",
  };
}

/*
 * =========================
 * SECTION TRANSLATION
 * =========================
 */

export async function updateSectionTranslation(
  projectId: string,
  sectionId: string,
  _previousState:
    SectionActionState,
  formData: FormData,
): Promise<
  SectionActionState
> {
  const localeValue =
    getText(
      formData,
      "content_locale",
    );

  if (
    !isLocale(
      localeValue,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Bahasa section tidak valid.",
    };
  }

  const locale =
    localeValue;

  const {
    eyebrow,
    heading,
    body,
    errors,
  } =
    validateTranslatedSectionCopy(
      formData,
    );

  if (
    Object.keys(
      errors,
    ).length >
    0
  ) {
    return {
      status:
        "error",

      message:
        "Periksa kembali section translation.",

      errors,
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
        "id",
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
        `Gagal membaca section: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Section tidak ditemukan.",
    };
  }

  const {
    data:
      currentTranslation,

    error:
      translationLookupError,
  } =
    await supabase
      .from(
        "project_section_translations",
      )
      .select(
        "content",
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
    translationLookupError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membaca translation: ${translationLookupError.message}`,
    };
  }

  const currentContent =
    normalizeTranslationContent(
      currentTranslation
        ?.content,
    );

  const hasCoreCopy =
    Boolean(
      eyebrow ||
        heading ||
        body,
    );

  const hasContentOverrides =
    Object.keys(
      currentContent,
    ).length >
    0;

  /*
   * ID / DE kosong total:
   * hapus row jika tidak punya
   * specialized content override.
   */
  if (
    locale !==
      "en" &&
    !hasCoreCopy &&
    !hasContentOverrides
  ) {
    const {
      error:
        deleteError,
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
      deleteError
    ) {
      return {
        status:
          "error",

        message:
          `Gagal menghapus section translation: ${deleteError.message}`,
      };
    }

    revalidateSectionPages(
      projectId,
    );

    return {
      status:
        "success",

      message:
        `${locale.toUpperCase()} translation dikosongkan. Section akan fallback ke English.`,
    };
  }

  const {
    error:
      upsertError,
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

          eyebrow:
            eyebrow ||
            null,

          heading:
            heading ||
            null,

          body:
            body ||
            null,

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
    upsertError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menyimpan section translation: ${upsertError.message}`,
    };
  }

  /*
   * Legacy English selalu
   * disinkronkan.
   */
  if (
    locale ===
    "en"
  ) {
    const {
      error:
        legacyError,
    } =
      await supabase
        .from(
          "project_sections",
        )
        .update({
          eyebrow:
            eyebrow ||
            null,

          heading:
            heading ||
            null,

          body:
            body ||
            null,

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
      legacyError
    ) {
      return {
        status:
          "error",

        message:
          `Translation tersimpan, tetapi legacy English gagal disinkronkan: ${legacyError.message}`,
      };
    }
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      `${locale.toUpperCase()} section content berhasil disimpan.`,
  };
}

/*
 * =========================
 * SHARED SECTION SETTINGS
 * =========================
 */

export async function updateSectionSettings(
  projectId: string,
  sectionId: string,
  _previousState:
    SectionActionState,
  formData: FormData,
): Promise<
  SectionActionState
> {
  const {
    sectionType,
    theme,
    errors,
  } =
    validateSharedSectionSettings(
      formData,
    );

  const isVisible =
    formData.get(
      "is_visible",
    ) ===
    "on";

  if (
    Object.keys(
      errors,
    ).length >
    0
  ) {
    return {
      status:
        "error",

      message:
        "Periksa kembali shared section settings.",

      errors,
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
        "id",
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
        `Gagal membaca section: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Section tidak ditemukan.",
    };
  }

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        section_type:
          sectionType,

        theme,

        is_visible:
          isVisible,

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
    updateError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menyimpan section settings: ${updateError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Shared section settings berhasil disimpan.",
  };
}

/*
 * =========================
 * IMAGE SECTION
 * =========================
 */

export async function saveImageSectionMedia(
  projectId: string,
  sectionId: string,
  media: ImageSectionMedia,
): Promise<
  SectionActionState
> {
  const validationError =
    validateImageMedia(
      projectId,
      sectionId,
      media,
    );

  if (
    validationError
  ) {
    return {
      status:
        "error",

      message:
        validationError,
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
        "id, section_type, content",
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
        "Media gambar hanya dapat disimpan pada section bertipe Image.",
    };
  }

  const previousMedia =
    getImageSectionMedia(
      section.content,
    );

  const normalizedMedia:
    ImageSectionMedia =
    {
      asset:
        media.asset,

      alt:
        media.alt.trim(),

      caption:
        media.caption.trim(),
    };

  const nextContent = {
    ...getContentRecord(
      section.content,
    ),

    image:
      normalizedMedia,
  };

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        content:
          nextContent,

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
    updateError
  ) {
    if (
      previousMedia
        ?.asset.path !==
      normalizedMedia.asset.path
    ) {
      await removeStoragePath(
        supabase,
        normalizedMedia
          .asset.path,
      );
    }

    return {
      status:
        "error",

      message:
        `Gagal menyimpan media gambar: ${updateError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Media gambar berhasil disimpan. File sebelumnya dipertahankan sebagai recovery copy.",
  };
}

export async function removeImageSectionMedia(
  projectId: string,
  sectionId: string,
): Promise<
  SectionActionState
> {
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
        "id, section_type, content",
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
        "Section ini bukan image section.",
    };
  }

  const currentMedia =
    getImageSectionMedia(
      section.content,
    );

  if (
    !currentMedia
  ) {
    return {
      status:
        "success",

      message:
        "Tidak ada media gambar yang perlu dihapus.",
    };
  }

  const nextContent = {
    ...getContentRecord(
      section.content,
    ),
  };

  delete nextContent.image;

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        content:
          nextContent,

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
    updateError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menghapus media dari section: ${updateError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Media dilepas dari section. File disimpan sebagai recovery copy.",
  };
}

/*
 * =========================
 * GALLERY SECTION
 * =========================
 */

export async function saveGallerySectionMedia(
  projectId: string,
  sectionId: string,
  gallery: GallerySectionMedia,
): Promise<
  SectionActionState
> {
  const validationError =
    validateGalleryMedia(
      projectId,
      sectionId,
      gallery,
    );

  if (
    validationError
  ) {
    return {
      status:
        "error",

      message:
        validationError,
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
        "id, section_type, content",
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
        "Media gallery hanya dapat disimpan pada section bertipe Gallery.",
    };
  }

  const previousGallery =
    getGallerySectionMedia(
      section.content,
    );

  const normalizedGallery:
    GallerySectionMedia =
    {
      items:
        gallery.items.map(
          (
            item,
          ) => ({
            id:
              item.id,

            asset:
              item.asset,

            alt:
              item.alt.trim(),

            caption:
              item.caption.trim(),
          }),
        ),
    };

  const previousPaths =
    new Set(
      previousGallery
        ?.items.map(
          (
            item,
          ) =>
            item.asset.path,
        ) ??
        [],
    );

  const nextPaths =
    new Set(
      normalizedGallery
        .items.map(
          (
            item,
          ) =>
            item.asset.path,
        ),
    );

  const newlyUploadedPaths =
    Array.from(
      nextPaths,
    ).filter(
      (
        path,
      ) =>
        !previousPaths.has(
          path,
        ),
    );

  const nextContent = {
    ...getContentRecord(
      section.content,
    ),

    gallery:
      normalizedGallery,
  };

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        content:
          nextContent,

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
    updateError
  ) {
    if (
      newlyUploadedPaths
        .length >
      0
    ) {
      await supabase.storage
        .from(
          PORTFOLIO_MEDIA_BUCKET,
        )
        .remove(
          newlyUploadedPaths,
        );
    }

    return {
      status:
        "error",

      message:
        `Gagal menyimpan gallery: ${updateError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      normalizedGallery
        .items.length ===
      0
        ? "Gallery dikosongkan. File lama dipertahankan sebagai recovery copy."
        : `Gallery dengan ${normalizedGallery.items.length} gambar berhasil disimpan. File yang diganti/dilepas dipertahankan sebagai recovery copy.`,
  };
}

/*
 * =========================
 * METRICS SECTION
 * =========================
 */

export async function saveMetricsSectionContent(
  projectId: string,
  sectionId: string,
  metrics: MetricsSectionContent,
): Promise<
  SectionActionState
> {
  const validationError =
    validateMetricsContent(
      metrics,
    );

  if (
    validationError
  ) {
    return {
      status:
        "error",

      message:
        validationError,
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
        "id, section_type, content",
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
        "Metrics hanya dapat disimpan pada section bertipe Results / Metrics.",
    };
  }

  const normalizedMetrics:
    MetricsSectionContent =
    {
      columns:
        metrics.columns,

      items:
        metrics.items.map(
          (
            item,
          ) => ({
            id:
              item.id,

            value:
              item.value.trim(),

            label:
              item.label.trim(),

            detail:
              item.detail.trim(),
          }),
        ),
    };

  const nextContent = {
    ...getContentRecord(
      section.content,
    ),

    metrics:
      normalizedMetrics,
  };

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        content:
          nextContent,

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
    updateError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menyimpan metrics: ${updateError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      normalizedMetrics
        .items.length ===
      0
        ? "Metrics dikosongkan."
        : `${normalizedMetrics.items.length} metrics berhasil disimpan.`,
  };
}

/*
 * =========================
 * QUOTE SECTION
 * =========================
 */

export async function saveQuoteSectionContent(
  projectId: string,
  sectionId: string,
  quote: QuoteSectionContent,
): Promise<
  SectionActionState
> {
  const validationError =
    validateQuoteContent(
      quote,
    );

  if (
    validationError
  ) {
    return {
      status:
        "error",

      message:
        validationError,
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
        "id, section_type, content",
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
        `Gagal membaca quote section: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Quote section tidak ditemukan.",
    };
  }

  if (
    section.section_type !==
    "quote"
  ) {
    return {
      status:
        "error",

      message:
        "Quote hanya dapat disimpan pada section bertipe Quote.",
    };
  }

  const normalizedQuote:
    QuoteSectionContent =
    {
      text:
        quote.text.trim(),

      source:
        quote.source.trim(),

      context:
        quote.context.trim(),

      alignment:
        quote.alignment,
    };

  const nextContent = {
    ...getContentRecord(
      section.content,
    ),

    quote:
      normalizedQuote,
  };

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        content:
          nextContent,

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
    updateError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menyimpan quote: ${updateError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Quote berhasil disimpan.",
  };
}

/*
 * =========================
 * FINALE SECTION
 * =========================
 */

export async function saveFinaleSectionContent(
  projectId: string,
  sectionId: string,
  finale: FinaleSectionContent,
): Promise<
  SectionActionState
> {
  const validationError =
    validateFinaleContent(
      projectId,
      sectionId,
      finale,
    );

  if (
    validationError
  ) {
    return {
      status:
        "error",

      message:
        validationError,
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
        "id, section_type, content",
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
        `Gagal membaca finale section: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Finale section tidak ditemukan.",
    };
  }

  if (
    section.section_type !==
    "finale"
  ) {
    return {
      status:
        "error",

      message:
        "Finale hanya dapat disimpan pada section bertipe Final Showcase.",
    };
  }

  const previousMedia =
    getFinaleSectionMedia(
      section.content,
    );

  const normalizedMedia =
    finale.media
      ? {
          kind:
            finale.media.kind,

          asset:
            finale.media.asset,

          alt:
            finale.media.alt.trim(),
        }
      : null;

  const normalizedFinale:
    FinaleSectionContent =
    {
      title:
        finale.title.trim(),

      body:
        finale.body.trim(),

      ctaLabel:
        finale.ctaLabel.trim(),

      ctaUrl:
        finale.ctaUrl.trim(),

      media:
        normalizedMedia,
    };

  const previousPath =
    previousMedia
      ?.asset.path ??
    null;

  const nextPath =
    normalizedMedia
      ?.asset.path ??
    null;

  const nextContent = {
    ...getContentRecord(
      section.content,
    ),

    finale:
      normalizedFinale,
  };

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        content:
          nextContent,

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
    updateError
  ) {
    if (
      nextPath &&
      nextPath !==
        previousPath
    ) {
      await removeStoragePath(
        supabase,
        nextPath,
      );
    }

    return {
      status:
        "error",

      message:
        `Gagal menyimpan finale: ${updateError.message}`,
    };
  }

  revalidateSectionPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Finale berhasil disimpan. Media sebelumnya dipertahankan sebagai recovery copy.",
  };
}

/*
 * =========================
 * REORDER SECTION
 * =========================
 */

export async function moveSection(
  projectId: string,
  sectionId: string,
  formData: FormData,
) {
  const direction =
    getText(
      formData,
      "direction",
    );

  if (
    direction !==
      "up" &&
    direction !==
      "down"
  ) {
    throw new Error(
      "Arah perpindahan section tidak valid.",
    );
  }

  const supabase =
    await getAdminClient();

  const {
    error,
  } =
    await supabase.rpc(
      "move_project_section",
      {
        p_project_id:
          projectId,

        p_section_id:
          sectionId,

        p_direction:
          direction,
      },
    );

  if (
    error
  ) {
    throw new Error(
      `Gagal memindahkan section: ${error.message}`,
    );
  }

  revalidateSectionPages(
    projectId,
  );
}

/*
 * =========================
 * DELETE SECTION
 * =========================
 */

export async function deleteSection(
  projectId: string,
  sectionId: string,
) {
  const supabase =
    await getAdminClient();

  const {
    error,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .delete()
      .eq(
        "id",
        sectionId,
      )
      .eq(
        "project_id",
        projectId,
      );

  if (
    error
  ) {
    throw new Error(
      `Gagal menghapus section: ${error.message}`,
    );
  }

  revalidateSectionPages(
    projectId,
  );
}