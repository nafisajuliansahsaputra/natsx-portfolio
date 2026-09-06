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
import themeStyles from "./HeroThemeTransition.module.css";

type HeroVisualProps = {
  locale: Locale;
};

const THEME_SCROLL_RESET_THRESHOLD =
  28;

const THEME_TOP_LIMIT =
  24;

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

function updateShapeLightPosition(
  element: HTMLElement | null,
  clientX: number,
  clientY: number,
) {
  if (!element) {
    return;
  }

  const rect =
    element.getBoundingClientRect();

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
        clientX -
        rect.left
      ) /
        rect.width,
      -1,
      2,
    );

  const y =
    clamp(
      (
        clientY -
        rect.top
      ) /
        rect.height,
      -1,
      2,
    );

  element.style.setProperty(
    "--shape-light-x",
    `${(
      x *
      100
    ).toFixed(
      3,
    )}%`,
  );

  element.style.setProperty(
    "--shape-light-y",
    `${(
      y *
      100
    ).toFixed(
      3,
    )}%`,
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

  const circleRef =
    useRef<HTMLDivElement>(
      null,
    );

  const archRef =
    useRef<HTMLDivElement>(
      null,
    );

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

    const hero =
      visual.closest<HTMLElement>(
        "[data-home-hero]",
      );

    if (!hero) {
      return;
    }

    const visualElement =
      visual;

    const stageElement =
      stage;

    const heroElement =
      hero;

    const rootElement =
      document.documentElement;

    const circleElement =
      circleRef.current;

    const archElement =
      archRef.current;

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

    let targetX =
      0.5;

    let targetY =
      0.5;

    let currentX =
      0.5;

    let currentY =
      0.5;

    let trailX =
      0.5;

    let trailY =
      0.5;

    let targetFocus =
      0;

    let currentFocus =
      0;

    let targetLightX =
      0.74;

    let targetLightY =
      0.5;

    let currentLightX =
      0.74;

    let currentLightY =
      0.5;

    let targetLightStrength =
      0;

    let currentLightStrength =
      0;

    let themeActive =
      false;

    let pointerInsidePortrait =
      false;

    let themeArmed =
      true;

    let activationScrollY =
      Math.max(
        window.scrollY,
        0,
      );

    delete rootElement.dataset
      .heroTheme;

    delete heroElement.dataset
      .heroThemeActive;

    function activateDarkTheme() {
      if (
        themeActive ||
        !themeArmed ||
        reducedMotion.matches ||
        !interactivePointer.matches
      ) {
        return;
      }

      const currentScrollY =
        Math.max(
          window.scrollY,
          0,
        );

      if (
        currentScrollY >
        THEME_TOP_LIMIT
      ) {
        return;
      }

      themeActive =
        true;

      activationScrollY =
        currentScrollY;

      rootElement.dataset.heroTheme =
        "dark";

      heroElement.dataset.heroThemeActive =
        "true";

      targetLightStrength =
        1;

      requestFrame();
    }

    function deactivateDarkTheme(
      lockUntilPointerLeaves = false,
    ) {
      if (
        rootElement.dataset.heroTheme ===
        "dark"
      ) {
        delete rootElement.dataset
          .heroTheme;
      }

      delete heroElement.dataset
        .heroThemeActive;

      themeActive =
        false;

      targetLightStrength =
        0;

      requestFrame();

      if (
        lockUntilPointerLeaves &&
        pointerInsidePortrait
      ) {
        themeArmed =
          false;

        return;
      }

      themeArmed =
        true;
    }

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

      heroElement.style.setProperty(
        "--flashlight-hero-x",
        `${(
          currentLightX *
          100
        ).toFixed(
          3,
        )}%`,
      );

      heroElement.style.setProperty(
        "--flashlight-hero-y",
        `${(
          currentLightY *
          100
        ).toFixed(
          3,
        )}%`,
      );

      heroElement.style.setProperty(
        "--flashlight-strength",
        currentLightStrength.toFixed(
          4,
        ),
      );

      circleElement?.style.setProperty(
        "--shape-light-strength",
        currentLightStrength.toFixed(
          4,
        ),
      );

      archElement?.style.setProperty(
        "--shape-light-strength",
        currentLightStrength.toFixed(
          4,
        ),
      );

      stageElement.dataset.portraitState =
        currentFocus >
        0.025
          ? "active"
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

      trailX =
        damp(
          trailX,
          targetX,
          revealActive
            ? 6.2
            : 4.2,
          deltaTime,
        );

      trailY =
        damp(
          trailY,
          targetY,
          revealActive
            ? 6.2
            : 4.2,
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

      currentLightX =
        damp(
          currentLightX,
          targetLightX,
          16,
          deltaTime,
        );

      currentLightY =
        damp(
          currentLightY,
          targetLightY,
          16,
          deltaTime,
        );

      currentLightStrength =
        damp(
          currentLightStrength,
          targetLightStrength,
          targetLightStrength >
            currentLightStrength
            ? 6.2
            : 5,
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
          0.0004 ||
        Math.abs(
          currentLightX -
            targetLightX,
        ) >
          0.0004 ||
        Math.abs(
          currentLightY -
            targetLightY,
        ) >
          0.0004 ||
        Math.abs(
          currentLightStrength -
            targetLightStrength,
        ) >
          0.0004;

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
        !interactivePointer.matches
      ) {
        return;
      }

      const stageRect =
        stageElement.getBoundingClientRect();

      if (
        stageRect.width >
          0 &&
        stageRect.height >
          0
      ) {
        targetX =
          clamp(
            (
              event.clientX -
              stageRect.left
            ) /
              stageRect.width,
            0,
            1,
          );

        targetY =
          clamp(
            (
              event.clientY -
              stageRect.top
            ) /
              stageRect.height,
            0,
            1,
          );
      }

      const heroRect =
        heroElement.getBoundingClientRect();

      if (
        heroRect.width >
          0 &&
        heroRect.height >
          0
      ) {
        targetLightX =
          clamp(
            (
              event.clientX -
              heroRect.left
            ) /
              heroRect.width,
            0,
            1,
          );

        targetLightY =
          clamp(
            (
              event.clientY -
              heroRect.top
            ) /
              heroRect.height,
            0,
            1,
          );
      }

      updateShapeLightPosition(
        circleElement,
        event.clientX,
        event.clientY,
      );

      updateShapeLightPosition(
        archElement,
        event.clientX,
        event.clientY,
      );

      requestFrame();
    }

    function updateThemeZone(
      event: PointerEvent,
    ) {
      const rect =
        stageElement.getBoundingClientRect();

      const inside =
        isInsidePortraitZone(
          event.clientX,
          event.clientY,
          rect,
        );

      if (inside) {
        targetFocus =
          1;

        if (
          !pointerInsidePortrait
        ) {
          pointerInsidePortrait =
            true;

          activateDarkTheme();
        }

        if (
          themeActive
        ) {
          targetLightStrength =
            1;
        }

        return;
      }

      targetFocus =
        0;

      if (
        pointerInsidePortrait
      ) {
        pointerInsidePortrait =
          false;

        themeArmed =
          true;

        deactivateDarkTheme();
      }
    }

    function handlePointerEnter(
      event: PointerEvent,
    ) {
      updatePointer(
        event,
      );

      updateThemeZone(
        event,
      );
    }

    function handlePointerMove(
      event: PointerEvent,
    ) {
      updatePointer(
        event,
      );

      updateThemeZone(
        event,
      );
    }

    function handlePointerLeave() {
      pointerInsidePortrait =
        false;

      themeArmed =
        true;

      targetFocus =
        0;

      targetLightStrength =
        0;

      deactivateDarkTheme();

      requestFrame();
    }

    function handleScroll() {
      if (
        !themeActive
      ) {
        return;
      }

      const currentScrollY =
        Math.max(
          window.scrollY,
          0,
        );

      const travelled =
        Math.abs(
          currentScrollY -
            activationScrollY,
        );

      if (
        travelled <
        THEME_SCROLL_RESET_THRESHOLD
      ) {
        return;
      }

      deactivateDarkTheme(
        true,
      );

      targetFocus =
        0;

      targetLightStrength =
        0;

      requestFrame();
    }

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

      targetLightX =
        0.74;

      targetLightY =
        0.5;

      currentLightX =
        0.74;

      currentLightY =
        0.5;

      targetLightStrength =
        0;

      currentLightStrength =
        0;

      pointerInsidePortrait =
        false;

      themeArmed =
        true;

      deactivateDarkTheme();

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

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive:
          true,
      },
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

      window.removeEventListener(
        "scroll",
        handleScroll,
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

      [
        "--flashlight-hero-x",
        "--flashlight-hero-y",
        "--flashlight-strength",
      ].forEach(
        (
          property,
        ) => {
          heroElement.style.removeProperty(
            property,
          );
        },
      );

      [
        circleElement,
        archElement,
      ].forEach(
        (
          element,
        ) => {
          if (!element) {
            return;
          }

          [
            "--shape-light-x",
            "--shape-light-y",
            "--shape-light-strength",
          ].forEach(
            (
              property,
            ) => {
              element.style.removeProperty(
                property,
              );
            },
          );
        },
      );

      delete rootElement.dataset
        .heroTheme;

      delete heroElement.dataset
        .heroThemeActive;

      delete stageElement.dataset
        .portraitState;
    };
  }, []);

  return (
    <div
      ref={
        visualRef
      }
      className={`${styles.visual} ${themeStyles.themeScope}`}
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
        ref={
          circleRef
        }
        className={`${styles.shape} ${styles.shapeCircle}`}
        data-hero-shape="circle"
        aria-hidden="true"
      />

      <div
        ref={
          archRef
        }
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
          className={`${portraitStyles.layer} ${portraitStyles.fallbackLayer}`}
          aria-hidden="true"
        >
          <Image
            src="/images/natsx-portrait-hero-bfr.png"
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 960px) 100vw, 42vw"
            className={
              portraitStyles.fallbackImage
            }
          />
        </div>

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