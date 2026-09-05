"use client";

import {
  useEffect,
} from "react";

import styles from "./HomeSectionChoreography.module.css";

const SECTION_IDS = [
  "work",
  "capabilities",
  "about",
  "playground",
  "contact",
] as const;

type SectionState = {
  section: HTMLElement;
  order: number;
};

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

function smoothstep(
  value: number,
) {
  const t =
    clamp(
      value,
      0,
      1,
    );

  return (
    t *
    t *
    (
      3 -
      2 *
        t
    )
  );
}

function setSectionRestState(
  state: SectionState,
) {
  state.section.style.setProperty(
    "--home-choreo-y",
    "0px",
  );

  state.section.style.setProperty(
    "--home-choreo-scale",
    "1",
  );

  state.section.style.setProperty(
    "--home-choreo-rule-opacity",
    "0",
  );

  state.section.style.setProperty(
    "--home-choreo-rule-scale",
    "0",
  );
}

export default function HomeSectionChoreography() {
  useEffect(() => {
    const page =
      document.querySelector<HTMLElement>(
        '[data-motion-page="home"]',
      );

    if (!page) {
      return;
    }

    const states =
      SECTION_IDS
        .map(
          (
            id,
            order,
          ): SectionState | null => {
            const section =
              document.getElementById(
                id,
              );

            if (!section) {
              return null;
            }

            section.dataset.homeChoreoSection =
              "true";

            section.dataset.homeChoreoOrder =
              String(
                order,
              );

            section.dataset.homeChoreoActive =
              "false";

            setSectionRestState({
              section,
              order,
            });

            return {
              section,
              order,
            };
          },
        )
        .filter(
          (
            state,
          ): state is SectionState =>
            state !== null,
        );

    if (
      states.length ===
      0
    ) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const compactLayout =
      window.matchMedia(
        "(max-width: 960px)",
      );

    let frameId =
      0;

    let destroyed =
      false;

    function resetAll() {
      states.forEach(
        (
          state,
        ) => {
          setSectionRestState(
            state,
          );

          state.section.dataset.homeChoreoActive =
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
       * Mobile / tablet gets its own
       * motion pass later.
       *
       * Don't force desktop choreography
       * into stacked layouts.
       */
      if (
        reducedMotion.matches ||
        compactLayout.matches
      ) {
        resetAll();

        return;
      }

      const viewportHeight =
        Math.max(
          window.innerHeight,
          1,
        );

      /*
       * We treat roughly the middle-lower
       * viewport as the "handoff stage".
       */
      const focusLine =
        viewportHeight *
        0.52;

      const rectangles =
        states.map(
          (
            state,
          ) =>
            state.section.getBoundingClientRect(),
        );

      /*
       * =========================
       * ACTIVE SECTION
       * =========================
       */

      let nearestIndex =
        0;

      let nearestDistance =
        Number.POSITIVE_INFINITY;

      rectangles.forEach(
        (
          rect,
          index,
        ) => {
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
        },
      );

      /*
       * =========================
       * SECTION HANDOFFS
       * =========================
       */

      states.forEach(
        (
          state,
          index,
        ) => {
          const rect =
            rectangles[
              index
            ];

          /*
           * Incoming progress:
           *
           * 0 when section top is still
           * close to bottom of viewport.
           *
           * 1 once the section has firmly
           * entered the visual stage.
           */
          const enterStart =
            viewportHeight *
            0.94;

          const enterEnd =
            viewportHeight *
            0.4;

          const rawIncoming =
            (
              enterStart -
              rect.top
            ) /
            Math.max(
              enterStart -
                enterEnd,
              1,
            );

          const incoming =
            smoothstep(
              rawIncoming,
            );

          /*
           * Outgoing progress is driven
           * by the NEXT section.
           *
           * This is the key:
           *
           * current scene doesn't move
           * because of arbitrary scrollY;
           * it reacts because the next
           * scene is arriving.
           */
          let outgoing =
            0;

          if (
            index <
            rectangles.length -
              1
          ) {
            const nextRect =
              rectangles[
                index +
                1
              ];

            const handoffStart =
              viewportHeight *
              0.9;

            const handoffEnd =
              viewportHeight *
              0.42;

            const rawOutgoing =
              (
                handoffStart -
                nextRect.top
              ) /
              Math.max(
                handoffStart -
                  handoffEnd,
                1,
              );

            outgoing =
              smoothstep(
                rawOutgoing,
              );
          }

          /*
           * =========================
           * CONTENT POSITION
           * =========================
           *
           * Incoming section settles upward.
           *
           * Outgoing section gets gently
           * pulled up as next one enters.
           *
           * No opacity changes.
           */

          const incomingTravel =
            17;

          const outgoingTravel =
            10;

          const y =
            (
              1 -
              incoming
            ) *
              incomingTravel -
            outgoing *
              outgoingTravel;

          /*
           * Extremely small scale movement.
           *
           * Enough to create depth,
           * not enough to look like
           * a card zoom animation.
           */

          const incomingScale =
            0.997 +
            incoming *
              0.003;

          const scale =
            incomingScale -
            outgoing *
              0.0018;

          /*
           * =========================
           * BOUNDARY RULE
           * =========================
           *
           * Short accent line appears
           * only DURING the handoff.
           *
           * It grows, peaks, then
           * disappears once next section
           * has fully taken the stage.
           */

          const ruleOpacity =
            Math.sin(
              incoming *
                Math.PI,
            ) *
            0.72;

          const ruleScale =
            clamp(
              incoming *
                1.35,
              0,
              1,
            );

          state.section.style.setProperty(
            "--home-choreo-y",
            `${y.toFixed(
              3,
            )}px`,
          );

          state.section.style.setProperty(
            "--home-choreo-scale",
            scale.toFixed(
              5,
            ),
          );

          state.section.style.setProperty(
            "--home-choreo-rule-opacity",
            Math.max(
              0,
              ruleOpacity,
            ).toFixed(
              4,
            ),
          );

          state.section.style.setProperty(
            "--home-choreo-rule-scale",
            ruleScale.toFixed(
              4,
            ),
          );

          state.section.dataset.homeChoreoActive =
            index ===
            nearestIndex
              ? "true"
              : "false";
        },
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

    compactLayout.addEventListener(
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

    states.forEach(
      (
        state,
      ) => {
        resizeObserver?.observe(
          state.section,
        );
      },
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

      compactLayout.removeEventListener(
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

      states.forEach(
        (
          state,
        ) => {
          delete state.section.dataset
            .homeChoreoSection;

          delete state.section.dataset
            .homeChoreoOrder;

          delete state.section.dataset
            .homeChoreoActive;

          [
            "--home-choreo-y",
            "--home-choreo-scale",
            "--home-choreo-rule-opacity",
            "--home-choreo-rule-scale",
          ].forEach(
            (
              property,
            ) => {
              state.section.style.removeProperty(
                property,
              );
            },
          );
        },
      );
    };
  }, []);

  return (
    <span
      className={
        styles.mount
      }
      aria-hidden="true"
    />
  );
}