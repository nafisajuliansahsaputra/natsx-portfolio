"use client";

import {
  useEffect,
} from "react";

import styles from "./ContactConversionPolish.module.css";

type InteractiveState = {
  element: HTMLElement;

  targetX: number;
  targetY: number;
  targetHover: number;

  currentX: number;
  currentY: number;
  currentHover: number;

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

export default function ContactConversionPolish() {
  useEffect(() => {
    const root =
      document.querySelector<HTMLElement>(
        "[data-contact-conversion-root]",
      );

    if (!root) {
      return;
    }

    const rootElement =
      root;

    const primaryStage =
      rootElement.querySelector<HTMLElement>(
        "[data-contact-primary-stage]",
      );

    const magneticSurface =
      rootElement.querySelector<HTMLElement>(
        "[data-contact-magnetic]",
      );

    const rowElements =
      Array.from(
        rootElement.querySelectorAll<HTMLElement>(
          "[data-contact-interactive-row]",
        ),
      );

    const linkElements =
      Array.from(
        rootElement.querySelectorAll<HTMLElement>(
          "[data-contact-interactive-link]",
        ),
      );

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

    const rowStates:
      InteractiveState[] =
      rowElements.map(
        (
          element,
        ) => ({
          element,

          targetX:
            0,

          targetY:
            0,

          targetHover:
            0,

          currentX:
            0,

          currentY:
            0,

          currentHover:
            0,

          pointerActive:
            false,

          focusActive:
            false,
        }),
      );

    const linkStates:
      InteractiveState[] =
      linkElements.map(
        (
          element,
        ) => ({
          element,

          targetX:
            0,

          targetY:
            0,

          targetHover:
            0,

          currentX:
            0,

          currentY:
            0,

          currentHover:
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

    /*
     * =========================
     * PRIMARY CONTACT FIELD
     * =========================
     */

    let primaryTargetX =
      50;

    let primaryTargetY =
      50;

    let primaryCurrentX =
      50;

    let primaryCurrentY =
      50;

    let primaryTargetHover =
      0;

    let primaryCurrentHover =
      0;

    function applyPrimary() {
      if (
        !primaryStage
      ) {
        return;
      }

      primaryStage.style.setProperty(
        "--contact-focus-x",
        `${primaryCurrentX.toFixed(
          3,
        )}%`,
      );

      primaryStage.style.setProperty(
        "--contact-focus-y",
        `${primaryCurrentY.toFixed(
          3,
        )}%`,
      );

      primaryStage.style.setProperty(
        "--contact-focus-opacity",
        primaryCurrentHover.toFixed(
          4,
        ),
      );
    }

    /*
     * =========================
     * ROW OUTPUT
     * =========================
     */

    function applyRow(
      state: InteractiveState,
    ) {
      const type =
        state.element.dataset
          .contactInteractiveRow;

      const isSocial =
        type ===
        "social";

      const titleX =
        state.currentX *
        state.currentHover *
        (
          isSocial
            ? 7
            : 5
        );

      const titleY =
        state.currentY *
        state.currentHover *
        2;

      const numberX =
        state.currentX *
        state.currentHover *
        -3;

      const numberY =
        state.currentY *
        state.currentHover *
        -2;

      const metaX =
        state.currentX *
        state.currentHover *
        3;

      const metaY =
        state.currentY *
        state.currentHover *
        1.5;

      const arrowX =
        state.currentX *
        state.currentHover *
        7;

      const arrowY =
        state.currentY *
        state.currentHover *
        5;

      const fieldX =
        50 +
        state.currentX *
          32;

      state.element.style.setProperty(
        "--contact-row-title-x",
        `${titleX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-row-title-y",
        `${titleY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-row-number-x",
        `${numberX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-row-number-y",
        `${numberY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-row-meta-x",
        `${metaX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-row-meta-y",
        `${metaY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-row-arrow-x",
        `${arrowX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-row-arrow-y",
        `${arrowY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-row-field-x",
        `${fieldX.toFixed(
          2,
        )}%`,
      );

      state.element.style.setProperty(
        "--contact-row-hover",
        state.currentHover.toFixed(
          4,
        ),
      );

      const active =
        state.pointerActive ||
        state.focusActive ||
        state.currentHover >
          0.08;

      state.element.dataset.contactRowActive =
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
      state: InteractiveState,
    ) {
      const linkX =
        state.currentX *
        state.currentHover *
        4;

      const linkY =
        state.currentY *
        state.currentHover *
        2.5;

      const arrowX =
        state.currentX *
        state.currentHover *
        7;

      const arrowY =
        state.currentY *
        state.currentHover *
        6;

      state.element.style.setProperty(
        "--contact-link-x",
        `${linkX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-link-y",
        `${linkY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-link-arrow-x",
        `${arrowX.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-link-arrow-y",
        `${arrowY.toFixed(
          3,
        )}px`,
      );

      state.element.style.setProperty(
        "--contact-link-hover",
        state.currentHover.toFixed(
          4,
        ),
      );
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

      primaryCurrentX =
        damp(
          primaryCurrentX,
          primaryTargetX,
          10,
          deltaTime,
        );

      primaryCurrentY =
        damp(
          primaryCurrentY,
          primaryTargetY,
          10,
          deltaTime,
        );

      primaryCurrentHover =
        damp(
          primaryCurrentHover,
          primaryTargetHover,
          8,
          deltaTime,
        );

      applyPrimary();

      if (
        Math.abs(
          primaryCurrentX -
            primaryTargetX,
        ) >
          0.001 ||
        Math.abs(
          primaryCurrentY -
            primaryTargetY,
        ) >
          0.001 ||
        Math.abs(
          primaryCurrentHover -
            primaryTargetHover,
        ) >
          0.001
      ) {
        moving =
          true;
      }

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
     * PRIMARY EVENTS
     * =========================
     */

    const primaryCleanup =
      (() => {
        if (
          !primaryStage ||
          !magneticSurface
        ) {
          return () => {};
        }

        const stageElement =
          primaryStage;

        const surfaceElement =
          magneticSurface;

        function handleMove(
          event: PointerEvent,
        ) {
          if (
            !finePointer.matches ||
            !desktop.matches
          ) {
            return;
          }

          const rect =
            stageElement.getBoundingClientRect();

          if (
            rect.width <=
              0 ||
            rect.height <=
              0
          ) {
            return;
          }

          primaryTargetX =
            clamp(
              (
                (
                  event.clientX -
                  rect.left
                ) /
                  rect.width
              ) *
                100,
              0,
              100,
            );

          primaryTargetY =
            clamp(
              (
                (
                  event.clientY -
                  rect.top
                ) /
                  rect.height
              ) *
                100,
              0,
              100,
            );

          primaryTargetHover =
            1;

          requestFrame();
        }

        function handleEnter() {
          if (
            !finePointer.matches ||
            !desktop.matches
          ) {
            return;
          }

          primaryTargetHover =
            1;

          requestFrame();
        }

        function handleLeave() {
          primaryTargetX =
            50;

          primaryTargetY =
            50;

          primaryTargetHover =
            0;

          requestFrame();
        }

        surfaceElement.addEventListener(
          "pointerenter",
          handleEnter,
        );

        surfaceElement.addEventListener(
          "pointermove",
          handleMove,
          {
            passive: true,
          },
        );

        surfaceElement.addEventListener(
          "pointerleave",
          handleLeave,
        );

        surfaceElement.addEventListener(
          "pointercancel",
          handleLeave,
        );

        return () => {
          surfaceElement.removeEventListener(
            "pointerenter",
            handleEnter,
          );

          surfaceElement.removeEventListener(
            "pointermove",
            handleMove,
          );

          surfaceElement.removeEventListener(
            "pointerleave",
            handleLeave,
          );

          surfaceElement.removeEventListener(
            "pointercancel",
            handleLeave,
          );
        };
      })();

    /*
     * =========================
     * GENERIC INTERACTION EVENTS
     * =========================
     */

    const cleanups:
      Array<
        () => void
      > = [];

    function setupState(
      state: InteractiveState,
    ) {
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
        const related =
          event.relatedTarget;

        if (
          related instanceof
            Node &&
          state.element.contains(
            related,
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
    }

    rowStates.forEach(
      (
        state,
      ) => {
        applyRow(
          state,
        );

        setupState(
          state,
        );
      },
    );

    linkStates.forEach(
      (
        state,
      ) => {
        applyLink(
          state,
        );

        setupState(
          state,
        );
      },
    );

    return () => {
      destroyed =
        true;

      primaryCleanup();

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

      if (
        primaryStage
      ) {
        [
          "--contact-focus-x",
          "--contact-focus-y",
          "--contact-focus-opacity",
        ].forEach(
          (
            property,
          ) => {
            primaryStage.style.removeProperty(
              property,
            );
          },
        );
      }

      rowStates.forEach(
        (
          state,
        ) => {
          delete state.element.dataset
            .contactRowActive;

          [
            "--contact-row-title-x",
            "--contact-row-title-y",
            "--contact-row-number-x",
            "--contact-row-number-y",
            "--contact-row-meta-x",
            "--contact-row-meta-y",
            "--contact-row-arrow-x",
            "--contact-row-arrow-y",
            "--contact-row-field-x",
            "--contact-row-hover",
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
          [
            "--contact-link-x",
            "--contact-link-y",
            "--contact-link-arrow-x",
            "--contact-link-arrow-y",
            "--contact-link-hover",
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