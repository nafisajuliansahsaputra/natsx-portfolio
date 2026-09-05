"use client";

import {
  useEffect,
} from "react";

import styles from "./WorkArchiveImmersive.module.css";

type RowState = {
  row: HTMLElement;

  pointerActive: boolean;
  focusActive: boolean;

  targetX: number;
  targetY: number;

  currentX: number;
  currentY: number;

  targetScale: number;
  currentScale: number;

  frameId:
    | number
    | null;

  previousTime: number;
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

export default function WorkArchiveImmersive() {
  useEffect(() => {
    const archive =
      document.querySelector<HTMLElement>(
        "[data-work-archive-immersive-root]",
      );

    if (!archive) {
      return;
    }

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

    const rows =
      Array.from(
        archive.querySelectorAll<HTMLElement>(
          "[data-work-project-row]",
        ),
      );

    if (
      rows.length ===
      0
    ) {
      return;
    }

    const states:
      RowState[] =
      rows.map(
        (
          row,
        ) => ({
          row,

          pointerActive:
            false,

          focusActive:
            false,

          targetX:
            0,

          targetY:
            0,

          currentX:
            0,

          currentY:
            0,

          targetScale:
            0.94,

          currentScale:
            0.94,

          frameId:
            null,

          previousTime:
            performance.now(),
        }),
      );

    const cleanups:
      Array<
        () => void
      > = [];

    /*
     * =========================
     * CSS OUTPUT
     * =========================
     */

    function applyState(
      state: RowState,
    ) {
      /*
       * Floating preview movement.
       */
      const previewX =
        state.currentX *
        34;

      const previewY =
        state.currentY *
        18;

      const previewRotate =
        state.currentX *
          1.65 +
        state.currentY *
          0.28;

      /*
       * Very subtle 3D card tilt.
       */
      const tiltX =
        state.currentY *
        -2.1;

      const tiltY =
        state.currentX *
        2.4;

      /*
       * Editorial copy responds with
       * far less travel than preview.
       */
      const titleX =
        state.currentX *
        4.5;

      const titleY =
        state.currentY *
        2.2;

      /*
       * Year moves in opposite direction,
       * creating a little layer tension.
       */
      const yearX =
        state.currentX *
        -2.5;

      const yearY =
        state.currentY *
        -1.7;

      state.row.style.setProperty(
        "--work-preview-x",
        `${previewX.toFixed(
          3,
        )}px`,
      );

      state.row.style.setProperty(
        "--work-preview-y",
        `${previewY.toFixed(
          3,
        )}px`,
      );

      state.row.style.setProperty(
        "--work-preview-rotate",
        `${previewRotate.toFixed(
          3,
        )}deg`,
      );

      state.row.style.setProperty(
        "--work-preview-scale",
        state.currentScale.toFixed(
          5,
        ),
      );

      state.row.style.setProperty(
        "--work-preview-tilt-x",
        `${tiltX.toFixed(
          3,
        )}deg`,
      );

      state.row.style.setProperty(
        "--work-preview-tilt-y",
        `${tiltY.toFixed(
          3,
        )}deg`,
      );

      state.row.style.setProperty(
        "--work-title-x",
        `${titleX.toFixed(
          3,
        )}px`,
      );

      state.row.style.setProperty(
        "--work-title-y",
        `${titleY.toFixed(
          3,
        )}px`,
      );

      state.row.style.setProperty(
        "--work-year-x",
        `${yearX.toFixed(
          3,
        )}px`,
      );

      state.row.style.setProperty(
        "--work-year-y",
        `${yearY.toFixed(
          3,
        )}px`,
      );
    }

    function syncActiveState(
      state: RowState,
    ) {
      const active =
        state.pointerActive ||
        state.focusActive;

      state.row.dataset.workActive =
        active
          ? "true"
          : "false";
    }

    /*
     * =========================
     * SPRING LOOP
     * =========================
     */

    function requestFrame(
      state: RowState,
    ) {
      if (
        state.frameId !==
        null
      ) {
        return;
      }

      state.previousTime =
        performance.now();

      state.frameId =
        window.requestAnimationFrame(
          (
            timestamp,
          ) => {
            renderFrame(
              state,
              timestamp,
            );
          },
        );
    }

    function renderFrame(
      state: RowState,
      timestamp: number,
    ) {
      state.frameId =
        null;

      const deltaTime =
        Math.min(
          (
            timestamp -
            state.previousTime
          ) /
            1000,
          0.064,
        );

      state.previousTime =
        timestamp;

      const active =
        state.pointerActive ||
        state.focusActive;

      const positionLambda =
        active
          ? 13
          : 8.5;

      const scaleLambda =
        active
          ? 10.5
          : 7.5;

      state.currentX =
        damp(
          state.currentX,
          state.targetX,
          positionLambda,
          deltaTime,
        );

      state.currentY =
        damp(
          state.currentY,
          state.targetY,
          positionLambda,
          deltaTime,
        );

      state.currentScale =
        damp(
          state.currentScale,
          state.targetScale,
          scaleLambda,
          deltaTime,
        );

      applyState(
        state,
      );

      const stillMoving =
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
          state.currentScale -
            state.targetScale,
        ) >
          0.001;

      if (
        stillMoving
      ) {
        requestFrame(
          state,
        );
      }
    }

    /*
     * =========================
     * EVENT SETUP
     * =========================
     */

    states.forEach(
      (
        state,
      ) => {
        applyState(
          state,
        );

        state.row.dataset.workActive =
          "false";

        function handlePointerEnter() {
          if (
            !finePointer.matches ||
            !desktop.matches
          ) {
            return;
          }

          state.pointerActive =
            true;

          state.targetScale =
            1;

          syncActiveState(
            state,
          );

          requestFrame(
            state,
          );
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
            state.row.getBoundingClientRect();

          if (
            rect.width <=
              0 ||
            rect.height <=
              0
          ) {
            return;
          }

          const normalizedX =
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

          const normalizedY =
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

          state.targetX =
            normalizedX;

          /*
           * Y intentionally weaker.
           * Keeps preview movement feeling
           * horizontal / editorial.
           */
          state.targetY =
            normalizedY *
            0.72;

          state.targetScale =
            1;

          syncActiveState(
            state,
          );

          requestFrame(
            state,
          );
        }

        function handlePointerLeave() {
          state.pointerActive =
            false;

          state.targetX =
            0;

          state.targetY =
            0;

          state.targetScale =
            state.focusActive
              ? 1
              : 0.94;

          syncActiveState(
            state,
          );

          requestFrame(
            state,
          );
        }

        function handleFocusIn() {
          if (
            !desktop.matches
          ) {
            return;
          }

          state.focusActive =
            true;

          state.targetX =
            0;

          state.targetY =
            0;

          state.targetScale =
            1;

          syncActiveState(
            state,
          );

          requestFrame(
            state,
          );
        }

        function handleFocusOut(
          event: FocusEvent,
        ) {
          const nextTarget =
            event.relatedTarget;

          if (
            nextTarget instanceof
              Node &&
            state.row.contains(
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

          state.targetScale =
            state.pointerActive
              ? 1
              : 0.94;

          syncActiveState(
            state,
          );

          requestFrame(
            state,
          );
        }

        state.row.addEventListener(
          "pointerenter",
          handlePointerEnter,
        );

        state.row.addEventListener(
          "pointermove",
          handlePointerMove,
          {
            passive: true,
          },
        );

        state.row.addEventListener(
          "pointerleave",
          handlePointerLeave,
        );

        state.row.addEventListener(
          "pointercancel",
          handlePointerLeave,
        );

        state.row.addEventListener(
          "focusin",
          handleFocusIn,
        );

        state.row.addEventListener(
          "focusout",
          handleFocusOut,
        );

        cleanups.push(
          () => {
            state.row.removeEventListener(
              "pointerenter",
              handlePointerEnter,
            );

            state.row.removeEventListener(
              "pointermove",
              handlePointerMove,
            );

            state.row.removeEventListener(
              "pointerleave",
              handlePointerLeave,
            );

            state.row.removeEventListener(
              "pointercancel",
              handlePointerLeave,
            );

            state.row.removeEventListener(
              "focusin",
              handleFocusIn,
            );

            state.row.removeEventListener(
              "focusout",
              handleFocusOut,
            );
          },
        );
      },
    );

    return () => {
      cleanups.forEach(
        (
          cleanup,
        ) => {
          cleanup();
        },
      );

      states.forEach(
        (
          state,
        ) => {
          if (
            state.frameId !==
            null
          ) {
            window.cancelAnimationFrame(
              state.frameId,
            );
          }

          delete state.row.dataset
            .workActive;

          [
            "--work-preview-x",
            "--work-preview-y",
            "--work-preview-rotate",
            "--work-preview-scale",
            "--work-preview-tilt-x",
            "--work-preview-tilt-y",
            "--work-title-x",
            "--work-title-y",
            "--work-year-x",
            "--work-year-y",
          ].forEach(
            (
              property,
            ) => {
              state.row.style.removeProperty(
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