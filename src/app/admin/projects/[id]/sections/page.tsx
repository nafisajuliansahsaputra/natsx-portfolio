import type {
  CSSProperties,
} from "react";

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

import SectionManager, {
  type SectionRow,
  type SectionTranslation,
} from "./SectionManager";

import styles from "./sections.module.css";

type ProjectSectionsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  project_number: string;
  accent_color: string;
};

type TranslationRow = {
  section_id: string;
  locale: string;

  eyebrow:
    | string
    | null;

  heading:
    | string
    | null;

  body:
    | string
    | null;

  content:
    | Record<
        string,
        unknown
      >
    | null;
};

function isLocale(
  value: string,
): value is Locale {
  return (
    value === "en" ||
    value === "id" ||
    value === "de"
  );
}

export default async function ProjectSectionsPage({
  params,
}: ProjectSectionsPageProps) {
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

  const {
    data:
      projectData,

    error:
      projectError,
  } =
    await supabase
      .from(
        "projects",
      )
      .select(
        `
          id,
          title,
          slug,
          status,
          project_number,
          accent_color
        `,
      )
      .eq(
        "id",
        id,
      )
      .maybeSingle();

  if (
    projectError
  ) {
    throw new Error(
      `Gagal memuat project: ${projectError.message}`,
    );
  }

  if (
    !projectData
  ) {
    notFound();
  }

  const project =
    projectData as
      ProjectRow;

  const {
    data:
      sectionData,

    error:
      sectionError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .select(
        `
          id,
          project_id,
          section_type,
          eyebrow,
          heading,
          body,
          content,
          theme,
          sort_order,
          is_visible,
          created_at,
          updated_at
        `,
      )
      .eq(
        "project_id",
        project.id,
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
    sectionError
  ) {
    throw new Error(
      `Gagal memuat project sections: ${sectionError.message}`,
    );
  }

  const sectionRows =
    (
      sectionData ??
      []
    ) as Omit<
      SectionRow,
      "translations"
    >[];

  const sectionIds =
    sectionRows.map(
      (
        section,
      ) =>
        section.id,
    );

  let translationRows:
    TranslationRow[] =
    [];

  if (
    sectionIds.length >
    0
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "project_section_translations",
        )
        .select(
          `
            section_id,
            locale,
            eyebrow,
            heading,
            body,
            content
          `,
        )
        .in(
          "section_id",
          sectionIds,
        );

    if (
      error
    ) {
      throw new Error(
        `Gagal memuat section translations: ${error.message}`,
      );
    }

    translationRows =
      (
        data ??
        []
      ) as unknown as
        TranslationRow[];
  }

  const sections:
    SectionRow[] =
    sectionRows.map(
      (
        section,
      ) => {
        const translations:
          Record<
            Locale,
            SectionTranslation | null
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
          translationRows
        ) {
          if (
            row.section_id !==
              section.id ||
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

            eyebrow:
              row.eyebrow,

            heading:
              row.heading,

            body:
              row.body,

            content:
              row.content ??
              {},
          };
        }

        /*
         * Existing legacy section
         * tetap jadi safe EN fallback.
         */
        if (
          !translations.en
        ) {
          translations.en = {
            locale:
              "en",

            eyebrow:
              section.eyebrow,

            heading:
              section.heading,

            body:
              section.body,

            content: {},
          };
        }

        return {
          ...section,

          translations,
        };
      },
    );

  return (
    <main
      className={
        styles.page
      }
      style={
        {
          "--project-accent":
            project.accent_color ||
            "#5961ED",
        } as CSSProperties
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
            className={
              styles.headerLinks
            }
          >
            <Link
              className={
                styles.backLink
              }
              href={`/admin/projects/${project.id}`}
            >
              Project settings
            </Link>

            <Link
              className={
                styles.backLink
              }
              href="/admin"
            >
              ← Dashboard
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
              04 / CONTENT SECTIONS
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
              Shape the
              <br />

              case study
              <span>
                .
              </span>
            </h1>

            <div
              className={
                styles.projectInformation
              }
            >
              <p>
                {
                  project.title
                }
              </p>

              <span>
                /{
                  project.slug
                }
              </span>

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
                      sections.length,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <SectionManager
          projectId={
            project.id
          }
          sections={
            sections
          }
        />
      </div>
    </main>
  );
}