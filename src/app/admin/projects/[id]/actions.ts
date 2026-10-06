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
  PORTFOLIO_MEDIA_BUCKET,
  collectPortfolioMediaPaths,
} from "@/lib/portfolio-media";

import {
  createClient,
} from "@/lib/supabase/server";

type TranslationField =
  | "title"
  | "summary";

type SettingsField =
  | "slug"
  | "project_number"
  | "year"
  | "tech_stack"
  | "project_status"
  | "live_url"
  | "repository_url"
  | "accent_color"
  | "secondary_color"
  | "sort_order"
  | "status";

export type UpdateProjectTranslationState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;

  errors?: Partial<
    Record<
      TranslationField,
      string
    >
  >;
};

export type UpdateProjectSettingsState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;

  errors?: Partial<
    Record<
      SettingsField,
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

function createSlug(
  value: string,
) {
  return value
    .normalize(
      "NFKD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .slice(
      0,
      100,
    );
}

function parseList(
  value: string,
) {
  return Array.from(
    new Set(
      value
        .split(
          /[,\n]/,
        )
        .map(
          (
            item,
          ) =>
            item.trim(),
        )
        .filter(
          Boolean,
        ),
    ),
  );
}

function isValidColor(
  value: string,
) {
  return /^#[0-9a-f]{6}$/i.test(
    value,
  );
}

function isValidUrl(
  value: string,
) {
  try {
    const url =
      new URL(
        value,
      );

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}

function isLocale(
  value: string,
): value is Locale {
  return (
    value ===
      "en" ||
    value ===
      "id" ||
    value ===
      "de"
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

/*
 * =========================
 * TRANSLATED PROJECT COPY
 * =========================
 */

export async function updateProjectTranslation(
  projectId: string,

  _previousState:
    UpdateProjectTranslationState,

  formData: FormData,
): Promise<
  UpdateProjectTranslationState
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
        "Bahasa konten tidak valid.",
    };
  }

  const locale =
    localeValue;

  const title =
    getText(
      formData,
      "title",
    );

  const period =
    getText(
      formData,
      "period",
    );

  const summary =
    getText(
      formData,
      "summary",
    );

  const categories =
    parseList(
      getText(
        formData,
        "categories",
      ),
    );

  const roles =
    parseList(
      getText(
        formData,
        "roles",
      ),
    );

  const errors:
    UpdateProjectTranslationState["errors"] =
    {};

  /*
   * English menjadi canonical
   * fallback, jadi title EN wajib.
   *
   * ID/DE boleh sebagian kosong:
   * field kosong akan fallback
   * ke English di public renderer.
   */
  if (
    locale ===
      "en" &&
    !title
  ) {
    errors.title =
      "Judul English wajib diisi.";
  } else if (
    title.length >
    140
  ) {
    errors.title =
      "Judul maksimal 140 karakter.";
  }

  if (
    summary.length >
    2000
  ) {
    errors.summary =
      "Ringkasan maksimal 2.000 karakter.";
  }

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
        "Periksa kembali field translation.",

      errors,
    };
  }

  const supabase =
    await getAdminClient();

  const {
    data:
      currentProject,

    error:
      projectLookupError,
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
    projectLookupError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membaca project: ${projectLookupError.message}`,
    };
  }

  if (
    !currentProject
  ) {
    return {
      status:
        "error",

      message:
        "Project tidak ditemukan.",
    };
  }

  const currentTime =
    new Date().toISOString();

  const hasTranslationContent =
    Boolean(
      title ||
        period ||
        summary ||
        categories.length >
          0 ||
        roles.length >
          0,
    );

  /*
   * Untuk ID / DE:
   *
   * semua field kosong =
   * hapus translation row dan
   * kembali memakai English
   * fallback.
   */
  if (
    locale !==
      "en" &&
    !hasTranslationContent
  ) {
    const {
      error:
        deleteError,
    } =
      await supabase
        .from(
          "project_translations",
        )
        .delete()
        .eq(
          "project_id",
          projectId,
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
          `Gagal menghapus translation: ${deleteError.message}`,
      };
    }

    refreshProject(
      projectId,
    );

    return {
      status:
        "success",

      message:
        `${locale.toUpperCase()} translation dikosongkan. Public page akan fallback ke English.`,
    };
  }

  const translationPayload = {
    project_id:
      projectId,

    locale,

    title:
      locale ===
      "en"
        ? title
        : title ||
          null,

    period:
      period ||
      null,

    summary:
      locale ===
      "en"
        ? summary
        : summary ||
          null,

    categories:
      locale ===
      "en"
        ? categories
        : categories.length >
            0
          ? categories
          : null,

    roles:
      locale ===
      "en"
        ? roles
        : roles.length >
            0
          ? roles
          : null,

    updated_at:
      currentTime,
  };

  const {
    error:
      translationError,
  } =
    await supabase
      .from(
        "project_translations",
      )
      .upsert(
        translationPayload,
        {
          onConflict:
            "project_id,locale",
        },
      );

  if (
    translationError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menyimpan translation: ${translationError.message}`,
    };
  }

  /*
   * Legacy English columns tetap
   * disinkronkan.
   *
   * Ini mempertahankan:
   * - backwards compatibility
   * - admin heading lama
   * - final fallback terakhir
   */
  if (
    locale ===
    "en"
  ) {
    const {
      error:
        legacyUpdateError,
    } =
      await supabase
        .from(
          "projects",
        )
        .update({
          title,

          period:
            period ||
            null,

          summary,

          categories,

          roles,

          updated_at:
            currentTime,
        })
        .eq(
          "id",
          projectId,
        );

    if (
      legacyUpdateError
    ) {
      return {
        status:
          "error",

        message:
          `Translation tersimpan, tetapi legacy English gagal disinkronkan: ${legacyUpdateError.message}`,
      };
    }
  }

  refreshProject(
    projectId,
  );

  return {
    status:
      "success",

    message:
      `${locale.toUpperCase()} project content berhasil disimpan.`,
  };
}

/*
 * =========================
 * SHARED PROJECT SETTINGS
 * =========================
 */

export async function updateProjectSettings(
  projectId: string,

  _previousState:
    UpdateProjectSettingsState,

  formData: FormData,
): Promise<
  UpdateProjectSettingsState
> {
  const slug =
    createSlug(
      getText(
        formData,
        "slug",
      ),
    );

  const projectNumber =
    getText(
      formData,
      "project_number",
    );

  const year =
    Number(
      getText(
        formData,
        "year",
      ),
    );

  const techStack =
    parseList(
      getText(
        formData,
        "tech_stack",
      ),
    );

  const projectStatus =
    getText(
      formData,
      "project_status",
    );

  const liveUrl =
    getText(
      formData,
      "live_url",
    );

  const repositoryUrl =
    getText(
      formData,
      "repository_url",
    );

  const accentColor =
    getText(
      formData,
      "accent_color",
    ) ||
    "#5961ED";

  const secondaryColor =
    getText(
      formData,
      "secondary_color",
    );

  const sortOrder =
    Number(
      getText(
        formData,
        "sort_order",
      ),
    );

  const status =
    getText(
      formData,
      "status",
    );

  const featured =
    formData.get(
      "featured",
    ) ===
    "on";

  const errors:
    UpdateProjectSettingsState["errors"] =
    {};

  if (
    !slug
  ) {
    errors.slug =
      "Slug project wajib diisi.";
  } else if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug,
    )
  ) {
    errors.slug =
      "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.";
  }

  if (
    !projectNumber
  ) {
    errors.project_number =
      "Nomor project wajib diisi.";
  } else if (
    projectNumber.length >
    10
  ) {
    errors.project_number =
      "Nomor project maksimal 10 karakter.";
  }

  if (
    !Number.isInteger(
      year,
    ) ||
    year <
      2000 ||
    year >
      2100
  ) {
    errors.year =
      "Tahun project harus antara 2000 dan 2100.";
  }

  if (
    !projectStatus
  ) {
    errors.project_status =
      "Project status wajib diisi.";
  }

  if (
    liveUrl &&
    !isValidUrl(
      liveUrl,
    )
  ) {
    errors.live_url =
      "Masukkan URL lengkap, misalnya https://example.com.";
  }

  if (
    repositoryUrl &&
    !isValidUrl(
      repositoryUrl,
    )
  ) {
    errors.repository_url =
      "Masukkan URL repository lengkap, misalnya https://github.com/owner/repo.";
  }

  if (
    !isValidColor(
      accentColor,
    )
  ) {
    errors.accent_color =
      "Gunakan format warna HEX seperti #5961ED.";
  }

  if (
    secondaryColor &&
    !isValidColor(
      secondaryColor,
    )
  ) {
    errors.secondary_color =
      "Gunakan format warna HEX seperti #F4EFE6.";
  }

  if (
    !Number.isInteger(
      sortOrder,
    ) ||
    sortOrder <
      0
  ) {
    errors.sort_order =
      "Urutan harus berupa angka 0 atau lebih besar.";
  }

  if (
    status !==
      "draft" &&
    status !==
      "published" &&
    status !==
      "archived"
  ) {
    errors.status =
      "Status project tidak valid.";
  }

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
        "Periksa kembali beberapa setting yang belum valid.",

      errors,
    };
  }

  const supabase =
    await getAdminClient();

  const {
    data:
      currentProject,

    error:
      currentProjectError,
  } =
    await supabase
      .from(
        "projects",
      )
      .select(
        "id, slug, published_at",
      )
      .eq(
        "id",
        projectId,
      )
      .maybeSingle();

  if (
    currentProjectError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal membaca project: ${currentProjectError.message}`,
    };
  }

  if (
    !currentProject
  ) {
    return {
      status:
        "error",

      message:
        "Project tidak ditemukan.",
    };
  }

  if (
    currentProject.published_at &&
    slug !==
      currentProject.slug
  ) {
    return {
      status:
        "error",

      message:
        "Slug project yang sudah pernah dipublikasikan tidak dapat diubah.",

      errors: {
        slug:
          "Slug dikunci setelah publish pertama untuk menjaga URL tetap stabil.",
      },
    };
  }

  const {
    data:
      duplicateProject,

    error:
      slugLookupError,
  } =
    await supabase
      .from(
        "projects",
      )
      .select(
        "id",
      )
      .eq(
        "slug",
        slug,
      )
      .neq(
        "id",
        projectId,
      )
      .maybeSingle();

  if (
    slugLookupError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal memeriksa slug: ${slugLookupError.message}`,
    };
  }

  if (
    duplicateProject
  ) {
    return {
      status:
        "error",

      message:
        "Slug tersebut sudah digunakan oleh project lain.",

      errors: {
        slug:
          "Pilih slug lain yang belum digunakan.",
      },
    };
  }

  const currentTime =
    new Date().toISOString();

  const publishedAt =
    currentProject.published_at ??
    (
      status ===
      "published"
        ? currentTime
        : null
    );

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "projects",
      )
      .update({
        slug,

        project_number:
          projectNumber,

        year,

        status,

        featured,

        sort_order:
          sortOrder,

        tech_stack:
          techStack,

        project_status:
          projectStatus,

        live_url:
          liveUrl ||
          null,

        repository_url:
          repositoryUrl ||
          null,

        accent_color:
          accentColor,

        secondary_color:
          secondaryColor ||
          null,

        published_at:
          publishedAt,

        updated_at:
          currentTime,
      })
      .eq(
        "id",
        projectId,
      );

  if (
    updateError
  ) {
    if (
      updateError.code ===
      "23505"
    ) {
      return {
        status:
          "error",

        message:
          "Slug tersebut sudah digunakan oleh project lain.",

        errors: {
          slug:
            "Pilih slug lain yang belum digunakan.",
        },
      };
    }

    return {
      status:
        "error",

      message:
        `Gagal menyimpan project settings: ${updateError.message}`,
    };
  }

  refreshProject(
    projectId,
  );

  return {
    status:
      "success",

    message:
      "Project settings berhasil disimpan.",
  };
}

/*
 * =========================
 * DELETE PROJECT
 * =========================
 */

export async function deleteProject(
  projectId: string,
) {
  const supabase =
    await getAdminClient();

  const {
    data:
      sections,

    error:
      sectionLookupError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .select(
        "content",
      )
      .eq(
        "project_id",
        projectId,
      );

  if (
    sectionLookupError
  ) {
    throw new Error(
      `Gagal membaca media project: ${sectionLookupError.message}`,
    );
  }

  const storagePaths =
    Array.from(
      new Set(
        (
          sections ??
          []
        ).flatMap(
          (
            section,
          ) =>
            collectPortfolioMediaPaths(
              section.content,
            ),
        ),
      ),
    );

  /*
   * project_sections ikut
   * terhapus melalui cascade.
   *
   * translation tables juga
   * sekarang cascade dari
   * project / section masing-masing.
   */
  const {
    error:
      projectDeleteError,
  } =
    await supabase
      .from(
        "projects",
      )
      .delete()
      .eq(
        "id",
        projectId,
      );

  if (
    projectDeleteError
  ) {
    throw new Error(
      `Gagal menghapus project: ${projectDeleteError.message}`,
    );
  }

  if (
    storagePaths.length >
    0
  ) {
    const {
      error:
        storageCleanupError,
    } =
      await supabase.storage
        .from(
          PORTFOLIO_MEDIA_BUCKET,
        )
        .remove(
          storagePaths,
        );

    if (
      storageCleanupError
    ) {
      console.error(
        "Project deleted, but media cleanup failed:",
        storageCleanupError,
      );
    }
  }

  updateTag(
    PUBLIC_PORTFOLIO_CACHE_TAG,
  );

  revalidatePath(
    "/admin",
  );

  redirect(
    "/admin",
  );
}