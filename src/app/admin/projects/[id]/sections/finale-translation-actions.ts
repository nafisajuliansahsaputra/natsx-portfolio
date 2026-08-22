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
  PORTFOLIO_MEDIA_BUCKET,
  getContentRecord,
  getFinaleMediaKind,
  getFinaleSectionMedia,
  isAllowedFinaleMediaMimeType,
  type FinaleSectionMedia,
} from "@/lib/portfolio-media";

import {
  getFinaleSectionContent,
} from "@/lib/project-section-content";

import {
  createClient,
} from "@/lib/supabase/server";

export type FinaleTranslationState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;
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

function hasText(
  value:
    | string
    | null,
) {
  return Boolean(
    value?.trim(),
  );
}

function isValidCtaUrl(
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

function validateMedia(
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
    expectedKind !==
      media.kind
  ) {
    return "Jenis finale media tidak valid.";
  }

  if (
    !Number.isFinite(
      media.asset.size,
    ) ||
    media.asset.size <=
      0 ||
    media.asset.size >
      MAX_PORTFOLIO_MEDIA_FILE_SIZE
  ) {
    return "Ukuran finale media tidak valid atau melebihi 50 MB.";
  }

  if (
    !media.asset.originalName ||
    media.asset.originalName
      .length >
      255
  ) {
    return "Nama file finale media tidak valid.";
  }

  return null;
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
      `Gagal membaca finale translation: ${error.message}`,
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
        `Gagal membersihkan finale translation: ${error.message}`,
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
      `Gagal menyimpan finale translation: ${error.message}`,
    );
  }
}

/*
 * =========================================
 * SHARED FINALE DATA
 * =========================================
 *
 * Shared:
 * - CTA URL
 * - media kind
 * - media asset
 */

export async function saveFinaleSectionSharedData(
  projectId: string,
  sectionId: string,
  ctaUrlValue: string,
  media: FinaleSectionMedia | null,
): Promise<
  FinaleTranslationState
> {
  const ctaUrl =
    ctaUrlValue.trim();

  if (
    ctaUrl.length >
    2000
  ) {
    return {
      status:
        "error",

      message:
        "CTA URL terlalu panjang.",
    };
  }

  if (
    ctaUrl &&
    !isValidCtaUrl(
      ctaUrl,
    )
  ) {
    return {
      status:
        "error",

      message:
        "CTA URL tidak valid.",
    };
  }

  if (
    media
  ) {
    const mediaError =
      validateMedia(
        projectId,
        sectionId,
        media,
      );

    if (
      mediaError
    ) {
      return {
        status:
          "error",

        message:
          mediaError,
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
        "Shared finale data hanya dapat disimpan pada Final Showcase section.",
    };
  }

  const baseContent =
    getContentRecord(
      section.content,
    );

  const baseFinale =
    getFinaleSectionContent(
      section.content,
    );

  const previousMedia =
    getFinaleSectionMedia(
      section.content,
    );

  /*
   * Alt tidak ditulis dari shared
   * editor. English alt canonical
   * dipertahankan ketika media
   * diganti.
   */
  const normalizedMedia:
    FinaleSectionMedia | null =
    media
      ? {
          kind:
            media.kind,

          asset:
            media.asset,

          alt:
            previousMedia
              ?.alt ??
            "",
        }
      : null;

  const previousPath =
    previousMedia
      ?.asset.path ??
    null;

  const nextPath =
    normalizedMedia
      ?.asset.path ??
    null;

  const nextContent = {
    ...baseContent,

    finale: {
      ...baseFinale,

      ctaUrl,

      media:
        normalizedMedia,
    },
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
      await supabase.storage
        .from(
          PORTFOLIO_MEDIA_BUCKET,
        )
        .remove([
          nextPath,
        ]);
    }

    return {
      status:
        "error",

      message:
        `Gagal menyimpan shared finale data: ${updateError.message}`,
    };
  }

  let cleanupWarning =
    "";

  if (
    previousPath &&
    previousPath !==
      nextPath
  ) {
    const {
      error:
        cleanupError,
    } =
      await supabase.storage
        .from(
          PORTFOLIO_MEDIA_BUCKET,
        )
        .remove([
          previousPath,
        ]);

    if (
      cleanupError
    ) {
      cleanupWarning =
        " Shared data tersimpan, tetapi file media lama gagal dibersihkan dari Storage.";
    }
  }

  revalidateProject(
    projectId,
  );

  return {
    status:
      "success",

    message:
      `Shared finale URL dan media berhasil disimpan.${cleanupWarning}`,
  };
}

/*
 * =========================================
 * LOCALIZED FINALE COPY
 * =========================================
 *
 * Localized:
 * - title
 * - body
 * - CTA label
 * - media alt
 */

export async function saveFinaleSectionLocalizedCopy(
  projectId: string,
  sectionId: string,
  localeValue: string,
  titleValue: string,
  bodyValue: string,
  ctaLabelValue: string,
  mediaAltValue: string,
): Promise<
  FinaleTranslationState
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
        "Bahasa finale content tidak valid.",
    };
  }

  const locale =
    localeValue;

  const title =
    titleValue.trim();

  const body =
    bodyValue.trim();

  const ctaLabel =
    ctaLabelValue.trim();

  const requestedMediaAlt =
    mediaAltValue.trim();

  if (
    locale === "en" &&
    !title
  ) {
    return {
      status:
        "error",

      message:
        "English finale title wajib diisi.",
    };
  }

  if (
    title.length >
    300
  ) {
    return {
      status:
        "error",

      message:
        "Finale title maksimal 300 karakter.",
    };
  }

  if (
    body.length >
    2000
  ) {
    return {
      status:
        "error",

      message:
        "Finale description maksimal 2.000 karakter.",
    };
  }

  if (
    ctaLabel.length >
    120
  ) {
    return {
      status:
        "error",

      message:
        "CTA label maksimal 120 karakter.",
    };
  }

  if (
    requestedMediaAlt.length >
    500
  ) {
    return {
      status:
        "error",

      message:
        "Media description maksimal 500 karakter.",
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
        "Localized finale copy hanya dapat disimpan pada Final Showcase section.",
    };
  }

  const baseFinale =
    getFinaleSectionContent(
      section.content,
    );

  /*
   * Kalau tidak ada shared media,
   * alt override dibersihkan.
   */
  const mediaAlt =
    baseFinale.media
      ? requestedMediaAlt
      : "";

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
          : "Gagal membaca finale translation.",
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

  const nextFinaleContent:
    Record<
      string,
      unknown
    > = {
    ...getRecord(
      currentContent.finale,
    ),
  };

  /*
   * Shared properties tidak boleh
   * hidup di translation row.
   */
  delete nextFinaleContent.ctaUrl;

  if (
    title
  ) {
    nextFinaleContent.title =
      title;
  } else {
    delete nextFinaleContent.title;
  }

  if (
    body
  ) {
    nextFinaleContent.body =
      body;
  } else {
    delete nextFinaleContent.body;
  }

  if (
    ctaLabel
  ) {
    nextFinaleContent.ctaLabel =
      ctaLabel;
  } else {
    delete nextFinaleContent.ctaLabel;
  }

  /*
   * Translation media hanya boleh
   * mengandung alt, bukan asset.
   */
  delete nextFinaleContent.media;

  if (
    mediaAlt
  ) {
    nextFinaleContent.media = {
      alt:
        mediaAlt,
    };
  }

  if (
    isEmptyRecord(
      nextFinaleContent,
    )
  ) {
    delete nextContent.finale;
  } else {
    nextContent.finale =
      nextFinaleContent;
  }

  /*
   * English copy tetap disimpan
   * ke canonical base untuk legacy
   * fallback dan kompatibilitas.
   */
  if (
    locale === "en"
  ) {
    const baseContent =
      getContentRecord(
        section.content,
      );

    const nextBaseFinale = {
      ...baseFinale,

      title,

      body,

      ctaLabel,

      media:
        baseFinale.media
          ? {
              ...baseFinale.media,

              alt:
                mediaAlt,
            }
          : null,
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
          content: {
            ...baseContent,

            finale:
              nextBaseFinale,
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
          `Gagal menyinkronkan English finale copy: ${baseUpdateError.message}`,
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
          : "Gagal menyimpan finale translation.",
    };
  }

  revalidateProject(
    projectId,
  );

  return {
    status:
      "success",

    message:
      locale === "en"
        ? "English finale copy berhasil disimpan."
        : title ||
            body ||
            ctaLabel ||
            mediaAlt
          ? `${locale.toUpperCase()} finale copy berhasil disimpan.`
          : `${locale.toUpperCase()} finale copy dikosongkan dan akan fallback ke English.`,
  };
}