"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

const SECTION_THEMES = ["light", "dark", "accent"] as const;

type SectionField =
  | "section_type"
  | "theme"
  | "eyebrow"
  | "heading"
  | "body";

export type SectionActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<SectionField, string>>;
};

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
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

function validateSection(formData: FormData) {
  const sectionType = getText(formData, "section_type");
  const theme = getText(formData, "theme");
  const eyebrow = getText(formData, "eyebrow");
  const heading = getText(formData, "heading");
  const body = getText(formData, "body");

  const errors: SectionActionState["errors"] = {};

  if (
    !SECTION_TYPES.includes(
      sectionType as (typeof SECTION_TYPES)[number],
    )
  ) {
    errors.section_type = "Jenis section tidak valid.";
  }

  if (
    !SECTION_THEMES.includes(
      theme as (typeof SECTION_THEMES)[number],
    )
  ) {
    errors.theme = "Tema section tidak valid.";
  }

  if (eyebrow.length > 100) {
    errors.eyebrow = "Eyebrow maksimal 100 karakter.";
  }

  if (heading.length > 300) {
    errors.heading = "Heading maksimal 300 karakter.";
  }

  if (body.length > 10000) {
    errors.body = "Body maksimal 10.000 karakter.";
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

function revalidateSectionPages(projectId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}/sections`);
}

export async function createSection(
  projectId: string,
  _previousState: SectionActionState,
  formData: FormData,
): Promise<SectionActionState> {
  const { values, errors } = validateSection(formData);

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali informasi section.",
      errors,
    };
  }

  const supabase = await getAdminClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    return {
      status: "error",
      message: `Gagal memeriksa project: ${projectError.message}`,
    };
  }

  if (!project) {
    return {
      status: "error",
      message: "Project tidak ditemukan.",
    };
  }

  const { data: lastSection, error: orderError } = await supabase
    .from("project_sections")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    return {
      status: "error",
      message: `Gagal menentukan urutan section: ${orderError.message}`,
    };
  }

  const nextSortOrder = (lastSection?.sort_order ?? -1) + 1;

  const { error: insertError } = await supabase
    .from("project_sections")
    .insert({
      project_id: projectId,
      section_type: values.sectionType,
      eyebrow: values.eyebrow || null,
      heading: values.heading || null,
      body: values.body || null,
      content: {},
      theme: values.theme,
      sort_order: nextSortOrder,
      is_visible: true,
    });

  if (insertError) {
    return {
      status: "error",
      message: `Gagal membuat section: ${insertError.message}`,
    };
  }

  revalidateSectionPages(projectId);

  return {
    status: "success",
    message: "Section baru berhasil ditambahkan.",
  };
}

export async function updateSection(
  projectId: string,
  sectionId: string,
  _previousState: SectionActionState,
  formData: FormData,
): Promise<SectionActionState> {
  const { values, errors } = validateSection(formData);
  const isVisible = formData.get("is_visible") === "on";

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Periksa kembali informasi section.",
      errors,
    };
  }

  const supabase = await getAdminClient();

  const { data: section, error: sectionError } = await supabase
    .from("project_sections")
    .select("id")
    .eq("id", sectionId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (sectionError) {
    return {
      status: "error",
      message: `Gagal membaca section: ${sectionError.message}`,
    };
  }

  if (!section) {
    return {
      status: "error",
      message: "Section tidak ditemukan.",
    };
  }

  const { error: updateError } = await supabase
    .from("project_sections")
    .update({
      section_type: values.sectionType,
      eyebrow: values.eyebrow || null,
      heading: values.heading || null,
      body: values.body || null,
      theme: values.theme,
      is_visible: isVisible,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sectionId)
    .eq("project_id", projectId);

  if (updateError) {
    return {
      status: "error",
      message: `Gagal menyimpan section: ${updateError.message}`,
    };
  }

  revalidateSectionPages(projectId);

  return {
    status: "success",
    message: "Perubahan section berhasil disimpan.",
  };
}

export async function moveSection(
  projectId: string,
  sectionId: string,
  formData: FormData,
) {
  const direction = getText(formData, "direction");

  if (direction !== "up" && direction !== "down") {
    throw new Error("Arah perpindahan section tidak valid.");
  }

  const supabase = await getAdminClient();

  const { data, error } = await supabase
    .from("project_sections")
    .select("id, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Gagal membaca urutan section: ${error.message}`);
  }

  const sections = data ?? [];
  const currentIndex = sections.findIndex(
    (section) => section.id === sectionId,
  );

  if (currentIndex === -1) {
    throw new Error("Section tidak ditemukan.");
  }

  const destinationIndex =
    direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (
    destinationIndex < 0 ||
    destinationIndex >= sections.length
  ) {
    return;
  }

  const currentSection = sections[currentIndex];
  const destinationSection = sections[destinationIndex];

  const temporaryOrder =
    Math.min(...sections.map((section) => section.sort_order), 0) - 1000;

  const { error: temporaryError } = await supabase
    .from("project_sections")
    .update({
      sort_order: temporaryOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentSection.id)
    .eq("project_id", projectId);

  if (temporaryError) {
    throw new Error(
      `Gagal memindahkan section: ${temporaryError.message}`,
    );
  }

  const { error: destinationError } = await supabase
    .from("project_sections")
    .update({
      sort_order: currentSection.sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", destinationSection.id)
    .eq("project_id", projectId);

  if (destinationError) {
    throw new Error(
      `Gagal memperbarui urutan section: ${destinationError.message}`,
    );
  }

  const { error: currentError } = await supabase
    .from("project_sections")
    .update({
      sort_order: destinationSection.sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentSection.id)
    .eq("project_id", projectId);

  if (currentError) {
    throw new Error(
      `Gagal menyelesaikan perpindahan section: ${currentError.message}`,
    );
  }

  revalidateSectionPages(projectId);
}

export async function deleteSection(
  projectId: string,
  sectionId: string,
  _formData: FormData,
) {
  const supabase = await getAdminClient();

  const { error } = await supabase
    .from("project_sections")
    .delete()
    .eq("id", sectionId)
    .eq("project_id", projectId);

  if (error) {
    throw new Error(`Gagal menghapus section: ${error.message}`);
  }

  revalidateSectionPages(projectId);
}