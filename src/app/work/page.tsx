import type {
  CSSProperties,
} from "react";

import Image from "next/image";

import LocaleLink from "@/components/i18n/LocaleLink";

import SiteHeader from "@/components/layout/SiteHeader";

import type {
  Locale,
} from "@/i18n/config";

import {
  getWorkMessages,
} from "@/i18n/work-messages";

import {
  createPageMetadata,
} from "@/lib/page-metadata";

import {
  getProjectPrimaryVisualUrl,
  getProjectSecondaryVisualUrl,
} from "@/lib/public-media";

import {
  getPublishedProjects,
  getPublicProjectYearRange,
} from "@/lib/public-projects";

import styles from "./Work.module.css";

export const revalidate =
  3600;

const description =
  "Selected projects by NATSX across product design, development, identity, and creative direction.";

export const metadata =
  createPageMetadata({
    title:
      "Work",

    description,

    path:
      "/work",
  });

function getPreviewVariant(
  index: number,
) {
  if (
    index % 3 ===
    1
  ) {
    return "drop";
  }

  if (
    index % 3 ===
    2
  ) {
    return "center";
  }

  return "rise";
}

export async function WorkPageContent({
  locale,
}: {
  locale: Locale;
}) {
  const copy =
    getWorkMessages(
      locale,
    );

  const projects =
    await getPublishedProjects(
      locale,
    );

  const projectCount =
    String(
      projects.length,
    ).padStart(
      2,
      "0",
    );

  const projectPeriod =
    getPublicProjectYearRange(
      projects,
    );

  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className={
          styles.page
        }
        data-motion-page="work"
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
              data-motion-work-hero-piece="top"
            >
              <div
                className={
                  styles.label
                }
              >
                <span
                  className={
                    styles.dot
                  }
                />

                <span>
                  {
                    copy.hero.label
                  }
                </span>
              </div>

              <span
                className={
                  styles.heroIndex
                }
              >
                {
                  copy.hero.index
                }
              </span>
            </div>

            <div
              className={
                styles.heroMain
              }
            >
              <h1
                className={
                  styles.heading
                }
                data-motion-work-hero-piece="title"
              >
                {
                  copy.hero.heading
                }

                <span>
                  .
                </span>
              </h1>

              <div
                className={
                  styles.intro
                }
              >
                <p
                  data-motion-work-hero-piece="intro"
                >
                  {
                    copy.hero
                      .description
                  }
                </p>

                <div
                  className={
                    styles.introMeta
                  }
                  data-motion-work-hero-piece="meta"
                >
                  <div>
                    <span
                      className={
                        styles.metaLabel
                      }
                    >
                      {
                        copy.hero
                          .projects
                      }
                    </span>

                    <span>
                      {
                        projectCount
                      }
                    </span>
                  </div>

                  <div>
                    <span
                      className={
                        styles.metaLabel
                      }
                    >
                      {
                        copy.hero
                          .period
                      }
                    </span>

                    <span>
                      {projectPeriod ||
                        "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.archive
          }
        >
          <div className="site-container">
            <div
              className={
                styles.archiveHeader
              }
              data-motion-scroll="work-archive-header"
            >
              <span>
                {
                  copy.archive
                    .heading
                }
              </span>

              <span
                className={
                  styles.archiveCount
                }
              >
                {projectCount}
                {" / "}
                {
                  copy.archive
                    .current
                }
              </span>
            </div>

            <div
              className={
                styles.projects
              }
            >
              {projects.map(
                (
                  project,
                  index,
                ) => {
                  const previewImage =
                    getProjectPrimaryVisualUrl(
                      project,
                    ) ??
                    getProjectSecondaryVisualUrl(
                      project,
                    );

                  const projectStyle = {
                    "--row-accent":
                      project.accentColor,
                  } as CSSProperties;

                  return (
                    <LocaleLink
                      href={`/work/${project.slug}`}
                      className={
                        styles.project
                      }
                      key={
                        project.id
                      }
                      data-motion-scroll="work-project"
                      data-preview-variant={
                        getPreviewVariant(
                          index,
                        )
                      }
                      data-has-preview={
                        previewImage
                          ? "true"
                          : "false"
                      }
                      style={
                        projectStyle
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

                      <div
                        className={
                          styles.projectMain
                        }
                      >
                        <h2>
                          {
                            project.title
                          }
                        </h2>

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
                      </div>

                      {previewImage ? (
                        <div
                          className={
                            styles.previewStage
                          }
                          aria-hidden="true"
                        >
                          <div
                            className={
                              styles.previewFrame
                            }
                          >
                            <Image
                              src={
                                previewImage
                              }
                              alt=""
                              fill
                              sizes="(max-width: 700px) 74vw, 340px"
                              className={
                                styles.previewImage
                              }
                            />
                          </div>
                        </div>
                      ) : null}

                      <div
                        className={
                          styles.projectMeta
                        }
                      >
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

                      <span
                        className={
                          styles.projectArrow
                        }
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </LocaleLink>
                  );
                },
              )}
            </div>

            {projects.length ===
            0 ? (
              <div
                className={
                  styles.closing
                }
                data-motion-scroll="work-closing"
              >
                <div
                  className={
                    styles.closingLabel
                  }
                >
                  <span
                    className={
                      styles.dot
                    }
                  />

                  <span>
                    {
                      copy.empty
                        .label
                    }
                  </span>
                </div>

                <div
                  className={
                    styles.closingMain
                  }
                >
                  <p>
                    {
                      copy.empty
                        .description
                    }
                  </p>

                  <LocaleLink
                    href="/contact"
                    className={
                      styles.contactLink
                    }
                  >
                    {
                      copy.empty
                        .contact
                    }

                    <span>
                      ↗
                    </span>
                  </LocaleLink>
                </div>
              </div>
            ) : (
              <div
                className={
                  styles.closing
                }
                data-motion-scroll="work-closing"
              >
                <div
                  className={
                    styles.closingLabel
                  }
                >
                  <span
                    className={
                      styles.dot
                    }
                  />

                  <span>
                    {
                      copy.closing
                        .label
                    }
                  </span>
                </div>

                <div
                  className={
                    styles.closingMain
                  }
                >
                  <p>
                    {
                      copy.closing
                        .description
                    }
                  </p>

                  <LocaleLink
                    href="/contact"
                    className={
                      styles.contactLink
                    }
                  >
                    {
                      copy.closing
                        .contact
                    }

                    <span>
                      ↗
                    </span>
                  </LocaleLink>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default function WorkPage() {
  return (
    <WorkPageContent
      locale="en"
    />
  );
}