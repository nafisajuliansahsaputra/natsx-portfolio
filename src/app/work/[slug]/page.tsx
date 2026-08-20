import type {
  CSSProperties,
} from "react";

import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  getProjectPreviewImage,
} from "@/lib/public-media";

import {
  getPublishedProjectPage,
} from "@/lib/public-projects";

import {
  getAbsoluteUrl,
} from "@/lib/site-url";

import ProjectSectionRenderer from "./ProjectSectionRenderer";

import styles from "./ProjectDetail.module.css";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate =
  3600;

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const data =
    await getPublishedProjectPage(
      slug,
    );

  if (!data) {
    return {
      title:
        "Project Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const {
    project,
    sections,
  } = data;

  const description =
    project.summary ||
    `${project.title} — a project case study by NATSX.`;

  const canonical =
    getAbsoluteUrl(
      `/work/${project.slug}`,
    );

  const previewImage =
    getProjectPreviewImage(
      sections,
    );

  return {
    title:
      project.title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type:
        "article",

      title:
        `${project.title} — NATSX`,

      description,

      url:
        canonical,

      siteName:
        "NATSX",

      publishedTime:
        project.publishedAt ??
        undefined,

      modifiedTime:
        project.updatedAt,

      images:
        previewImage
          ? [
              {
                url:
                  previewImage,

                alt:
                  `${project.title} — NATSX`,
              },
            ]
          : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        `${project.title} — NATSX`,

      description,

      images:
        previewImage
          ? [
              previewImage,
            ]
          : undefined,
    },
  };
}

function getAccessibleContrastColor(
  hex: string,
) {
  const normalized =
    hex
      .replace(
        "#",
        "",
      )
      .trim();

  if (
    !/^[0-9a-f]{6}$/i.test(
      normalized,
    )
  ) {
    return "#ffffff";
  }

  const red =
    Number.parseInt(
      normalized.slice(
        0,
        2,
      ),
      16,
    );

  const green =
    Number.parseInt(
      normalized.slice(
        2,
        4,
      ),
      16,
    );

  const blue =
    Number.parseInt(
      normalized.slice(
        4,
        6,
      ),
      16,
    );

  function toLinear(
    channel: number,
  ) {
    const value =
      channel / 255;

    return value <=
      0.04045
      ? value /
          12.92
      : Math.pow(
          (
            value +
            0.055
          ) /
            1.055,
          2.4,
        );
  }

  const luminance =
    0.2126 *
      toLinear(
        red,
      ) +
    0.7152 *
      toLinear(
        green,
      ) +
    0.0722 *
      toLinear(
        blue,
      );

  /*
   * Contrast ratio menurut
   * WCAG relative luminance.
   *
   * Black / white dipilih berdasarkan
   * contrast ratio terbesar sehingga
   * project accent arbitrary tetap
   * mempunyai foreground yang aman.
   */
  const contrastWithWhite =
    1.05 /
    (
      luminance +
      0.05
    );

  const contrastWithBlack =
    (
      luminance +
      0.05
    ) /
    0.05;

  return contrastWithBlack >=
    contrastWithWhite
    ? "#000000"
    : "#ffffff";
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } =
    await params;

  const data =
    await getPublishedProjectPage(
      slug,
    );

  if (!data) {
    notFound();
  }

  const {
    project,
    sections,
    nextProject,
    totalProjects,
  } = data;

  const projectStyle = {
    "--project-accent":
      project.accentColor,

"--project-on-accent":
  getAccessibleContrastColor(
    project.accentColor,
  ),

    "--project-secondary":
      project.secondaryColor ||
      "#dedede",
  } as CSSProperties;

  return (
    <>
      <SiteHeader />

      <main
  id="main-content"
  tabIndex={-1}
  className={
    styles.page
  }
  style={
    projectStyle
  }
  data-motion-page="project-detail"
>
        <section
          className={
            styles.hero
          }
        >
          <div className="site-container">
            <div
              className={
                styles.heroTop
              }
              data-motion-project-hero-piece="top"
            >
              <Link
                href="/work"
                className={
                  styles.backLink
                }
              >
                <span>
                  ←
                </span>

                All Work
              </Link>

              <span
                className={
                  styles.projectIndex
                }
              >
                Project{" "}
                {
                  project.number
                }{" "}
                /{" "}
                {
                  project.year
                }
              </span>
            </div>

            <div
              className={
                styles.heroGrid
              }
            >
              <div
                className={
                  styles.heroTitle
                }
                data-motion-project-hero-piece="title"
              >
                <h1>
                  {
                    project.title
                  }

                  <span>
                    .
                  </span>
                </h1>
              </div>

              <div
                className={
                  styles.heroAside
                }
              >
                <div
                  className={
                    styles.disciplines
                  }
                  data-motion-project-hero-piece="disciplines"
                >
                  {project.disciplines.map(
                    (
                      discipline,
                    ) => (
                      <span
                        key={
                          discipline
                        }
                      >
                        {
                          discipline
                        }
                      </span>
                    ),
                  )}
                </div>

                {project.summary ? (
                  <p
                    className={
                      styles.summary
                    }
                    data-motion-project-hero-piece="summary"
                  >
                    {
                      project.summary
                    }
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className={
                styles.projectDetails
              }
              data-motion-scroll="project-details"
            >
              <div>
                <span
                  className={
                    styles.detailLabel
                  }
                >
                  Year
                </span>

                <strong>
                  {
                    project.year
                  }
                </strong>
              </div>

              <div>
                <span
                  className={
                    styles.detailLabel
                  }
                >
                  Period
                </span>

                <strong>
                  {
                    project.period
                  }
                </strong>
              </div>

              <div>
                <span
                  className={
                    styles.detailLabel
                  }
                >
                  Role
                </span>

                <div
                  className={
                    styles.roleList
                  }
                >
                  {project.roles.map(
                    (
                      role,
                    ) => (
                      <span
                        key={
                          role
                        }
                      >
                        {
                          role
                        }
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div>
                <span
                  className={
                    styles.detailLabel
                  }
                >
                  Project
                </span>

                {project.website ? (
                  <a
                    href={
                      project.website
                    }
                    target="_blank"
                    rel="noreferrer"
                    className={
                      styles.liveLink
                    }
                  >
                    Visit Live

                    <span>
                      ↗
                    </span>
                  </a>
                ) : (
                  <strong>
                    Case Study
                  </strong>
                )}
              </div>
            </div>
          </div>
        </section>

        <div
          className={
            styles.story
          }
        >
          {sections.length >
          0 ? (
            sections.map(
              (
                section,
              ) => (
                <ProjectSectionRenderer
                  section={
                    section
                  }
                  key={
                    section.id
                  }
                />
              ),
            )
          ) : (
            <section
              className={
                styles.emptyStory
              }
            >
              <div className="site-container">
                <span>
                  CASE STUDY /
                  COMING SOON
                </span>

                <h2>
                  Story in
                  progress

                  <span>
                    .
                  </span>
                </h2>

                <p>
                  This project is
                  published, but
                  its detailed case
                  study is still
                  being prepared.
                </p>
              </div>
            </section>
          )}
        </div>

        {nextProject ? (
          <section
            className={
              styles.nextProject
            }
          >
            <div className="site-container">
              <div
                className={
                  styles.nextHeader
                }
                data-motion-scroll="project-next-header"
              >
                <div
                  className={
                    styles.nextLabel
                  }
                >
                  <span
                    className={
                      styles.dot
                    }
                  />

                  <span>
                    Next Project
                  </span>
                </div>

                <span>
                  {
                    nextProject.number
                  }{" "}
                  /{" "}
                  {String(
                    totalProjects,
                  ).padStart(
                    2,
                    "0",
                  )}
                </span>
              </div>

              <Link
                href={`/work/${nextProject.slug}`}
                className={
                  styles.nextLink
                }
                data-motion-scroll="project-next-link"
              >
                <h2>
                  {
                    nextProject.title
                  }
                </h2>

                <div
                  className={
                    styles.nextMeta
                  }
                >
                  <div>
                    {nextProject.disciplines.map(
                      (
                        discipline,
                      ) => (
                        <span
                          key={
                            discipline
                          }
                        >
                          {
                            discipline
                          }
                        </span>
                      ),
                    )}
                  </div>

                  <span
                    className={
                      styles.nextArrow
                    }
                  >
                    ↗
                  </span>
                </div>
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}