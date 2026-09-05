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
   * HERO AMBIENT STATE
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
    };
  }, []);

  /*
   * =========================
   * PORTRAIT REVEAL ENGINE
   * =========================
   *
   * Portrait itself stays anchored.
   *
   * Pointer only controls which
   * portrait state becomes visible.
   *
   * Magnetic grid remains a completely
   * independent system.
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

    /*
     * Stable non-null references.
     *
     * Necessary because these values
     * are used from nested callbacks.
     */

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
     * =========================
     * MAIN POINTER
     * =========================
     */

    let targetX =
      0.5;

    let targetY =
      0.5;

    let currentX =
      0.5;

    let currentY =
      0.5;

    /*
     * =========================
     * TRAILING POINTER
     * =========================
     *
     * Moves slower than main reveal.
     */

    let trailX =
      0.5;

    let trailY =
      0.5;

    /*
     * =========================
     * REVEAL INTENSITY
     * =========================
     *
     * 0 = base portrait
     * 1 = ALT reveal active
     */

    let targetFocus =
      0;

    let currentFocus =
      0;

    /*
     * =========================
     * APPLY CSS VARIABLES
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
        "--portrait-trail-x",
        `${(
          trailX *
          100
        ).toFixed(
          3,
        )}%`,
      );

      stageElement.style.setProperty(
        "--portrait-trail-y",
        `${(
          trailY *
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
     * RAF
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

      const active =
        targetFocus >
        0;

      /*
       * Main reveal follows cursor
       * relatively quickly.
       */

      currentX =
        damp(
          currentX,
          targetX,
          active
            ? 17
            : 9,
          deltaTime,
        );

      currentY =
        damp(
          currentY,
          targetY,
          active
            ? 17
            : 9,
          deltaTime,
        );

      /*
       * Secondary reveal follows slower.
       */

      trailX =
        damp(
          trailX,
          targetX,
          active
            ? 6.2
            : 4.2,
          deltaTime,
        );

      trailY =
        damp(
          trailY,
          targetY,
          active
            ? 6.2
            : 4.2,
          deltaTime,
        );

      /*
       * Reveal opacity.
       *
       * Faster on entry,
       * softer on exit.
       */

      currentFocus =
        damp(
          currentFocus,
          targetFocus,
          active
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
          trailX -
            targetX,
        ) >
          0.0004 ||
        Math.abs(
          trailY -
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
     * POINTER UPDATE
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

      /*
       * Read coordinates against the
       * portrait stage itself rather
       * than the page.
       */

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

      targetFocus =
        1;

      requestFrame();
    }

    function handlePointerEnter(
      event: PointerEvent,
    ) {
      updatePointer(
        event,
      );
    }

    function handlePointerMove(
      event: PointerEvent,
    ) {
      updatePointer(
        event,
      );
    }

    function handlePointerLeave() {
      /*
       * Keep reveal position at the
       * last cursor location.
       *
       * Only fade its strength.
       */

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

      trailX =
        0.5;

      trailY =
        0.5;

      targetFocus =
        0;

      currentFocus =
        0;

      apply();
    }

    function handleEnvironmentChange() {
      if (
        reducedMotion.matches ||
        !interactivePointer.matches
      ) {
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
    }

    /*
     * =========================
     * EVENTS
     * =========================
     *
     * Keep listener on original visual.
     *
     * HeroAmbientSignature uses the
     * same area independently.
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
        "--portrait-trail-x",
        "--portrait-trail-y",
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

  /*
   * =========================
   * RENDER
   * =========================
   */

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
        aria-hidden="true"
      >
        <span />
        <span />
      </div>

      <div
        className={`${styles.shape} ${styles.shapeCircle}`}
        aria-hidden="true"
      />

      <div
        className={`${styles.shape} ${styles.shapeArch}`}
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
        {/* BASE PORTRAIT */}

        <div
          className={`${portraitStyles.layer} ${portraitStyles.baseLayer}`}
        >
          <Image
            src="/images/natsx-portrait-hero-before.png"
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

        {/* SLOW TRAILING ALT */}

        <div
          className={`${portraitStyles.layer} ${portraitStyles.altTrail}`}
          aria-hidden="true"
        >
          <Image
            src="/images/natsx-portrait-hero-aftr.png"
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 960px) 100vw, 42vw"
            className={
              portraitStyles.altImage
            }
          />
        </div>

        {/* MAIN ALT REVEAL */}

        <div
          className={`${portraitStyles.layer} ${portraitStyles.altCore}`}
          aria-hidden="true"
        >
          <Image
            src="/images/natsx-portrait-hero-aftr.png"
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