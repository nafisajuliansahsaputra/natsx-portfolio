import type {
  CSSProperties,
} from "react";

import LocaleLink from "@/components/i18n/LocaleLink";

import type {
  Locale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

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

type SelectedWorkProps = {
  locale: Locale;
};

type SelectedWorkCopy =
  ReturnType<
    typeof getHomeMessages
  >["selectedWork"];

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

export default async function SelectedWork({
  locale,
}: SelectedWorkProps) {
  const copy =
    getHomeMessages(
      locale,
    ).selectedWork;

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
              {
                copy.sectionLabel
              }
            </span>
          </div>

          <h2
            className={
              styles.heading
            }
            data-motion-piece="title"
          >
            {
              copy.headingLine1
            }

            <br />

            {
              copy.headingLine2
            }

            <span>
              .
            </span>
          </h2>

          <div
            className={
              styles.headerDescription
            }
            data-motion-piece="description"
          >
            <p>
              {
                copy.description
              }
            </p>

            <span
              className={
                styles.yearRange
              }
            >
              {yearRange ||
                copy.current}
            </span>

            <LocaleLink
              href="/work"
              className={
                styles.projectLink
              }
            >
              {
                copy.viewAll
              }

              <span>
                ↗
              </span>
            </LocaleLink>
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
                      copy={
                        copy
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

                    <LocaleLink
                      href={`/work/${project.slug}`}
                      className={
                        styles.projectLink
                      }
                    >
                      {
                        copy.viewProject
                      }

                      <span>
                        ↗
                      </span>
                    </LocaleLink>
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
  copy,
}: {
  project: PublicProject;
  variant: HomeVisual;
  copy: SelectedWorkCopy;
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
    copy.selectedProject;

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
                {
                  line
                }
              </span>
            ),
          )}
        </div>

        <span
          className={
            styles.visualLabel
          }
        >
          {
            visualLabel
          }
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
              {
                copy.viewCaseStudy
              }{" "}
              ↗
            </span>
          </div>
        </div>

        <span
          className={
            styles.visualLabel
          }
        >
          {
            visualLabel
          }
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
            {
              project.number
            }{" "}
            / NATSX
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
        {
          visualLabel
        }
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