import "@/app/about-motion.css";
import "@/app/about-motion-fit.css";

import LocaleLink from "@/components/i18n/LocaleLink";
import SiteHeader from "@/components/layout/SiteHeader";

import {
  site,
} from "@/data/site";

import type {
  Locale,
} from "@/i18n/config";

import {
  getAboutMessages,
} from "@/i18n/about-messages";

import {
  createPageMetadata,
} from "@/lib/page-metadata";

import AboutIdentityPortrait from "./AboutIdentityPortrait";
import AboutInteractionPolish from "./AboutInteractionPolish";

import styles from "./About.module.css";

const description =
  "About Nafisa Juliansah Saputra — a multidisciplinary digital creator working across design, development, motion, and visual experiences.";

export const metadata =
  createPageMetadata({
    title:
      "About",

    description,

    path:
      "/about",
  });

const disciplines = [
  {
    number:
      "01",

    key:
      "design",

    items: [
      "UI/UX Design",
      "Web Design",
      "Graphic Design",
      "Visual Identity",
    ],
  },

  {
    number:
      "02",

    key:
      "development",

    items: [
      "Frontend",
      "Next.js",
      "React",
      "Creative Development",
    ],
  },

  {
    number:
      "03",

    key:
      "motion",

    items: [
      "Motion Design",
      "UI Motion",
      "Video Editing",
      "Interaction",
    ],
  },

  {
    number:
      "04",

    key:
      "creative",

    items: [
      "Creative Direction",
      "Art Direction",
      "AI-Assisted Creative",
      "Visual Exploration",
    ],
  },
] as const;

export function AboutPageContent({
  locale,
}: {
  locale: Locale;
}) {
  const copy =
    getAboutMessages(
      locale,
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
        data-motion-page="about"
        data-about-interaction-root
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
              data-motion-about-hero-piece="top"
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
                    copy.hero
                      .label
                  }
                </span>
              </div>

              <span
                className={
                  styles.heroMeta
                }
              >
                {
                  site.person
                }
                {" / "}
                {
                  site.location
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
                data-motion-about-hero-piece="title"
              >
                {
                  copy.hero
                    .headingLine1
                }

                <br />

                {
                  copy.hero
                    .headingLine2
                }

                <span>
                  .
                </span>
              </h1>

              <div
                className={
                  styles.heroStatement
                }
                data-motion-about-hero-piece="statement"
              >
                <p>
                  {
                    copy.hero
                      .statement
                  }
                </p>

                <span>
                  {
                    copy.hero
                      .roles
                  }
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.profile
          }
        >
          <div className="site-container">
            <div
              className={
                styles.profileGrid
              }
            >
              <div
                className={
                  styles.portraitColumn
                }
                data-motion-scroll="about-portrait"
              >
                <AboutIdentityPortrait
                  nameLabel={
                    copy.profile
                      .name
                  }
                  identityLabel={
                    copy.profile
                      .identity
                  }
                  basedInLabel={
                    copy.profile
                      .basedIn
                  }
                />
              </div>

              <div
                className={
                  styles.story
                }
                data-motion-scroll="about-story"
              >
                <div
                  className={
                    styles.storyLabel
                  }
                  data-motion-piece="label"
                >
                  <span
                    className={
                      styles.dot
                    }
                  />

                  <span>
                    {
                      copy.profile
                        .storyLabel
                    }
                  </span>
                </div>

                <h2
                  data-motion-piece="title"
                >
                  {
                    copy.profile
                      .headingLine1
                  }

                  <br />

                  {
                    copy.profile
                      .headingLine2
                  }

                  <br />

                  {
                    copy.profile
                      .headingLine3
                  }

                  <br />

                  {
                    copy.profile
                      .headingLine4
                  }{" "}

                  <em>
                    {
                      copy.profile
                        .headingEmphasis
                    }
                  </em>
                </h2>

                <div
                  className={
                    styles.storyCopy
                  }
                  data-motion-piece="copy"
                >
                  {copy.profile
                    .paragraphs
                    .map(
                      (
                        paragraph,
                      ) => (
                        <p
                          key={
                            paragraph
                          }
                        >
                          {
                            paragraph
                          }
                        </p>
                      ),
                    )}
                </div>

                <div
                  className={
                    styles.cvAccess
                  }
                >
                  <span>
                    {
                      copy.profile
                        .professionalProfile
                    }
                  </span>

                  <LocaleLink
                    href="/cv"
                    className={
                      styles.cvLink
                    }
                    data-about-magnetic-link="compact"
                  >
                    {
                      copy.profile
                        .viewCv
                    }

                    <span
                      aria-hidden="true"
                      data-about-magnetic-arrow
                    >
                      ↗
                    </span>
                  </LocaleLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.approach
          }
        >
          <div className="site-container">
            <div
              className={
                styles.approachHeader
              }
              data-motion-scroll="about-approach-header"
            >
              <div
                className={
                  styles.approachLabel
                }
                data-motion-piece="label"
              >
                <span
                  className={
                    styles.darkDot
                  }
                />

                <span>
                  {
                    copy.approach
                      .label
                  }
                </span>
              </div>

              <h2
                data-motion-piece="title"
              >
                {
                  copy.approach
                    .headingLine1
                }

                <br />

                {
                  copy.approach
                    .headingLine2
                }

                <span>
                  .
                </span>
              </h2>
            </div>

            <div
              className={
                styles.principles
              }
            >
              {copy.approach
                .principles
                .map(
                  (
                    principle,
                  ) => (
                    <article
                      className={
                        styles.principle
                      }
                      key={
                        principle.number
                      }
                      data-motion-scroll="about-principle"
                      data-about-interactive-row="principle"
                      data-about-row-active="false"
                    >
                      <span
                        className={
                          styles
                            .principleNumber
                        }
                        data-about-row-number
                      >
                        {
                          principle.number
                        }
                      </span>

                      <h3
                        data-about-row-title
                      >
                        {
                          principle.title
                        }
                      </h3>

                      <p
                        data-about-row-copy
                      >
                        {
                          principle.description
                        }
                      </p>
                    </article>
                  ),
                )}
            </div>
          </div>
        </section>

        <section
          className={
            styles.disciplines
          }
        >
          <div className="site-container">
            <div
              className={
                styles.disciplinesHeader
              }
              data-motion-scroll="about-disciplines-header"
            >
              <div
                className={
                  styles.label
                }
                data-motion-piece="label"
              >
                <span
                  className={
                    styles.dot
                  }
                />

                <span>
                  {
                    copy.disciplines
                      .label
                  }
                </span>
              </div>

              <p
                data-motion-piece="title"
              >
                {
                  copy.disciplines
                    .introLine1
                }

                <br />

                {
                  copy.disciplines
                    .introLine2
                }
              </p>
            </div>

            <div
              className={
                styles.disciplineList
              }
            >
              {disciplines.map(
                (
                  discipline,
                ) => {
                  const content =
                    copy
                      .disciplines
                      .items[
                        discipline.key
                      ];

                  return (
                    <article
                      className={
                        styles.discipline
                      }
                      key={
                        discipline.number
                      }
                      data-motion-scroll="about-discipline"
                      data-about-interactive-row="discipline"
                      data-about-row-active="false"
                    >
                      <span
                        className={
                          styles
                            .disciplineNumber
                        }
                        data-about-row-number
                      >
                        {
                          discipline.number
                        }
                      </span>

                      <div
                        className={
                          styles
                            .disciplineMain
                        }
                        data-about-row-title
                      >
                        <h2>
                          {
                            content.title
                          }
                        </h2>

                        <p
                          data-about-row-copy
                        >
                          {
                            content.description
                          }
                        </p>
                      </div>

                      <div
                        className={
                          styles
                            .disciplineItems
                        }
                        data-about-row-items
                      >
                        {discipline.items.map(
                          (
                            item,
                          ) => (
                            <span
                              key={
                                item
                              }
                            >
                              {
                                item
                              }
                            </span>
                          ),
                        )}
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </div>
        </section>

        <section
          className={
            styles.closing
          }
        >
          <div className="site-container">
            <div
              className={
                styles.closingGrid
              }
              data-motion-scroll="about-closing"
            >
              <div
                className={
                  styles.closingLabel
                }
                data-motion-piece="label"
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
                data-motion-piece="main"
              >
                <p>
                  {
                    copy.closing
                      .line1
                  }

                  <br />

                  {
                    copy.closing
                      .line2
                  }

                  <span>
                    .
                  </span>
                </p>

                <LocaleLink
                  href="/work"
                  className={
                    styles.closingLink
                  }
                  data-about-magnetic-link="closing"
                >
                  {
                    copy.closing
                      .action
                  }

                  <span
                    data-about-magnetic-arrow
                  >
                    ↗
                  </span>
                </LocaleLink>
              </div>
            </div>
          </div>
        </section>

        <AboutInteractionPolish />
      </main>
    </>
  );
}

export default function AboutPage() {
  return (
    <AboutPageContent
      locale="en"
    />
  );
}