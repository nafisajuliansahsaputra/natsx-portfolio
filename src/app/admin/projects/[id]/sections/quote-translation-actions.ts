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
} from "@/lib/portfolio-media";

import {
  getQuoteSectionContent,
  isQuoteAlignment,
  type QuoteAlignment,
} from "@/lib/project-section-content";

import {
  createClient,
} from "@/lib/supabase/server";

export type QuoteTranslationState = {
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
      `Gagal membaca quote translation: ${error.message}`,
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
        `Gagal membersihkan quote translation: ${error.message}`,
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
      `Gagal menyimpan quote translation: ${error.message}`,
    );
  }
}

export async function saveQuoteSectionSharedAlignment(
  projectId: string,
  sectionId: string,
  alignmentValue: string,
): Promise<
  QuoteTranslationState
> {
  if (
    !isQuoteAlignment(
      alignmentValue,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Alignment quote tidak valid.",
    };
  }

  const alignment:
    QuoteAlignment =
    alignmentValue;

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
        "Shared quote alignment hanya dapat disimpan pada Quote section.",
    };
  }

  const baseContent =
    getContentRecord(
      section.content,
    );

  const currentQuote =
    getRecord(
      baseContent.quote,
    );

  const nextContent = {
    ...baseContent,

    quote: {
      ...currentQuote,

      alignment,
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
    return {
      status:
        "error",

      message:
        `Gagal menyimpan shared quote alignment: ${updateError.message}`,
    };
  }

  revalidateProject(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Shared quote alignment berhasil disimpan.",
  };
}

export async function saveQuoteSectionLocalizedCopy(
  projectId: string,
  sectionId: string,
  localeValue: string,
  textValue: string,
  sourceValue: string,
  contextValue: string,
): Promise<
  QuoteTranslationState
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
        "Bahasa quote content tidak valid.",
    };
  }

  const locale =
    localeValue;

  const text =
    textValue.trim();

  const source =
    sourceValue.trim();

  const context =
    contextValue.trim();

  if (
    locale === "en" &&
    !text
  ) {
    return {
      status:
        "error",

      message:
        "English quote text wajib diisi.",
    };
  }

  if (
    text.length >
    2000
  ) {
    return {
      status:
        "error",

      message:
        "Quote maksimal 2.000 karakter.",
    };
  }

  if (
    source.length >
    160
  ) {
    return {
      status:
        "error",

      message:
        "Source maksimal 160 karakter.",
    };
  }

  if (
    context.length >
    200
  ) {
    return {
      status:
        "error",

      message:
        "Context maksimal 200 karakter.",
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
        "Localized quote copy hanya dapat disimpan pada Quote section.",
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
          : "Gagal membaca quote translation.",
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

  const nextQuoteContent:
    Record<
      string,
      unknown
    > = {
    ...getRecord(
      currentContent.quote,
    ),
  };

  /*
   * Alignment adalah shared,
   * sehingga translation tidak
   * boleh menyimpan override.
   */
  delete nextQuoteContent.alignment;

  if (
    text
  ) {
    nextQuoteContent.text =
      text;
  } else {
    delete nextQuoteContent.text;
  }

  if (
    source
  ) {
    nextQuoteContent.source =
      source;
  } else {
    delete nextQuoteContent.source;
  }

  if (
    context
  ) {
    nextQuoteContent.context =
      context;
  } else {
    delete nextQuoteContent.context;
  }

  if (
    isEmptyRecord(
      nextQuoteContent,
    )
  ) {
    delete nextContent.quote;
  } else {
    nextContent.quote =
      nextQuoteContent;
  }

  /*
   * English tetap disinkronkan
   * ke canonical project_sections
   * sebagai legacy fallback.
   */
  if (
    locale === "en"
  ) {
    const baseContent =
      getContentRecord(
        section.content,
      );

    const baseQuote =
      getQuoteSectionContent(
        section.content,
      );

    const nextBaseContent = {
      ...baseContent,

      quote: {
        ...baseQuote,

        text,

        source,

        context,
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
          `Gagal menyinkronkan English quote copy: ${baseUpdateError.message}`,
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
          : "Gagal menyimpan quote translation.",
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
        ? "English quote copy berhasil disimpan."
        : text ||
            source ||
            context
          ? `${locale.toUpperCase()} quote copy berhasil disimpan.`
          : `${locale.toUpperCase()} quote copy dikosongkan dan akan fallback ke English.`,
  };
}