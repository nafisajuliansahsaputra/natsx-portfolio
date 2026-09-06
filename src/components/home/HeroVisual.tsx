"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import type {
  Locale,
} from "@/i18n/config";

import {
  getMessages,
} from "@/i18n/messages";

import styles from "./Hero.module.css";
import portraitStyles from "./HeroPortraitTransition.module.css";

type HeroVisualProps = {
  locale: Locale;
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

function isInsidePortraitZone(
  clientX: number,
  clientY: number,
  rect: DOMRect,
) {
  if (
    rect.width <=
      0 ||
    rect.height <=
      0
  ) {
    return false;
  }

  const x =
    (
      clientX -
      rect.left
    ) /
    rect.width;

  const y =
    (
      clientY -
      rect.top
    ) /
    rect.height;

  const centerX =
    0.53;

  const centerY =
    0.56;

  const radiusX =
    0.43;

  const radiusY =
    0.58;

  const dx =
    (
      x -
      centerX
    ) /
    radiusX;

  const dy =
    (
      y -
      centerY
    ) /
    radiusY;

  return (
    dx *
      dx +
      dy *
        dy <=
    1
  );
}

export default function HeroVisual({
  locale,
}: HeroVisualProps) {
  const copy =
    getMessages(
      locale,
    );

  const [
    portraitLoaded,
    setPortraitLoaded,
  ] =
    useState(
      false,
    );

  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  const portraitStageRef =
    useRef<HTMLDivElement>(
      null,
    );

  /*
   * =========================
   * HERO AMBIENT
   * =========================
   */

  useEffect(() => {
    const visual =
      visualRef.current;

    if (!visual) {
      return;
    }

    const hero =
      visual.closest<HTMLElement>(
        "[data-home-hero]",
      );

    if (!hero) {
      return;
    }

    const heroElement =
      hero;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    let isInView =
      true;

    function syncAmbientState() {
      const active =
        isInView &&
        !document.hidden &&
        !reducedMotion.matches;

      heroElement.dataset.ambientActive =
        active
          ? "true"
          : "false";
    }

    const observer =
      typeof IntersectionObserver !==
      "undefined"
        ? new IntersectionObserver(
            (
              [
                entry,
              ],
            ) => {
              isInView =
                entry.isIntersecting;

              syncAmbientState();
            },
            {
              threshold:
                0.1,
            },
          )
        : null;

    observer?.observe(
      heroElement,
    );

    document.addEventListener(
      "visibilitychange",
      syncAmbientState,
    );

    reducedMotion.addEventListener(
      "change",
      syncAmbientState,
    );

    syncAmbientState();

    return () => {
      observer?.disconnect();

      document.removeEventListener(
        "visibilitychange",
        syncAmbientState,
      );

      reducedMotion.removeEventListener(
        "change",
        syncAmbientState,
      );

      delete heroElement.dataset
        .ambientActive;
    };
  }, []);

  /*
   * =========================
   * PORTRAIT REVEAL
   * =========================
   */

  useEffect(() => {
    const visual =
      visualRef.current;

    const stage =
      portraitStageRef.current;

    if (
      !visual ||
      !stage
    ) {
      return;
    }

    const visualElement =
      visual;

    const stageElement =
      stage;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const interactivePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine) and (min-width: 961px)",
      );

    let destroyed =
      false;

    let frameId:
      | number
      | null =
      null;

    let previousTime =
      performance.now();

    /*
     * Cursor target.
     */

    let targetX =
      0.5;

    let targetY =
      0.5;

    /*
     * Smoothed cursor position.
     */

    let currentX =
      0.5;

    let currentY =
      0.5;

    /*
     * Portrait reveal amount.
     *
     * 0 = base portrait
     * 1 = alternate portrait
     *     visible inside cursor zone
     */

    let targetFocus =
      0;

    let currentFocus =
      0;

    /*
     * =========================
     * APPLY STATE
     * =========================
     */

    function apply() {
      stageElement.style.setProperty(
        "--portrait-pointer-x",
        `${(
          currentX *
          100
        ).toFixed(
          3,
        )}%`,
      );

      stageElement.style.setProperty(
        "--portrait-pointer-y",
        `${(
          currentY *
          100
        ).toFixed(
          3,
        )}%`,
      );

      stageElement.style.setProperty(
        "--portrait-focus",
        currentFocus.toFixed(
          4,
        ),
      );

      stageElement.dataset.portraitState =
        currentFocus >
        0.025
          ? "active"
          : "base";
    }

    /*
     * =========================
     * ANIMATION FRAME
     * =========================
     */

    function requestFrame() {
      if (
        frameId !==
        null
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
        null;

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

      const revealActive =
        targetFocus >
        0;

      currentX =
        damp(
          currentX,
          targetX,
          revealActive
            ? 17
            : 9,
          deltaTime,
        );

      currentY =
        damp(
          currentY,
          targetY,
          revealActive
            ? 17
            : 9,
          deltaTime,
        );

      currentFocus =
        damp(
          currentFocus,
          targetFocus,
          revealActive
            ? 9.5
            : 5.2,
          deltaTime,
        );

      apply();

      const moving =
        Math.abs(
          currentX -
            targetX,
        ) >
          0.0004 ||
        Math.abs(
          currentY -
            targetY,
        ) >
          0.0004 ||
        Math.abs(
          currentFocus -
            targetFocus,
        ) >
          0.0004;

      if (
        moving
      ) {
        requestFrame();
      }
    }

    /*
     * =========================
     * POINTER POSITION
     * =========================
     */

    function updatePointer(
      event: PointerEvent,
    ) {
      if (
        reducedMotion.matches ||
        !interactivePointer.matches
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

      targetX =
        clamp(
          (
            event.clientX -
            rect.left
          ) /
            rect.width,
          0,
          1,
        );

      targetY =
        clamp(
          (
            event.clientY -
            rect.top
          ) /
            rect.height,
          0,
          1,
        );

      requestFrame();
    }

    /*
     * =========================
     * PORTRAIT FOCUS ZONE
     * =========================
     */

    function updatePortraitZone(
      event: PointerEvent,
    ) {
      if (
        reducedMotion.matches ||
        !interactivePointer.matches
      ) {
        return;
      }

      const rect =
        stageElement.getBoundingClientRect();

      const inside =
        isInsidePortraitZone(
          event.clientX,
          event.clientY,
          rect,
        );

      targetFocus =
        inside
          ? 1
          : 0;

      requestFrame();
    }

    /*
     * =========================
     * POINTER EVENTS
     * =========================
     */

    function handlePointerEnter(
      event: PointerEvent,
    ) {
      updatePointer(
        event,
      );

      updatePortraitZone(
        event,
      );
    }

    function handlePointerMove(
      event: PointerEvent,
    ) {
      updatePointer(
        event,
      );

      updatePortraitZone(
        event,
      );
    }

    function handlePointerLeave() {
      targetFocus =
        0;

      requestFrame();
    }

    /*
     * =========================
     * RESET
     * =========================
     */

    function resetInteraction() {
      targetX =
        0.5;

      targetY =
        0.5;

      currentX =
        0.5;

      currentY =
        0.5;

      targetFocus =
        0;

      currentFocus =
        0;

      apply();
    }

    function handleEnvironmentChange() {
      if (
        frameId !==
        null
      ) {
        window.cancelAnimationFrame(
          frameId,
        );

        frameId =
          null;
      }

      resetInteraction();
    }

    /*
     * =========================
     * LISTENERS
     * =========================
     */

    visualElement.addEventListener(
      "pointerenter",
      handlePointerEnter,
    );

    visualElement.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive:
          true,
      },
    );

    visualElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    visualElement.addEventListener(
      "pointercancel",
      handlePointerLeave,
    );

    reducedMotion.addEventListener(
      "change",
      handleEnvironmentChange,
    );

    interactivePointer.addEventListener(
      "change",
      handleEnvironmentChange,
    );

    resetInteraction();

    /*
     * =========================
     * CLEANUP
     * =========================
     */

    return () => {
      destroyed =
        true;

      visualElement.removeEventListener(
        "pointerenter",
        handlePointerEnter,
      );

      visualElement.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      visualElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      visualElement.removeEventListener(
        "pointercancel",
        handlePointerLeave,
      );

      reducedMotion.removeEventListener(
        "change",
        handleEnvironmentChange,
      );

      interactivePointer.removeEventListener(
        "change",
        handleEnvironmentChange,
      );

      if (
        frameId !==
        null
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }

      [
        "--portrait-pointer-x",
        "--portrait-pointer-y",
        "--portrait-focus",
      ].forEach(
        (
          property,
        ) => {
          stageElement.style.removeProperty(
            property,
          );
        },
      );

      delete stageElement.dataset
        .portraitState;
    };
  }, []);

  return (
    <div
      ref={
        visualRef
      }
      className={
        styles.visual
      }
      data-motion-hero-piece="visual"
    >
      <div
        className={
          styles.accentPlus
        }
        data-hero-accent-plus
        aria-hidden="true"
      >
        <span />
        <span />
      </div>

      <div
        className={`${styles.shape} ${styles.shapeCircle}`}
        data-hero-shape="circle"
        aria-hidden="true"
      />

      <div
        className={`${styles.shape} ${styles.shapeArch}`}
        data-hero-shape="arch"
        aria-hidden="true"
      />

      <div
        ref={
          portraitStageRef
        }
        className={`${styles.portrait} ${portraitStyles.stage}`}
        data-motion-portrait={
          portraitLoaded
            ? "loaded"
            : "loading"
        }
        data-portrait-state="base"
      >
        <div
          className={`${portraitStyles.layer} ${portraitStyles.baseLayer}`}
        >
          <Image
            src="/images/natsx-portrait-hero-bfr.png"
            alt={
              copy
                .accessibility
                .portrait
            }
            fill
            preload
            sizes="(max-width: 960px) 100vw, 42vw"
            className={
              portraitStyles.baseImage
            }
            onLoad={
              () => {
                setPortraitLoaded(
                  true,
                );
              }
            }
          />
        </div>

        <div
          className={`${portraitStyles.layer} ${portraitStyles.altCore}`}
          aria-hidden="true"
        >
          <Image
            src="/images/natsx-portrait-hero-atr.png"
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 960px) 100vw, 42vw"
            className={
              portraitStyles.altImage
            }
          />
        </div>
      </div>
    </div>
  );
}