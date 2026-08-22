import LocaleLink from "@/components/i18n/LocaleLink";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  playgroundItems,
  type PlaygroundVisual,
} from "@/data/playground";

import type {
  Locale,
} from "@/i18n/config";

import {
  getPlaygroundMessages,
} from "@/i18n/playground-messages";

import {
  createPageMetadata,
} from "@/lib/page-metadata";

import styles from "./Playground.module.css";

const description =
  "A collection of experiments, visual studies, motion, typography, and creative explorations by NATSX.";

export const metadata =
  createPageMetadata({
    title:
      "Playground",

    description,

    path:
      "/playground",
  });

function ExperimentVisual({
  type,
}: {
  type: PlaygroundVisual;
}) {
  if (
    type ===
    "generative"
  ) {
    return (
      <div
        className={`${styles.visual} ${styles.generativeVisual}`}
      >
        <div
          className={
            styles.generativeGrid
          }
        />

        <div
          className={
            styles.generativeCircle
          }
        />

        <div
          className={
            styles.generativeSquare
          }
        />

        <span
          className={
            styles.visualIndex
          }
        >
          NATSX / 01
        </span>

        <span
          className={
            styles.visualPlus
          }
        >
          +
        </span>
      </div>
    );
  }

  if (
    type ===
    "motion"
  ) {
    return (
      <div
        className={`${styles.visual} ${styles.motionVisual}`}
      >
        <div
          className={
            styles.motionWord
          }
        >
          <span>
            MO
          </span>

          <span>
            VE
          </span>
        </div>

        <span
          className={
            styles.motionMeta
          }
        >
          TYPE
          <br />
          IN
          <br />
          MOTION
        </span>

        <div
          className={
            styles.motionLine
          }
        />
      </div>
    );
  }

  if (
    type ===
    "form"
  ) {
    return (
      <div
        className={`${styles.visual} ${styles.formVisual}`}
      >
        <div
          className={
            styles.formCircleLarge
          }
        />

        <div
          className={
            styles.formCircleSmall
          }
        />

        <div
          className={
            styles.formBlock
          }
        />

        <span
          className={
            styles.formLabel
          }
        >
          FORM
          <br />
          STUDY
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.visual} ${styles.posterVisual}`}
    >
      <div
        className={
          styles.posterTop
        }
      >
        <span>
          NATSX
        </span>

        <span>
          04 / PLAY
        </span>
      </div>

      <div
        className={
          styles.posterWords
        }
      >
        <span>
          MAKE
        </span>

        <span>
          TRY
        </span>

        <span>
          REPEAT
        </span>
      </div>

      <div
        className={
          styles.posterBottom
        }
      >
        <span>
          VISUAL EXPERIMENT
        </span>

        <span>
          2026
        </span>
      </div>
    </div>
  );
}

export function PlaygroundPageContent({
  locale,
}: {
  locale: Locale;
}) {
  const copy =
    getPlaygroundMessages(
      locale,
    );

  const experimentCount =
    String(
      playgroundItems.length,
    ).padStart(
      2,
      "0",
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
        data-motion-page="playground"
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
              data-motion-playground-hero-piece="top"
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
                  styles.heroMeta
                }
              >
                {
                  copy.hero.meta
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
                data-motion-playground-hero-piece="title"
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
                  styles.heroIntro
                }
                data-motion-playground-hero-piece="intro"
              >
                <p>
                  {
                    copy.hero
                      .description
                  }
                </p>

                <span>
                  {
                    copy.hero
                      .noteLine1
                  }

                  <br />

                  {
                    copy.hero
                      .noteLine2
                  }
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.gallery
          }
        >
          <div className="site-container">
            <div
              className={
                styles.galleryHeader
              }
              data-motion-scroll="playground-gallery-header"
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
                    copy.gallery
                      .label
                  }
                </span>
              </div>

              <span
                className={
                  styles.galleryCount
                }
              >
                {
                  experimentCount
                }
                {" / "}
                {
                  copy.gallery
                    .collection
                }
              </span>
            </div>

            <div
              className={
                styles.galleryGrid
              }
            >
              {playgroundItems.map(
                (
                  experiment,
                ) => (
                  <article
                    className={
                      styles.experiment
                    }
                    key={
                      experiment.slug
                    }
                    data-motion-scroll="playground-experiment"
                  >
                    <div
                      className={
                        styles.visualWrap
                      }
                      data-motion-piece="visual"
                    >
                      <ExperimentVisual
                        type={
                          experiment.visual
                        }
                      />
                    </div>

                    <div
                      className={
                        styles.experimentInfo
                      }
                      data-motion-piece="info"
                    >
                      <div
                        className={
                          styles.experimentHeading
                        }
                      >
                        <span>
                          {
                            experiment.number
                          }
                        </span>

                        <h2>
                          {
                            experiment.title
                          }
                        </h2>
                      </div>

                      <div
                        className={
                          styles.experimentMeta
                        }
                      >
                        <span>
                          {
                            experiment.category
                          }
                        </span>

                        <p>
                          {
                            experiment.description
                          }
                        </p>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          className={
            styles.manifesto
          }
        >
          <div className="site-container">
            <div
              className={
                styles.manifestoGrid
              }
              data-motion-scroll="playground-manifesto"
            >
              <div
                className={
                  styles.manifestoLabel
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
                    copy.manifesto
                      .label
                  }
                </span>
              </div>

              <div
                className={
                  styles.manifestoMain
                }
              >
                <h2
                  data-motion-piece="title"
                >
                  {
                    copy.manifesto
                      .headingLine1
                  }

                  <br />

                  {
                    copy.manifesto
                      .headingLine2
                  }

                  <br />

                  {
                    copy.manifesto
                      .headingLine3
                  }

                  <span>
                    .
                  </span>
                </h2>

                <div
                  className={
                    styles.manifestoCopy
                  }
                  data-motion-piece="copy"
                >
                  <p>
                    {
                      copy.manifesto
                        .paragraph1
                    }
                  </p>

                  <p>
                    {
                      copy.manifesto
                        .paragraph2
                    }
                  </p>
                </div>
              </div>
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
              data-motion-scroll="playground-closing"
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
                      .headingLine1
                  }

                  <br />

                  {
                    copy.closing
                      .headingLine2
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
                >
                  {
                    copy.closing
                      .action
                  }

                  <span>
                    ↗
                  </span>
                </LocaleLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default function PlaygroundPage() {
  return (
    <PlaygroundPageContent
      locale="en"
    />
  );
}