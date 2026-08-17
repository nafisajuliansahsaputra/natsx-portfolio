import type {
  CSSProperties,
} from "react";

import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  getNextProject,
  getProjectBySlug,
  projects,
} from "@/data/projects";

import styles from "./ProjectDetail.module.css";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const themeStyles = {
  spall: {
    "--project-accent": "#5862EC",
    "--project-accent-on-dark":
      "#5862EC",
    "--project-on-accent": "#111111",
    "--project-secondary": "#D8D7D1",
    "--project-surface": "#111111",
  },

  vision: {
    "--project-accent": "#0F1B2D",
    "--project-accent-on-dark":
      "#D8DCE3",
    "--project-on-accent": "#F7F6F2",
    "--project-secondary": "#D8DCE3",
    "--project-surface": "#111111",
  },

  stay: {
    "--project-accent": "#5862EC",
    "--project-accent-on-dark":
      "#5862EC",
    "--project-on-accent": "#111111",
    "--project-secondary": "#D9E2DD",
    "--project-surface": "#171717",
  },
};

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;

  const project =
    getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;

  const project =
    getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const nextProject =
    getNextProject(project.slug);

  const projectStyle =
    themeStyles[
      project.theme
    ] as unknown as CSSProperties;

  return (
    <>
      <SiteHeader />

      <main
        className={styles.page}
        style={projectStyle}
        data-motion-page="project-detail"
      >
        {/* =========================
            PROJECT HERO
        ========================= */}

        <section className={styles.hero}>
          <div className="site-container">
            <div
              className={styles.heroTop}
              data-motion-project-hero-piece="top"
            >
              <Link
                href="/work"
                className={styles.backLink}
              >
                <span>←</span>
                All Work
              </Link>

              <span
                className={
                  styles.projectIndex
                }
              >
                Project {project.number} /{" "}
                {project.year}
              </span>
            </div>

            <div
              className={styles.heroTitle}
              data-motion-project-hero-piece="title"
            >
              <h1>
                {project.title}
              </h1>
            </div>

            <div
              className={
                styles.heroBottom
              }
            >
              <div
                className={
                  styles.disciplines
                }
                data-motion-project-hero-piece="disciplines"
              >
                {project.disciplines.map(
                  (discipline) => (
                    <span
                      key={discipline}
                    >
                      {discipline}
                    </span>
                  ),
                )}
              </div>

              <p
                data-motion-project-hero-piece="summary"
              >
                {project.summary}
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            COVER
        ========================= */}

        <section
          className={
            styles.coverSection
          }
        >
          <div className="site-container">
            <div
              className={
                styles.coverVisual
              }
              data-motion-scroll="project-cover"
            >
              <div
                className={
                  styles.coverGrid
                }
              />

              <span
                className={
                  styles.coverMeta
                }
              >
                {
                  project.visualLabels
                    .cover
                }
              </span>

              <span
                className={
                  styles.coverNumber
                }
              >
                {project.number}
              </span>

              <div
                className={
                  styles.coverShapeOne
                }
              />

              <div
                className={
                  styles.coverShapeTwo
                }
              />

              <div
                className={
                  styles.coverWord
                }
              >
                <span>
                  {project.title}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            OVERVIEW
        ========================= */}

        <section
          className={styles.overview}
        >
          <div className="site-container">
            <div
              className={
                styles.overviewGrid
              }
              data-motion-scroll="project-overview"
            >
              <div
                className={
                  styles.sectionLabel
                }
                data-motion-piece="label"
              >
                <span
                  className={styles.dot}
                />

                <span>
                  Project Overview
                </span>
              </div>

              <div
                className={
                  styles.overviewMain
                }
              >
                <h2
                  data-motion-piece="title"
                >
                  {project.statement}
                  <span>.</span>
                </h2>

                <div
                  className={
                    styles.overviewCopy
                  }
                  data-motion-piece="copy"
                >
                  {project.overview.map(
                    (paragraph) => (
                      <p key={paragraph}>
                        {paragraph}
                      </p>
                    ),
                  )}
                </div>
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

                <span>
                  {project.year}
                </span>
              </div>

              <div>
                <span
                  className={
                    styles.detailLabel
                  }
                >
                  Period
                </span>

                <span>
                  {project.period}
                </span>
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
                  {project.role.map(
                    (role) => (
                      <span key={role}>
                        {role}
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
                  Status
                </span>

                <span>
                  Selected Project
                </span>
              </div>
            </div>

            {project.website && (
              <div
                className={
                  styles.websiteRow
                }
                data-motion-scroll="project-website"
              >
                <span>
                  Live Project
                </span>

                <a
                  href={project.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit Website
                  <span>↗</span>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* =========================
            VISUAL 01
        ========================= */}

        <section
          className={
            styles.visualStory
          }
        >
          <div className="site-container">
            <div
              className={
                styles.visualWide
              }
              data-motion-scroll="project-wide-visual"
            >
              <div
                className={
                  styles.interfaceFrame
                }
              >
                <div
                  className={
                    styles.interfaceTop
                  }
                >
                  <span>
                    NATSX / PROJECT
                  </span>

                  <span>
                    {
                      project.visualLabels
                        .first
                    }
                  </span>
                </div>

                <div
                  className={
                    styles.interfaceBody
                  }
                >
                  <div
                    className={
                      styles
                        .interfaceSidebar
                    }
                  >
                    <span>01</span>
                    <span>02</span>
                    <span>03</span>
                  </div>

                  <div
                    className={
                      styles
                        .interfaceContent
                    }
                  >
                    <span>
                      {project.title}
                    </span>

                    <div
                      className={
                        styles
                          .interfaceCardLarge
                      }
                    />

                    <div
                      className={
                        styles
                          .interfaceCards
                      }
                    >
                      <div />
                      <div />
                      <div />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                styles.visualCaption
              }
              data-motion-scroll="project-visual-caption"
            >
              <span>
                01 / Visual System
              </span>

              <p>
                {
                  project.visualLabels
                    .first
                }
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            STATEMENT
        ========================= */}

        <section
          className={styles.statement}
        >
          <div className="site-container">
            <div
              className={
                styles.statementGrid
              }
              data-motion-scroll="project-statement"
            >
              <div
                className={
                  styles.statementLabel
                }
                data-motion-piece="label"
              >
                <span
                  className={
                    styles.lightDot
                  }
                />

                <span>
                  Direction
                </span>
              </div>

              <p
                data-motion-piece="title"
              >
                The goal is not only
                <br />
                to make it look good
                <br />
                <em>
                  —but make it feel
                  right.
                </em>
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            VISUAL PAIR
        ========================= */}

        <section
          className={
            styles.visualPairSection
          }
        >
          <div className="site-container">
            <div
              className={
                styles.visualPair
              }
            >
              <div
                className={
                  styles.visualPairLeft
                }
                data-motion-scroll="project-pair-left"
              >
                <div
                  className={
                    styles.mobileVisual
                  }
                >
                  <div
                    className={
                      styles.mobileDevice
                    }
                  >
                    <div
                      className={
                        styles.mobileHeader
                      }
                    />

                    <span>
                      {project.title}
                    </span>

                    <div
                      className={
                        styles.mobileHero
                      }
                    />

                    <div
                      className={
                        styles.mobileRows
                      }
                    >
                      <div />
                      <div />
                      <div />
                    </div>
                  </div>
                </div>

                <div
                  className={
                    styles.pairCaption
                  }
                >
                  <span>02</span>

                  <p>
                    {
                      project.visualLabels
                        .second
                    }
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.visualPairRight
                }
                data-motion-scroll="project-pair-right"
              >
                <div
                  className={
                    styles.detailVisual
                  }
                >
                  <div
                    className={
                      styles.detailCircle
                    }
                  />

                  <div
                    className={
                      styles.detailBlock
                    }
                  />

                  <span>
                    {
                      project.visualLabels
                        .third
                    }
                  </span>

                  <span
                    className={
                      styles.detailPlus
                    }
                  >
                    +
                  </span>
                </div>

                <div
                  className={
                    styles.pairCaption
                  }
                >
                  <span>03</span>

                  <p>
                    {
                      project.visualLabels
                        .third
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            FINAL VISUAL
        ========================= */}

        <section
          className={
            styles.finalVisualSection
          }
        >
          <div className="site-container">
            <div
              className={
                styles.finalVisual
              }
              data-motion-scroll="project-final-visual"
            >
              <div
                className={
                  styles.finalVisualTop
                }
              >
                <span>
                  {project.title}
                </span>

                <span>
                  {project.year} /
                  NATSX
                </span>
              </div>

              <div
                className={
                  styles.finalVisualTitle
                }
              >
                <span>IDEA</span>
                <span>TO</span>
                <span>
                  EXPERIENCE.
                </span>
              </div>

              <div
                className={
                  styles.finalVisualBottom
                }
              >
                <span>
                  {
                    project.disciplines[
                      0
                    ]
                  }
                </span>

                <span>
                  Project{" "}
                  {project.number}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            NEXT PROJECT
        ========================= */}

        {nextProject && (
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
                    styles.sectionLabel
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
                  {nextProject.number} /{" "}
                  {String(
                    projects.length,
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
                  {nextProject.title}
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
        )}
      </main>
    </>
  );
}