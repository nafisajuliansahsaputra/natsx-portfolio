"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProjectField =
  | "title"
  | "slug"
  | "project_number"
  | "year"
  | "summary"
  | "live_url"
  | "accent_color"
  | "secondary_color";

export type CreateProjectState = {
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

export async function createProject(
  _previousState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const title = getText(formData, "title");
  const slug = createSlug(getText(formData, "slug") || title);
  const projectNumber = getText(formData, "project_number");
  const yearValue = getText(formData, "year");
  const year = Number(yearValue);
  const period = getText(formData, "period");
  const summary = getText(formData, "summary");
  const categories = parseList(getText(formData, "categories"));
  const roles = parseList(getText(formData, "roles"));
  const liveUrl = getText(formData, "live_url");
  const accentColor = getText(formData, "accent_color") || "#5961ED";
  const secondaryColor = getText(formData, "secondary_color");

  const errors: CreateProjectState["errors"] = {};

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

  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    errors.year = "Tahun project tidak valid.";
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

  if (Object.keys(errors).length > 0) {
    return {
      message: "Periksa kembali beberapa field yang belum valid.",
      errors,
    };
  }

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
    return {
      message: `Gagal memverifikasi admin: ${adminError.message}`,
    };
  }

  if (!adminUser) {
    redirect("/admin/login?error=unauthorized");
  }

  const { data: existingProject, error: slugLookupError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (slugLookupError) {
    return {
      message: `Gagal memeriksa slug: ${slugLookupError.message}`,
    };
  }

  if (existingProject) {
    return {
      message: "Slug tersebut sudah digunakan oleh project lain.",
      errors: {
        slug: "Pilih slug lain yang belum digunakan.",
      },
    };
  }

  const { data: lastProject, error: sortOrderError } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sortOrderError) {
    return {
      message: `Gagal menentukan urutan project: ${sortOrderError.message}`,
    };
  }

  const nextSortOrder = (lastProject?.sort_order ?? -1) + 1;

  const { error: insertError } = await supabase.from("projects").insert({
    slug,
    title,
    project_number: projectNumber,
    year,
    period: period || null,
    summary,
    categories,
    roles,
    status: "draft",
    featured: false,
    sort_order: nextSortOrder,
    live_url: liveUrl || null,
    accent_color: accentColor,
    secondary_color: secondaryColor || null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        message: "Slug tersebut sudah digunakan oleh project lain.",
        errors: {
          slug: "Pilih slug lain yang belum digunakan.",
        },
      };
    }

    return {
      message: `Gagal membuat project: ${insertError.message}`,
    };
  }

  revalidatePath("/admin");
  redirect("/admin");
}