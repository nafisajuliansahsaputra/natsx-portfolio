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
  getImageSectionMedia,
} from "@/lib/portfolio-media";

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
        `
          eyebrow,
          heading,
          body,
          content
        `,
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

  return (
    data as
      | TranslationRow
      | null
  );
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

  /*
   * ID / DE yang tidak punya
   * core copy maupun specialized
   * copy tidak perlu memiliki row.
   */
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

  /*
   * Hanya update content.
   *
   * eyebrow / heading / body yang
   * sudah dibuat oleh core editor
   * tidak ditimpa.
   */
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
 *
 * Shared:
 * image.asset
 *
 * Localized:
 * image.alt
 * image.caption
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
        `
          id,
          section_type,
          content
        `,
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

  /*
   * Empty localized fields berarti
   * fallback ke English.
   */
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

  /*
   * English tetap disinkronkan ke
   * base content supaya legacy
   * fallback tetap benar.
   */
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