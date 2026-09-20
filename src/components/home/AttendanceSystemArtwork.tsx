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

const SCENE_PRELOAD_MARGIN = "800px 0px";

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

    </div>
  );
}
