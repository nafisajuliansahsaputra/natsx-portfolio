"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

/*
 * =========================================================
 * HERO AMBIENT — RUNTIME GATE
 * =========================================================
 *
 * The visual ambient grid is already hidden
 * by CSS at <= 960px.
 *
 * Previously:
 *
 * mobile/tablet
 * → component hydrated
 * → grid vertices created
 * → SVG paths calculated
 * → ResizeObserver attached
 * → CSS hides the result
 *
 * Now:
 *
 * <= 960px
 * → heavy module is never loaded
 *
 * > 960px
 * → exact existing component is loaded
 *
 * Desktop visual behaviour remains untouched.
 */

const HeroAmbientSignature =
  dynamic(
    () =>
      import(
        "./HeroAmbientSignature"
      ),
    {
      ssr:
        false,

      loading:
        () => null,
    },
  );

export default function HeroAmbientSignatureGate() {
  const [
    enabled,
    setEnabled,
  ] =
    useState(
      false,
    );

  const frameRef =
    useRef<number | null>(
      null,
    );

  useEffect(() => {
    const desktop =
      window.matchMedia(
        "(min-width: 961px)",
      );

    function commit() {
      if (
        frameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          frameRef.current,
        );
      }

      frameRef.current =
        window.requestAnimationFrame(
          () => {
            frameRef.current =
              null;

            const next =
              desktop.matches;

            setEnabled(
              (
                current,
              ) =>
                current ===
                next
                  ? current
                  : next,
            );
          },
        );
    }

    commit();

    desktop.addEventListener(
      "change",
      commit,
    );

    return () => {
      desktop.removeEventListener(
        "change",
        commit,
      );

      if (
        frameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          frameRef.current,
        );
      }
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <HeroAmbientSignature />
  );
}