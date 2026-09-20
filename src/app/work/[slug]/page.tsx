import type {
  CSSProperties,
} from "react";

import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import "@/app/project-motion.css";
import "@/app/project-media-motion.css";
import "@/app/project-fit.css";

import Link from "next/link";
import InnerFooter from "@/components/layout/InnerFooter";
import SiteHeader from "@/components/layout/SiteHeader";

import type {
  Locale,
} from "@/i18n/config";

import {
  localizePath,
} from "@/i18n/config";

import {
  getProjectMessages,
} from "@/i18n/project-messages";

import {
  getProjectPreviewImage,
} from "@/lib/public-media";

import {
  getPublishedProjectPage,
} from "@/lib/public-projects";

import {
  getAbsoluteUrl,
} from "@/lib/site-url";

import NextProjectHandoff from "./NextProjectHandoff";
import ProjectNarrativeMotion from "./ProjectNarrativeMotion";
import ProjectSectionRenderer from "./ProjectSectionRenderer";

import styles from "./ProjectDetail.module.css";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProjectPageContentProps = {
  slug: string;
  locale: Locale;
};

export const revalidate =
  3600;

export async function generateProjectMetadata(
  slug: string,
  locale: Locale,
): Promise<Metadata> {
  const copy =
    getProjectMessages(
      locale,
    );

  const data =
    await getPublishedProjectPage(
      slug,
      locale,
    );

  if (!data) {
    return {
      title:
        copy.notFoundTitle,

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  const {
    project,
    sections,
  } = data;

  const description =
    project.summary ||
    `${project.title} — ${copy.metadataFallback}`;

  const path =
    localizePath(
      `/work/${project.slug}`,
      locale,
    );

  const canonical =
    getAbsoluteUrl(
      path,
    );

  const englishUrl =
    getAbsoluteUrl(
      localizePath(
        `/work/${project.slug}`,
        "en",
      ),
    );

  const indonesianUrl =
    getAbsoluteUrl(
      localizePath(
        `/work/${project.slug}`,
        "id",
      ),
    );

  const germanUrl =
    getAbsoluteUrl(
      localizePath(
        `/work/${project.slug}`,
        "de",
      ),
    );

  const previewImage =
    getProjectPreviewImage(
      sections,
      project,
    );

  return {
    title:
      project.title,

    description,

    robots: {
      index:
        true,

      follow:
        true,
    },

    alternates: {
      canonical,

      languages: {
        en:
          englishUrl,

        id:
          indonesianUrl,

        de:
          germanUrl,

        "x-default":
          englishUrl,
      },
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

      locale:
        locale ===
        "id"
          ? "id_ID"
          : locale ===
              "de"
            ? "de_DE"
            : "en_US",

      alternateLocale:
        locale ===
        "en"
          ? [
              "id_ID",
              "de_DE",
            ]
          : locale ===
              "id"
            ? [
                "en_US",
                "de_DE",
              ]
            : [
                "en_US",
                "id_ID",
              ],

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

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

  return generateProjectMetadata(
    slug,
    "en",
  );
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
      channel /
      255;

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

export async function ProjectPageContent({
  slug,
  locale,
}: ProjectPageContentProps) {
  const data =
    await getPublishedProjectPage(
      slug,
      locale,
    );

  if (!data) {
    notFound();
  }

  const copy =
    getProjectMessages(
      locale,
    );

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

  const nextProjectStyle =
    nextProject
      ? ({
          "--next-project-accent":
            nextProject.accentColor,

          "--next-project-on-accent":
            getAccessibleContrastColor(
              nextProject.accentColor,
            ),
        } as CSSProperties)
      : undefined;

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
                href={localizePath("/work", locale)}
                className={
                  styles.backLink
                }
              >
                <span>
                  ←
                </span>

                {
                  copy.back
                }
              </Link>

              <span
                className={
                  styles.projectIndex
                }
              >
                {
                  copy.project
                }{" "}
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
                  {
                    copy.details
                      .year
                  }
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
                  {
                    copy.details
                      .period
                  }
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
                  {
                    copy.details
                      .role
                  }
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
                  {
                    copy.details
                      .project
                  }
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
                    {
                      copy.details
                        .visitLive
                    }

                    <span>
                      ↗
                    </span>
                  </a>
                ) : (
                  <strong>
                    {
                      copy.details
                        .caseStudy
                    }
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
          data-project-story
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
                  locale={
                    locale
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
                  {
                    copy.empty
                      .label
                  }
                </span>

                <h2>
                  {
                    copy.empty
                      .heading
                  }

                  <span>
                    .
                  </span>
                </h2>

                <p>
                  {
                    copy.empty
                      .description
                  }
                </p>
              </div>
            </section>
          )}
        </div>

        <ProjectNarrativeMotion />

        {nextProject ? (
          <>
            <section
              className={
                styles.nextProject
              }
              style={
                nextProjectStyle
              }
              data-next-project-handoff
              data-next-project-number={
                nextProject.number
              }
            >
              <div className="site-container">
                <div
                  className={
                    styles.nextHeader
                  }
                  data-motion-scroll="project-next-header"
                  data-next-project-header
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
                      data-next-project-dot
                    />

                    <span>
                      {
                        copy.next
                      }
                    </span>
                  </div>

                  <span
                    data-next-project-counter
                  >
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
                  href={localizePath(`/work/${nextProject.slug}`, locale)}
                  className={
                    styles.nextLink
                  }
                  data-motion-scroll="project-next-link"
                  data-next-project-link
                >
                  <h2
                    data-next-project-title
                  >
                    {
                      nextProject.title
                    }
                  </h2>

                  <div
                    className={
                      styles.nextMeta
                    }
                    data-next-project-meta
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
                      data-next-project-arrow
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </div>
                </Link>
              </div>
            </section>

            <NextProjectHandoff />
          </>
        ) : null}
      </main>

      <InnerFooter
        locale={
          locale
        }
      />
    </>
  );
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const {
    slug,
  } = await params;

  return (
    <ProjectPageContent
      slug={
        slug
      }
      locale="en"
    />
  );
}