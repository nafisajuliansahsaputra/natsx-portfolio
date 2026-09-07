import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import CategoryCreateForm from "./CategoryCreateForm";

import {
  deleteCategory,
  updateCategory,
} from "./actions";

import styles from "./categories.module.css";


type CategoryRow = {
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

  created_at:
    string;
};


type CategoryUsageRow = {
  category_id:
    string;
};


export default async function AdminCategoriesPage() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (
    !user
  ) {
    redirect(
      "/admin/login",
    );
  }

  const {
    data:
      adminUser,
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
    !adminUser
  ) {
    redirect(
      "/admin/login?error=unauthorized",
    );
  }

  const [
    categoryResult,
    usageResult,
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
            is_visible,
            created_at
          `,
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
          "category_id",
        ),
    ]);

  if (
    categoryResult.error
  ) {
    throw new Error(
      `Gagal memuat kategori: ${categoryResult.error.message}`,
    );
  }

  if (
    usageResult.error
  ) {
    throw new Error(
      `Gagal memuat penggunaan kategori: ${usageResult.error.message}`,
    );
  }

  const categories =
    (
      categoryResult.data ??
      []
    ) as CategoryRow[];

  const usages =
    (
      usageResult.data ??
      []
    ) as CategoryUsageRow[];

  const usageMap =
    new Map<
      string,
      number
    >();

  for (
    const usage of
    usages
  ) {
    usageMap.set(
      usage.category_id,
      (
        usageMap.get(
          usage.category_id,
        ) ??
        0
      ) + 1,
    );
  }

  return (
    <main
      className={
        styles.page
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div
          className={
            styles.brand
          }
        >
          <span
            className={
              styles.dot
            }
          />

          <span>
            NATSX / ADMIN
          </span>
        </div>

        <Link
          href="/admin"
          className={
            styles.backLink
          }
        >
          Dashboard ↗
        </Link>
      </header>

      <section
        className={
          styles.hero
        }
      >
        <span
          className={
            styles.eyebrow
          }
        >
          03 / CATEGORIES
        </span>

        <div
          className={
            styles.heroGrid
          }
        >
          <h1>
            Archive
            <br />
            structure
            <span>
              .
            </span>
          </h1>

          <p>
            Atur kategori besar
            yang dipakai untuk
            mengelompokkan karya
            Development, Design,
            Motion, Photography,
            dan discipline baru
            lainnya.
          </p>
        </div>
      </section>

      <section
        className={
          styles.content
        }
      >
        <div
          className={
            styles.sectionHeading
          }
        >
          <div>
            <span
              className={
                styles.dot
              }
            />

            <span>
              CATEGORY MANAGER
            </span>
          </div>

          <span>
            {
              categories.length
            }{" "}
            RECORDS
          </span>
        </div>

        <CategoryCreateForm />

        <div
          className={
            styles.list
          }
        >
          {categories.map(
            (
              category,
              index,
            ) => {
              const usageCount =
                usageMap.get(
                  category.id,
                ) ??
                0;

              const updateAction =
                updateCategory.bind(
                  null,
                  category.id,
                );

              const deleteAction =
                deleteCategory.bind(
                  null,
                  category.id,
                );

              return (
                <article
                  className={
                    styles.card
                  }
                  key={
                    category.id
                  }
                >
                  <form
                    className={
                      styles.editForm
                    }
                    action={
                      updateAction
                    }
                  >
                    <div
                      className={
                        styles.number
                      }
                    >
                      {String(
                        index +
                          1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </div>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        Name
                      </span>

                      <input
                        name="name"
                        defaultValue={
                          category.name
                        }
                        maxLength={
                          60
                        }
                        required
                      />
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        Slug
                      </span>

                      <input
                        name="slug"
                        defaultValue={
                          category.slug
                        }
                        maxLength={
                          60
                        }
                        required
                      />
                    </label>

                    <label
                      className={
                        styles.orderField
                      }
                    >
                      <span>
                        Order
                      </span>

                      <input
                        name="sort_order"
                        type="number"
                        min={
                          0
                        }
                        defaultValue={
                          category.sort_order
                        }
                        required
                      />
                    </label>

                    <label
                      className={
                        styles.visibility
                      }
                    >
                      <input
                        name="is_visible"
                        type="checkbox"
                        defaultChecked={
                          category.is_visible
                        }
                      />

                      <span
                        aria-hidden="true"
                      />

                      <strong>
                        Visible
                      </strong>
                    </label>

                    <div
                      className={
                        styles.usage
                      }
                    >
                      <span>
                        USED BY
                      </span>

                      <strong>
                        {String(
                          usageCount,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </strong>
                    </div>

                    <button
                      type="submit"
                      className={
                        styles.saveButton
                      }
                    >
                      Save ↗
                    </button>
                  </form>

                  <form
                    action={
                      deleteAction
                    }
                    className={
                      styles.deleteForm
                    }
                  >
                    <p>
                      {usageCount >
                      0
                        ? `Menghapus kategori akan melepasnya dari ${usageCount} project. Project tidak ikut terhapus.`
                        : "Kategori ini belum digunakan oleh project apa pun."}
                    </p>

                    <button
                      type="submit"
                      className={
                        styles.deleteButton
                      }
                    >
                      Delete
                    </button>
                  </form>
                </article>
              );
            },
          )}
        </div>
      </section>
    </main>
  );
}