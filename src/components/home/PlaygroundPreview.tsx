"use client";

import {
  useRef,
} from "react";

import type {
  PointerEvent as ReactPointerEvent,
} from "react";

import LocaleLink from "@/components/i18n/LocaleLink";

import type {
  Locale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

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

function prefersReducedMotion() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

export default function PlaygroundPreview({
  locale,
}: PlaygroundPreviewProps) {
  const copy =
    getHomeMessages(
      locale,
    ).playground;

  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      prefersReducedMotion()
    ) {
      return;
    }

    const element =
      visualRef.current;

    if (!element) {
      return;
    }

    const rect =
      element.getBoundingClientRect();

    const x =
      (
        (
          event.clientX -
          rect.left
        ) /
          rect.width -
        0.5
      ) *
      2;

    const y =
      (
        (
          event.clientY -
          rect.top
        ) /
          rect.height -
        0.5
      ) *
      2;

    element.style.setProperty(
      "--lab-x",
      `${x * 24}px`,
    );

    element.style.setProperty(
      "--lab-y",
      `${y * 18}px`,
    );

    element.style.setProperty(
      "--lab-x-reverse",
      `${x * -18}px`,
    );

    element.style.setProperty(
      "--lab-y-reverse",
      `${y * -12}px`,
    );

    element.style.setProperty(
      "--lab-rotate",
      `${x * 2.2}deg`,
    );

    element.style.setProperty(
      "--cursor-x",
      `${
        event.clientX -
        rect.left
      }px`,
    );

    element.style.setProperty(
      "--cursor-y",
      `${
        event.clientY -
        rect.top
      }px`,
    );
  }

  function resetPointer() {
    const element =
      visualRef.current;

    if (!element) {
      return;
    }

    [
      "--lab-x",
      "--lab-y",
      "--lab-x-reverse",
      "--lab-y-reverse",
      "--lab-rotate",
      "--cursor-x",
      "--cursor-y",
    ].forEach(
      (
        property,
      ) => {
        element.style.removeProperty(
          property,
        );
      },
    );
  }

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

        <LocaleLink
          href="/playground"
          className={
            styles.labLink
          }
          aria-label={
            copy.explore
          }
        >
          <div
            ref={
              visualRef
            }
            className={
              styles.lab
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerLeave={
              resetPointer
            }
          >
            <div
              className={
                styles.labTop
              }
            >
              <span>
                NATSX / LIVE LAB
              </span>

              <span>
                04 EXPERIMENTS
              </span>
            </div>

            <div
              className={
                styles.labType
              }
              aria-hidden="true"
            >
              <span
                className={
                  styles.wordPlay
                }
              >
                PLAY
              </span>

              <span
                className={
                  styles.wordWith
                }
              >
                WITH
              </span>

              <span
                className={
                  styles.wordIdeas
                }
              >
                IDEAS
              </span>
            </div>

            <div
              className={
                styles.labField
              }
              aria-hidden="true"
            >
              {Array.from(
                {
                  length: 24,
                },
                (
                  _,
                  index,
                ) => (
                  <span
                    key={
                      index
                    }
                  />
                ),
              )}
            </div>

            <div
              className={
                styles.cursor
              }
              aria-hidden="true"
            />

            <div
              className={
                styles.labBottom
              }
            >
              <span>
                MOVE / HOVER / INTERRUPT
              </span>

              <span>
                OPEN LAB ↗
              </span>
            </div>
          </div>
        </LocaleLink>

        <div
          className={
            styles.experimentList
          }
        >
          {experiments.map(
            (
              experiment,
            ) => (
              <LocaleLink
                href="/playground"
                className={
                  styles.experiment
                }
                key={
                  experiment.number
                }
              >
                <span
                  className={
                    styles.number
                  }
                >
                  {
                    experiment.number
                  }
                </span>

                <span
                  className={
                    styles.experimentTitle
                  }
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
                >
                  ↗
                </span>
              </LocaleLink>
            ),
          )}
        </div>
      </div>
    </section>
  );
}