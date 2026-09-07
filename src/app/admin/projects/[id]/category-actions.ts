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
  createClient,
} from "@/lib/supabase/server";


export type UpdateProjectCategoriesState = {
  status:
    | "idle"
    | "success"
    | "error";

  message:
    string;
};


async function requireAdmin() {
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
    adminError ||
    !adminUser
  ) {
    redirect(
      "/admin/login?error=unauthorized",
    );
  }

  return supabase;
}


function refreshProject(
  projectId:
    string,
) {
  updateTag(
    PUBLIC_PORTFOLIO_CACHE_TAG,
  );

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/categories",
  );

  revalidatePath(
    `/admin/projects/${projectId}`,
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
}


export async function updateProjectCategories(
  projectId:
    string,

  previousState:
    UpdateProjectCategoriesState,

  formData:
    FormData,
): Promise<
  UpdateProjectCategoriesState
> {
  void previousState;

  const selectedCategoryIds =
    Array.from(
      new Set(
        formData
          .getAll(
            "work_category_ids",
          )
          .filter(
            (
              value,
            ): value is string =>
              typeof value ===
              "string",
          )
          .map(
            (
              value,
            ) =>
              value.trim(),
          )
          .filter(
            Boolean,
          ),
      ),
    );

  const supabase =
    await requireAdmin();

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
        `Gagal membaca project: ${projectError.message}`,
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

  /*
   * Validate every submitted category.
   *
   * Prevents arbitrary UUIDs from being
   * inserted into the relation table.
   */
  if (
    selectedCategoryIds.length >
    0
  ) {
    const {
      data:
        validCategories,

      error:
        categoryError,
    } =
      await supabase
        .from(
          "work_categories",
        )
        .select(
          "id",
        )
        .in(
          "id",
          selectedCategoryIds,
        );

    if (
      categoryError
    ) {
      return {
        status:
          "error",

        message:
          `Gagal memvalidasi kategori: ${categoryError.message}`,
      };
    }

    const validIds =
      new Set(
        (
          validCategories ??
          []
        ).map(
          (
            category,
          ) =>
            category.id,
        ),
      );

    const hasInvalidId =
      selectedCategoryIds.some(
        (
          categoryId,
        ) =>
          !validIds.has(
            categoryId,
          ),
      );

    if (
      hasInvalidId
    ) {
      return {
        status:
          "error",

        message:
          "Ada kategori yang tidak valid.",
      };
    }
  }

  /*
   * Replace strategy:
   *
   * delete current relations
   * → insert current selection
   *
   * Simple and deterministic for the
   * small category set used by portfolio.
   */
  const {
    error:
      deleteError,
  } =
    await supabase
      .from(
        "project_work_categories",
      )
      .delete()
      .eq(
        "project_id",
        projectId,
      );

  if (
    deleteError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal memperbarui kategori: ${deleteError.message}`,
    };
  }

  if (
    selectedCategoryIds.length >
    0
  ) {
    const {
      error:
        insertError,
    } =
      await supabase
        .from(
          "project_work_categories",
        )
        .insert(
          selectedCategoryIds.map(
            (
              categoryId,
            ) => ({
              project_id:
                projectId,

              category_id:
                categoryId,
            }),
          ),
        );

    if (
      insertError
    ) {
      return {
        status:
          "error",

        message:
          `Gagal menyimpan kategori: ${insertError.message}`,
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
      selectedCategoryIds.length >
      0
        ? "Work categories berhasil disimpan."
        : "Semua work category dilepas dari project.",
  };
}