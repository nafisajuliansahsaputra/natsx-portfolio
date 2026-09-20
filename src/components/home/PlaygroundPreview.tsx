import Link from "next/link";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import PlaygroundPreviewLab from "./PlaygroundPreviewLab";

import styles from "./PlaygroundPreview.module.css";

type PlaygroundPreviewProps = {
  locale: Locale;
};

const experiments = [
  {
    number: "01",
    title: "Kinetic Type",
  },
  {
    number: "02",
    title: "Magnetic Field",
  },
  {
    number: "03",
    title: "Spatial Composition",
  },
  {
    number: "04",
    title: "Break the Grid",
  },
] as const;

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
      data-motion-scroll="playground-preview"
    >
      <div className="site-container">
        <header
          className={
            styles.header
          }
          data-motion-scroll="home-playground-header"
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
                styles.headerRight
              }
              data-motion-piece="copy"
            >
              <p>
                {
                  copy.description
                }
              </p>

              <Link
                href={localizePath("/playground", locale)}
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
              </Link>
            </div>
          </div>
        </header>

        <Link
          href={localizePath("/playground", locale)}
          className={
            styles.labLink
          }
          aria-label={
            copy.explore
          }
        >
          <PlaygroundPreviewLab />
        </Link>

        <div
          className={
            styles.experimentList
          }
        >
          {experiments.map(
            (
              experiment,
            ) => (
              <Link
                href={localizePath("/playground", locale)}
                className={
                  styles.experiment
                }
                key={
                  experiment.number
                }
                data-motion-scroll="home-playground-item"
              >
                <span
                  className={
                    styles.number
                  }
                  data-motion-piece="number"
                >
                  {
                    experiment.number
                  }
                </span>

                <span
                  className={
                    styles.experimentTitle
                  }
                  data-motion-piece="title"
                >
                  {
                    experiment.title
                  }
                </span>

                <span
                  className={
                    styles.arrow
                  }
                  aria-hidden="true"
                  data-motion-piece="arrow"
                >
                  ↗
                </span>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}