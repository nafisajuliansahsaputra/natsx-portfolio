"use client";

import {
  useEffect,
} from "react";

import styles from "./AboutInteractionPolish.module.css";

type RowState = {
  element: HTMLElement;

  currentX: number;
  currentY: number;
  currentHover: number;

  targetX: number;
  targetY: number;
  targetHover: number;

  pointerActive: boolean;
  focusActive: boolean;
};

type LinkState = {
  element: HTMLElement;

  currentX: number;
  currentY: number;
  currentHover: number;

  targetX: number;
  targetY: number;
  targetHover: number;

  pointerActive: boolean;
  focusActive: boolean;
};

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

function damp(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
) {
  return (
    current +
    (
      target -
      current
    ) *
      (
        1 -
        Math.exp(
          -lambda *
            deltaTime,
        )
      )
  );
}

export default function AboutInteractionPolish() {
  useEffect(() => {
    const root =
      document.querySelector<HTMLElement>(
        "[data-about-interaction-root]",
      );

    if (!root) {
      return;
    }

    const rootElement =
      root;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const finePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );

    const desktop =
      window.matchMedia(
        "(min-width: 961px)",
      );

    if (
      reducedMotion.matches
    ) {
      return;
    }

    const rowElements =
      Array.from(
        rootElement.querySelectorAll<HTMLElement>(
          "[data-about-interactive-row]",
        ),
      );

    const linkElements =
      Array.from(
        rootElement.querySelectorAll<HTMLElement>(
          "[data-about-magnetic-link]",
        ),
      );

    const rowStates:
      RowState[] =
      rowElements.map(
        (
          element,
        ) => ({
          element,

          currentX:
            0,

          currentY:
            0,

          currentHover:
            0,

          targetX:
            0,

          targetY:
            0,

          targetHover:
            0,

          pointerActive:
            false,

          focusActive:
            false,
        }),
      );

    const linkStates:
      LinkState[] =
      linkElements.map(
        (
          element,
        ) => ({
          element,

          currentX:
            0,

          currentY:
            0,

          currentHover:
            0,

          targetX:
            0,

          targetY:
            0,

          targetHover:
            0,

          pointerActive:
            false,

          focusActive:
            false,
        }),
      );

    let frameId =
      0;

    let previousTime =
      performance.now();

    let destroyed =
      false;

    const cleanups:
      Array<
        () => void
      > = [];

    /*
     * =========================
     * ROW OUTPUT
     * =========================
     */

    function applyRow(
      state: RowState,
    ) {
      const titleX =
        state.currentX *
        state.currentHover *
        7;

      const titleY =
        state.currentY *
        state.currentHover *
        2.5;

      const copyX =
        state.currentX *
        state.currentHover *
        -3.5;

      const copyY =
        state.currentY *
        state.currentHover *
        -1.5;

      const numberX =
        state.currentX *
        state.currentHover *
        3;

      const numberY =
        state.currentY *
        state.currentHover *
        -4;

      const itemsX =
        state.currentX *
        state.currentHover *
        4.5;

      const itemsY =
        state.currentY *
        state.currentHover *
        1.5;

      const glowX =
        50 +
        state.currentX *
          29;

      state.element.style.setProperty(
        "--about-row-title-x",
        `${titleX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-row-title-y",
        `${titleY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-row-copy-x",
        `${copyX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-row-copy-y",
        `${copyY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-row-number-x",
        `${numberX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-row-number-y",
        `${numberY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-row-items-x",
        `${itemsX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-row-items-y",
        `${itemsY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-row-glow-x",
        `${glowX.toFixed(
          2,
        )}%`,
      );

      state.element.style.setProperty(
        "--about-row-hover",
        state.currentHover.toFixed(
          4,
        ),
      );

      state.element.style.setProperty(
        "--about-row-rule-scale",
        state.currentHover.toFixed(
          4,
        ),
      );

      const active =
        state.pointerActive ||
        state.focusActive ||
        state.currentHover >
          0.08;

      state.element.dataset.aboutRowActive =
        active
          ? "true"
          : "false";
    }

    /*
     * =========================
     * LINK OUTPUT
     * =========================
     */

    function applyLink(
      state: LinkState,
    ) {
      const variant =
        state.element.dataset
          .aboutMagneticLink;

      const compact =
        variant ===
        "compact";

      const linkTravel =
        compact
          ? 3
          : 5;

      const arrowTravel =
        compact
          ? 6
          : 10;

      const linkX =
        state.currentX *
        state.currentHover *
        linkTravel;

      const linkY =
        state.currentY *
        state.currentHover *
        linkTravel *
        0.55;

      const arrowX =
        state.currentX *
        state.currentHover *
        arrowTravel;

      const arrowY =
        state.currentY *
        state.currentHover *
        arrowTravel *
        0.72;

      state.element.style.setProperty(
        "--about-link-x",
        `${linkX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-link-y",
        `${linkY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-link-arrow-x",
        `${arrowX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-link-arrow-y",
        `${arrowY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--about-link-hover",
        state.currentHover.toFixed(
          4,
        ),
      );

      const active =
        state.pointerActive ||
        state.focusActive ||
        state.currentHover >
          0.08;

      state.element.dataset.aboutLinkActive =
        active
          ? "true"
          : "false";
    }

    /*
     * =========================
     * SHARED RAF
     * =========================
     */

    function requestFrame() {
      if (
        frameId !==
        0
      ) {
        return;
      }

      previousTime =
        performance.now();

      frameId =
        window.requestAnimationFrame(
          renderFrame,
        );
    }

    function renderFrame(
      timestamp: number,
    ) {
      frameId =
        0;

      if (
        destroyed
      ) {
        return;
      }

      const deltaTime =
        Math.min(
          (
            timestamp -
            previousTime
          ) /
            1000,
          0.064,
        );

      previousTime =
        timestamp;

      let moving =
        false;

      rowStates.forEach(
        (
          state,
        ) => {
          const active =
            state.pointerActive ||
            state.focusActive;

          state.currentX =
            damp(
              state.currentX,
              state.targetX,
              active
                ? 13
                : 8,
              deltaTime,
            );

          state.currentY =
            damp(
              state.currentY,
              state.targetY,
              active
                ? 13
                : 8,
              deltaTime,
            );

          state.currentHover =
            damp(
              state.currentHover,
              state.targetHover,
              active
                ? 10
                : 7,
              deltaTime,
            );

          applyRow(
            state,
          );

          if (
            Math.abs(
              state.currentX -
                state.targetX,
            ) >
              0.001 ||
            Math.abs(
              state.currentY -
                state.targetY,
            ) >
              0.001 ||
            Math.abs(
              state.currentHover -
                state.targetHover,
            ) >
              0.001
          ) {
            moving =
              true;
          }
        },
      );

      linkStates.forEach(
        (
          state,
        ) => {
          const active =
            state.pointerActive ||
            state.focusActive;

          state.currentX =
            damp(
              state.currentX,
              state.targetX,
              active
                ? 14
                : 8,
              deltaTime,
            );

          state.currentY =
            damp(
              state.currentY,
              state.targetY,
              active
                ? 14
                : 8,
              deltaTime,
            );

          state.currentHover =
            damp(
              state.currentHover,
              state.targetHover,
              active
                ? 11
                : 7,
              deltaTime,
            );

          applyLink(
            state,
          );

          if (
            Math.abs(
              state.currentX -
                state.targetX,
            ) >
              0.001 ||
            Math.abs(
              state.currentY -
                state.targetY,
            ) >
              0.001 ||
            Math.abs(
              state.currentHover -
                state.targetHover,
            ) >
              0.001
          ) {
            moving =
              true;
          }
        },
      );

      if (
        moving
      ) {
        requestFrame();
      }
    }

    /*
     * =========================
     * ROW EVENTS
     * =========================
     */

    rowStates.forEach(
      (
        state,
      ) => {
        applyRow(
          state,
        );

        function handlePointerEnter() {
          if (
            !finePointer.matches ||
            !desktop.matches
          ) {
            return;
          }

          state.pointerActive =
            true;

          state.targetHover =
            1;

          requestFrame();
        }

        function handlePointerMove(
          event: PointerEvent,
        ) {
          if (
            !finePointer.matches ||
            !desktop.matches
          ) {
            return;
          }

          const rect =
            state.element.getBoundingClientRect();

          if (
            rect.width <=
              0 ||
            rect.height <=
              0
          ) {
            return;
          }

          state.targetX =
            clamp(
              (
                (
                  event.clientX -
                  rect.left
                ) /
                  rect.width -
                0.5
              ) *
                2,
              -1,
              1,
            );

          state.targetY =
            clamp(
              (
                (
                  event.clientY -
                  rect.top
                ) /
                  rect.height -
                0.5
              ) *
                2,
              -1,
              1,
            );

          state.pointerActive =
            true;

          state.targetHover =
            1;

          requestFrame();
        }

        function handlePointerLeave() {
          state.pointerActive =
            false;

          state.targetX =
            0;

          state.targetY =
            0;

          state.targetHover =
            state.focusActive
              ? 1
              : 0;

          requestFrame();
        }

        function handleFocusIn() {
          state.focusActive =
            true;

          state.targetHover =
            1;

          requestFrame();
        }

        function handleFocusOut(
          event: FocusEvent,
        ) {
          const nextTarget =
            event.relatedTarget;

          if (
            nextTarget instanceof
              Node &&
            state.element.contains(
              nextTarget,
            )
          ) {
            return;
          }

          state.focusActive =
            false;

          state.targetX =
            0;

          state.targetY =
            0;

          state.targetHover =
            state.pointerActive
              ? 1
              : 0;

          requestFrame();
        }

        state.element.addEventListener(
          "pointerenter",
          handlePointerEnter,
        );

        state.element.addEventListener(
          "pointermove",
          handlePointerMove,
          {
            passive: true,
          },
        );

        state.element.addEventListener(
          "pointerleave",
          handlePointerLeave,
        );

        state.element.addEventListener(
          "pointercancel",
          handlePointerLeave,
        );

        state.element.addEventListener(
          "focusin",
          handleFocusIn,
        );

        state.element.addEventListener(
          "focusout",
          handleFocusOut,
        );

        cleanups.push(
          () => {
            state.element.removeEventListener(
              "pointerenter",
              handlePointerEnter,
            );

            state.element.removeEventListener(
              "pointermove",
              handlePointerMove,
            );

            state.element.removeEventListener(
              "pointerleave",
              handlePointerLeave,
            );

            state.element.removeEventListener(
              "pointercancel",
              handlePointerLeave,
            );

            state.element.removeEventListener(
              "focusin",
              handleFocusIn,
            );

            state.element.removeEventListener(
              "focusout",
              handleFocusOut,
            );
          },
        );
      },
    );

    /*
     * =========================
     * LINK EVENTS
     * =========================
     */

    linkStates.forEach(
      (
        state,
      ) => {
        applyLink(
          state,
        );

        function handlePointerEnter() {
          if (
            !finePointer.matches ||
            !desktop.matches
          ) {
            return;
          }

          state.pointerActive =
            true;

          state.targetHover =
            1;

          requestFrame();
        }

        function handlePointerMove(
          event: PointerEvent,
        ) {
          if (
            !finePointer.matches ||
            !desktop.matches
          ) {
            return;
          }

          const rect =
            state.element.getBoundingClientRect();

          if (
            rect.width <=
              0 ||
            rect.height <=
              0
          ) {
            return;
          }

          state.targetX =
            clamp(
              (
                (
                  event.clientX -
                  rect.left
                ) /
                  rect.width -
                0.5
              ) *
                2,
              -1,
              1,
            );

          state.targetY =
            clamp(
              (
                (
                  event.clientY -
                  rect.top
                ) /
                  rect.height -
                0.5
              ) *
                2,
              -1,
              1,
            );

          state.pointerActive =
            true;

          state.targetHover =
            1;

          requestFrame();
        }

        function handlePointerLeave() {
          state.pointerActive =
            false;

          state.targetX =
            0;

          state.targetY =
            0;

          state.targetHover =
            state.focusActive
              ? 1
              : 0;

          requestFrame();
        }

        function handleFocus() {
          state.focusActive =
            true;

          state.targetHover =
            1;

          requestFrame();
        }

        function handleBlur() {
          state.focusActive =
            false;

          state.targetX =
            0;

          state.targetY =
            0;

          state.targetHover =
            state.pointerActive
              ? 1
              : 0;

          requestFrame();
        }

        state.element.addEventListener(
          "pointerenter",
          handlePointerEnter,
        );

        state.element.addEventListener(
          "pointermove",
          handlePointerMove,
          {
            passive: true,
          },
        );

        state.element.addEventListener(
          "pointerleave",
          handlePointerLeave,
        );

        state.element.addEventListener(
          "pointercancel",
          handlePointerLeave,
        );

        state.element.addEventListener(
          "focus",
          handleFocus,
        );

        state.element.addEventListener(
          "blur",
          handleBlur,
        );

        cleanups.push(
          () => {
            state.element.removeEventListener(
              "pointerenter",
              handlePointerEnter,
            );

            state.element.removeEventListener(
              "pointermove",
              handlePointerMove,
            );

            state.element.removeEventListener(
              "pointerleave",
              handlePointerLeave,
            );

            state.element.removeEventListener(
              "pointercancel",
              handlePointerLeave,
            );

            state.element.removeEventListener(
              "focus",
              handleFocus,
            );

            state.element.removeEventListener(
              "blur",
              handleBlur,
            );
          },
        );
      },
    );

    return () => {
      destroyed =
        true;

      cleanups.forEach(
        (
          cleanup,
        ) => {
          cleanup();
        },
      );

      if (
        frameId !==
        0
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }

      rowStates.forEach(
        (
          state,
        ) => {
          delete state.element.dataset
            .aboutRowActive;

          [
            "--about-row-title-x",
            "--about-row-title-y",
            "--about-row-copy-x",
            "--about-row-copy-y",
            "--about-row-number-x",
            "--about-row-number-y",
            "--about-row-items-x",
            "--about-row-items-y",
            "--about-row-glow-x",
            "--about-row-hover",
            "--about-row-rule-scale",
          ].forEach(
            (
              property,
            ) => {
              state.element.style.removeProperty(
                property,
              );
            },
          );
        },
      );

      linkStates.forEach(
        (
          state,
        ) => {
          delete state.element.dataset
            .aboutLinkActive;

          [
            "--about-link-x",
            "--about-link-y",
            "--about-link-arrow-x",
            "--about-link-arrow-y",
            "--about-link-hover",
          ].forEach(
            (
              property,
            ) => {
              state.element.style.removeProperty(
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