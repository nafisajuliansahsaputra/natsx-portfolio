"use client";

import {
  useEffect,
} from "react";

import styles from "./HomeHeroWorkHandoff.module.css";

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

export default function HomeHeroWorkHandoff() {
  useEffect(() => {
    const hero =
      document.querySelector<HTMLElement>(
        "[data-home-hero]",
      );

    const work =
      document.getElementById(
        "work",
      );

    if (
      !hero ||
      !work
    ) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );

    if (
      reducedMotion.matches
    ) {
      return;
    }

    const mobile =
      window.matchMedia(
        "(max-width: 700px)",
      );

    hero.dataset
      .homeHandoffHero =
      "true";

    work.dataset
      .homeHandoffWork =
      "true";

    let targetProgress =
      0;

    let currentProgress =
      0;

    let frameId:
      | number
      | null =
      null;

    let previousTime =
      performance.now();

    let destroyed =
      false;

    /*
     * =========================
     * CSS VARIABLE OUTPUT
     * =========================
     *
     * Semua choreography dikontrol
     * lewat sedikit CSS variables.
     *
     * JS hanya menghitung progress.
     * Visual styling tetap di CSS.
     */

    const applyProgress = (
      progress: number,
    ) => {
      const compact =
        mobile.matches;

      /*
       * Hero copy bergerak ke atas
       * dengan magnitude berbeda.
       *
       * Hierarchy:
       *
       * eyebrow  = paling ringan
       * title    = paling terasa
       * intro    = medium
       */

      const eyebrowY =
        progress *
        (
          compact
            ? -3
            : -9
        );

      const titleY =
        progress *
        (
          compact
            ? -8
            : -26
        );

      const introY =
        progress *
        (
          compact
            ? -5
            : -13
        );

      /*
       * Portrait side bergerak berlawanan.
       *
       * Bukan parallax besar.
       * Cukup untuk menciptakan separation
       * antara type dan visual.
       */

      const visualY =
        progress *
        (
          compact
            ? 7
            : 29
        );

      const visualScale =
        1 +
        progress *
          (
            compact
              ? 0.004
              : 0.019
          );

      /*
       * Selected Work perlahan ditarik
       * menuju posisi final saat Hero
       * menyerahkan viewport.
       */

      const workPullY =
        (
          1 -
          progress
        ) *
        (
          compact
            ? 9
            : 28
        );

      const workScale =
        0.993 +
        progress *
          0.007;

      /*
       * Accent handoff line hanya muncul
       * selama perpindahan.
       *
       * 0   = tidak terlihat
       * .5  = paling terlihat
       * 1   = hilang lagi
       *
       * Jadi tidak menjadi dekorasi
       * permanen di Selected Work.
       */

      const ruleOpacity =
        Math.sin(
          progress *
            Math.PI,
        );

      const ruleScale =
        clamp(
          progress *
            1.16,
          0,
          1,
        );

      hero.style.setProperty(
        "--home-handoff-eyebrow-y",
        `${eyebrowY.toFixed(
          3,
        )}px`,
      );

      hero.style.setProperty(
        "--home-handoff-title-y",
        `${titleY.toFixed(
          3,
        )}px`,
      );

      hero.style.setProperty(
        "--home-handoff-intro-y",
        `${introY.toFixed(
          3,
        )}px`,
      );

      hero.style.setProperty(
        "--home-handoff-visual-y",
        `${visualY.toFixed(
          3,
        )}px`,
      );

      hero.style.setProperty(
        "--home-handoff-visual-scale",
        visualScale.toFixed(
          5,
        ),
      );

      work.style.setProperty(
        "--home-handoff-work-y",
        `${workPullY.toFixed(
          3,
        )}px`,
      );

      work.style.setProperty(
        "--home-handoff-work-scale",
        workScale.toFixed(
          5,
        ),
      );

      work.style.setProperty(
        "--home-handoff-rule-opacity",
        ruleOpacity.toFixed(
          4,
        ),
      );

      work.style.setProperty(
        "--home-handoff-rule-scale",
        ruleScale.toFixed(
          4,
        ),
      );
    };

    /*
     * =========================
     * SCROLL → TARGET PROGRESS
     * =========================
     *
     * Progress tidak didasarkan
     * pada scrollY document.
     *
     * Kita pakai posisi bottom Hero,
     * sehingga tetap stabil kalau
     * viewport / header berubah.
     */

    const measureTarget =
      () => {
        const rect =
          hero.getBoundingClientRect();

        const viewportHeight =
          Math.max(
            window.innerHeight,
            1,
          );

        /*
         * Start:
         * Hero bottom melewati 72% viewport.
         *
         * End:
         * Hero bottom mencapai 18%.
         *
         * Memberi overlap cukup panjang
         * tanpa terasa seperti scroll scene
         * yang di-pin.
         */

        const startLine =
          viewportHeight *
          0.72;

        const endLine =
          viewportHeight *
          0.18;

        const range =
          Math.max(
            startLine -
              endLine,
            1,
          );

        targetProgress =
          clamp(
            (
              startLine -
              rect.bottom
            ) /
              range,
            0,
            1,
          );

        requestFrame();
      };

    /*
     * =========================
     * SMOOTH FOLLOW LOOP
     * =========================
     *
     * Scroll event cuma mengubah target.
     * Progress visual mengikuti target
     * dengan exponential damping.
     *
     * Ini menghindari gerakan mechanical
     * 1:1 terhadap wheel / trackpad.
     */

    const renderFrame = (
      timestamp: number,
    ) => {
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

      currentProgress =
        damp(
          currentProgress,
          targetProgress,
          10.5,
          deltaTime,
        );

      if (
        Math.abs(
          currentProgress -
            targetProgress,
        ) <
        0.0005
      ) {
        currentProgress =
          targetProgress;
      }

      applyProgress(
        currentProgress,
      );

      if (
        Math.abs(
          currentProgress -
            targetProgress,
        ) >
        0.0005
      ) {
        requestFrame();
      }
    };

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

    /*
     * Initial position.
     */

    const rect =
      hero.getBoundingClientRect();

    const viewportHeight =
      Math.max(
        window.innerHeight,
        1,
      );

    const startLine =
      viewportHeight *
      0.72;

    const endLine =
      viewportHeight *
      0.18;

    currentProgress =
      clamp(
        (
          startLine -
          rect.bottom
        ) /
          Math.max(
            startLine -
              endLine,
            1,
          ),
        0,
        1,
      );

    targetProgress =
      currentProgress;

    applyProgress(
      currentProgress,
    );

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
      hero,
    );

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

      resizeObserver?.disconnect();

      if (
        frameId !==
        null
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }

      delete hero.dataset
        .homeHandoffHero;

      delete work.dataset
        .homeHandoffWork;

      [
        "--home-handoff-eyebrow-y",
        "--home-handoff-title-y",
        "--home-handoff-intro-y",
        "--home-handoff-visual-y",
        "--home-handoff-visual-scale",
      ].forEach(
        (
          property,
        ) => {
          hero.style.removeProperty(
            property,
          );
        },
      );

      [
        "--home-handoff-work-y",
        "--home-handoff-work-scale",
        "--home-handoff-rule-opacity",
        "--home-handoff-rule-scale",
      ].forEach(
        (
          property,
        ) => {
          work.style.removeProperty(
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