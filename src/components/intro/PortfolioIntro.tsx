"use client";

import type {
  CSSProperties,
} from "react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import {
  usePathname,
} from "next/navigation";

import {
  site,
} from "@/data/site";

import TypedWordmark from "./TypedWordmark";

import styles from "./PortfolioIntro.module.css";

const FULL_LOGO_SOURCE =
  "/images/branding/natsx-logo-black.png";

const SYMBOL_SOURCE =
  "/images/branding/natsx-symbol.png";

type IntroPhase =
  | "running"
  | "exit"
  | "done";

export default function PortfolioIntro() {
  const pathname =
    usePathname();

  const isAdminRoute =
    pathname ===
      "/admin" ||
    pathname.startsWith(
      "/admin/",
    );

  const [
    phase,
    setPhase,
  ] =
    useState<IntroPhase>(
      "running",
    );

  const [
    progress,
    setProgress,
  ] =
    useState(
      0,
    );

  const animationFrame =
    useRef<number | null>(
      null,
    );

  const skipIntro =
    useRef<
      (() => void) |
        null
    >(
      null,
    );

  useEffect(() => {
    if (
      isAdminRoute
    ) {
      document.documentElement
        .dataset.intro =
        "done";

      return;
    }

    const params =
      new URLSearchParams(
        window.location.search,
      );

    const forceIntro =
      params.get(
        "intro",
      ) ===
      "1";

    const introState =
      document.documentElement
        .dataset.intro;

    const shouldShow =
      forceIntro ||
      introState ===
        "pending" ||
      introState ===
        "running";

    /*
     * Bootstrap script di root layout
     * sudah menentukan apakah intro
     * perlu tampil.
     *
     * Kalau intro tidak diperlukan,
     * cukup ubah data-intro.
     *
     * intro-motion.css akan langsung
     * menyembunyikan overlay melalui:
     *
     * html[data-intro="done"]
     * [data-portfolio-intro]
     */
    if (
      !shouldShow
    ) {
      document.documentElement
        .dataset.intro =
        "done";

      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    /*
     * TITLE SEQUENCE V2
     *
     * Running:
     * 2820ms
     *
     * Exit:
     * 760ms
     *
     * Total:
     * ±3580ms
     */
    const progressDuration =
      prefersReducedMotion
        ? 220
        : 2820;

    const exitDuration =
      prefersReducedMotion
        ? 260
        : 760;

    const startedAt =
      performance.now();

    let exitTimer:
      | number
      | null =
      null;

    let finishTimer:
      | number
      | null =
      null;

    let hasStartedExit =
      false;

    let keyboardAttached =
      false;

    document.documentElement
      .dataset.intro =
      "running";

    function detachKeyboard() {
      if (
        !keyboardAttached
      ) {
        return;
      }

      window.removeEventListener(
        "keydown",
        handleKeyDown,
        true,
      );

      keyboardAttached =
        false;
    }

    function finishIntro() {
      detachKeyboard();

      skipIntro.current =
        null;

      document.documentElement
        .dataset.intro =
        "done";

      setPhase(
        "done",
      );
    }

    function beginExit() {
      if (
        hasStartedExit
      ) {
        return;
      }

      hasStartedExit =
        true;

      /*
       * Keyboard interception hanya
       * hidup selama intro benar-benar
       * running.
       *
       * Begitu exit dimulai, listener
       * langsung dilepas.
       */
      detachKeyboard();

      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current,
        );

        animationFrame.current =
          null;
      }

      if (
        exitTimer !==
        null
      ) {
        window.clearTimeout(
          exitTimer,
        );

        exitTimer =
          null;
      }

      setProgress(
        100,
      );

      setPhase(
        "exit",
      );

      document.documentElement
        .dataset.intro =
        "exit";

      finishTimer =
        window.setTimeout(
          finishIntro,
          exitDuration,
        );
    }

    skipIntro.current =
      beginExit;

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      const shouldSkip =
        event.key ===
          "Enter" ||
        event.key ===
          " " ||
        event.key ===
          "Escape";

      if (
        !shouldSkip
      ) {
        return;
      }

      /*
       * Listener dipasang di capture
       * phase supaya shortcut intro
       * tidak sekaligus mengaktifkan
       * link/button di page di belakang.
       */
      event.preventDefault();

      event.stopPropagation();

      beginExit();
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
      true,
    );

    keyboardAttached =
      true;

    function updateProgress(
      currentTime: number,
    ) {
      const elapsed =
        currentTime -
        startedAt;

      const normalized =
        Math.min(
          elapsed /
            progressDuration,
          1,
        );

      setProgress(
        Math.round(
          normalized *
            100,
        ),
      );

      if (
        normalized <
          1 &&
        !hasStartedExit
      ) {
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

    exitTimer =
      window.setTimeout(
        beginExit,
        progressDuration,
      );

    return () => {
      skipIntro.current =
        null;

      detachKeyboard();

      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current,
        );

        animationFrame.current =
          null;
      }

      if (
        exitTimer !==
        null
      ) {
        window.clearTimeout(
          exitTimer,
        );
      }

      if (
        finishTimer !==
        null
      ) {
        window.clearTimeout(
          finishTimer,
        );
      }
    };
  }, [
    pathname,
    isAdminRoute,
  ]);

  if (
    isAdminRoute ||
    phase ===
      "done"
  ) {
    return null;
  }

  const progressLabel =
    String(
      progress,
    ).padStart(
      2,
      "0",
    );

  const progressStyle = {
    "--intro-progress":
      `${progress}%`,
  } as CSSProperties;

  return (
    <div
      className={
        styles.intro
      }
      data-portfolio-intro
      data-phase={
        phase
      }
      style={
        progressStyle
      }
      aria-hidden="true"
      onPointerDown={() => {
        skipIntro.current?.();
      }}
    >
      <div
        className={`${styles.panel} ${styles.panelTop}`}
      />

      <div
        className={`${styles.panel} ${styles.panelBottom}`}
      />

      <div
        className={
          styles.content
        }
      >
        <header
          className={
            styles.header
          }
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
              NATSX /
              PORTFOLIO
            </span>
          </div>

          <div
            className={
              styles.headerMeta
            }
          >
            <span>
              {
                site.location
              }{" "}
              / +62
            </span>

            <span>
              {
                site.year
              }
            </span>
          </div>
        </header>

        <div
          className={
            styles.stage
          }
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
              ENTRY SEQUENCE /
              01
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
              Designing ideas
              into experience
              <span>.</span>
            </p>
          </div>

          <div
            className={
              styles.index
            }
          >
            <span>
              N
            </span>

            <span>
              /
            </span>

            <span>
              26
            </span>
          </div>
        </div>

        <footer
          className={
            styles.footer
          }
        >
          <span
            className={
              styles.disciplines
            }
          >
            DESIGN /
            DEVELOPMENT /
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
              {
                progressLabel
              }
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