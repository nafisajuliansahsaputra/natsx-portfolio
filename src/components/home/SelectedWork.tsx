import type {
  CSSProperties,
} from "react";

import Link from "next/link";

import {
  getFeaturedProjects,
  getPublicProjectYearRange,
  type PublicProject,
} from "@/lib/public-projects";

import styles from "./SelectedWork.module.css";

type HomeLayout =
  | "wide"
  | "right"
  | "left";

type HomeVisual =
  | "spall"
  | "vision"
  | "stay";

const HOME_LAYOUTS: HomeLayout[] = [
  "wide",
  "right",
  "left",
];

const HOME_VISUALS: HomeVisual[] = [
  "spall",
  "vision",
  "stay",
];

export default async function SelectedWork() {
  const featuredProjects =
    await getFeaturedProjects(
      3,
    );

  const yearRange =
    getPublicProjectYearRange(
      featuredProjects,
    );

  return (
    <section
      className={
        styles.section
      }
      id="work"
    >
      <div className="site-container">
        <header
          className={
            styles.header
          }
          data-motion-scroll="selected-header"
        >
          <div
            className={
              styles.headerMeta
            }
            data-motion-piece="meta"
          >
            <span
              className={
                styles.dot
              }
            />

            <span>
              02 / Selected Work
            </span>
          </div>

          <h2
            className={
              styles.heading
            }
            data-motion-piece="title"
          >
            Selected
            <br />
            Work<span>.</span>
          </h2>

          <div
            className={
              styles.headerDescription
            }
            data-motion-piece="description"
          >
            <p>
              A selection of
              projects across
              design, development,
              identity, and digital
              experiences.
            </p>

            <span
              className={
                styles.yearRange
              }
            >
              {yearRange ||
                "CURRENT"}
            </span>

            <Link
              href="/work"
              className={
                styles.projectLink
              }
            >
              View All Work

              <span>↗</span>
            </Link>
          </div>
        </header>

        <div
          className={
            styles.projects
          }
        >
          {featuredProjects.map(
            (
              project,
              index,
            ) => {
              const layout =
                HOME_LAYOUTS[
                  index %
                    HOME_LAYOUTS.length
                ];

              const visual =
                HOME_VISUALS[
                  index %
                    HOME_VISUALS.length
                ];

              const projectStyle = {
                "--accent":
                  project.accentColor,
              } as CSSProperties;

              return (
                <article
                  className={`${styles.project} ${
                    styles[
                      `layout_${layout}`
                    ]
                  }`}
                  key={
                    project.id
                  }
                  style={
                    projectStyle
                  }
                  data-motion-scroll="project"
                >
                  <div
                    className={
                      styles.projectHeader
                    }
                  >
                    <span
                      className={
                        styles.projectNumber
                      }
                    >
                      {
                        project.number
                      }
                    </span>

                    <h3
                      className={
                        styles.projectTitle
                      }
                    >
                      {
                        project.title
                      }
                    </h3>

                    <span
                      className={
                        styles.projectYear
                      }
                    >
                      {
                        project.year
                      }
                    </span>
                  </div>

                  <div
                    className={`${styles.visual} ${
                      styles[
                        `visual_${visual}`
                      ]
                    }`}
                  >
                    <ProjectArtwork
                      project={
                        project
                      }
                      variant={
                        visual
                      }
                    />
                  </div>

                  <div
                    className={
                      styles.projectFooter
                    }
                  >
                    <div
                      className={
                        styles.categories
                      }
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

                    <Link
                      href={`/work/${project.slug}`}
                      className={
                        styles.projectLink
                      }
                    >
                      View Project

                      <span>
                        ↗
                      </span>
                    </Link>
                  </div>
                </article>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectArtwork({
  project,
  variant,
}: {
  project: PublicProject;
  variant: HomeVisual;
}) {
  const titleLines =
    getTitleLines(
      project.title,
    );

  const visualLabel =
    project.disciplines
      .slice(
        0,
        2,
      )
      .join(" / ") ||
    "Selected Project";

  if (
    variant ===
    "vision"
  ) {
    return (
      <div
        className={
          styles.visionArtwork
        }
      >
        <div
          className={
            styles.visionOrb
          }
        />

        <div
          className={
            styles.visionType
          }
        >
          {titleLines.map(
            (
              line,
              index,
            ) => (
              <span
                key={`${line}-${index}`}
              >
                {line}
              </span>
            ),
          )}
        </div>

        <span
          className={
            styles.visualLabel
          }
        >
          {visualLabel}
        </span>
      </div>
    );
  }

  if (
    variant ===
    "stay"
  ) {
    return (
      <div
        className={
          styles.stayArtwork
        }
      >
        <div
          className={
            styles.stayArch
          }
        />

        <div
          className={
            styles.stayWindow
          }
        >
          <div
            className={
              styles.stayWindowTop
            }
          >
            <span />
            <span />
            <span />
          </div>

          <div
            className={
              styles.stayWindowContent
            }
          >
            <p>
              {
                titleLines[0]
              }

              {titleLines[1] ? (
                <>
                  <br />

                  {
                    titleLines[1]
                  }
                </>
              ) : null}
            </p>

            <span>
              View case study ↗
            </span>
          </div>
        </div>

        <span
          className={
            styles.visualLabel
          }
        >
          {visualLabel}
        </span>
      </div>
    );
  }

  return (
    <div
      className={
        styles.spallArtwork
      }
    >
      <div
        className={
          styles.spallBrowser
        }
      >
        <div
          className={
            styles.spallBrowserTop
          }
        >
          <span />
          <span />
          <span />
        </div>

        <div
          className={
            styles.spallBrowserBody
          }
        >
          <span
            className={
              styles.spallMiniLabel
            }
          >
            {project.number} /
            NATSX
          </span>

          <strong>
            {
              titleLines[0]
            }

            {titleLines[1] ? (
              <>
                <br />

                {
                  titleLines[1]
                }
              </>
            ) : null}
          </strong>
        </div>
      </div>

      <div
        className={
          styles.spallCard
        }
      >
        <span>
          {
            project.number
          }
        </span>

        <strong>
          SELECTED
        </strong>

        <strong>
          WORK
        </strong>
      </div>

      <span
        className={
          styles.visualLabel
        }
      >
        {visualLabel}
      </span>
    </div>
  );
}

function getTitleLines(
  title: string,
) {
  const words =
    title
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length <= 1
  ) {
    return [
      title.trim(),
    ];
  }

  const midpoint =
    Math.ceil(
      words.length / 2,
    );

  return [
    words
      .slice(
        0,
        midpoint,
      )
      .join(" "),

    words
      .slice(
        midpoint,
      )
      .join(" "),
  ].filter(Boolean);
}