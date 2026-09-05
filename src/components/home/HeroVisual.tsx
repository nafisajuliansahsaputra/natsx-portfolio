"use client";

import {
  useEffect,
  useRef,
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

export default function HeroVisual({
  locale,
}: HeroVisualProps) {
  const copy =
    getMessages(
      locale,
    );

  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  /*
   * =========================
   * HERO AMBIENT STATE
   * =========================
   *
   * Keep all original Hero ambience:
   *
   * - plus rotation
   * - title ambience
   * - eyebrow pulse
   * - CTA arrows
   *
   * This does NOT move the portrait.
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
   * TWO-PORTRAIT ENGINE
   * =========================
   *
   * IMPORTANT:
   *
   * Grid:
   *    still reacts spatially.
   *
   * Portrait:
   *    NEVER translates / rotates
   *    toward cursor.
   *
   * Cursor only changes which
   * portrait state is visible.
   */

  useEffect(() => {
    const visual =
      visualRef.current;

    if (!visual) {
      return;
    }

    const visualElement =
      visual;

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

    let destroyed =
      false;

    let frameId:
      | number
      | null =
      null;

    let previousTime =
      performance.now();

    /*
     * Pointer position.
     *
     * 0 → 1
     */
    let targetX =
      0;

    let targetY =
      0.5;

    let currentX =
      0;

    let currentY =
      0.5;

    /*
     * Interaction intensity.
     */
    let targetFocus =
      0;

    let currentFocus =
      0;

    /*
     * Global transformation progress:
     *
     * 0 = base portrait
     * 1 = alt portrait
     */
    let targetReveal =
      0;

    let currentReveal =
      0;

    function apply() {
      const pointerX =
        currentX *
        100;

      const pointerY =
        currentY *
        100;

      const reveal =
        smoothstep(
          currentReveal,
        );

      /*
       * Global sweep boundary.
       */
      const cut =
        reveal *
        100;

      /*
       * Local cursor reveal stays visible
       * even slightly ahead of the sweep.
       *
       * This produces the hybrid frame:
       *
       * face = ALT
       * body = BASE
       */
      const localOpacity =
        currentFocus *
        (
          0.48 +
          reveal *
            0.4
        );

      visualElement.style.setProperty(
        "--portrait-pointer-x",
        `${pointerX.toFixed(
          3,
        )}%`,
      );

      visualElement.style.setProperty(
        "--portrait-pointer-y",
        `${pointerY.toFixed(
          3,
        )}%`,
      );

      visualElement.style.setProperty(
        "--portrait-reveal",
        reveal.toFixed(
          5,
        ),
      );

      visualElement.style.setProperty(
        "--portrait-cut",
        `${cut.toFixed(
          3,
        )}%`,
      );

      visualElement.style.setProperty(
        "--portrait-focus",
        currentFocus.toFixed(
          4,
        ),
      );

      visualElement.style.setProperty(
        "--portrait-local-opacity",
        localOpacity.toFixed(
          4,
        ),
      );

      visualElement.dataset.portraitState =
        reveal >
        0.5
          ? "alt"
          : "base";
    }

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
       * Cursor mask reacts quickly.
       */
      currentX =
        damp(
          currentX,
          targetX,
          active
            ? 15
            : 8,
          deltaTime,
        );

      currentY =
        damp(
          currentY,
          targetY,
          active
            ? 15
            : 8,
          deltaTime,
        );

      /*
       * Focus slightly softer.
       */
      currentFocus =
        damp(
          currentFocus,
          targetFocus,
          active
            ? 10
            : 6,
          deltaTime,
        );

      /*
       * Main portrait transition trails
       * cursor intentionally.
       *
       * This is the important "liquid"
       * feeling from the reference.
       */
      currentReveal =
        damp(
          currentReveal,
          targetReveal,
          active
            ? 6.2
            : 4.8,
          deltaTime,
        );

      apply();

      const moving =
        Math.abs(
          currentX -
            targetX,
        ) >
          0.0005 ||
        Math.abs(
          currentY -
            targetY,
        ) >
          0.0005 ||
        Math.abs(
          currentFocus -
            targetFocus,
        ) >
          0.0005 ||
        Math.abs(
          currentReveal -
            targetReveal,
        ) >
          0.0005;

      if (
        moving
      ) {
        requestFrame();
      }
    }

    function updatePointer(
      event: PointerEvent,
    ) {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        !desktop.matches
      ) {
        return;
      }

      const rect =
        visualElement.getBoundingClientRect();

      if (
        rect.width <=
          0 ||
        rect.height <=
          0
      ) {
        return;
      }

      const x =
        clamp(
          (
            event.clientX -
            rect.left
          ) /
            rect.width,
          0,
          1,
        );

      const y =
        clamp(
          (
            event.clientY -
            rect.top
          ) /
            rect.height,
          0,
          1,
        );

      targetX =
        x;

      targetY =
        y;

      targetFocus =
        1;

      /*
       * Transformation controlled mainly
       * by horizontal cursor position.
       *
       * Slight deadzone on left/right
       * keeps states stable.
       */
      targetReveal =
        clamp(
          (
            x -
            0.08
          ) /
            0.84,
          0,
          1,
        );

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
       * Return smoothly to base.
       */
      targetX =
        0;

      targetY =
        0.5;

      targetFocus =
        0;

      targetReveal =
        0;

      requestFrame();
    }

    function reset() {
      targetX =
        0;

      targetY =
        0.5;

      targetFocus =
        0;

      targetReveal =
        0;

      requestFrame();
    }

    /*
     * Attach events to ORIGINAL
     * visual wrapper.
     *
     * HeroAmbientSignature also listens
     * here, so both systems receive the
     * exact same pointer.
     */

    visualElement.addEventListener(
      "pointerenter",
      handlePointerEnter,
    );

    visualElement.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
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
      reset,
    );

    finePointer.addEventListener(
      "change",
      reset,
    );

    desktop.addEventListener(
      "change",
      reset,
    );

    apply();

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
        reset,
      );

      finePointer.removeEventListener(
        "change",
        reset,
      );

      desktop.removeEventListener(
        "change",
        reset,
      );

      if (
        frameId !==
        null
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }

      delete visualElement.dataset
        .portraitState;

      [
        "--portrait-pointer-x",
        "--portrait-pointer-y",
        "--portrait-reveal",
        "--portrait-cut",
        "--portrait-focus",
        "--portrait-local-opacity",
      ].forEach(
        (
          property,
        ) => {
          visualElement.style.removeProperty(
            property,
          );
        },
      );
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
      data-portrait-state="base"
    >
      {/*
       * ORIGINAL PLUS
       */}
      <div
        className={
          styles.accentPlus
        }
        aria-hidden="true"
      >
        <span />

        <span />
      </div>

      {/*
       * ORIGINAL CIRCLE
       */}
      <div
        className={`${styles.shape} ${styles.shapeCircle}`}
        aria-hidden="true"
      />

      {/*
       * ORIGINAL ARCH
       */}
      <div
        className={`${styles.shape} ${styles.shapeArch}`}
        aria-hidden="true"
      />

      {/*
       * =========================
       * TWO-PORTRAIT STACK
       * =========================
       */}
      <div
        className={`${styles.portrait} ${portraitStyles.stage}`}
        data-motion-portrait="loaded"
      >
        {/*
         * BASE
         */}
        <div
          className={`${portraitStyles.layer} ${portraitStyles.baseLayer}`}
        >
          <Image
            src="/images/natsx-portrait-hero.png"
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
          />
        </div>

        {/*
         * ALT — MAIN SWEEP
         */}
        <div
          className={`${portraitStyles.layer} ${portraitStyles.altSweep}`}
          aria-hidden="true"
        >
          <Image
            src="/images/natsx-portrait-hero-alt.png"
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 960px) 100vw, 42vw"
            className={
              portraitStyles.altImage
            }
          />
        </div>

        {/*
         * ALT — CURSOR LOCAL REVEAL
         *
         * Same second photo.
         * Not a third state.
         */}
        <div
          className={`${portraitStyles.layer} ${portraitStyles.altLocal}`}
          aria-hidden="true"
        >
          <Image
            src="/images/natsx-portrait-hero-alt.png"
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 960px) 100vw, 42vw"
            className={
              portraitStyles.altImage
            }
          />
        </div>

        {/*
         * Soft seam treatment.
         */}
        <div
          className={`${portraitStyles.layer} ${portraitStyles.altEdge}`}
          aria-hidden="true"
        >
          <Image
            src="/images/natsx-portrait-hero-alt.png"
            alt=""
            fill
            loading="lazy"
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