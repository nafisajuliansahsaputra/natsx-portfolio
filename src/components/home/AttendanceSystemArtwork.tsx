"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { PublicProject } from "@/lib/public-projects";

import styles from "./AttendanceSystemArtwork.module.css";

const AttendanceEditorialScene = dynamic(
  () => import("./AttendanceEditorialScene"),
  {
    ssr: false,
  },
);

const SCENE_PRELOAD_MARGIN = "300px 0px";

type AttendanceSystemArtworkProps = {
  project: PublicProject;
  primaryVisual: string | null;
  secondaryVisual: string | null;
};

function clamp(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export default function AttendanceSystemArtwork({
  project,
  primaryVisual,
  secondaryVisual,
}: AttendanceSystemArtworkProps) {
  const artworkRef = useRef<HTMLDivElement>(null);

  const [shouldLoadScene, setShouldLoadScene] = useState(false);

  useEffect(() => {
    const currentArtwork = artworkRef.current;

    if (!currentArtwork) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => {
        setShouldLoadScene(true);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry || !entry.isIntersecting) {
          return;
        }

        setShouldLoadScene(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: SCENE_PRELOAD_MARGIN,
        threshold: 0.01,
      },
    );

    observer.observe(currentArtwork);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =========================================================
     TEXT / UI COUNTER PARALLAX

     iMac follows the pointer inside AttendanceEditorialScene.
     Everything outside the hero hardware moves in the opposite
     direction so Attendance matches the BAST / Spall interaction.
  ========================================================= */

  useEffect(() => {
    const currentArtwork = artworkRef.current;

    if (!currentArtwork) {
      return;
    }

    const artwork = currentArtwork;

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrame = 0;

    function clearMotionProperties() {
      [
        "--attendance-copy-x",
        "--attendance-copy-y",
        "--attendance-copy-rotate",
        "--attendance-features-x",
        "--attendance-features-y",
        "--attendance-note-x",
        "--attendance-note-y",
      ].forEach((property) => {
        artwork.style.removeProperty(property);
      });
    }

    function applyMotion() {
      /*
       * Counter-parallax:
       * cursor / iMac RIGHT -> copy moves LEFT.
       */
      artwork.style.setProperty(
        "--attendance-copy-x",
        `${currentX * -22}px`,
      );

      artwork.style.setProperty(
        "--attendance-copy-y",
        `${currentY * -13}px`,
      );

      artwork.style.setProperty(
        "--attendance-copy-rotate",
        `${currentX * -0.16}deg`,
      );

      artwork.style.setProperty(
        "--attendance-features-x",
        `${currentX * -13}px`,
      );

      artwork.style.setProperty(
        "--attendance-features-y",
        `${currentY * -8}px`,
      );

      artwork.style.setProperty(
        "--attendance-note-x",
        `${currentX * -9}px`,
      );

      artwork.style.setProperty(
        "--attendance-note-y",
        `${currentY * -5}px`,
      );
    }

    function tick() {
      const easing = 0.115;

      currentX += (targetX - currentX) * easing;
      currentY += (targetY - currentY) * easing;

      applyMotion();

      const movingX = Math.abs(targetX - currentX);
      const movingY = Math.abs(targetY - currentY);

      if (movingX > 0.0005 || movingY > 0.0005) {
        animationFrame = window.requestAnimationFrame(tick);
        return;
      }

      currentX = targetX;
      currentY = targetY;
      applyMotion();
      animationFrame = 0;
    }

    function requestTick() {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(tick);
    }

    function handlePointerMove(event: PointerEvent) {
      if (
        event.pointerType === "touch" ||
        !finePointer.matches ||
        reducedMotion.matches
      ) {
        return;
      }

      const bounds = artwork.getBoundingClientRect();

      if (bounds.width <= 0 || bounds.height <= 0) {
        return;
      }

      targetX = clamp(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      );

      targetY = clamp(
        ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
      );

      requestTick();
    }

    function resetMotion() {
      targetX = 0;
      targetY = 0;

      if (reducedMotion.matches || !finePointer.matches) {
        currentX = 0;
        currentY = 0;
        clearMotionProperties();
        return;
      }

      requestTick();
    }

    artwork.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    artwork.addEventListener("pointerleave", resetMotion);
    artwork.addEventListener("pointercancel", resetMotion);
    window.addEventListener("blur", resetMotion);
    finePointer.addEventListener("change", resetMotion);
    reducedMotion.addEventListener("change", resetMotion);

    return () => {
      artwork.removeEventListener("pointermove", handlePointerMove);
      artwork.removeEventListener("pointerleave", resetMotion);
      artwork.removeEventListener("pointercancel", resetMotion);
      window.removeEventListener("blur", resetMotion);
      finePointer.removeEventListener("change", resetMotion);
      reducedMotion.removeEventListener("change", resetMotion);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      clearMotionProperties();
    };
  }, []);

  const dashboardImageUrl = secondaryVisual ?? primaryVisual ?? null;

  return (
    <div
      ref={artworkRef}
      className={styles.artwork}
      data-attendance-featured="true"
    >
      {/* Background layer */}
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.sparkles} aria-hidden="true" />
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.orbitSecondary} aria-hidden="true" />
      <div className={styles.orbitTertiary} aria-hidden="true" />

      <div className={styles.orbOne} aria-hidden="true" />
      <div className={styles.orbTwo} aria-hidden="true" />
      <div className={styles.orbThree} aria-hidden="true" />
      <div className={styles.orbFour} aria-hidden="true" />
      <div className={styles.sceneGlow} aria-hidden="true" />

      {/* Reference-style editorial metadata */}
      <div className={styles.projectMeta} aria-hidden="true">
        <strong>{project.number}</strong>
        <i />
        <span>FEATURED PROJECT</span>
      </div>

      <div className={styles.yearMeta} aria-hidden="true">
        <strong>{project.year}</strong>
        <i />
        <span>
          PEOPLE
          <br />
          PRESENCE
          <br />
          PROGRESS
        </span>
      </div>

      {/* Copy */}
      <div className={styles.copy} aria-hidden="true">
        <h4 className={styles.headline}>
          <span>Smart</span>
          <strong>Attendance</strong>
          <span>System</span>
        </h4>

        <p className={styles.systemName}>
          IDENTITY VERIFICATION SYSTEM
        </p>

        <span className={styles.rule} />

        <p className={styles.description}>
          Check in faster.
          <br />
          Verify smarter.
          <br />
          Track in real time.
        </p>
      </div>

      {/* 3D scene */}
      <div className={styles.scene}>
        {shouldLoadScene ? (
          <AttendanceEditorialScene
            label={`${project.title} — floating attendance hardware`}
            dashboardImageUrl={dashboardImageUrl}
          />
        ) : null}
      </div>

      {/* Feature micro copy */}
      <div className={styles.features} aria-hidden="true">
        <Feature
          symbol="face"
          label="FACE"
          line="VERIFICATION"
        />

        <Feature
          symbol="chart"
          label="REAL-TIME"
          line="TRACKING"
        />

        <Feature
          symbol="shield"
          label="SECURE"
          line="ACCESS"
        />

        <Feature
          symbol="group"
          label="SMARTER"
          line="WORKPLACES"
        />
      </div>

      <div className={styles.bottomNote} aria-hidden="true">
        <span>A SMARTER TOMORROW</span>
        <span>STARTS WITH PEOPLE.</span>
        <i />
      </div>
    </div>
  );
}

function Feature({
  symbol,
  label,
  line,
}: {
  symbol: "face" | "chart" | "shield" | "group";
  label: string;
  line: string;
}) {
  return (
    <div className={styles.feature}>
      <strong>
        <svg
          viewBox="0 0 32 32"
          width="100%"
          height="100%"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          {symbol === "face" ? (
            <>
              <path d="M9 3H3v6m20-6h6v6M3 23v6h6m14 0h6v-6" />
              <circle cx="16" cy="12" r="5" />
              <path d="M7 26c0-10 18-10 18 0" />
            </>
          ) : null}

          {symbol === "chart" ? (
            <path
              strokeWidth="4"
              strokeLinecap="round"
              d="M7 27V19m9 8V11m9 16V4"
            />
          ) : null}

          {symbol === "shield" ? (
            <>
              <path d="M16 2 28 7v9c0 7-12 14-12 14S4 23 4 16V7Z" />
              <path d="m10 15 4 4 8-9" />
            </>
          ) : null}

          {symbol === "group" ? (
            <>
              <circle cx="12" cy="10" r="4" />
              <circle cx="24" cy="12" r="3" />
              <path d="M3 27v-4c0-9 18-9 18 0v4Zm18-9c8-2 10 3 9 9h-5" />
            </>
          ) : null}
        </svg>
      </strong>

      <span>
        {label}
        <br />
        {line}
      </span>
    </div>
  );
}