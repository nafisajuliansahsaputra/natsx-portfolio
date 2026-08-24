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
  PORTFOLIO_MEDIA_BUCKET,
} from "@/lib/portfolio-media";

import {
  createClient,
} from "@/lib/supabase/server";

export type ProjectCoverSlot =
  | "card"
  | "hero";

export type ProjectCoverActionState = {
  status:
    | "success"
    | "error";

  message: string;

  path?:
    | string
    | null;
};

type ProjectCoverRow = {
  slug: string;

  hero_image_path:
    | string
    | null;

  card_image_path:
    | string
    | null;
};

function isProjectCoverSlot(
  value: string,
): value is ProjectCoverSlot {
  return (
    value ===
      "card" ||
    value ===
      "hero"
  );
}

function isOwnedProjectCoverPath(
  projectId: string,
  path: string,
) {
  const expectedPrefix =
    `projects/${projectId}/covers/`;

  return (
    path.startsWith(
      expectedPrefix,
    ) &&
    !path.includes(
      "..",
    ) &&
    !path.startsWith(
      "/",
    )
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

async function loadProject(
  projectId: string,
) {
  const supabase =
    await getAdminClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "projects",
      )
      .select(
        `
          slug,
          hero_image_path,
          card_image_path
        `,
      )
      .eq(
        "id",
        projectId,
      )
      .maybeSingle();

  if (
    error
  ) {
    return {
      supabase,

      project:
        null,

      error:
        `Gagal memuat project: ${error.message}`,
    };
  }

  if (
    !data
  ) {
    return {
      supabase,

      project:
        null,

      error:
        "Project tidak ditemukan.",
    };
  }

  return {
    supabase,

    project:
      data as unknown as
        ProjectCoverRow,

    error:
      null,
  };
}

function refreshProject(
  projectId: string,
  slug: string,
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

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/id",
  );

  revalidatePath(
    "/de",
  );

  revalidatePath(
    "/work",
  );

  revalidatePath(
    "/id/work",
  );

  revalidatePath(
    "/de/work",
  );

  revalidatePath(
    `/work/${slug}`,
  );

  revalidatePath(
    `/id/work/${slug}`,
  );

  revalidatePath(
    `/de/work/${slug}`,
  );
}

async function removeUnusedStoragePath(
  supabase:
    Awaited<
      ReturnType<
        typeof createClient
      >
    >,

  path:
    | string
    | null,

  retainedPath:
    | string
    | null,
) {
  if (
    !path ||
    path ===
      retainedPath
  ) {
    return null;
  }

  const {
    error,
  } =
    await supabase.storage
      .from(
        PORTFOLIO_MEDIA_BUCKET,
      )
      .remove([
        path,
      ]);

  return error;
}

export async function saveProjectCover(
  projectId: string,
  slot: ProjectCoverSlot,
  path: string,
): Promise<ProjectCoverActionState> {
  const normalizedProjectId =
    projectId.trim();

  const normalizedPath =
    path.trim();

  if (
    !normalizedProjectId
  ) {
    return {
      status:
        "error",

      message:
        "Project ID tidak valid.",
    };
  }

  if (
    !isProjectCoverSlot(
      slot,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Jenis cover tidak valid.",
    };
  }

  if (
    !isOwnedProjectCoverPath(
      normalizedProjectId,
      normalizedPath,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Lokasi file cover tidak valid.",
    };
  }

  const {
    supabase,
    project,
    error:
      loadError,
  } =
    await loadProject(
      normalizedProjectId,
    );

  if (
    loadError ||
    !project
  ) {
    return {
      status:
        "error",

      message:
        loadError ??
        "Project tidak ditemukan.",
    };
  }

  const previousPath =
    slot ===
      "card"
      ? project
          .card_image_path
      : project
          .hero_image_path;

  const retainedPath =
    slot ===
      "card"
      ? project
          .hero_image_path
      : project
          .card_image_path;

  const updatePayload =
    slot ===
      "card"
      ? {
          card_image_path:
            normalizedPath,

          updated_at:
            new Date()
              .toISOString(),
        }
      : {
          hero_image_path:
            normalizedPath,

          updated_at:
            new Date()
              .toISOString(),
        };

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "projects",
      )
      .update(
        updatePayload,
      )
      .eq(
        "id",
        normalizedProjectId,
      );

  if (
    updateError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menyimpan cover: ${updateError.message}`,
    };
  }

  const cleanupError =
    await removeUnusedStoragePath(
      supabase,
      previousPath,
      retainedPath,
    );

  refreshProject(
    normalizedProjectId,
    project.slug,
  );

  if (
    cleanupError
  ) {
    return {
      status:
        "success",

      message:
        "Cover berhasil disimpan. File cover lama belum berhasil dibersihkan dari Storage.",

      path:
        normalizedPath,
    };
  }

  return {
    status:
      "success",

    message:
      slot ===
        "card"
        ? "Card cover berhasil disimpan."
        : "Hero cover berhasil disimpan.",

    path:
      normalizedPath,
  };
}

export async function removeProjectCover(
  projectId: string,
  slot: ProjectCoverSlot,
): Promise<ProjectCoverActionState> {
  const normalizedProjectId =
    projectId.trim();

  if (
    !normalizedProjectId
  ) {
    return {
      status:
        "error",

      message:
        "Project ID tidak valid.",
    };
  }

  if (
    !isProjectCoverSlot(
      slot,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Jenis cover tidak valid.",
    };
  }

  const {
    supabase,
    project,
    error:
      loadError,
  } =
    await loadProject(
      normalizedProjectId,
    );

  if (
    loadError ||
    !project
  ) {
    return {
      status:
        "error",

      message:
        loadError ??
        "Project tidak ditemukan.",
    };
  }

  const currentPath =
    slot ===
      "card"
      ? project
          .card_image_path
      : project
          .hero_image_path;

  const retainedPath =
    slot ===
      "card"
      ? project
          .hero_image_path
      : project
          .card_image_path;

  if (
    !currentPath
  ) {
    return {
      status:
        "success",

      message:
        "Cover sudah kosong.",

      path:
        null,
    };
  }

  const updatePayload =
    slot ===
      "card"
      ? {
          card_image_path:
            null,

          updated_at:
            new Date()
              .toISOString(),
        }
      : {
          hero_image_path:
            null,

          updated_at:
            new Date()
              .toISOString(),
        };

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "projects",
      )
      .update(
        updatePayload,
      )
      .eq(
        "id",
        normalizedProjectId,
      );

  if (
    updateError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menghapus cover: ${updateError.message}`,
    };
  }

  const cleanupError =
    await removeUnusedStoragePath(
      supabase,
      currentPath,
      retainedPath,
    );

  refreshProject(
    normalizedProjectId,
    project.slug,
  );

  if (
    cleanupError
  ) {
    return {
      status:
        "success",

      message:
        "Cover sudah dilepas dari project. File lama belum berhasil dibersihkan dari Storage.",

      path:
        null,
    };
  }

  return {
    status:
      "success",

    message:
      slot ===
        "card"
        ? "Card cover berhasil dihapus."
        : "Hero cover berhasil dihapus.",

    path:
      null,
  };
}