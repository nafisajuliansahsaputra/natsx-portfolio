import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  playgroundItems,
  type PlaygroundVisual,
} from "@/data/playground";

import styles from "./Playground.module.css";

import {
  createPageMetadata,
} from "@/lib/page-metadata";

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
  if (type === "generative") {
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
          className={styles.visualIndex}
        >
          NATSX / 01
        </span>

        <span
          className={styles.visualPlus}
        >
          +
        </span>
      </div>
    );
  }

  if (type === "motion") {
    return (
      <div
        className={`${styles.visual} ${styles.motionVisual}`}
      >
        <div
          className={styles.motionWord}
        >
          <span>MO</span>
          <span>VE</span>
        </div>

        <span
          className={styles.motionMeta}
        >
          TYPE
          <br />
          IN
          <br />
          MOTION
        </span>

        <div
          className={styles.motionLine}
        />
      </div>
    );
  }

  if (type === "form") {
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
          className={styles.formBlock}
        />

        <span
          className={styles.formLabel}
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
        className={styles.posterTop}
      >
        <span>NATSX</span>

        <span>
          04 / PLAY
        </span>
      </div>

      <div
        className={styles.posterWords}
      >
        <span>MAKE</span>
        <span>TRY</span>
        <span>REPEAT</span>
      </div>

      <div
        className={
          styles.posterBottom
        }
      >
        <span>
          VISUAL EXPERIMENT
        </span>

        <span>2026</span>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  const experimentCount = String(
    playgroundItems.length,
  ).padStart(2, "0");

  return (
    <>
      <SiteHeader />

<main
  id="main-content"
  tabIndex={-1}
  className={styles.page}
  data-motion-page="playground"
>
        {/* =========================
            HERO
        ========================= */}

        <section className={styles.hero}>
          <div className="site-container">
            <div
              className={styles.heroTop}
              data-motion-playground-hero-piece="top"
            >
              <div
                className={styles.label}
              >
                <span
                  className={styles.dot}
                />

                <span>
                  Playground /
                  Experiments
                </span>
              </div>

              <span
                className={
                  styles.heroMeta
                }
              >
                Curious /
                Uncommissioned /
                Ongoing
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
                Where ideas
                <br />
                get to wander
                <span>.</span>
              </h1>

              <div
                className={
                  styles.heroIntro
                }
                data-motion-playground-hero-piece="intro"
              >
                <p>
                  A space for
                  experiments, visual
                  studies, motion,
                  typography, and ideas
                  explored outside
                  structured project
                  work.
                </p>

                <span>
                  No fixed outcome.
                  <br />
                  Just something worth
                  trying.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            GALLERY
        ========================= */}

        <section
          className={styles.gallery}
        >
          <div className="site-container">
            <div
              className={
                styles.galleryHeader
              }
              data-motion-scroll="playground-gallery-header"
            >
              <div
                className={styles.label}
              >
                <span
                  className={styles.dot}
                />

                <span>
                  Current Experiments
                </span>
              </div>

              <span
                className={
                  styles.galleryCount
                }
              >
                {experimentCount} /
                Ongoing Collection
              </span>
            </div>

            <div
              className={
                styles.galleryGrid
              }
            >
              {playgroundItems.map(
                (experiment) => (
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

        {/* =========================
            MANIFESTO
        ========================= */}

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
                  Why Playground?
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
                  Not everything
                  <br />
                  needs a brief to be
                  <br />
                  worth making
                  <span>.</span>
                </h2>

                <div
                  className={
                    styles.manifestoCopy
                  }
                  data-motion-piece="copy"
                >
                  <p>
                    Some ideas exist
                    simply because they
                    are interesting
                    enough to explore.
                  </p>

                  <p>
                    The playground is
                    where I can test
                    those ideas, learn
                    something new,
                    break familiar
                    patterns, and
                    occasionally
                    discover something
                    worth carrying into
                    real project work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            CLOSING
        ========================= */}

        <section
          className={styles.closing}
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
                  className={styles.dot}
                />

                <span>
                  Looking for finished
                  work?
                </span>
              </div>

              <div
                className={
                  styles.closingMain
                }
                data-motion-piece="main"
              >
                <p>
                  Experiments are one
                  side.
                  <br />
                  Projects are the other
                  <span>.</span>
                </p>

                <Link
                  href="/work"
                  className={
                    styles.closingLink
                  }
                >
                  Explore selected work

                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}