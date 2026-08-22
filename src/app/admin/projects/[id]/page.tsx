import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import type {
  Locale,
} from "@/i18n/config";

import {
  createClient,
} from "@/lib/supabase/server";

import ProjectEditorForm, {
  type EditableProject,
  type EditableProjectTranslation,
} from "./ProjectEditorForm";

import styles from "./project-editor.module.css";

type ProjectEditorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProjectRow =
  Omit<
    EditableProject,
    "translations"
  > & {
    created_at: string;
    updated_at: string;
  };

type TranslationRow = {
  locale: string;

  title:
    | string
    | null;

  period:
    | string
    | null;

  summary:
    | string
    | null;

  categories:
    | string[]
    | null;

  roles:
    | string[]
    | null;
};

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

export default async function ProjectEditorPage({
  params,
}: ProjectEditorPageProps) {
  const {
    id,
  } =
    await params;

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
    projectResult,
    translationResult,
    sectionCountResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "projects",
        )
        .select(
          `
            id,
            slug,
            title,
            project_number,
            year,
            period,
            summary,
            categories,
            roles,
            status,
            featured,
            sort_order,
            live_url,
            accent_color,
            secondary_color,
            published_at,
            created_at,
            updated_at
          `,
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle(),

      supabase
        .from(
          "project_translations",
        )
        .select(
          `
            locale,
            title,
            period,
            summary,
            categories,
            roles
          `,
        )
        .eq(
          "project_id",
          id,
        ),

      supabase
        .from(
          "project_sections",
        )
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          },
        )
        .eq(
          "project_id",
          id,
        ),
    ]);

  if (
    projectResult.error
  ) {
    throw new Error(
      `Gagal memuat project: ${projectResult.error.message}`,
    );
  }

  if (
    !projectResult.data
  ) {
    notFound();
  }

  if (
    translationResult.error
  ) {
    throw new Error(
      `Gagal memuat project translations: ${translationResult.error.message}`,
    );
  }

  if (
    sectionCountResult.error
  ) {
    throw new Error(
      `Gagal menghitung project section: ${sectionCountResult.error.message}`,
    );
  }

  const projectRow =
    projectResult.data as unknown as
      ProjectRow;

  const translations:
    Record<
      Locale,
      EditableProjectTranslation | null
    > = {
      en:
        null,

      id:
        null,

      de:
        null,
    };

  for (
    const row of
    (
      translationResult.data ??
      []
    ) as unknown as
      TranslationRow[]
  ) {
    if (
      !isLocale(
        row.locale,
      )
    ) {
      continue;
    }

    translations[
      row.locale
    ] = {
      locale:
        row.locale,

      title:
        row.title,

      period:
        row.period,

      summary:
        row.summary,

      categories:
        row.categories,

      roles:
        row.roles,
    };
  }

  /*
   * Safety fallback kalau suatu
   * environment belum punya EN row.
   */
  if (
    !translations.en
  ) {
    translations.en = {
      locale:
        "en",

      title:
        projectRow.title,

      period:
        projectRow.period,

      summary:
        projectRow.summary,

      categories:
        projectRow.categories,

      roles:
        projectRow.roles,
    };
  }

  const project:
    EditableProject =
    {
      ...projectRow,

      translations,
    };

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

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "24px",
            }}
          >
            <Link
              className={
                styles.backLink
              }
              href={`/admin/projects/${project.id}/sections`}
            >
              Content sections ↗
            </Link>

            <Link
              className={
                styles.backLink
              }
              href="/admin"
            >
              ← Back to projects
            </Link>
          </div>
        </header>

        <section
          className={
            styles.hero
          }
        >
          <div
            className={
              styles.heroHeader
            }
          >
            <p>
              03 / PROJECT EDITOR
            </p>

            <span
              className={
                styles.statusBadge
              }
              data-status={
                project.status
              }
            >
              {
                project.status
              }
            </span>
          </div>

          <div
            className={
              styles.heroGrid
            }
          >
            <h1>
              {
                project.title
              }

              <span>
                .
              </span>
            </h1>

            <div
              className={
                styles.projectSummary
              }
            >
              <p>
                /{
                  project.slug
                }
              </p>

              <dl>
                <div>
                  <dt>
                    Project
                  </dt>

                  <dd>
                    {
                      project.project_number
                    }
                  </dd>
                </div>

                <div>
                  <dt>
                    Sections
                  </dt>

                  <dd>
                    {String(
                      sectionCountResult.count ??
                        0,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    Year
                  </dt>

                  <dd>
                    {
                      project.year
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section
          className={
            styles.editorSection
          }
        >
          <p
            className={
              styles.sectionLabel
            }
          >
            PROJECT SETTINGS
          </p>

          <ProjectEditorForm
            project={
              project
            }
          />
        </section>
      </div>
    </main>
  );
}