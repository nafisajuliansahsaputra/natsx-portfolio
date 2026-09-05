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

type HeroVisualProps = {
  locale: Locale;
};

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

  const portraitRef =
    useRef<HTMLImageElement>(
      null,
    );

  const circleRef =
    useRef<HTMLDivElement>(
      null,
    );

  const archRef =
    useRef<HTMLDivElement>(
      null,
    );

  /*
   * =========================
   * IMAGE LOAD STATE
   * =========================
   */

  useEffect(() => {
    const image =
      portraitRef.current;

    if (!image) {
      return;
    }

    const syncLoadedState =
      () => {
        if (
          image.complete &&
          image.naturalWidth >
            0
        ) {
          setPortraitLoaded(
            true,
          );
        }
      };

    syncLoadedState();

    image.addEventListener(
      "load",
      syncLoadedState,
    );

    return () => {
      image.removeEventListener(
        "load",
        syncLoadedState,
      );
    };
  }, []);

  /*
   * =========================
   * MAGNETIC DEPTH SYSTEM
   * =========================
   *
   * Physics-based magnetic motion.
   *
   * Instead of directly interpolating
   * the portrait toward the cursor,
   * every layer has:
   *
   * - target
   * - velocity
   * - spring force
   * - damping
   *
   * This gives the hero visual
   * actual perceived weight.
   */

  useEffect(() => {
    const visual =
      visualRef.current;

    const portrait =
      portraitRef.current;

    const circle =
      circleRef.current;

    const arch =
      archRef.current;

    if (
      !visual ||
      !portrait ||
      !circle ||
      !arch
    ) {
      return;
    }

    const hero =
      visual.closest(
        "[data-home-hero]",
      ) as HTMLElement | null;

    if (!hero) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const finePointer =
      window.matchMedia(
        "(pointer: fine)",
      );

    let isInView =
      true;

    let frameId:
      | number
      | null =
      null;

    /*
     * Normalized pointer target:
     *
     * -1 ... 1
     */
    let targetX =
      0;

    let targetY =
      0;

    /*
     * Current spring position.
     */
    let currentX =
      0;

    let currentY =
      0;

    /*
     * Spring velocity.
     */
    let velocityX =
      0;

    let velocityY =
      0;

    /*
     * Magnetic tuning.
     *
     * Cursor-following and release
     * intentionally use different
     * spring profiles.
     *
     * While the cursor is inside the
     * visual, the response is quick and
     * magnetic. When the cursor leaves,
     * the return spring becomes softer
     * and keeps a little more momentum,
     * creating a smooth rebound instead
     * of a stiff snap-back.
     */
    const activeSpring =
      0.068;

    const activeDamping =
      0.77;

    const returnSpring =
      0.03;

    const returnDamping =
      0.84;

    let isPointerActive =
      false;

    /*
     * Amplifies subtle cursor
     * movement around the center.
     *
     * This avoids the old feeling
     * where the visual only moves
     * when the pointer travels far.
     */
    const shapeInput = (
      value: number,
    ) => {
      if (
        value ===
        0
      ) {
        return 0;
      }

      return (
        Math.sign(
          value,
        ) *
        Math.pow(
          Math.abs(
            value,
          ),
          0.78,
        )
      );
    };

    const applyMagnetic = (
      x: number,
      y: number,
    ) => {
      const shapedX =
        shapeInput(
          x,
        );

      const shapedY =
        shapeInput(
          y,
        );

      const intensity =
        Math.min(
          1,
          Math.hypot(
            shapedX,
            shapedY,
          ),
        );

      /*
       * =========================
       * PORTRAIT
       * =========================
       */

      const portraitX =
        shapedX *
        32;

      const portraitY =
        shapedY *
        21;

      const portraitRotate =
        shapedX *
          0.82 -
        shapedY *
          0.16;

      const portraitScale =
        1.006 +
        intensity *
          0.008;

      portrait.style.transform = `
        translate3d(
          ${portraitX}px,
          ${portraitY}px,
          0
        )
        rotate(
          ${portraitRotate}deg
        )
        scale(
          ${portraitScale}
        )
      `;

      /*
       * =========================
       * LIGHT CIRCLE
       * =========================
       */

      const circleX =
        shapedX *
        -20;

      const circleY =
        shapedY *
        -14;

      circle.style.transform = `
        translate3d(
          ${circleX}px,
          ${circleY}px,
          0
        )
        scale(
          ${
            1 +
            intensity *
              0.011
          }
        )
      `;

      /*
       * =========================
       * DARK ARCH
       * =========================
       */

      const archX =
        shapedX *
        15;

      const archY =
        shapedY *
        10;

      const archRotate =
        shapedX *
        0.38;

      arch.style.transform = `
        translate3d(
          ${archX}px,
          ${archY}px,
          0
        )
        rotate(
          ${archRotate}deg
        )
      `;
    };

    const resetVisual =
      () => {
        targetX =
          0;

        targetY =
          0;

        currentX =
          0;

        currentY =
          0;

        velocityX =
          0;

        velocityY =
          0;

        applyMagnetic(
          0,
          0,
        );
      };

    /*
     * Ambient animations are
     * independent from magnetic
     * portrait movement.
     */

    const syncAmbientState =
      () => {
        const shouldRun =
          isInView &&
          !document.hidden &&
          !reducedMotion.matches;

        hero.dataset.ambientActive =
          shouldRun
            ? "true"
            : "false";
      };

    /*
     * =========================
     * SPRING LOOP
     * =========================
     */

    const renderMagnetic =
      () => {
        /*
         * Strong responsive attraction
         * while cursor is inside.
         *
         * Softer spring + more retained
         * momentum when released.
         */
        const spring =
          isPointerActive
            ? activeSpring
            : returnSpring;

        const damping =
          isPointerActive
            ? activeDamping
            : returnDamping;

        /*
         * Spring acceleration.
         */
        velocityX +=
          (
            targetX -
            currentX
          ) *
          spring;

        velocityY +=
          (
            targetY -
            currentY
          ) *
          spring;

        /*
         * Energy loss.
         */
        velocityX *=
          damping;

        velocityY *=
          damping;

        /*
         * Integrate position.
         */
        currentX +=
          velocityX;

        currentY +=
          velocityY;

        applyMagnetic(
          currentX,
          currentY,
        );

        const distanceX =
          Math.abs(
            targetX -
              currentX,
          );

        const distanceY =
          Math.abs(
            targetY -
              currentY,
          );

        const motionEnergy =
          Math.abs(
            velocityX,
          ) +
          Math.abs(
            velocityY,
          );

        const stillMoving =
          distanceX >
            0.0004 ||
          distanceY >
            0.0004 ||
          motionEnergy >
            0.0004;

        if (
          stillMoving
        ) {
          frameId =
            window.requestAnimationFrame(
              renderMagnetic,
            );

          return;
        }

        currentX =
          targetX;

        currentY =
          targetY;

        velocityX =
          0;

        velocityY =
          0;

        applyMagnetic(
          currentX,
          currentY,
        );

        frameId =
          null;
      };

    const requestFrame =
      () => {
        if (
          frameId !==
          null
        ) {
          return;
        }

        frameId =
          window.requestAnimationFrame(
            renderMagnetic,
          );
      };

    /*
     * =========================
     * POINTER
     * =========================
     *
     * Magnetic field only exists
     * inside the visual area.
     *
     * Moving from the picture toward
     * the hero text immediately releases
     * the visual back toward center.
     */

    const handlePointerEnter =
      () => {
        if (
          !finePointer.matches ||
          reducedMotion.matches ||
          !isInView
        ) {
          return;
        }

        isPointerActive =
          true;
      };

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      if (
        !finePointer.matches ||
        reducedMotion.matches ||
        !isInView
      ) {
        return;
      }

      isPointerActive =
        true;

      /*
       * IMPORTANT:
       *
       * Calculate cursor position from
       * VISUAL bounds instead of the
       * entire hero.
       *
       * This gives stronger local
       * magnetic sensitivity.
       */
      const rect =
        visual.getBoundingClientRect();

      if (
        rect.width <=
          0 ||
        rect.height <=
          0
      ) {
        return;
      }

      const x =
        (
          (
            event.clientX -
            rect.left
          ) /
            rect.width -
          0.5
        ) *
        2;

      const y =
        (
          (
            event.clientY -
            rect.top
          ) /
            rect.height -
          0.5
        ) *
        2;

      targetX =
        Math.max(
          -1,
          Math.min(
            1,
            x,
          ),
        );

      targetY =
        Math.max(
          -1,
          Math.min(
            1,
            y,
          ),
        );

      requestFrame();
    };

    const handlePointerLeave =
      () => {
        /*
         * Release magnetic coupling.
         *
         * Do NOT reset velocity.
         *
         * Existing movement momentum
         * naturally carries into the
         * return spring and produces
         * the soft rebound.
         */
        isPointerActive =
          false;

        targetX =
          0;

        targetY =
          0;

        requestFrame();
      };

    /*
     * =========================
     * REDUCED MOTION
     * =========================
     */

    const handleReducedMotion =
      () => {
        if (
          reducedMotion.matches
        ) {
          isPointerActive =
            false;

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

          resetVisual();
        }

        syncAmbientState();
      };

    /*
     * =========================
     * HERO VISIBILITY
     * =========================
     */

    let observer:
      | IntersectionObserver
      | null =
      null;

    if (
      "IntersectionObserver" in
      window
    ) {
      observer =
        new IntersectionObserver(
          (
            [
              entry,
            ],
          ) => {
            isInView =
              entry.isIntersecting;

            if (
              !isInView
            ) {
              isPointerActive =
                false;

              targetX =
                0;

              targetY =
                0;

              requestFrame();
            }

            syncAmbientState();
          },
          {
            threshold:
              0.1,
          },
        );

      observer.observe(
        hero,
      );
    } else {
      syncAmbientState();
    }

    /*
     * Pointer tracking is attached
     * ONLY to the right visual.
     */
    visual.addEventListener(
      "pointerenter",
      handlePointerEnter,
    );

    visual.addEventListener(
      "pointermove",
      handlePointerMove,
    );

    visual.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    document.addEventListener(
      "visibilitychange",
      syncAmbientState,
    );

    reducedMotion.addEventListener(
      "change",
      handleReducedMotion,
    );

    resetVisual();
    syncAmbientState();

    return () => {
      observer?.disconnect();

      visual.removeEventListener(
        "pointerenter",
        handlePointerEnter,
      );

      visual.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      visual.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );

      document.removeEventListener(
        "visibilitychange",
        syncAmbientState,
      );

      reducedMotion.removeEventListener(
        "change",
        handleReducedMotion,
      );

      if (
        frameId !==
        null
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }

      portrait.style.removeProperty(
        "transform",
      );

      circle.style.removeProperty(
        "transform",
      );

      arch.style.removeProperty(
        "transform",
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
        ref={
          circleRef
        }
        className={`${styles.shape} ${styles.shapeCircle}`}
        aria-hidden="true"
      />

      <div
        ref={
          archRef
        }
        className={`${styles.shape} ${styles.shapeArch}`}
        aria-hidden="true"
      />

      <div
        className={
          styles.portrait
        }
        data-motion-portrait={
          portraitLoaded
            ? "loaded"
            : "loading"
        }
      >
        <Image
          ref={
            portraitRef
          }
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
            styles.portraitImage
          }
          onLoad={() =>
            setPortraitLoaded(
              true,
            )
          }
        />
      </div>
    </div>
  );
}