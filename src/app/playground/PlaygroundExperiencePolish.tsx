"use client";

import {
  useEffect,
  useRef,
} from "react";

import styles from "./PlaygroundExperiencePolish.module.css";

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    Math.max(
      value,
      minimum,
    ),
    maximum,
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

export default function PlaygroundExperiencePolish() {
  const navigatorRef =
    useRef<HTMLDivElement>(
      null,
    );

  const currentRef =
    useRef<HTMLSpanElement>(
      null,
    );

  const totalRef =
    useRef<HTMLSpanElement>(
      null,
    );

  const titleRef =
    useRef<HTMLSpanElement>(
      null,
    );

  const activeIndexRef =
    useRef(
      -1,
    );

  useEffect(() => {
    const page =
      document.querySelector<HTMLElement>(
        '[data-motion-page="playground"]',
      );

    const navigator =
      navigatorRef.current;

    const current =
      currentRef.current;

    const total =
      totalRef.current;

    const title =
      titleRef.current;

    if (
      !page ||
      !navigator ||
      !current ||
      !total ||
      !title
    ) {
      return;
    }

    /*
     * Stable references after guards.
     */
    const navigatorElement =
      navigator;

    const currentElement =
      current;

    const totalElement =
      total;

    const titleElement =
      title;

    const experiments =
      Array.from(
        page.querySelectorAll<HTMLElement>(
          '[data-motion-scroll="playground-experiment"]',
        ),
      );

    if (
      experiments.length ===
      0
    ) {
      return;
    }

    const lab =
      experiments[0]
        .closest<HTMLElement>(
          "section",
        );

    if (!lab) {
      return;
    }

    const labElement =
      lab;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const compact =
      window.matchMedia(
        "(max-width: 960px)",
      );

    let frameId =
      0;

    let destroyed =
      false;

    /*
     * =========================
     * INITIAL SETUP
     * =========================
     */

    experiments.forEach(
      (
        experiment,
        index,
      ) => {
        experiment.dataset.playgroundLabItem =
          "true";

        experiment.dataset.playgroundLabIndex =
          String(
            index,
          );

        experiment.dataset.playgroundLabActive =
          "false";

        experiment.style.setProperty(
          "--playground-depth-meta-y",
          "0px",
        );

        experiment.style.setProperty(
          "--playground-depth-visual-y",
          "0px",
        );

        experiment.style.setProperty(
          "--playground-depth-visual-scale",
          "1",
        );

        experiment.style.setProperty(
          "--playground-focus-strength",
          "0",
        );

        experiment.style.setProperty(
          "--playground-focus-line",
          "0",
        );
      },
    );

    totalElement.textContent =
      formatIndex(
        experiments.length,
      );

    /*
     * Read title directly from existing
     * experiment markup.
     *
     * No duplicated translation data.
     */
    function getExperimentTitle(
      index: number,
    ) {
      return (
        experiments[
          index
        ]
          ?.querySelector(
            "h2",
          )
          ?.textContent
          ?.trim() ||
        "LIVE LAB"
      );
    }

    function setActiveExperiment(
      index: number,
    ) {
      if (
        activeIndexRef.current ===
        index
      ) {
        return;
      }

      activeIndexRef.current =
        index;

      currentElement.textContent =
        formatIndex(
          index +
            1,
        );

      titleElement.textContent =
        getExperimentTitle(
          index,
        );

      experiments.forEach(
        (
          experiment,
          experimentIndex,
        ) => {
          experiment.dataset.playgroundLabActive =
            experimentIndex ===
            index
              ? "true"
              : "false";
        },
      );
    }

    /*
     * =========================
     * RESET
     * =========================
     */

    function resetMotion() {
      experiments.forEach(
        (
          experiment,
        ) => {
          experiment.style.setProperty(
            "--playground-depth-meta-y",
            "0px",
          );

          experiment.style.setProperty(
            "--playground-depth-visual-y",
            "0px",
          );

          experiment.style.setProperty(
            "--playground-depth-visual-scale",
            "1",
          );

          experiment.style.setProperty(
            "--playground-focus-strength",
            "0",
          );

          experiment.style.setProperty(
            "--playground-focus-line",
            "0",
          );
        },
      );

      navigatorElement.dataset.labVisible =
        "false";
    }

    /*
     * =========================
     * SCROLL MEASUREMENT
     * =========================
     */

    function measure() {
      frameId =
        0;

      if (
        destroyed
      ) {
        return;
      }

      if (
        reducedMotion.matches ||
        compact.matches
      ) {
        resetMotion();

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

      const labRect =
        labElement.getBoundingClientRect();

      /*
       * Navigator only exists while
       * Live Lab itself occupies viewport.
       */
      const labVisible =
        labRect.top <
          viewportHeight *
            0.78 &&
        labRect.bottom >
          viewportHeight *
            0.22;

      navigatorElement.dataset.labVisible =
        labVisible
          ? "true"
          : "false";

      /*
       * =========================
       * LAB PROGRESS
       * =========================
       */

      const progressTravel =
        Math.max(
          labRect.height -
            viewportHeight *
              0.42,
          1,
        );

      const labProgress =
        clamp(
          (
            focusLine -
            labRect.top
          ) /
            progressTravel,
          0,
          1,
        );

      navigatorElement.style.setProperty(
        "--playground-lab-progress",
        labProgress.toFixed(
          5,
        ),
      );

      /*
       * =========================
       * FIND ACTIVE EXPERIMENT
       * =========================
       */

      let nearestIndex =
        0;

      let nearestDistance =
        Number.POSITIVE_INFINITY;

      experiments.forEach(
        (
          experiment,
          index,
        ) => {
          const rect =
            experiment.getBoundingClientRect();

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
           * -1 = above focus line
           *  0 = active center
           *  1 = below focus line
           */
          const normalized =
            clamp(
              (
                center -
                focusLine
              ) /
                (
                  viewportHeight *
                  0.95
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
           * DEPTH
           * =========================
           *
           * Metadata + interactive visual
           * move at different rates.
           *
           * Tiny travel only:
           * this is not parallax theatre.
           */

          const metaY =
            normalized *
            8;

          const visualY =
            normalized *
            -16;

          const visualScale =
            0.998 +
            strength *
              0.002;

          /*
           * Accent line peaks around
           * center of viewport.
           */
          const line =
            Math.pow(
              strength,
              1.6,
            );

          experiment.style.setProperty(
            "--playground-depth-meta-y",
            `${metaY.toFixed(
              3,
            )}px`,
          );

          experiment.style.setProperty(
            "--playground-depth-visual-y",
            `${visualY.toFixed(
              3,
            )}px`,
          );

          experiment.style.setProperty(
            "--playground-depth-visual-scale",
            visualScale.toFixed(
              5,
            ),
          );

          experiment.style.setProperty(
            "--playground-focus-strength",
            strength.toFixed(
              4,
            ),
          );

          experiment.style.setProperty(
            "--playground-focus-line",
            line.toFixed(
              4,
            ),
          );
        },
      );

      setActiveExperiment(
        nearestIndex,
      );
    }

    function requestMeasure() {
      if (
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

    /*
     * =========================
     * EVENTS
     * =========================
     */

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

    compact.addEventListener(
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
      labElement,
    );

    experiments.forEach(
      (
        experiment,
      ) => {
        resizeObserver?.observe(
          experiment,
        );
      },
    );

    setActiveExperiment(
      0,
    );

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

      compact.removeEventListener(
        "change",
        requestMeasure,
      );

      resizeObserver?.disconnect();

      if (
        frameId !==
        0
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }

      navigatorElement.style.removeProperty(
        "--playground-lab-progress",
      );

      delete navigatorElement.dataset
        .labVisible;

      experiments.forEach(
        (
          experiment,
        ) => {
          delete experiment.dataset
            .playgroundLabItem;

          delete experiment.dataset
            .playgroundLabIndex;

          delete experiment.dataset
            .playgroundLabActive;

          [
            "--playground-depth-meta-y",
            "--playground-depth-visual-y",
            "--playground-depth-visual-scale",
            "--playground-focus-strength",
            "--playground-focus-line",
          ].forEach(
            (
              property,
            ) => {
              experiment.style.removeProperty(
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
        navigatorRef
      }
      className={
        styles.navigator
      }
      data-lab-visible="false"
      aria-hidden="true"
    >
      <div
        className={
          styles.counter
        }
      >
        <span
          ref={
            currentRef
          }
        >
          00
        </span>

        <span>
          /
        </span>

        <span
          ref={
            totalRef
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
        ref={
          titleRef
        }
        className={
          styles.title
        }
      >
        LIVE LAB
      </span>
    </div>
  );
}