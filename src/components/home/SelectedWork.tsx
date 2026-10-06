import type {
  CSSProperties,
} from "react";

import Link from "next/link";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import {
  getProjectPrimaryVisualUrl,
  getProjectSecondaryVisualUrl,
} from "@/lib/public-media";

import {
  getFeaturedProjects,
  getPublicProjectYearRange,
  type PublicProject,
} from "@/lib/public-projects";

import AttendanceSystemArtwork from "./AttendanceSystemArtwork";
import BastManagementArtwork from "./BastManagementArtwork";
import FiveAmVisionArtwork from "./FiveAmVisionArtwork";
import NatsxControllerArtwork from "./NatsxControllerArtwork";
import SpallSpillArtwork from "./SpallSpillArtwork";

import styles from "./SelectedWork.module.css";

type HomeLayout =
  | "wide"
  | "right"
  | "left"
  | "finale";

type HomeVisual =
  | "spall"
  | "vision"
  | "bast"
  | "attendance"
  | "controller";

type SelectedWorkProps = {
  locale:
    Locale;
};

type SelectedWorkCopy =
  ReturnType<
    typeof getHomeMessages
  >["selectedWork"];

const FALLBACK_LAYOUTS:
  HomeLayout[] = [
    "wide",
    "right",
    "finale",
    "left",
  ];

const FALLBACK_VISUALS:
  HomeVisual[] = [
    "spall",
    "vision",
    "bast",
    "attendance",
  ];


const RECRUITER_PRIORITY:
  Record<
    string,
    number
  > = {
    "smart-attendance-system":
      0,

    "attendance-system":
      0,

    "nusantara-stay":
      0,

    "natsx-controller":
      1,

    "bast-management-system":
      2,

    "spall-spill":
      3,

    "5am-vision":
      4,
  };

function sortFeaturedProjectsForRecruiters(
  projects:
    PublicProject[],
) {
  return [
    ...projects,
  ].sort(
    (
      first,
      second,
    ) => {
      const firstPriority =
        RECRUITER_PRIORITY[
          first.slug
        ] ??
        Number.MAX_SAFE_INTEGER;

      const secondPriority =
        RECRUITER_PRIORITY[
          second.slug
        ] ??
        Number.MAX_SAFE_INTEGER;

      if (
        firstPriority !==
        secondPriority
      ) {
        return (
          firstPriority -
          secondPriority
        );
      }

      return (
        first.sortOrder -
        second.sortOrder
      );
    },
  );
}

function getProjectPresentation(
  project:
    PublicProject,

  index:
    number,
) {
  switch (
    project.slug
  ) {
    case "spall-spill":
      return {
        layout:
          "wide" as const,

        visual:
          "spall" as const,
      };

    case "5am-vision":
      return {
        layout:
          "right" as const,

        visual:
          "vision" as const,
      };

    case "bast-management-system":
      return {
        layout:
          "finale" as const,

        visual:
          "bast" as const,
      };

    case "natsx-controller":
      return {
        layout:
          "right" as const,

        visual:
          "controller" as const,
      };

    /*
     * Legacy project slot.
     *
     * Nusantara Stay sedang digantikan
     * menjadi Smart Attendance System.
     *
     * Slug database masih lama untuk
     * sementara, sehingga presentation
     * layer diarahkan ke Attendance.
     */
    case "nusantara-stay":
    case "attendance-system":
    case "smart-attendance-system":
      return {
        layout:
          "left" as const,

        visual:
          "attendance" as const,
      };

    default:
      return {
        layout:
          FALLBACK_LAYOUTS[
            index %
              FALLBACK_LAYOUTS.length
          ],

        visual:
          FALLBACK_VISUALS[
            index %
              FALLBACK_VISUALS.length
          ],
      };
  }
}

export default async function SelectedWork({
  locale,
}: SelectedWorkProps) {
  const copy =
    getHomeMessages(
      locale,
    ).selectedWork;

  const featuredProjects =
    sortFeaturedProjectsForRecruiters(
      await getFeaturedProjects(
        4,
        locale,
      ),
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
              {
                yearRange ||
                copy.current
              }
            </span>

            <Link
              href={localizePath("/work", locale)}
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
            </Link>
          </div>
        </header>

        <div
          className={
            styles.projects
          }
        >
          {
            featuredProjects.map(
              (
                project,
                index,
              ) => {
                const {
                  layout,
                  visual,
                } =
                  getProjectPresentation(
                    project,
                    index,
                  );

                const projectStyle = {
                  "--accent":
                    project.accentColor,

                  "--project-secondary":
                    project.secondaryColor ??
                    "#deddd7",
                } as CSSProperties;

                const isLegacyAttendance =
                  visual ===
                  "attendance";

                const displayNumber =
                  String(
                    index +
                      1,
                  ).padStart(
                    2,
                    "0",
                  );

                const displayTitle =
                  isLegacyAttendance
                    ? "Smart Attendance System"
                    : project.title;

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
                    data-route-transition-project-title={
                      displayTitle
                    }
                    data-route-transition-project-number={
                      displayNumber
                    }
                    data-project-visual={
                      visual
                    }
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
                          displayNumber
                        }
                      </span>

                      <h3
                        className={
                          styles.projectTitle
                        }
                      >
                        {
                          displayTitle
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
                      className={
                        styles.visual
                      }
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
                          styles.projectDetails
                        }
                      >
                        <div
                          className={
                            styles.categories
                          }
                        >
                          {
                            isLegacyAttendance
                              ? (
                                <>
                                  <span>
                                    Full-Stack Engineering
                                  </span>

                                  <span>
                                    RFID + Face Verification
                                  </span>

                                  <span>
                                    Device API + Authorization
                                  </span>
                                </>
                              )
                              : (
                                project.disciplines.map(
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
                                )
                              )
                          }
                        </div>

                        {project.techStack.length >
                        0 ? (
                          <div
                            className={
                              styles.techStack
                            }
                            aria-label="Technology stack"
                          >
                            {project.techStack
                              .slice(
                                0,
                                4,
                              )
                              .map(
                                (
                                  technology,
                                ) => (
                                  <span
                                    key={
                                      technology
                                    }
                                  >
                                    {
                                      technology
                                    }
                                  </span>
                                ),
                              )}
                          </div>
                        ) : null}
                      </div>

                      <Link
                        href={localizePath(`/work/${project.slug}`, locale)}
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
                      </Link>
                    </div>
                  </article>
                );
              },
            )
          }
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
  project:
    PublicProject;

  variant:
    HomeVisual;

  copy:
    SelectedWorkCopy;
}) {
  if (
    variant ===
    "controller"
  ) {
    return (
      <NatsxControllerArtwork />
    );
  }

  if (
    variant ===
    "vision"
  ) {
    return (
      <FiveAmVisionArtwork
        copy={
          copy.visionArtwork
        }
      />
    );
  }

  const primaryVisual =
    getProjectPrimaryVisualUrl(
      project,
    );

  const secondaryVisual =
    getProjectSecondaryVisualUrl(
      project,
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
    "spall"
  ) {
    return (
      <SpallSpillArtwork
        project={
          project
        }
        secondaryVisual={
          secondaryVisual
        }
        visualLabel={
          visualLabel
        }
      />
    );
  }

  if (
    variant ===
    "bast"
  ) {
    return (
      <BastManagementArtwork
        project={
          project
        }
        primaryVisual={
          primaryVisual
        }
        secondaryVisual={
          secondaryVisual
        }
        visualLabel={
          visualLabel
        }
      />
    );
  }

  return (
    <AttendanceSystemArtwork
      project={
        project
      }
      primaryVisual={
        primaryVisual
      }
      secondaryVisual={
        secondaryVisual
      }
    />
  );
}