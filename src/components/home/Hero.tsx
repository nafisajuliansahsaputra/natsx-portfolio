"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import LocaleLink from "@/components/i18n/LocaleLink";

import {
  site,
} from "@/data/site";

import styles from "./Hero.module.css";

import type {
  Locale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

type HeroProps = {
  locale: Locale;
};

export default function Hero({
  locale,
}: HeroProps) {
  const copy =
    getHomeMessages(
      locale,
    );
  const [
    portraitLoaded,
    setPortraitLoaded,
  ] = useState(false);

  const heroRef =
    useRef<HTMLElement>(
      null,
    );

  const visualRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(() => {
    const hero =
      heroRef.current;

    const visual =
      visualRef.current;

    if (
      !hero ||
      !visual
    ) {
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

    let isInView = true;

    let frameId:
      | number
      | null = null;

    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    const applyParallax = (
      x: number,
      y: number,
    ) => {
      visual.style.setProperty(
        "--portrait-x",
        `${x * 5}px`,
      );

      visual.style.setProperty(
        "--portrait-y",
        `${y * 4}px`,
      );

      visual.style.setProperty(
        "--circle-x",
        `${x * -3}px`,
      );

      visual.style.setProperty(
        "--circle-y",
        `${y * -2}px`,
      );

      visual.style.setProperty(
        "--arch-x",
        `${x * 3.5}px`,
      );

      visual.style.setProperty(
        "--arch-y",
        `${y * 3}px`,
      );
    };

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

    const renderParallax =
      () => {
        currentX +=
          (targetX -
            currentX) *
          0.085;

        currentY +=
          (targetY -
            currentY) *
          0.085;

        applyParallax(
          currentX,
          currentY,
        );

        const stillMoving =
          Math.abs(
            targetX -
              currentX,
          ) > 0.001 ||
          Math.abs(
            targetY -
              currentY,
          ) > 0.001;

        if (stillMoving) {
          frameId =
            window.requestAnimationFrame(
              renderParallax,
            );

          return;
        }

        frameId = null;
      };

    const requestFrame =
      () => {
        if (
          frameId !== null
        ) {
          return;
        }

        frameId =
          window.requestAnimationFrame(
            renderParallax,
          );
      };

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      if (
        !finePointer.matches ||
        reducedMotion.matches
      ) {
        return;
      }

      const rect =
        visual.getBoundingClientRect();

      if (
        rect.width === 0 ||
        rect.height === 0
      ) {
        return;
      }

      const x =
        ((event.clientX -
          rect.left) /
          rect.width -
          0.5) *
        2;

      const y =
        ((event.clientY -
          rect.top) /
          rect.height -
          0.5) *
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
        targetX = 0;
        targetY = 0;

        requestFrame();
      };

    const handleReducedMotion =
      () => {
        if (
          reducedMotion.matches
        ) {
          targetX = 0;
          targetY = 0;

          currentX = 0;
          currentY = 0;

          applyParallax(
            0,
            0,
          );
        }

        syncAmbientState();
      };

    let observer:
      | IntersectionObserver
      | null = null;

    if (
      "IntersectionObserver" in
      window
    ) {
      observer =
        new IntersectionObserver(
          ([entry]) => {
            isInView =
              entry.isIntersecting;

            syncAmbientState();
          },
          {
            threshold: 0.1,
          },
        );

      observer.observe(hero);
    } else {
      syncAmbientState();
    }

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

    syncAmbientState();

    return () => {
      observer?.disconnect();

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
        frameId !== null
      ) {
        window.cancelAnimationFrame(
          frameId,
        );
      }
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      data-ambient-active="false"
    >
      <div
        className={`site-container ${styles.inner}`}
      >
        
        <div
          className={
            styles.content
          }
        >
          <div
            className={
              styles.contentInner
            }
          >
            <p
              className={
                styles.eyebrow
              }
              data-motion-hero-piece="eyebrow"
            >
              <span
                className={
                  styles.eyebrowDot
                }
              />

              {site.person} |{" "}
              {site.role}
            </p>

            <h1
              className={
                styles.title
              }
              data-motion-hero-piece="title"
            >
              <span
                className={
                  styles.titleLine
                }
              >
<strong>
  {
    copy.hero
      .titlePrimary
  }
</strong>{" "}
<span
  className={`${styles.titleLight} ${styles.kineticWord}`}
>
  {
    copy.hero
      .titleSecondary
  }
</span>
              </span>

              <span
                className={
                  styles.titleLine
                }
              >
<span
  className={
    styles.titleLight
  }
>
  {
    copy.hero
      .titleTertiary
  }
</span>{" "}
                <strong>
  {
    copy.hero
      .titleQuaternary
  }
                  <span
                    className={
                      styles.titleAccent
                    }
                  >
                    .
                  </span>
                </strong>
              </span>
            </h1>

            <div
              className={
                styles.intro
              }
              data-motion-hero-piece="intro"
            >
<p
  className={
    styles.description
  }
>
  {
    copy.hero
      .description
  }
</p>

              <div
                className={
                  styles.actions
                }
              >
                <a
                  href="#work"
                  className={
                    styles.primaryLink
                  }
                >
<span>
  {
    copy.hero
      .selectedWork
  }
</span>

                  <span
                    className={`${styles.arrow} ${styles.arrowDown}`}
                  >
                    ↘
                  </span>
                </a>

<LocaleLink
  href="/about"
  className={
    styles.secondaryLink
  }
>
<span>
  {
    copy.hero
      .aboutMe
  }
</span>

  <span
    className={`${styles.arrow} ${styles.arrowUp}`}
  >
    ↗
  </span>
</LocaleLink>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={visualRef}
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
              src="/images/natsx-portrait-hero.png"
              alt="Portrait of Nafisa Juliansah Saputra"
              fill
              priority
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
      </div>
    </section>
  );
}