"use client";

import {
  useEffect,
  useRef,
} from "react";

import styles from "./ProjectNarrativeMotion.module.css";

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    Math.max(
      value,
      min,
    ),
    max,
  );
}

function formatIndex(
  value: number,
) {
  return String(
    value,
  ).padStart(
    2,
    "0",
  );
}

function resetSectionMotion(
  section: HTMLElement,
) {
  section.style.setProperty(
    "--pd-media-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-media-scale",
    "1",
  );

  section.style.setProperty(
    "--pd-content-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-gallery-a-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-gallery-b-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-metric-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-statement-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-statement-scale",
    "1",
  );

  section.style.setProperty(
    "--pd-quote-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-quote-mark-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-finale-y",
    "0px",
  );

  section.style.setProperty(
    "--pd-section-strength",
    "0",
  );
}

export default function ProjectNarrativeMotion() {
  const indicatorRef =
    useRef<HTMLDivElement>(
      null,
    );

  const currentIndexRef =
    useRef<HTMLSpanElement>(
      null,
    );

  const totalIndexRef =
    useRef<HTMLSpanElement>(
      null,
    );

  const activeIndexRef =
    useRef(
      -1,
    );

  useEffect(() => {
    const story =
      document.querySelector<HTMLElement>(
        "[data-project-story]",
      );

    const indicator =
      indicatorRef.current;

    const currentIndex =
      currentIndexRef.current;

    const totalIndex =
      totalIndexRef.current;

    if (
      !story ||
      !indicator ||
      !currentIndex ||
      !totalIndex
    ) {
      return;
    }

    /*
     * Stable aliases after null guards.
     *
     * TypeScript tidak lagi kehilangan
     * narrowing ketika element dipakai
     * dari callback scroll / observer.
     */
    const storyElement =
      story;

    const indicatorElement =
      indicator;

    const currentIndexElement =
      currentIndex;

    const totalIndexElement =
      totalIndex;

    const sections =
      Array.from(
        storyElement.querySelectorAll<HTMLElement>(
          ":scope > section[data-motion-scroll]",
        ),
      );

    if (
      sections.length ===
      0
    ) {
      indicatorElement.dataset.storyVisible =
        "false";

      currentIndexElement.textContent =
        "00";

      totalIndexElement.textContent =
        "00";

      return;
    }

    /*
     * No React setState is needed here.
     *
     * This controller manages an external
     * DOM animation system, so updating
     * the small decorative counter through
     * refs avoids unnecessary renders and
     * satisfies react-hooks/set-state-in-effect.
     */
    totalIndexElement.textContent =
      formatIndex(
        sections.length,
      );

    currentIndexElement.textContent =
      "01";

    activeIndexRef.current =
      0;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const mobile =
      window.matchMedia(
        "(max-width: 700px)",
      );

    let frameId =
      0;

    let destroyed =
      false;

    let storyActive =
      typeof IntersectionObserver ===
      "undefined";

    let mediaPreloadObserver:
      IntersectionObserver |
      null =
      null;

    if (
      typeof IntersectionObserver !==
      "undefined"
    ) {
      mediaPreloadObserver =
        new IntersectionObserver(
            (
              entries,
            ) => {
              entries.forEach(
                (
                  entry,
                ) => {
                  if (
                    !entry.isIntersecting
                  ) {
                    return;
                  }

                  const section =
                    entry.target as HTMLElement;

                  section
                    .querySelectorAll<HTMLImageElement>(
                      'img[loading="lazy"]',
                    )
                    .forEach(
                      (
                        image,
                      ) => {
                        image.loading =
                          "eager";
                      },
                    );

                  mediaPreloadObserver
                    ?.unobserve(
                      section,
                    );
                },
              );
            },
            {
              rootMargin:
                `${Math.max(
                  Math.round(
                    window.innerHeight *
                      2,
                  ),
                  1,
                )}px 0px`,

              threshold:
                0,
            },
          );
    }

    if (
      mediaPreloadObserver
    ) {
      sections.forEach(
        (
          section,
        ) => {
          mediaPreloadObserver.observe(
            section,
          );
        },
      );
    } else {
      sections.forEach(
        (
          section,
        ) => {
          section
            .querySelectorAll<HTMLImageElement>(
              'img[loading="lazy"]',
            )
            .forEach(
              (
                image,
              ) => {
                image.loading =
                  "eager";
              },
            );
        },
      );
    }

    sections.forEach(
      (
        section,
        index,
      ) => {
        section.dataset.narrativeSection =
          "true";

        section.dataset.narrativeIndex =
          String(
            index,
          );

        section.dataset.narrativeType =
          section.dataset.motionScroll ||
          "project-section";

        section.dataset.narrativeActive =
          "false";

        resetSectionMotion(
          section,
        );
      },
    );

    function applyZeroState() {
      sections.forEach(
        (
          section,
        ) => {
          resetSectionMotion(
            section,
          );

          section.dataset.narrativeActive =
            "false";
        },
      );
    }

    function measure() {
      frameId =
        0;

      if (
        destroyed
      ) {
        return;
      }

      /*
       * Mobile gets a dedicated pass later.
       * Keep project detail restrained here.
       */
      if (
        reducedMotion.matches ||
        mobile.matches
      ) {
        applyZeroState();

        indicatorElement.dataset.storyVisible =
          "false";

        return;
      }

      const viewportHeight =
        Math.max(
          window.innerHeight,
          1,
        );

      const focusLine =
        viewportHeight *
        0.52;

      const storyRect =
        storyElement.getBoundingClientRect();

      /*
       * =========================
       * WHOLE STORY PROGRESS
       * =========================
       */

      const storyTravel =
        Math.max(
          storyRect.height -
            viewportHeight *
              0.28,
          1,
        );

      const storyProgress =
        clamp(
          (
            focusLine -
            storyRect.top
          ) /
            storyTravel,
          0,
          1,
        );

      indicatorElement.style.setProperty(
        "--project-story-progress",
        storyProgress.toFixed(
          5,
        ),
      );

      const storyVisible =
        storyRect.top <
          viewportHeight *
            0.78 &&
        storyRect.bottom >
          viewportHeight *
            0.22;

      indicatorElement.dataset.storyVisible =
        storyVisible
          ? "true"
          : "false";

      /*
       * =========================
       * ACTIVE CHAPTER
       * =========================
       */

      let nearestIndex =
        0;

      let nearestDistance =
        Number.POSITIVE_INFINITY;

      sections.forEach(
        (
          section,
          index,
        ) => {
          const rect =
            section.getBoundingClientRect();

          const center =
            rect.top +
            rect.height /
              2;

          const distance =
            Math.abs(
              center -
                focusLine,
            );

          if (
            distance <
            nearestDistance
          ) {
            nearestDistance =
              distance;

            nearestIndex =
              index;
          }

          /*
           * -1 = already above viewport
           *  0 = around viewport focus
           *  1 = still below viewport
           */
          const normalized =
            clamp(
              (
                center -
                focusLine
              ) /
                (
                  viewportHeight *
                  0.88
                ),
              -1,
              1,
            );

          const strength =
            clamp(
              1 -
                Math.abs(
                  normalized,
                ),
              0,
              1,
            );

          /*
           * =========================
           * CONTINUOUS DEPTH VALUES
           * =========================
           */

          const mediaY =
            -normalized *
            20;

          const contentY =
            -normalized *
            5;

          const galleryA =
            -normalized *
            17;

          const galleryB =
            -normalized *
            9;

          const metricY =
            -normalized *
            8;

          const statementY =
            -normalized *
            8;

          const statementScale =
            0.994 +
            strength *
              0.006;

          const quoteY =
            -normalized *
            11;

          /*
           * Quote mark counters the
           * blockquote direction.
           */
          const quoteMarkY =
            normalized *
            17;

          const finaleY =
            -normalized *
            22;

          const mediaScale =
            1 +
            strength *
              0.004;

          section.style.setProperty(
            "--pd-media-y",
            `${mediaY.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-media-scale",
            mediaScale.toFixed(
              5,
            ),
          );

          section.style.setProperty(
            "--pd-content-y",
            `${contentY.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-gallery-a-y",
            `${galleryA.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-gallery-b-y",
            `${galleryB.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-metric-y",
            `${metricY.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-statement-y",
            `${statementY.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-statement-scale",
            statementScale.toFixed(
              5,
            ),
          );

          section.style.setProperty(
            "--pd-quote-y",
            `${quoteY.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-quote-mark-y",
            `${quoteMarkY.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-finale-y",
            `${finaleY.toFixed(
              3,
            )}px`,
          );

          section.style.setProperty(
            "--pd-section-strength",
            strength.toFixed(
              4,
            ),
          );
        },
      );

      sections.forEach(
        (
          section,
          index,
        ) => {
          section.dataset.narrativeActive =
            index ===
            nearestIndex
              ? "true"
              : "false";
        },
      );

      /*
       * Update counter only when the
       * actual active chapter changes.
       */
      if (
        activeIndexRef.current !==
        nearestIndex
      ) {
        activeIndexRef.current =
          nearestIndex;

        currentIndexElement.textContent =
          formatIndex(
            nearestIndex +
              1,
          );
      }
    }

    function requestMeasure() {
      if (
        !storyActive ||
        frameId !==
          0
      ) {
        return;
      }

      frameId =
        window.requestAnimationFrame(
          measure,
        );
    }

    const visibilityObserver =
      typeof IntersectionObserver !==
      "undefined"
        ? new IntersectionObserver(
            (
              [
                entry,
              ],
            ) => {
              storyActive =
                Boolean(
                  entry
                    ?.isIntersecting,
                );

              if (
                storyActive
              ) {
                requestMeasure();
              } else {
                indicatorElement.dataset.storyVisible =
                  "false";

                if (
                  frameId !==
                  0
                ) {
                  window.cancelAnimationFrame(
                    frameId,
                  );

                  frameId =
                    0;
                }
              }
            },
            {
              rootMargin:
                "100% 0px 100% 0px",

              threshold:
                0,
            },
          )
        : null;

    visibilityObserver
      ?.observe(
        storyElement,
      );

    window.addEventListener(
      "scroll",
      requestMeasure,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      requestMeasure,
    );

    reducedMotion.addEventListener(
      "change",
      requestMeasure,
    );

    mobile.addEventListener(
      "change",
      requestMeasure,
    );

    const resizeObserver =
      typeof ResizeObserver !==
      "undefined"
        ? new ResizeObserver(
            () => {
              requestMeasure();
            },
          )
        : null;

    resizeObserver?.observe(
      storyElement,
    );

    sections.forEach(
      (
        section,
      ) => {
        resizeObserver?.observe(
          section,
        );
      },
    );

    /*
     * Initial measurement happens
     * on the next frame rather than
     * synchronously mutating React state.
     */
    requestMeasure();

    return () => {
      destroyed =
        true;

      window.removeEventListener(
        "scroll",
        requestMeasure,
      );

      window.removeEventListener(
        "resize",
        requestMeasure,
      );

      reducedMotion.removeEventListener(
        "change",
        requestMeasure,
      );

      mobile.removeEventListener(
        "change",
        requestMeasure,
      );

      resizeObserver?.disconnect();

      visibilityObserver
        ?.disconnect();

      mediaPreloadObserver
        ?.disconnect();

      if (
        frameId !==
        0
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }

      indicatorElement.style.removeProperty(
        "--project-story-progress",
      );

      delete indicatorElement.dataset
        .storyVisible;

      sections.forEach(
        (
          section,
        ) => {
          delete section.dataset
            .narrativeSection;

          delete section.dataset
            .narrativeIndex;

          delete section.dataset
            .narrativeType;

          delete section.dataset
            .narrativeActive;

          [
            "--pd-media-y",
            "--pd-media-scale",
            "--pd-content-y",
            "--pd-gallery-a-y",
            "--pd-gallery-b-y",
            "--pd-metric-y",
            "--pd-statement-y",
            "--pd-statement-scale",
            "--pd-quote-y",
            "--pd-quote-mark-y",
            "--pd-finale-y",
            "--pd-section-strength",
          ].forEach(
            (
              property,
            ) => {
              section.style.removeProperty(
                property,
              );
            },
          );
        },
      );
    };
  }, []);

  return (
    <div
      ref={
        indicatorRef
      }
      className={
        styles.progress
      }
      data-story-visible="false"
      aria-hidden="true"
    >
      <div
        className={
          styles.counter
        }
      >
        <span
          ref={
            currentIndexRef
          }
        >
          00
        </span>

        <span>
          /
        </span>

        <span
          ref={
            totalIndexRef
          }
        >
          00
        </span>
      </div>

      <div
        className={
          styles.track
        }
      >
        <span
          className={
            styles.fill
          }
        />
      </div>

      <span
        className={
          styles.caption
        }
      >
        CASE STUDY
      </span>
    </div>
  );
}