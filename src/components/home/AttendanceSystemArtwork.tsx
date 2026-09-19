"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./AttendanceSystemArtwork.module.css";

const AttendanceEditorialScene =
  dynamic(
    () =>
      import(
        "./AttendanceEditorialScene"
      ),
    {
      ssr:
        false,
    },
  );

const SCENE_PRELOAD_MARGIN =
  "300px 0px";

type AttendanceSystemArtworkProps = {
  project:
    PublicProject;

  primaryVisual:
    string | null;

  secondaryVisual:
    string | null;
};

export default function AttendanceSystemArtwork({
  project,
}: AttendanceSystemArtworkProps) {
  const artworkRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    shouldLoadScene,
    setShouldLoadScene,
  ] =
    useState(
      false,
    );

  /* =========================================================
     LAZY THREE.JS SCENE
  ========================================================= */

  useEffect(
    () => {
      const currentArtwork =
        artworkRef.current;

      if (
        !currentArtwork
      ) {
        return;
      }

      const artwork:
        HTMLDivElement =
          currentArtwork;

      if (
        typeof IntersectionObserver ===
        "undefined"
      ) {
        const frame =
          window.requestAnimationFrame(
            () => {
              setShouldLoadScene(
                true,
              );
            },
          );

        return () => {
          window.cancelAnimationFrame(
            frame,
          );
        };
      }

      const observer =
        new IntersectionObserver(
          (
            entries,
          ) => {
            const entry =
              entries[0];

            if (
              !entry ||
              !entry.isIntersecting
            ) {
              return;
            }

            setShouldLoadScene(
              true,
            );

            observer.disconnect();
          },
          {
            root:
              null,

            rootMargin:
              SCENE_PRELOAD_MARGIN,

            threshold:
              0.01,
          },
        );

      observer.observe(
        artwork,
      );

      return () => {
        observer.disconnect();
      };
    },
    [],
  );

  return (
    <div
      ref={
        artworkRef
      }
      className={
        styles.artwork
      }
      data-attendance-featured="true"
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className={
          styles.light
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.grid
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.orbit
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.orbitSecondary
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.orbOne
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.orbTwo
        }
        aria-hidden="true"
      />

      {/* =====================================================
          LEFT EDITORIAL COPY
      ===================================================== */}

      <div
        className={
          styles.copy
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.eyebrow
          }
        >
          PEOPLE
          <i>→</i>
          PRESENCE
          <i>→</i>
          PROGRESS
        </span>

        <h4
          className={
            styles.headline
          }
        >
          SMART
          <br />

          <strong>
            ATTENDANCE
          </strong>
        </h4>

        <p
          className={
            styles.systemName
          }
        >
          IDENTITY VERIFICATION
          <br />

          SYSTEM
        </p>

        <span
          className={
            styles.rule
          }
        />

        <p
          className={
            styles.description
          }
        >
          CHECK IN FASTER.
          <br />

          VERIFY SMARTER.
          <br />

          TRACK IN REAL TIME.
        </p>
      </div>

      {/* =====================================================
          THREE.JS WORLD

          Existing hardware assets with an aligned dashboard and floating cards.
      ===================================================== */}

      <div
        className={
          styles.scene
        }
      >
        {
          shouldLoadScene
            ? (
              <AttendanceEditorialScene
                label={`${project.title} — floating attendance hardware`}
              />
            )
            : null
        }
      </div>

      {/* =====================================================
          FEATURE MICRO COPY
      ===================================================== */}

      <div
        className={
          styles.features
        }
        aria-hidden="true"
      >
        <Feature
          symbol="⌗"
          label="FACE"
          line="VERIFICATION"
        />

        <Feature
          symbol="▥"
          label="REAL-TIME"
          line="TRACKING"
        />

        <Feature
          symbol="◇"
          label="SECURE"
          line="ACCESS"
        />

        <Feature
          symbol="◎"
          label="SMARTER"
          line="WORKPLACES"
        />
      </div>

      <div
        className={
          styles.bottomNote
        }
        aria-hidden="true"
      >
        <span>
          A SMARTER TOMORROW
        </span>

        <span>
          STARTS WITH PEOPLE
        </span>

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
  symbol:
    string;

  label:
    string;

  line:
    string;
}) {
  return (
    <div
      className={
        styles.feature
      }
    >
      <strong>
<svg viewBox="0 0 32 32" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          {symbol === "⌗" ? <><path d="M9 3H3v6m20-6h6v6M3 23v6h6m14 0h6v-6"/><circle cx="16" cy="12" r="5"/><path d="M7 26c0-10 18-10 18 0"/></> : symbol === "▥" ? <><path strokeWidth="4" strokeLinecap="round" d="M7 27V19m9 8V11m9 16V4"/></> : symbol === "◇" ? <><path d="M16 2 28 7v9c0 7-12 14-12 14S4 23 4 16V7Z"/><path d="m10 15 4 4 8-9"/></> : <><circle cx="12" cy="10" r="4"/><circle cx="24" cy="12" r="3"/><path d="M3 27v-4c0-9 18-9 18 0v4Zm18-9c8-2 10 3 9 9h-5"/></>}
        </svg>
      </strong>

      <span>
        {
          label
        }
        <br />

        {
          line
        }
      </span>
    </div>
  );
}