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


export type CategoryActionState = {
  status:
    | "idle"
    | "success"
    | "error";

  message:
    string;
};


function getText(
  formData:
    FormData,

  name:
    string,
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
  value:
    string,
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
      60,
    );
}


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


function revalidateCategoryRoutes() {
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
    "/work",
  );

  revalidatePath(
    "/id/work",
  );

  revalidatePath(
    "/de/work",
  );
}


export async function createCategory(
  previousState:
    CategoryActionState,

  formData:
    FormData,
): Promise<
  CategoryActionState
> {
  /*
   * useActionState requires the
   * previous state argument.
   *
   * We intentionally don't need its
   * value for this action yet.
   */
  void previousState;

  const name =
    getText(
      formData,
      "name",
    );

  const slug =
    createSlug(
      getText(
        formData,
        "slug",
      ) ||
        name,
    );

  if (
    !name
  ) {
    return {
      status:
        "error",

      message:
        "Nama kategori wajib diisi.",
    };
  }

  if (
    name.length >
    60
  ) {
    return {
      status:
        "error",

      message:
        "Nama kategori maksimal 60 karakter.",
    };
  }

  if (
    !slug
  ) {
    return {
      status:
        "error",

      message:
        "Slug kategori tidak valid.",
    };
  }

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.",
    };
  }

  const supabase =
    await requireAdmin();

  const {
    data:
      lastCategory,

    error:
      sortError,
  } =
    await supabase
      .from(
        "work_categories",
      )
      .select(
        "sort_order",
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
    sortError
  ) {
    return {
      status:
        "error",

      message:
        `Gagal menentukan urutan kategori: ${sortError.message}`,
    };
  }

  const nextSortOrder =
    (
      lastCategory
        ?.sort_order ??
      -1
    ) + 1;

  const {
    error:
      insertError,
  } =
    await supabase
      .from(
        "work_categories",
      )
      .insert({
        name,

        slug,

        sort_order:
          nextSortOrder,

        is_visible:
          true,
      });

  if (
    insertError
  ) {
    if (
      insertError.code ===
      "23505"
    ) {
      return {
        status:
          "error",

        message:
          "Kategori dengan slug tersebut sudah ada.",
      };
    }

    return {
      status:
        "error",

      message:
        `Gagal membuat kategori: ${insertError.message}`,
    };
  }

  revalidateCategoryRoutes();

  return {
    status:
      "success",

    message:
      "Kategori berhasil dibuat.",
  };
}


export async function updateCategory(
  categoryId:
    string,

  formData:
    FormData,
) {
  const name =
    getText(
      formData,
      "name",
    );

  const slug =
    createSlug(
      getText(
        formData,
        "slug",
      ) ||
        name,
    );

  const sortOrder =
    Number(
      getText(
        formData,
        "sort_order",
      ),
    );

  const isVisible =
    formData.get(
      "is_visible",
    ) ===
    "on";

  if (
    !name
  ) {
    throw new Error(
      "Nama kategori wajib diisi.",
    );
  }

  if (
    name.length >
    60
  ) {
    throw new Error(
      "Nama kategori maksimal 60 karakter.",
    );
  }

  if (
    !slug ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug,
    )
  ) {
    throw new Error(
      "Slug kategori tidak valid.",
    );
  }

  if (
    !Number.isInteger(
      sortOrder,
    ) ||
    sortOrder <
      0
  ) {
    throw new Error(
      "Sort order kategori tidak valid.",
    );
  }

  const supabase =
    await requireAdmin();

  const {
    error,
  } =
    await supabase
      .from(
        "work_categories",
      )
      .update({
        name,

        slug,

        sort_order:
          sortOrder,

        is_visible:
          isVisible,
      })
      .eq(
        "id",
        categoryId,
      );

  if (
    error
  ) {
    throw new Error(
      `Gagal mengubah kategori: ${error.message}`,
    );
  }

  revalidateCategoryRoutes();
}


export async function deleteCategory(
  categoryId:
    string,
) {
  const supabase =
    await requireAdmin();

  const {
    error,
  } =
    await supabase
      .from(
        "work_categories",
      )
      .delete()
      .eq(
        "id",
        categoryId,
      );

  if (
    error
  ) {
    throw new Error(
      `Gagal menghapus kategori: ${error.message}`,
    );
  }

  revalidateCategoryRoutes();
}