import {
  cache,
} from "react";

import {
  createPublicClient,
} from "@/lib/supabase/public";


type WorkCategoryRow = {
  id:
    string;

  name:
    string;

  slug:
    string;

  sort_order:
    number;

  is_visible:
    boolean;
};


type ProjectCategoryRow = {
  project_id:
    string;

  category_id:
    string;
};


export type PublicWorkCategory = {
  id:
    string;

  name:
    string;

  slug:
    string;

  sortOrder:
    number;
};


export type PublicWorkTaxonomy = {
  categories:
    PublicWorkCategory[];

  categorySlugsByProjectId:
    Record<
      string,
      string[]
    >;
};


async function loadPublicWorkTaxonomy():
  Promise<PublicWorkTaxonomy> {
  const supabase =
    createPublicClient();

  const [
    categoryResult,
    relationResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "work_categories",
        )
        .select(
          `
            id,
            name,
            slug,
            sort_order,
            is_visible
          `,
        )
        .eq(
          "is_visible",
          true,
        )
        .order(
          "sort_order",
          {
            ascending:
              true,
          },
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "project_work_categories",
        )
        .select(
          `
            project_id,
            category_id
          `,
        ),
    ]);

  if (
    categoryResult.error
  ) {
    throw new Error(
      `Gagal memuat public work categories: ${categoryResult.error.message}`,
    );
  }

  if (
    relationResult.error
  ) {
    throw new Error(
      `Gagal memuat public project category relations: ${relationResult.error.message}`,
    );
  }

  const categoryRows =
    (
      categoryResult.data ??
      []
    ) as unknown as
      WorkCategoryRow[];

  const relationRows =
    (
      relationResult.data ??
      []
    ) as unknown as
      ProjectCategoryRow[];

  const categories:
    PublicWorkCategory[] =
    categoryRows.map(
      (
        category,
      ) => ({
        id:
          category.id,

        name:
          category.name,

        slug:
          category.slug,

        sortOrder:
          category.sort_order,
      }),
    );

  const categorySlugById =
    new Map<
      string,
      string
    >();

  for (
    const category of
    categories
  ) {
    categorySlugById.set(
      category.id,
      category.slug,
    );
  }

  const categorySlugsByProjectId:
    Record<
      string,
      string[]
    > = {};

  for (
    const relation of
    relationRows
  ) {
    const categorySlug =
      categorySlugById.get(
        relation.category_id,
      );

    /*
     * Relation terhadap hidden category
     * tidak masuk public taxonomy karena
     * category tersebut tidak ada di map.
     */
    if (
      !categorySlug
    ) {
      continue;
    }

    const current =
      categorySlugsByProjectId[
        relation.project_id
      ] ??
      [];

    if (
      !current.includes(
        categorySlug,
      )
    ) {
      current.push(
        categorySlug,
      );
    }

    categorySlugsByProjectId[
      relation.project_id
    ] =
      current;
  }

  return {
    categories,

    categorySlugsByProjectId,
  };
}


/*
 * React cache hanya mendeduplikasi
 * pembacaan dalam render server.
 *
 * Public page cache / revalidation tetap
 * dimiliki oleh Next route.
 */
export const getPublicWorkTaxonomy =
  cache(
    loadPublicWorkTaxonomy,
  );