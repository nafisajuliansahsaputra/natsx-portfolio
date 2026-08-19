"use client";

import type { CSSProperties } from "react";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { site } from "@/data/site";

import TypedWordmark from "./TypedWordmark";
import styles from "./PortfolioIntro.module.css";

const INTRO_SESSION_KEY = "natsx:portfolio-intro:v5";

const FULL_LOGO_SOURCE =
  "/images/branding/natsx-logo-black.png";

const SYMBOL_SOURCE =
  "/images/branding/natsx-symbol.png";

type IntroPhase =
  | "running"
  | "exit"
  | "done";

export default function PortfolioIntro() {
  const pathname = usePathname();

  const [phase, setPhase] =
    useState<IntroPhase>("running");

  const [progress, setProgress] =
    useState(0);

  const animationFrame =
    useRef<number | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      document.documentElement.dataset.intro =
        "done";

      return;
    }

    const params =
      new URLSearchParams(
        window.location.search,
      );

    const forceIntro =
      params.get("intro") === "1";

    let shouldShow =
      forceIntro ||
      document.documentElement.dataset
        .intro === "pending";

    try {
      if (
        !forceIntro &&
        sessionStorage.getItem(
          INTRO_SESSION_KEY,
        ) === "1"
      ) {
        shouldShow = false;
      }
    } catch {
      // Session storage may be unavailable.
    }

    if (!shouldShow) {
      document.documentElement.dataset.intro =
        "done";

      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    /*
     * Intro sebelumnya:
     * 3000ms.
     *
     * Quote construction menambah
     * sekitar 400ms motion aktif.
     *
     * Jadi 3400ms mempertahankan
     * breathing room akhir yang
     * sudah terasa pas.
     */
    const progressDuration =
      prefersReducedMotion
        ? 220
        : 3400;

    const exitDuration =
      prefersReducedMotion
        ? 260
        : 760;

    const startedAt =
      performance.now();

    document.documentElement.dataset.intro =
      "running";

    function updateProgress(
      currentTime: number,
    ) {
      const elapsed =
        currentTime - startedAt;

      const normalized = Math.min(
        elapsed / progressDuration,
        1,
      );

      setProgress(
        Math.round(
          normalized * 100,
        ),
      );

      if (normalized < 1) {
        animationFrame.current =
          requestAnimationFrame(
            updateProgress,
          );
      }
    }

    animationFrame.current =
      requestAnimationFrame(
        updateProgress,
      );

    const exitTimer =
      window.setTimeout(() => {
        setProgress(100);

        setPhase("exit");

        document.documentElement.dataset.intro =
          "exit";
      }, progressDuration);

    const finishTimer =
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(
            INTRO_SESSION_KEY,
            "1",
          );
        } catch {
          // Session storage may be unavailable.
        }

        document.documentElement.dataset.intro =
          "done";

        setPhase("done");
      }, progressDuration + exitDuration);

    return () => {
      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current,
        );
      }

      window.clearTimeout(
        exitTimer,
      );

      window.clearTimeout(
        finishTimer,
      );
    };
  }, [pathname]);

  if (
    pathname !== "/" ||
    phase === "done"
  ) {
    return null;
  }

  const progressLabel =
    String(progress).padStart(
      2,
      "0",
    );

  const progressStyle = {
    "--intro-progress":
      `${progress}%`,
  } as CSSProperties;

  return (
    <div
      className={styles.intro}
      data-portfolio-intro
      data-phase={phase}
      style={progressStyle}
      aria-hidden="true"
    >
      <div
        className={`${styles.panel} ${styles.panelTop}`}
      />

      <div
        className={`${styles.panel} ${styles.panelBottom}`}
      />

      <div
        className={styles.content}
      >
        <header
          className={styles.header}
        >
          <div
            className={
              styles.headerBrand
            }
          >
            <span
              className={
                styles.headerDot
              }
            />

            <span>
              NATSX / PORTFOLIO
            </span>
          </div>

          <div
            className={
              styles.headerMeta
            }
          >
            <span>
              {site.location} / +62
            </span>

            <span>
              {site.year}
            </span>
          </div>
        </header>

        <div
          className={styles.stage}
        >
          <div
            className={
              styles.sequence
            }
          >
            <span
              className={
                styles.sequenceDot
              }
            />

            <span>
              ENTRY SEQUENCE / 01
            </span>
          </div>

          <div
            className={
              styles.lockup
            }
          >
            <div
              className={
                styles.logoStage
              }
            >
              <div
                className={
                  styles.primitive
                }
              />

              <div
                className={
                  styles.diagonalLayer
                }
              >
                <Image
                  src={
                    FULL_LOGO_SOURCE
                  }
                  alt=""
                  fill
                  priority
                  unoptimized
                  sizes="760px"
                  className={
                    styles.fullLogoImage
                  }
                />
              </div>

              <div
                className={
                  styles.quoteConstruction
                }
              >
                <div
                  className={
                    styles.quoteTopRight
                  }
                >
                  <span
                    className={
                      styles.quoteShape
                    }
                  />
                </div>

                <div
                  className={
                    styles.quoteBottomLeft
                  }
                >
                  <span
                    className={
                      styles.quoteShape
                    }
                  />
                </div>
              </div>

              <div
                className={
                  styles.symbolMover
                }
              >
                <div
                  className={
                    styles.symbolAsset
                  }
                >
                  <Image
                    src={
                      SYMBOL_SOURCE
                    }
                    alt=""
                    fill
                    priority
                    unoptimized
                    sizes="132px"
                    className={
                      styles.identityImage
                    }
                  />
                </div>
              </div>

              <div
                className={
                  styles.wordmarkMover
                }
              >
                <TypedWordmark />
              </div>
            </div>

            <p
              className={
                styles.statement
              }
            >
              Designing ideas into
              experience
              <span>.</span>
            </p>
          </div>

          <div
            className={
              styles.index
            }
          >
            <span>N</span>
            <span>/</span>
            <span>26</span>
          </div>
        </div>

        <footer
          className={styles.footer}
        >
          <span
            className={
              styles.disciplines
            }
          >
            DESIGN / DEVELOPMENT /
            MOTION
          </span>

          <div
            className={
              styles.progress
            }
          >
            <span
              className={
                styles.progressNumber
              }
            >
              {progressLabel}
            </span>

            <div
              className={
                styles.progressTrack
              }
            >
              <span
                className={
                  styles.progressFill
                }
              />
            </div>

            <span
              className={
                styles.progressEnd
              }
            >
              100
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}