"use server";

import {
  revalidatePath,
  updateTag,
} from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PUBLIC_PORTFOLIO_CACHE_TAG,
} from "@/lib/portfolio-cache";

import {
  PORTFOLIO_MEDIA_BUCKET,
  collectPortfolioMediaPaths,
} from "@/lib/portfolio-media";

type ProjectField =
  | "title"
  | "slug"
  | "project_number"
  | "year"
  | "summary"
  | "live_url"
  | "accent_color"
  | "secondary_color"
  | "sort_order"
  | "status";

export type UpdateProjectState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<ProjectField, string>>;
};

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function parseList(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function isValidColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function getAdminClient() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authenticationError,
  } = await supabase.auth.getUser();

  if (authenticationError || !user) {
    redirect("/admin/login");
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    throw new Error(`Gagal memverifikasi admin: ${adminError.message}`);
  }

  if (!adminUser) {
    redirect("/admin/login?error=unauthorized");
  }

  return supabase;
}

export async function updateProject(
  projectId: string,
  _previousState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const title = getText(formData, "title");
  const slug = createSlug(getText(formData, "slug") || title);
  const projectNumber = getText(formData, "project_number");
  const year = Number(getText(formData, "year"));
  const period = getText(formData, "period");
  const summary = getText(formData, "summary");
  const categories = parseList(getText(formData, "categories"));
  const roles = parseList(getText(formData, "roles"));
  const liveUrl = getText(formData, "live_url");
  const accentColor = getText(formData, "accent_color") || "#5961ED";
  const secondaryColor = getText(formData, "secondary_color");
  const sortOrder = Number(getText(formData, "sort_order"));
  const status = getText(formData, "status");
  const featured = formData.get("featured") === "on";

  const errors: UpdateProjectState["errors"] = {};

  if (!title) {
    errors.title = "Judul project wajib diisi.";
  } else if (title.length > 140) {
    errors.title = "Judul maksimal 140 karakter.";
  }

  if (!slug) {
    errors.slug = "Slug project wajib diisi.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.";
  }

  if (!projectNumber) {
    errors.project_number = "Nomor project wajib diisi.";
  } else if (projectNumber.length > 10) {
    errors.project_number = "Nomor project maksimal 10 karakter.";
  }

if (!Number.isInteger(year) || year < 2000 || year > 2100) {
  errors.year = "Tahun project harus antara 2000 dan 2100.";
}

  if (summary.length > 2000) {
    errors.summary = "Ringkasan maksimal 2.000 karakter.";
  }

  if (liveUrl && !isValidUrl(liveUrl)) {
    errors.live_url = "Masukkan URL lengkap, misalnya https://example.com.";
  }

  if (!isValidColor(accentColor)) {
    errors.accent_color = "Gunakan format warna HEX seperti #5961ED.";
  }

  if (secondaryColor && !isValidColor(secondaryColor)) {
    errors.secondary_color = "Gunakan format warna HEX seperti #F4EFE6.";
  }

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    errors.sort_order = "Urutan harus berupa angka 0 atau lebih besar.";
  }

if (
  status !== "draft" &&
  status !== "published" &&
  status !== "archived"
) {
  errors.status = "Status project tidak valid.";
}

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali beberapa field yang belum valid.",
      errors,
    };
  }

  const supabase = await getAdminClient();

const {
  data: currentProject,
  error: currentProjectError,
} = await supabase
  .from("projects")
  .select(
    "id, slug, published_at",
  )
  .eq(
    "id",
    projectId,
  )
  .maybeSingle();

  if (currentProjectError) {
    return {
      status: "error",
      message: `Gagal membaca project: ${currentProjectError.message}`,
    };
  }

  if (!currentProject) {
    return {
      status: "error",
      message: "Project tidak ditemukan.",
    };
  }

  /*
 * Slug menjadi permanent identifier
 * setelah project pertama kali
 * dipublikasikan.
 *
 * Ini menjaga URL lama, canonical,
 * sitemap, dan external links tetap
 * valid walaupun project kemudian
 * dikembalikan ke draft.
 */
if (
  currentProject.published_at &&
  slug !== currentProject.slug
) {
  return {
    status: "error",
    message:
      "Slug project yang sudah pernah dipublikasikan tidak dapat diubah.",
    errors: {
      slug:
        "Slug dikunci setelah publish pertama untuk menjaga URL tetap stabil.",
    },
  };
}

  const { data: duplicateProject, error: slugLookupError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .neq("id", projectId)
    .maybeSingle();

  if (slugLookupError) {
    return {
      status: "error",
      message: `Gagal memeriksa slug: ${slugLookupError.message}`,
    };
  }

  if (duplicateProject) {
    return {
      status: "error",
      message: "Slug tersebut sudah digunakan oleh project lain.",
      errors: {
        slug: "Pilih slug lain yang belum digunakan.",
      },
    };
  }

  const currentTime = new Date().toISOString();

const publishedAt =
  currentProject.published_at ??
  (
    status === "published"
      ? currentTime
      : null
  );

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      slug,
      title,
      project_number: projectNumber,
      year,
      period: period || null,
      summary,
      categories,
      roles,
      status,
      featured,
      sort_order: sortOrder,
      live_url: liveUrl || null,
      accent_color: accentColor,
      secondary_color: secondaryColor || null,
      published_at: publishedAt,
      updated_at: currentTime,
    })
    .eq("id", projectId);

  if (updateError) {
    if (updateError.code === "23505") {
      return {
        status: "error",
        message: "Slug tersebut sudah digunakan oleh project lain.",
        errors: {
          slug: "Pilih slug lain yang belum digunakan.",
        },
      };
    }

    return {
      status: "error",
      message: `Gagal menyimpan project: ${updateError.message}`,
    };
  }

  updateTag(
  PUBLIC_PORTFOLIO_CACHE_TAG,
);

  revalidatePath("/admin");
  revalidatePath(`/admin/projects/${projectId}`);

  return {
    status: "success",
    message: "Perubahan project berhasil disimpan.",
  };
}

export async function deleteProject(
  projectId: string,
) {
  const supabase =
    await getAdminClient();

  /*
   * Ambil semua media path sebelum
   * project dihapus.
   *
   * project_sections akan terhapus
   * otomatis melalui FK
   * ON DELETE CASCADE.
   */
  const {
    data: sections,
    error: sectionLookupError,
  } = await supabase
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

  if (sectionLookupError) {
    throw new Error(
      `Gagal membaca media project: ${sectionLookupError.message}`,
    );
  }

  const storagePaths =
    Array.from(
      new Set(
        (
          sections ?? []
        ).flatMap(
          (section) =>
            collectPortfolioMediaPaths(
              section.content,
            ),
        ),
      ),
    );

  /*
   * Hapus project saja.
   *
   * Semua project_sections ikut
   * terhapus lewat ON DELETE CASCADE.
   *
   * Ini menghindari kondisi:
   * sections sudah terhapus tetapi
   * project gagal terhapus.
   */
  const {
    error:
      projectDeleteError,
  } = await supabase
    .from(
      "projects",
    )
    .delete()
    .eq(
      "id",
      projectId,
    );

  if (projectDeleteError) {
    throw new Error(
      `Gagal menghapus project: ${projectDeleteError.message}`,
    );
  }

  /*
   * Database sudah menjadi source
   * of truth bahwa project terhapus.
   *
   * Baru setelah itu bersihkan
   * file Storage.
   *
   * Kalau Storage cleanup gagal,
   * jangan membatalkan deletion:
   * orphan file lebih aman daripada
   * project aktif kehilangan media.
   */
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