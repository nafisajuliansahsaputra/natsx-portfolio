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

import ProjectCategoryEditor, {
  type EditableWorkCategory,
} from "./ProjectCategoryEditor";

import ProjectCoverEditor from "./ProjectCoverEditor";

import ProjectEditorForm, {
  type EditableProject,
  type EditableProjectTranslation,
} from "./ProjectEditorForm";

import styles from "./project-editor.module.css";


type ProjectEditorPageProps = {
  params: Promise<{
    id:
      string;
  }>;
};


type ProjectRow =
  Omit<
    EditableProject,
    "translations"
  > & {
    hero_image_path:
      | string
      | null;

    card_image_path:
      | string
      | null;
  };


type TranslationRow = {
  locale:
    string;

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

type ProjectCategoryRow = {
  category_id:
    string;
};


function isLocale(
  value:
    string,
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
    categoryResult,
    projectCategoryResult,
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
            hero_image_path,
            card_image_path,
            published_at
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

  if (
    categoryResult.error
  ) {
    throw new Error(
      `Gagal memuat work categories: ${categoryResult.error.message}`,
    );
  }

  if (
    projectCategoryResult.error
  ) {
    throw new Error(
      `Gagal memuat category project: ${projectCategoryResult.error.message}`,
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

  const {
    hero_image_path:
      heroImagePath,

    card_image_path:
      cardImagePath,

    ...editableProjectRow
  } =
    projectRow;

  const project:
    EditableProject = {
    ...editableProjectRow,

    translations,
  };

  const workCategories:
    EditableWorkCategory[] =
    (
      categoryResult.data ??
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

        sortOrder:
          category.sort_order,

        isVisible:
          category.is_visible,
      }),
    );

  const selectedCategoryIds =
    (
      projectCategoryResult.data ??
      []
    )
      .map(
        (
          relation,
        ) =>
          (
            relation as ProjectCategoryRow
          ).category_id,
      )
      .filter(
        Boolean,
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
                /
                {
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
                    Categories
                  </dt>

                  <dd>
                    {String(
                      selectedCategoryIds.length,
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
            PROJECT VISUALS
          </p>

          <ProjectCoverEditor
            projectId={
              project.id
            }
            projectTitle={
              project.title
            }
            cardImagePath={
              cardImagePath
            }
            heroImagePath={
              heroImagePath
            }
          />
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
            WORK CATEGORIES
          </p>

          <ProjectCategoryEditor
            projectId={
              project.id
            }
            categories={
              workCategories
            }
            selectedCategoryIds={
              selectedCategoryIds
            }
          />
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