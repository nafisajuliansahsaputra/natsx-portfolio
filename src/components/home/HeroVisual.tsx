"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import useIntroCompletion from "@/components/intro/useIntroCompletion";

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


type SmoothDampResult = {
  value: number;
  velocity: number;
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
    (target - current) *
      (
        1 -
        Math.exp(
          -lambda *
            deltaTime,
        )
      )
  );
}


function smoothDamp(
  current: number,
  target: number,
  velocity: number,
  smoothTime: number,
  deltaTime: number,
): SmoothDampResult {
  const safeSmoothTime =
    Math.max(
      smoothTime,
      0.0001,
    );

  const omega =
    2 /
    safeSmoothTime;

  const x =
    omega *
    deltaTime;

  const exponential =
    1 /
    (
      1 +
      x +
      0.48 *
        x *
        x +
      0.235 *
        x *
        x *
        x
    );

  const change =
    current -
    target;

  const temporary =
    (
      velocity +
      omega *
        change
    ) *
    deltaTime;

  const nextVelocity =
    (
      velocity -
      omega *
        temporary
    ) *
    exponential;

  const nextValue =
    target +
    (
      change +
      temporary
    ) *
    exponential;

  return {
    value:
      nextValue,

    velocity:
      nextVelocity,
  };
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

  const introDone =
    useIntroCompletion();

  const [
    portraitLoaded,
    setPortraitLoaded,
  ] =
    useState(
      false,
    );

  const [
    alternatePortraitEnabled,
    setAlternatePortraitEnabled,
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
   * =====================================================
   * ALTERNATE PORTRAIT DELIVERY
   * =====================================================
   *
   * BASE tetap menjadi critical image / LCP.
   *
   * Desktop:
   * ALT diaktifkan langsung setelah BASE siap,
   * karena diperlukan cursor reveal.
   *
   * Mobile:
   * ALT baru mulai dimuat sedikit setelah BASE
   * selesai supaya tidak ikut berebut critical load.
   *
   * Tidak ada autoplay effect.
   */

  useEffect(() => {
    if (
      !portraitLoaded ||
      !introDone
    ) {
      return;
    }

    const desktop =
      window.matchMedia(
        "(min-width: 961px)",
      );

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    let mobileLoadTimer:
      | number
      | null =
      null;


    function clearMobileLoadTimer() {
      if (
        mobileLoadTimer ===
        null
      ) {
        return;
      }

      window.clearTimeout(
        mobileLoadTimer,
      );

      mobileLoadTimer =
        null;
    }


    function enableWhenUseful() {
      clearMobileLoadTimer();

      if (
        reducedMotion.matches
      ) {
        return;
      }

      /*
       * Desktop:
       * langsung siap untuk hover.
       */
      if (
        desktop.matches
      ) {
        setAlternatePortraitEnabled(
          true,
        );

        return;
      }

      /*
       * Mobile / tablet:
       * beri BASE sedikit ruang
       * menyelesaikan critical paint.
       */
      mobileLoadTimer =
        window.setTimeout(
          () => {
            setAlternatePortraitEnabled(
              true,
            );

            mobileLoadTimer =
              null;
          },
          650,
        );
    }


    enableWhenUseful();

    desktop.addEventListener(
      "change",
      enableWhenUseful,
    );

    reducedMotion.addEventListener(
      "change",
      enableWhenUseful,
    );


    return () => {
      clearMobileLoadTimer();

      desktop.removeEventListener(
        "change",
        enableWhenUseful,
      );

      reducedMotion.removeEventListener(
        "change",
        enableWhenUseful,
      );
    };
  }, [
    introDone,
    portraitLoaded,
  ]);


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

    const heroElement:
      HTMLElement =
      hero;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    let isInView =
      true;


    function syncAmbientState() {
      const active =
        introDone &&
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
            ([entry]) => {
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
  }, [
    introDone,
  ]);


  /*
   * =====================================================
   * PORTRAIT REVEAL ENGINE
   * =====================================================
   *
   * DESKTOP:
   * pointer-follow radial brush.
   *
   * MOBILE:
   * tap creates the same radial brush
   * at the tapped position.
   *
   * Both use the exact same:
   *
   * - radius physics
   * - feather
   * - brush mask
   * - inverse BASE eraser
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

    const visualElement:
      HTMLDivElement =
      visual;

    const stageElement:
      HTMLDivElement =
      stage;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    const interactivePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine) and (min-width: 961px)",
      );

    const touchLayout =
      window.matchMedia(
        "(max-width: 960px) and (pointer: coarse)",
      );

    let destroyed =
      false;

    let frameId:
      | number
      | null =
      null;

    let previousTime =
      performance.now();

    let targetX =
      0.5;

    let targetY =
      0.5;

    let currentX =
      0.5;

    let currentY =
      0.5;

    let targetRadius =
      0;

    let currentRadius =
      0;

    let radiusVelocity =
      0;

    let mobileTracking =
      false;

    let mobileMoved =
      false;

    let mobileStartX =
      0;

    let mobileStartY =
      0;

    let mobileCollapseTimer:
      | number
      | null =
      null;


    function clearMobileCollapseTimer() {
      if (
        mobileCollapseTimer ===
        null
      ) {
        return;
      }

      window.clearTimeout(
        mobileCollapseTimer,
      );

      mobileCollapseTimer =
        null;
    }


    function getDesktopMaximumRadius() {
      return clamp(
        window.innerWidth *
          0.108,
        155,
        190,
      );
    }


    function getMobileMaximumRadius(
      rect: DOMRect,
    ) {
      const shortestSide =
        Math.min(
          rect.width,
          rect.height,
        );

      return clamp(
        shortestSide *
          0.31,
        104,
        142,
      );
    }


    function apply() {
      const radius =
        Math.max(
          currentRadius,
          0.01,
        );

      /*
       * Same creamy feather field
       * untuk desktop dan mobile.
       */
      const feather =
        Math.min(
          36,
          Math.max(
            radius *
              0.235,
            0,
          ),
        );

      /*
       * Core tetap kuat supaya BASE
       * tidak bocor ke area ALT.
       */
      const cutRadius =
        Math.max(
          radius -
            feather *
              0.68,
          0.01,
        );

      const start =
        Math.max(
          radius -
            feather,
          0,
        );

      const feather1 =
        start +
        feather *
          0.08;

      const feather2 =
        start +
        feather *
          0.18;

      const feather3 =
        start +
        feather *
          0.31;

      const feather4 =
        start +
        feather *
          0.47;

      const feather5 =
        start +
        feather *
          0.63;

      const feather6 =
        start +
        feather *
          0.77;

      const feather7 =
        start +
        feather *
          0.89;

      const feather8 =
        start +
        feather *
          0.965;


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
        "--portrait-radius",
        `${radius.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-cut-radius",
        `${cutRadius.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-start",
        `${start.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-1",
        `${feather1.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-2",
        `${feather2.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-3",
        `${feather3.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-4",
        `${feather4.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-5",
        `${feather5.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-6",
        `${feather6.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-7",
        `${feather7.toFixed(
          3,
        )}px`,
      );

      stageElement.style.setProperty(
        "--portrait-feather-8",
        `${feather8.toFixed(
          3,
        )}px`,
      );
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
          0.033,
        );

      previousTime =
        timestamp;

      currentX =
        damp(
          currentX,
          targetX,
          24,
          deltaTime,
        );

      currentY =
        damp(
          currentY,
          targetY,
          24,
          deltaTime,
        );

      const radiusResult =
        smoothDamp(
          currentRadius,
          targetRadius,
          radiusVelocity,
          targetRadius >
            currentRadius
            ? 0.17
            : 0.23,
          deltaTime,
        );

      currentRadius =
        Math.max(
          radiusResult.value,
          0,
        );

      radiusVelocity =
        radiusResult.velocity;


      if (
        Math.abs(
          currentRadius -
            targetRadius,
        ) <
          0.04 &&
        Math.abs(
          radiusVelocity,
        ) <
          0.15
      ) {
        currentRadius =
          targetRadius;

        radiusVelocity =
          0;
      }


      if (
        Math.abs(
          currentX -
            targetX,
        ) <
        0.0002
      ) {
        currentX =
          targetX;
      }


      if (
        Math.abs(
          currentY -
            targetY,
        ) <
        0.0002
      ) {
        currentY =
          targetY;
      }


      apply();


      const moving =
        Math.abs(
          currentRadius -
            targetRadius,
        ) >
          0.04 ||
        Math.abs(
          radiusVelocity,
        ) >
          0.15 ||
        Math.abs(
          currentX -
            targetX,
        ) >
          0.0002 ||
        Math.abs(
          currentY -
            targetY,
        ) >
          0.0002;


      if (
        moving
      ) {
        requestFrame();
      }
    }


    /*
     * =========================
     * DESKTOP POINTER
     * =========================
     */

    function updateDesktopInteraction(
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

      const nextX =
        clamp(
          (
            event.clientX -
            rect.left
          ) /
            rect.width,
          0,
          1,
        );

      const nextY =
        clamp(
          (
            event.clientY -
            rect.top
          ) /
            rect.height,
          0,
          1,
        );

      const inside =
        isInsidePortraitZone(
          event.clientX,
          event.clientY,
          rect,
        );


      if (
        currentRadius <
          1 &&
        inside
      ) {
        currentX =
          nextX;

        currentY =
          nextY;
      }


      targetX =
        nextX;

      targetY =
        nextY;

      targetRadius =
        inside
          ? getDesktopMaximumRadius()
          : 0;

      requestFrame();
    }


    function handlePointerEnter(
      event: PointerEvent,
    ) {
      updateDesktopInteraction(
        event,
      );
    }


    function handlePointerMove(
      event: PointerEvent,
    ) {
      updateDesktopInteraction(
        event,
      );
    }


    function handlePointerLeave() {
      if (
        !interactivePointer.matches
      ) {
        return;
      }

      targetRadius =
        0;

      requestFrame();
    }


    /*
     * =========================
     * MOBILE TAP
     * =========================
     *
     * Pointer down alone does nothing.
     *
     * Reveal only happens after a
     * genuine TAP, so normal vertical
     * scrolling remains untouched.
     */

    function handleMobilePointerDown(
      event: PointerEvent,
    ) {
      if (
        reducedMotion.matches ||
        !touchLayout.matches ||
        event.pointerType ===
          "mouse"
      ) {
        return;
      }

      mobileTracking =
        true;

      mobileMoved =
        false;

      mobileStartX =
        event.clientX;

      mobileStartY =
        event.clientY;
    }


    function handleMobilePointerMove(
      event: PointerEvent,
    ) {
      if (
        !mobileTracking
      ) {
        return;
      }

      const distance =
        Math.hypot(
          event.clientX -
            mobileStartX,
          event.clientY -
            mobileStartY,
        );

      /*
       * Lebih dari 12px dianggap
       * scrolling / drag, bukan tap.
       */
      if (
        distance >
        12
      ) {
        mobileMoved =
          true;
      }
    }


    function handleMobilePointerUp(
      event: PointerEvent,
    ) {
      if (
        !mobileTracking
      ) {
        return;
      }

      const wasTap =
        !mobileMoved;

      mobileTracking =
        false;

      mobileMoved =
        false;


      if (
        !wasTap ||
        reducedMotion.matches ||
        !touchLayout.matches ||
        event.pointerType ===
          "mouse" ||
        stageElement.dataset
          .mobileAltReady !==
          "true"
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


      /*
       * Hanya tap pada portrait zone
       * yang memicu reveal.
       */
      const inside =
        isInsidePortraitZone(
          event.clientX,
          event.clientY,
          rect,
        );

      if (
        !inside
      ) {
        return;
      }


      const nextX =
        clamp(
          (
            event.clientX -
            rect.left
          ) /
            rect.width,
          0,
          1,
        );

      const nextY =
        clamp(
          (
            event.clientY -
            rect.top
          ) /
            rect.height,
          0,
          1,
        );


      clearMobileCollapseTimer();


      /*
       * Tap baru selalu mengambil
       * posisi jari secara langsung.
       *
       * Tidak ada trailing cursor
       * seperti desktop.
       */
      currentX =
        nextX;

      currentY =
        nextY;

      targetX =
        nextX;

      targetY =
        nextY;

      radiusVelocity =
        0;

      targetRadius =
        getMobileMaximumRadius(
          rect,
        );

      requestFrame();


      /*
       * Circle sempat mencapai ukuran
       * penuh lalu kembali mengecil.
       *
       * Total feel sekitar ±1 detik.
       */
      mobileCollapseTimer =
        window.setTimeout(
          () => {
            targetRadius =
              0;

            requestFrame();

            mobileCollapseTimer =
              null;
          },
          620,
        );
    }


    function cancelMobileTracking() {
      mobileTracking =
        false;

      mobileMoved =
        false;
    }


    /*
     * =========================
     * RESET / ENVIRONMENT
     * =========================
     */

    function resetInteraction() {
      clearMobileCollapseTimer();

      mobileTracking =
        false;

      mobileMoved =
        false;

      targetRadius =
        0;

      currentRadius =
        0;

      radiusVelocity =
        0;

      targetX =
        0.5;

      targetY =
        0.5;

      currentX =
        0.5;

      currentY =
        0.5;


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

      apply();
    }


    function handleEnvironmentChange() {
      resetInteraction();
    }


    function handleResize() {
      /*
       * Desktop hover circle keeps
       * adapting to viewport size.
       */
      if (
        interactivePointer.matches &&
        targetRadius >
          0
      ) {
        targetRadius =
          getDesktopMaximumRadius();

        requestFrame();
      }
    }


    /*
     * Desktop listeners.
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


    /*
     * Mobile tap listeners.
     */
    stageElement.addEventListener(
      "pointerdown",
      handleMobilePointerDown,
      {
        passive:
          true,
      },
    );

    stageElement.addEventListener(
      "pointermove",
      handleMobilePointerMove,
      {
        passive:
          true,
      },
    );

    stageElement.addEventListener(
      "pointerup",
      handleMobilePointerUp,
      {
        passive:
          true,
      },
    );

    stageElement.addEventListener(
      "pointercancel",
      cancelMobileTracking,
    );


    reducedMotion.addEventListener(
      "change",
      handleEnvironmentChange,
    );

    interactivePointer.addEventListener(
      "change",
      handleEnvironmentChange,
    );

    touchLayout.addEventListener(
      "change",
      handleEnvironmentChange,
    );

    window.addEventListener(
      "resize",
      handleResize,
      {
        passive:
          true,
      },
    );


    apply();


    return () => {
      destroyed =
        true;

      clearMobileCollapseTimer();


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


      stageElement.removeEventListener(
        "pointerdown",
        handleMobilePointerDown,
      );

      stageElement.removeEventListener(
        "pointermove",
        handleMobilePointerMove,
      );

      stageElement.removeEventListener(
        "pointerup",
        handleMobilePointerUp,
      );

      stageElement.removeEventListener(
        "pointercancel",
        cancelMobileTracking,
      );


      reducedMotion.removeEventListener(
        "change",
        handleEnvironmentChange,
      );

      interactivePointer.removeEventListener(
        "change",
        handleEnvironmentChange,
      );

      touchLayout.removeEventListener(
        "change",
        handleEnvironmentChange,
      );

      window.removeEventListener(
        "resize",
        handleResize,
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
        "--portrait-radius",
        "--portrait-cut-radius",
        "--portrait-feather-start",
        "--portrait-feather-1",
        "--portrait-feather-2",
        "--portrait-feather-3",
        "--portrait-feather-4",
        "--portrait-feather-5",
        "--portrait-feather-6",
        "--portrait-feather-7",
        "--portrait-feather-8",
      ].forEach(
        (
          property,
        ) => {
          stageElement.style.removeProperty(
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
      >
        <div
          className={`${portraitStyles.layer} ${portraitStyles.baseLayer}`}
        >
          <Image
            src="/images/natsx-portrait-hero-bases.png"
            alt={
              copy
                .accessibility
                .portrait
            }
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 960px) 100vw, 42vw"
            className={
              portraitStyles.baseImage
            }
            onLoad={() => {
              setPortraitLoaded(
                true,
              );
            }}
          />
        </div>

        <div
          className={`${portraitStyles.layer} ${portraitStyles.altLayer}`}
          aria-hidden="true"
        >
          {alternatePortraitEnabled ? (
            <Image
              src="/images/natsx-portrait-hero-altes.png"
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 960px) 100vw, 42vw"
              className={
                portraitStyles.altImage
              }
              onLoad={() => {
                const stage =
                  portraitStageRef.current;

                if (!stage) {
                  return;
                }

                stage.dataset.mobileAltReady =
                  "true";
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}