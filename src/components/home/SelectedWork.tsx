import type {
  CSSProperties,
} from "react";

import Image from "next/image";

import LocaleLink from "@/components/i18n/LocaleLink";

import type {
  Locale,
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

import phoneStyles from "./SpallPhone.module.css";
import styles from "./SelectedWork.module.css";

type HomeLayout =
  | "wide"
  | "right"
  | "left"
  | "finale";

type HomeVisual =
  | "spall"
  | "vision"
  | "stay"
  | "bast";

type SelectedWorkProps = {
  locale: Locale;
};

type SelectedWorkCopy =
  ReturnType<
    typeof getHomeMessages
  >["selectedWork"];

const FALLBACK_LAYOUTS:
  HomeLayout[] = [
    "wide",
    "right",
    "left",
    "finale",
  ];

const FALLBACK_VISUALS:
  HomeVisual[] = [
    "spall",
    "vision",
    "stay",
    "bast",
  ];

function getProjectPresentation(
  project: PublicProject,
  index: number,
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

    case "nusantara-stay":
      return {
        layout:
          "left" as const,

        visual:
          "stay" as const,
      };

    case "bast-management-system":
      return {
        layout:
          "finale" as const,

        visual:
          "bast" as const,
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
    await getFeaturedProjects(
      4,
      locale,
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
    "vision"
  ) {
    return (
      <VisionArtwork
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

  if (
    variant ===
    "stay"
  ) {
    return (
      <StayArtwork
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
        copy={
          copy
        }
      />
    );
  }

  if (
    variant ===
    "bast"
  ) {
    return (
      <BastArtwork
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
    <SpallArtwork
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

function SpallArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
}: {
  project: PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  visualLabel: string;
}) {
  const titleLines =
    getTitleLines(
      project.title,
    );

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
        <BrowserChrome
          className={
            styles.spallBrowserTop
          }
        />

        <div
          className={
            styles.spallBrowserBody
          }
        >
          {primaryVisual ? (
            <ShowcaseImage
              src={
                primaryVisual
              }
              alt={`${project.title} desktop interface`}
              className={
                styles.spallPrimaryImage
              }
              sizes="(max-width: 700px) 72vw, 58vw"
            />
          ) : (
            <div
              className={
                styles.spallFallback
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
          )}
        </div>
      </div>

      {secondaryVisual ? (
        <SpallPhone
          project={
            project
          }
          image={
            secondaryVisual
          }
        />
      ) : (
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
      )}

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

function SpallPhone({
  project,
  image,
}: {
  project: PublicProject;
  image: string;
}) {
  return (
    <div
      className={
        phoneStyles.stage
      }
    >
      <div
        className={
          phoneStyles.phone
        }
      >
        <div
          className={
            phoneStyles.screen
          }
        >
          <ShowcaseImage
            src={
              image
            }
            alt={`${project.title} mobile interface`}
            className={
              phoneStyles.image
            }
            sizes="(max-width: 700px) 31vw, 17.6vw"
          />
        </div>

        <div
          className={
            phoneStyles.hardware
          }
          aria-hidden="true"
        >
          <span
            className={
              phoneStyles.speaker
            }
          />

          <span
            className={
              phoneStyles.camera
            }
          />
        </div>
      </div>
    </div>
  );
}

function VisionArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
}: {
  project: PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  visualLabel: string;
}) {
  const titleLines =
    getTitleLines(
      project.title,
    );

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
        aria-hidden={
          Boolean(
            primaryVisual,
          )
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

      {primaryVisual ? (
        <div
          className={
            styles.visionPrimary
          }
        >
          <ShowcaseImage
            src={
              primaryVisual
            }
            alt={`${project.title} primary brand visual`}
            className={
              styles.visionPrimaryImage
            }
            sizes="(max-width: 700px) 62vw, 38vw"
          />
        </div>
      ) : null}

      {secondaryVisual ? (
        <div
          className={
            styles.visionSecondary
          }
        >
          <ShowcaseImage
            src={
              secondaryVisual
            }
            alt={`${project.title} secondary brand visual`}
            className={
              styles.visionSecondaryImage
            }
            sizes="(max-width: 700px) 34vw, 18vw"
          />
        </div>
      ) : null}

      <span
        className={
          styles.visionEdition
        }
        aria-hidden="true"
      >
        05:00
      </span>

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

function StayArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
  copy,
}: {
  project: PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  visualLabel: string;
  copy: SelectedWorkCopy;
}) {
  const titleLines =
    getTitleLines(
      project.title,
    );

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
      >
        <span
          aria-hidden="true"
        />
      </div>

      <div
        className={
          styles.stayWindow
        }
      >
        <BrowserChrome
          className={
            styles.stayWindowTop
          }
        />

        <div
          className={
            styles.stayWindowContent
          }
        >
          {primaryVisual ? (
            <ShowcaseImage
              src={
                primaryVisual
              }
              alt={`${project.title} desktop booking interface`}
              className={
                styles.stayPrimaryImage
              }
              sizes="(max-width: 700px) 72vw, 46vw"
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {secondaryVisual ? (
        <div
          className={
            styles.staySecondary
          }
        >
          <div
            className={
              styles.staySecondaryBar
            }
          >
            <span>
              ID
            </span>

            <span>
              STAY
            </span>
          </div>

          <div
            className={
              styles.staySecondaryViewport
            }
          >
            <ShowcaseImage
              src={
                secondaryVisual
              }
              alt={`${project.title} mobile booking interface`}
              className={
                styles.staySecondaryImage
              }
              sizes="(max-width: 700px) 34vw, 18vw"
            />
          </div>
        </div>
      ) : null}

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

function BastArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
}: {
  project: PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  visualLabel: string;
}) {
  return (
    <div
      className={
        styles.bastArtwork
      }
    >
      <div
        className={
          styles.bastGrid
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.bastIndex
        }
        aria-hidden="true"
      >
        <span>
          SYSTEM
        </span>

        <strong>
          BAST
        </strong>

        <span>
          2024—26
        </span>
      </div>

      <div
        className={
          styles.bastDashboard
        }
      >
        <div
          className={
            styles.bastDashboardTop
          }
        >
          <div>
            <span />
            <span />
            <span />
          </div>

          <span>
            MANAGEMENT
            SYSTEM
          </span>
        </div>

        <div
          className={
            styles.bastDashboardViewport
          }
        >
          {primaryVisual ? (
            <ShowcaseImage
              src={
                primaryVisual
              }
              alt={`${project.title} main system interface`}
              className={
                styles.bastPrimaryImage
              }
              sizes="(max-width: 700px) 75vw, 60vw"
            />
          ) : (
            <BastFallback />
          )}
        </div>
      </div>

      <div
        className={
          styles.bastDocument
        }
      >
        {secondaryVisual ? (
          <ShowcaseImage
            src={
              secondaryVisual
            }
            alt={`${project.title} supporting workflow visual`}
            className={
              styles.bastSecondaryImage
            }
            sizes="(max-width: 700px) 42vw, 22vw"
          />
        ) : (
          <div
            className={
              styles.bastDocumentFallback
            }
          >
            <span>
              BAST / DOC
            </span>

            <div />

            <div />

            <div />

            <strong>
              VERIFIED
            </strong>
          </div>
        )}
      </div>

      <div
        className={
          styles.bastStatus
        }
        aria-hidden="true"
      >
        <span />

        <div>
          <small>
            STATUS
          </small>

          <strong>
            ACTIVE
          </strong>
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

function BastFallback() {
  return (
    <div
      className={
        styles.bastFallback
      }
    >
      <aside>
        <span>
          NATSX
        </span>

        <i />
        <i />
        <i />
        <i />
      </aside>

      <div
        className={
          styles.bastFallbackMain
        }
      >
        <div
          className={
            styles.bastFallbackHeader
          }
        >
          <span>
            Dashboard
          </span>

          <span>
            ●
          </span>
        </div>

        <div
          className={
            styles.bastFallbackCards
          }
        >
          <span />
          <span />
          <span />
        </div>

        <div
          className={
            styles.bastFallbackTable
          }
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function BrowserChrome({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={
        className
      }
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </div>
  );
}

function ShowcaseImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className: string;
  sizes: string;
}) {
  return (
    <Image
      src={
        src
      }
      alt={
        alt
      }
      fill
      sizes={
        sizes
      }
      className={
        className
      }
    />
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