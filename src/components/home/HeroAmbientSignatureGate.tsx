"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import useIntroCompletion from "@/components/intro/useIntroCompletion";

/*
 * =========================================================
 * HERO AMBIENT — RUNTIME GATE
 * =========================================================
 *
 * The visual ambient grid is already hidden
 * by CSS at <= 960px.
 *
 * The ambient module is also kept asleep while
 * the first-entry intro owns the screen. This
 * prevents SVG geometry work and animation setup
 * from competing with the intro choreography.
 *
 * > 960px + intro complete:
 * → exact existing component is loaded
 *
 * Desktop visual behaviour after the intro
 * remains untouched.
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
  const introDone =
    useIntroCompletion();

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
              introDone &&
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
  }, [
    introDone,
  ]);

  if (!enabled) {
    return null;
  }

  return (
    <HeroAmbientSignature />
  );
}
