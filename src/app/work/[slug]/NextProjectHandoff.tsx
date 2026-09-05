"use client";

import {
  useEffect,
} from "react";

import styles from "./NextProjectHandoff.module.css";

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

export default function NextProjectHandoff() {
  useEffect(() => {
    const section =
      document.querySelector<HTMLElement>(
        "[data-next-project-handoff]",
      );

    if (!section) {
      return;
    }

    const link =
      section.querySelector<HTMLElement>(
        "[data-next-project-link]",
      );

    if (!link) {
      return;
    }

    /*
     * Stable references after guards.
     */
    const sectionElement =
      section;

    const linkElement =
      link;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const compact =
      window.matchMedia(
        "(max-width: 960px)",
      );

    const finePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );

    let destroyed =
      false;

    let frameId =
      0;

    let previousTime =
      performance.now();

    /*
     * =========================
     * SCROLL PROGRESS
     * =========================
     */

    let targetProgress =
      0;

    let currentProgress =
      0;

    /*
     * =========================
     * POINTER TENSION
     * =========================
     */

    let pointerActive =
      false;

    let targetPointerX =
      0;

    let targetPointerY =
      0;

    let currentPointerX =
      0;

    let currentPointerY =
      0;

    let targetHover =
      0;

    let currentHover =
      0;

    function apply() {
      const progress =
        smoothstep(
          currentProgress,
        );

      /*
       * =========================
       * SCROLL CHOREOGRAPHY
       * =========================
       */

      const titleY =
        (
          1 -
          progress
        ) *
        34;

      const titleScale =
        0.975 +
        progress *
          0.025;

      const headerY =
        (
          1 -
          progress
        ) *
        12;

      const metaY =
        (
          1 -
          progress
        ) *
        20;

      const ghostY =
        (
          1 -
          progress
        ) *
          76 -
        progress *
          8;

      /*
       * Accent wash is intentionally
       * subtle.
       *
       * It should be felt before it is
       * consciously noticed.
       */
      const washOpacity =
        progress *
          0.055 +
        currentHover *
          0.018;

      const ghostOpacity =
        progress *
          0.075;

      const lineScale =
        clamp(
          progress *
            1.18,
          0,
          1,
        );

      /*
       * =========================
       * POINTER TENSION
       * =========================
       */

      const titlePointerX =
        currentPointerX *
        currentHover *
        7;

      const titlePointerY =
        currentPointerY *
        currentHover *
        3.5;

      const metaPointerX =
        currentPointerX *
        currentHover *
        -3;

      const metaPointerY =
        currentPointerY *
        currentHover *
        -2;

      const arrowX =
        currentPointerX *
        currentHover *
        10;

      const arrowY =
        currentPointerY *
        currentHover *
        8;

      const arrowRotate =
        progress *
          8 +
        currentPointerX *
          currentHover *
          6;

      sectionElement.style.setProperty(
        "--next-handoff-title-y",
        `${titleY.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-title-scale",
        titleScale.toFixed(
          5,
        ),
      );

      sectionElement.style.setProperty(
        "--next-handoff-header-y",
        `${headerY.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-meta-y",
        `${metaY.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-index-y",
        `${ghostY.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-wash-opacity",
        washOpacity.toFixed(
          4,
        ),
      );

      sectionElement.style.setProperty(
        "--next-handoff-index-opacity",
        ghostOpacity.toFixed(
          4,
        ),
      );

      sectionElement.style.setProperty(
        "--next-handoff-line-scale",
        lineScale.toFixed(
          4,
        ),
      );

      sectionElement.style.setProperty(
        "--next-handoff-title-x",
        `${titlePointerX.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-title-pointer-y",
        `${titlePointerY.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-meta-x",
        `${metaPointerX.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-meta-pointer-y",
        `${metaPointerY.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-arrow-x",
        `${arrowX.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-arrow-y",
        `${arrowY.toFixed(
          3,
        )}px`,
      );

      sectionElement.style.setProperty(
        "--next-handoff-arrow-rotate",
        `${arrowRotate.toFixed(
          3,
        )}deg`,
      );

      sectionElement.dataset.nextHandoffActive =
        progress >
        0.18
          ? "true"
          : "false";
    }

    /*
     * =========================
     * TARGET MEASUREMENT
     * =========================
     */

    function measureTarget() {
      if (
        reducedMotion.matches ||
        compact.matches
      ) {
        targetProgress =
          1;

        targetPointerX =
          0;

        targetPointerY =
          0;

        targetHover =
          0;

        requestFrame();

        return;
      }

      const rect =
        sectionElement.getBoundingClientRect();

      const viewportHeight =
        Math.max(
          window.innerHeight,
          1,
        );

      /*
       * Starts before the section has
       * fully entered the screen.
       *
       * Finishes around upper-middle
       * viewport.
       */
      const startLine =
        viewportHeight *
        0.94;

      const endLine =
        viewportHeight *
        0.3;

      targetProgress =
        clamp(
          (
            startLine -
            rect.top
          ) /
            Math.max(
              startLine -
                endLine,
              1,
            ),
          0,
          1,
        );

      requestFrame();
    }

    /*
     * =========================
     * SMOOTH FRAME
     * =========================
     */

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

      currentProgress =
        damp(
          currentProgress,
          targetProgress,
          10,
          deltaTime,
        );

      currentPointerX =
        damp(
          currentPointerX,
          targetPointerX,
          pointerActive
            ? 13
            : 8,
          deltaTime,
        );

      currentPointerY =
        damp(
          currentPointerY,
          targetPointerY,
          pointerActive
            ? 13
            : 8,
          deltaTime,
        );

      currentHover =
        damp(
          currentHover,
          targetHover,
          pointerActive
            ? 10
            : 7,
          deltaTime,
        );

      apply();

      const stillMoving =
        Math.abs(
          currentProgress -
            targetProgress,
        ) >
          0.0005 ||
        Math.abs(
          currentPointerX -
            targetPointerX,
        ) >
          0.0005 ||
        Math.abs(
          currentPointerY -
            targetPointerY,
        ) >
          0.0005 ||
        Math.abs(
          currentHover -
            targetHover,
        ) >
          0.0005;

      if (
        stillMoving
      ) {
        requestFrame();
      }
    }

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

    /*
     * =========================
     * POINTER
     * =========================
     */

    function handlePointerEnter() {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        compact.matches
      ) {
        return;
      }

      pointerActive =
        true;

      targetHover =
        1;

      requestFrame();
    }

    function handlePointerMove(
      event: PointerEvent,
    ) {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        compact.matches
      ) {
        return;
      }

      const rect =
        linkElement.getBoundingClientRect();

      if (
        rect.width <=
          0 ||
        rect.height <=
          0
      ) {
        return;
      }

      targetPointerX =
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

      targetPointerY =
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

      pointerActive =
        true;

      targetHover =
        1;

      requestFrame();
    }

    function handlePointerLeave() {
      pointerActive =
        false;

      targetPointerX =
        0;

      targetPointerY =
        0;

      targetHover =
        0;

      requestFrame();
    }

    window.addEventListener(
      "scroll",
      measureTarget,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      measureTarget,
    );

    reducedMotion.addEventListener(
      "change",
      measureTarget,
    );

    compact.addEventListener(
      "change",
      measureTarget,
    );

    linkElement.addEventListener(
      "pointerenter",
      handlePointerEnter,
    );

    linkElement.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    linkElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    linkElement.addEventListener(
      "pointercancel",
      handlePointerLeave,
    );

    const resizeObserver =
      typeof ResizeObserver !==
      "undefined"
        ? new ResizeObserver(
            () => {
              measureTarget();
            },
          )
        : null;

    resizeObserver?.observe(
      sectionElement,
    );

    resizeObserver?.observe(
      linkElement,
    );

    measureTarget();

    return () => {
      destroyed =
        true;

      window.removeEventListener(
        "scroll",
        measureTarget,
      );

      window.removeEventListener(
        "resize",
        measureTarget,
      );

      reducedMotion.removeEventListener(
        "change",
        measureTarget,
      );

      compact.removeEventListener(
        "change",
        measureTarget,
      );

      linkElement.removeEventListener(
        "pointerenter",
        handlePointerEnter,
      );

      linkElement.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      linkElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      linkElement.removeEventListener(
        "pointercancel",
        handlePointerLeave,
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

      delete sectionElement.dataset
        .nextHandoffActive;

      [
        "--next-handoff-title-y",
        "--next-handoff-title-scale",
        "--next-handoff-header-y",
        "--next-handoff-meta-y",
        "--next-handoff-index-y",
        "--next-handoff-wash-opacity",
        "--next-handoff-index-opacity",
        "--next-handoff-line-scale",
        "--next-handoff-title-x",
        "--next-handoff-title-pointer-y",
        "--next-handoff-meta-x",
        "--next-handoff-meta-pointer-y",
        "--next-handoff-arrow-x",
        "--next-handoff-arrow-y",
        "--next-handoff-arrow-rotate",
      ].forEach(
        (
          property,
        ) => {
          sectionElement.style.removeProperty(
            property,
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