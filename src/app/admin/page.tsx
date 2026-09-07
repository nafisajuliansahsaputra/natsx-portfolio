import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import styles from "./Admin.module.css";


type ProjectRow = {
  id:
    string;

  slug:
    string;

  title:
    string;

  project_number:
    string;

  year:
    number;

  categories:
    string[];

  status:
    string;

  featured:
    boolean;

  sort_order:
    number;

  updated_at:
    string;
};


async function signOut() {
  "use server";

  const supabase =
    await createClient();

  await supabase.auth.signOut();

  redirect(
    "/admin/login",
  );
}


function formatDate(
  value:
    string,
) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}


export default async function AdminPage() {
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
    categoryResult,
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
            categories,
            status,
            featured,
            sort_order,
            updated_at
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
          "work_categories",
        )
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          },
        ),
    ]);

  if (
    projectResult.error
  ) {
    throw new Error(
      `Gagal memuat projects: ${projectResult.error.message}`,
    );
  }

  if (
    categoryResult.error
  ) {
    throw new Error(
      `Gagal menghitung categories: ${categoryResult.error.message}`,
    );
  }

  const projects =
    (
      projectResult.data ??
      []
    ) as ProjectRow[];

  const categoryCount =
    categoryResult.count ??
    0;

  const publishedCount =
    projects.filter(
      (
        project,
      ) =>
        project.status ===
        "published",
    ).length;

  const draftCount =
    projects.filter(
      (
        project,
      ) =>
        project.status ===
        "draft",
    ).length;

  return (
    <main
      className={
        styles.dashboard
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
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
            styles.headerAccount
          }
        >
          <span>
            {
              user.email
            }
          </span>

          <form
            action={
              signOut
            }
          >
            <button
              className={
                styles.logoutButton
              }
              type="submit"
            >
              Sign out ↗
            </button>
          </form>
        </div>
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
          01 / OVERVIEW
        </p>

        <div
          className={
            styles.heroGrid
          }
        >
          <h1>
            Content
            <br />
            control
            <span>
              .
            </span>
          </h1>

          <p>
            Kelola project
            portfolio, kategori,
            status publikasi,
            urutan, dan konten
            studi kasus dari satu
            tempat.
          </p>
        </div>
      </section>

      <section
        className={
          styles.statistics
        }
      >
        <article
          className={
            styles.statCard
          }
        >
          <span>
            Total projects
          </span>

          <strong>
            {String(
              projects.length,
            ).padStart(
              2,
              "0",
            )}
          </strong>
        </article>

        <article
          className={
            styles.statCard
          }
        >
          <span>
            Published
          </span>

          <strong>
            {String(
              publishedCount,
            ).padStart(
              2,
              "0",
            )}
          </strong>
        </article>

        <article
          className={
            styles.statCard
          }
        >
          <span>
            Draft
          </span>

          <strong>
            {String(
              draftCount,
            ).padStart(
              2,
              "0",
            )}
          </strong>
        </article>

        <article
          className={
            styles.statCard
          }
        >
          <span>
            Categories
          </span>

          <strong>
            {String(
              categoryCount,
            ).padStart(
              2,
              "0",
            )}
          </strong>
        </article>
      </section>

      <section
        className={
          styles.projectsSection
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div>
            <span
              className={
                styles.dot
              }
            />

            <span>
              02 / PROJECTS
            </span>
          </div>

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "18px",

              flexWrap:
                "wrap",

              justifyContent:
                "flex-end",
            }}
          >
            <span>
              {
                projects.length
              }{" "}
              RECORDS
            </span>

            <Link
              href="/admin/categories"
              className={
                styles.logoutButton
              }
              style={{
                textDecoration:
                  "none",
              }}
            >
              Categories ↗
            </Link>

            <Link
              href="/admin/projects/new"
              className={
                styles.logoutButton
              }
              style={{
                textDecoration:
                  "none",
              }}
            >
              New project ↗
            </Link>
          </div>
        </div>

        {projects.length ===
        0 ? (
          <div
            className={
              styles.emptyState
            }
          >
            <p>
              NO PROJECTS YET
            </p>

            <h2>
              Your project
              archive
              <br />
              starts here
              <span>
                .
              </span>
            </h2>

            <p>
              Database sudah
              tersambung. Gunakan
              tombol New Project
              untuk membuat project
              portfolio pertama.
            </p>
          </div>
        ) : (
          <div
            className={
              styles.projectList
            }
          >
            <div
              className={`${styles.projectRow} ${styles.projectHead}`}
            >
              <span>
                No.
              </span>

              <span>
                Project
              </span>

              <span>
                Status
              </span>

              <span>
                Year
              </span>

              <span>
                Updated
              </span>
            </div>

            {projects.map(
              (
                project,
              ) => (
                <Link
                  className={
                    styles.projectRow
                  }
                  href={`/admin/projects/${project.id}`}
                  key={
                    project.id
                  }
                  aria-label={`Edit project ${project.title}`}
                  style={{
                    color:
                      "inherit",

                    textDecoration:
                      "none",
                  }}
                >
                  <span
                    className={
                      styles.projectNumber
                    }
                  >
                    {
                      project.project_number
                    }
                  </span>

                  <div
                    className={
                      styles.projectIdentity
                    }
                  >
                    <h2>
                      {
                        project.title
                      }
                    </h2>

                    <div
                      className={
                        styles.projectMeta
                      }
                    >
                      <span>
                        /
                        {
                          project.slug
                        }
                      </span>

                      {project.categories.map(
                        (
                          category,
                        ) => (
                          <span
                            key={
                              category
                            }
                          >
                            {
                              category
                            }
                          </span>
                        ),
                      )}

                      {project.featured ? (
                        <span
                          className={
                            styles.featured
                          }
                        >
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <span
                      className={
                        styles.status
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

                  <span
                    className={
                      styles.projectYear
                    }
                  >
                    {
                      project.year
                    }
                  </span>

                  <span
                    className={
                      styles.updatedDate
                    }
                  >
                    {formatDate(
                      project.updated_at,
                    )}{" "}
                    ↗
                  </span>
                </Link>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}