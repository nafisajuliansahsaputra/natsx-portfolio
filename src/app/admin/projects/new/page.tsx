import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import NewProjectForm, {
  type WorkCategoryOption,
} from "./NewProjectForm";

import styles from "./new-project.module.css";


export default async function NewProjectPage() {
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

  const {
    data:
      categoryRows,

    error:
      categoryError,
  } =
    await supabase
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
      );

  if (
    categoryError
  ) {
    throw new Error(
      `Gagal memuat work categories: ${categoryError.message}`,
    );
  }

  const workCategories:
    WorkCategoryOption[] =
    (
      categoryRows ??
      []
    ).map(
      (
        category,
      ) => ({
        id:
          category.id,

        name:
          category.name,

        slug:
          category.slug,

        isVisible:
          category.is_visible,
      }),
    );

  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.shell
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
            className={
              styles.backLink
            }
            href="/admin"
          >
            ← Back to projects
          </Link>
        </header>

        <section
          className={
            styles.hero
          }
        >
          <p
            className={
              styles.eyebrow
            }
          >
            03 / NEW PROJECT
          </p>

          <div
            className={
              styles.heroGrid
            }
          >
            <h1>
              Build the
              <br />

              next story
              <span>
                .
              </span>
            </h1>

            <p>
              Tambahkan informasi
              dasar project terlebih
              dahulu. Section,
              gambar, dan konten
              studi kasus akan
              dikelola setelah
              project berhasil
              dibuat.
            </p>
          </div>
        </section>

        <section
          className={
            styles.formSection
          }
        >
          <p
            className={
              styles.sectionLabel
            }
          >
            PROJECT INFORMATION
          </p>

          <NewProjectForm
            currentYear={
              new Date()
                .getFullYear()
            }
            workCategories={
              workCategories
            }
          />
        </section>
      </div>
    </main>
  );
}