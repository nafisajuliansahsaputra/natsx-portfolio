import LocaleLink from "@/components/i18n/LocaleLink";

import {
  featuredPlaygroundItems,
  type PlaygroundPreviewVisual,
} from "@/data/playground";

import type {
  Locale,
} from "@/i18n/config";

import {
  getPlaygroundExperimentMessages,
} from "@/i18n/playground-messages";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import styles from "./PlaygroundPreview.module.css";

type PlaygroundPreviewProps = {
  locale: Locale;
};

export default function PlaygroundPreview({
  locale,
}: PlaygroundPreviewProps) {
  const copy =
    getHomeMessages(
      locale,
    ).playground;

  return (
    <section
      className={
        styles.section
      }
      id="playground"
    >
      <div className="site-container">
        <header
          className={
            styles.header
          }
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
                copy.sectionLabel
              }
            </span>
          </div>

          <div
            className={
              styles.headerMain
            }
          >
            <h2
              className={
                styles.heading
              }
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
                styles.headerRight
              }
            >
              <p>
                {
                  copy.description
                }
              </p>

              <LocaleLink
                href="/playground"
                className={
                  styles.allLink
                }
              >
                {
                  copy.explore
                }

                <span>
                  ↗
                </span>
              </LocaleLink>
            </div>
          </div>
        </header>

        <div
          className={
            styles.gallery
          }
        >
          {featuredPlaygroundItems.map(
            (
              experiment,
            ) => {
              const localized =
                getPlaygroundExperimentMessages(
                  locale,
                  experiment.slug,
                );

              const title =
                localized?.title ??
                experiment.title;

              const category =
                localized?.category ??
                experiment.category;

              return (
                <article
                  className={`${styles.item} ${
                    styles[
                      `layout_${experiment.preview.layout}`
                    ]
                  }`}
                  key={
                    experiment.slug
                  }
                >
                  <LocaleLink
                    href="/playground"
                    className={
                      styles.visualLink
                    }
                    aria-label={`${copy.experimentAria} ${title}`}
                  >
                    <div
                      className={`${styles.visual} ${
                        styles[
                          `visual_${experiment.preview.visual}`
                        ]
                      }`}
                    >
                      <ExperimentArtwork
                        variant={
                          experiment
                            .preview
                            .visual
                        }
                      />

                      <span
                        className={
                          styles.hoverLabel
                        }
                      >
                        {
                          copy.viewExperiment
                        }{" "}
                        ↗
                      </span>
                    </div>
                  </LocaleLink>

                  <div
                    className={
                      styles.meta
                    }
                  >
                    <div>
                      <span
                        className={
                          styles.number
                        }
                      >
                        {
                          experiment.number
                        }
                      </span>

                      <h3>
                        {
                          title
                        }
                      </h3>
                    </div>

                    <span
                      className={
                        styles.category
                      }
                    >
                      {
                        category
                      }
                    </span>
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

function ExperimentArtwork({
  variant,
}: {
  variant:
    PlaygroundPreviewVisual;
}) {
  if (
    variant ===
    "generative"
  ) {
    return (
      <div
        className={
          styles.generativeArtwork
        }
      >
        <div
          className={
            styles.generativeCircle
          }
        />

        <div
          className={
            styles.generativeGrid
          }
        />

        <span
          className={
            styles.artLabel
          }
        >
          GENERATIVE / 001
        </span>
      </div>
    );
  }

  if (
    variant ===
    "type"
  ) {
    return (
      <div
        className={
          styles.typeArtwork
        }
      >
        <span>N</span>
        <span>A</span>
        <span>T</span>
        <span>S</span>
        <span>X</span>
      </div>
    );
  }

  if (
    variant ===
    "form"
  ) {
    return (
      <div
        className={
          styles.formArtwork
        }
      >
        <div
          className={
            styles.formShape
          }
        />

        <span>
          FORM / STUDY
        </span>
      </div>
    );
  }

  return (
    <div
      className={
        styles.posterArtwork
      }
    >
      <span
        className={
          styles.posterSmall
        }
      >
        KEEP
      </span>

      <strong>
        MAKING
        <br />
        THINGS.
      </strong>

      <span
        className={
          styles.posterIndex
        }
      >
        04 / NATSX
      </span>
    </div>
  );
}