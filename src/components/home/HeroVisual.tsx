"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import styles from "./HeroVisual.module.css";

type HeroVisualProps = {
  className?: string;
  portraitSrc?: string;
  portraitAlt?: string;
  imageSrc?: string;
  imageAlt?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
};

const DEFAULT_PORTRAIT_SRC = "/images/home/hero-portrait-profile.png";
const DEFAULT_PORTRAIT_ALT = "NATSX hero portrait";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function damp(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
) {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaTime));
}

export default function HeroVisual({
  className,
  portraitSrc,
  portraitAlt,
  imageSrc,
  imageAlt,
  src,
  alt,
  priority = true,
}: HeroVisualProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const resolvedSrc =
    portraitSrc ??
    imageSrc ??
    src ??
    DEFAULT_PORTRAIT_SRC;

  const resolvedAlt =
    portraitAlt ??
    imageAlt ??
    alt ??
    DEFAULT_PORTRAIT_ALT;

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) {
      root.style.setProperty("--hero-portrait-pointer-x", "50%");
      root.style.setProperty("--hero-portrait-pointer-y", "50%");
      root.style.setProperty("--hero-portrait-nx", "0");
      root.style.setProperty("--hero-portrait-ny", "0");
      root.style.setProperty("--hero-portrait-focus", "0");
      root.style.setProperty("--hero-portrait-layer-a", "0");
      root.style.setProperty("--hero-portrait-layer-b", "0");
      root.style.setProperty("--hero-portrait-layer-c", "0");
      root.style.setProperty("--hero-portrait-layer-d", "0");
      return;
    }

    let frameId = 0;
    let destroyed = false;
    let previousTime = performance.now();

    let targetX = 0;
    let targetY = 0;
    let targetFocus = 0;

    let currentX = 0;
    let currentY = 0;
    let currentFocus = 0;

    function apply() {
      const pointerX = 50 + currentX * 24;
      const pointerY = 50 + currentY * 18;
      const intensity = clamp(
        Math.sqrt(currentX * currentX + currentY * currentY),
        0,
        1,
      );

      const layerA = clamp(
        (1 - Math.abs(currentX + 0.46)) * 0.92 * currentFocus,
        0,
        1,
      );

      const layerB = clamp(
        (1 - Math.abs(currentX - 0.04)) *
          (1 - Math.abs(currentY) * 0.68) *
          currentFocus,
        0,
        1,
      );

      const layerC = clamp(
        ((currentX + 1) / 2) * (0.42 + currentFocus * 0.58),
        0,
        1,
      );

      const layerD = clamp(
        (1 - Math.abs(currentY + 0.18)) * (0.22 + intensity * 0.78) * currentFocus,
        0,
        1,
      );

      root.style.setProperty(
        "--hero-portrait-pointer-x",
        `${pointerX.toFixed(3)}%`,
      );

      root.style.setProperty(
        "--hero-portrait-pointer-y",
        `${pointerY.toFixed(3)}%`,
      );

      root.style.setProperty(
        "--hero-portrait-nx",
        currentX.toFixed(4),
      );

      root.style.setProperty(
        "--hero-portrait-ny",
        currentY.toFixed(4),
      );

      root.style.setProperty(
        "--hero-portrait-focus",
        currentFocus.toFixed(4),
      );

      root.style.setProperty(
        "--hero-portrait-layer-a",
        layerA.toFixed(4),
      );

      root.style.setProperty(
        "--hero-portrait-layer-b",
        layerB.toFixed(4),
      );

      root.style.setProperty(
        "--hero-portrait-layer-c",
        layerC.toFixed(4),
      );

      root.style.setProperty(
        "--hero-portrait-layer-d",
        layerD.toFixed(4),
      );
    }

    function renderFrame(timestamp: number) {
      frameId = 0;

      if (destroyed) {
        return;
      }

      const deltaTime = Math.min((timestamp - previousTime) / 1000, 0.064);
      previousTime = timestamp;

      currentX = damp(currentX, targetX, targetFocus > 0 ? 12 : 8, deltaTime);
      currentY = damp(currentY, targetY, targetFocus > 0 ? 12 : 8, deltaTime);
      currentFocus = damp(
        currentFocus,
        targetFocus,
        targetFocus > 0 ? 10 : 7,
        deltaTime,
      );

      apply();

      const stillMoving =
        Math.abs(currentX - targetX) > 0.0005 ||
        Math.abs(currentY - targetY) > 0.0005 ||
        Math.abs(currentFocus - targetFocus) > 0.0005;

      if (stillMoving) {
        requestFrame();
      }
    }

    function requestFrame() {
      if (frameId !== 0) {
        return;
      }

      previousTime = performance.now();
      frameId = window.requestAnimationFrame(renderFrame);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = root.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        targetX = 0;
        targetY = 0;
        targetFocus = 0;
        requestFrame();
        return;
      }

      const normalizedX = clamp(
        ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        -1,
        1,
      );

      const normalizedY = clamp(
        ((event.clientY - rect.top) / rect.height - 0.5) * 2,
        -1,
        1,
      );

      targetX = normalizedX;
      targetY = normalizedY;
      targetFocus = 1;

      requestFrame();
    }

    function handleWindowLeave() {
      targetX = 0;
      targetY = 0;
      targetFocus = 0;
      requestFrame();
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    window.addEventListener("pointerleave", handleWindowLeave);
    window.addEventListener("blur", handleWindowLeave);

    apply();

    return () => {
      destroyed = true;

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handleWindowLeave);
      window.removeEventListener("blur", handleWindowLeave);

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      [
        "--hero-portrait-pointer-x",
        "--hero-portrait-pointer-y",
        "--hero-portrait-nx",
        "--hero-portrait-ny",
        "--hero-portrait-focus",
        "--hero-portrait-layer-a",
        "--hero-portrait-layer-b",
        "--hero-portrait-layer-c",
        "--hero-portrait-layer-d",
      ].forEach((property) => {
        root.style.removeProperty(property);
      });
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={[styles.visual, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <div className={styles.wordPlane}>
        <span className={`${styles.word} ${styles.wordIdeas}`}>IDEAS</span>
        <span className={`${styles.word} ${styles.wordBuild}`}>BUILD</span>
        <span className={`${styles.word} ${styles.wordMotion}`}>MOTION</span>
      </div>

      <div className={styles.backShapes}>
        <span className={styles.arch} />
        <span className={styles.disk} />
      </div>

      <div className={styles.portraitStage}>
        <div className={`${styles.layer} ${styles.layerBase}`}>
          <Image
            src={resolvedSrc}
            alt={resolvedAlt}
            fill
            priority={priority}
            sizes="(min-width: 1440px) 520px, (min-width: 1024px) 38vw, 70vw"
            className={styles.portraitImage}
          />
        </div>

        <div className={`${styles.layer} ${styles.layerReveal}`}>
          <Image
            src={resolvedSrc}
            alt=""
            fill
            priority={false}
            sizes="(min-width: 1440px) 520px, (min-width: 1024px) 38vw, 70vw"
            className={styles.portraitImage}
          />
        </div>

        <div className={`${styles.layer} ${styles.layerSoft}`}>
          <Image
            src={resolvedSrc}
            alt=""
            fill
            priority={false}
            sizes="(min-width: 1440px) 520px, (min-width: 1024px) 38vw, 70vw"
            className={styles.portraitImage}
          />
        </div>

        <div className={`${styles.layer} ${styles.layerInk}`}>
          <Image
            src={resolvedSrc}
            alt=""
            fill
            priority={false}
            sizes="(min-width: 1440px) 520px, (min-width: 1024px) 38vw, 70vw"
            className={styles.portraitImage}
          />
        </div>

        <div className={`${styles.layer} ${styles.layerGlow}`}>
          <Image
            src={resolvedSrc}
            alt=""
            fill
            priority={false}
            sizes="(min-width: 1440px) 520px, (min-width: 1024px) 38vw, 70vw"
            className={styles.portraitImage}
          />
        </div>
      </div>
    </div>
  );
}