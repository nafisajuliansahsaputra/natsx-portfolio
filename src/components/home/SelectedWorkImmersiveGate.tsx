"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

/*
 * =========================================================
 * SELECTED WORK — MOBILE PERFORMANCE GATE
 * =========================================================
 *
 * Existing immersive engine remains
 * completely untouched.
 *
 * Desktop + tablet:
 * → same motion component
 * → same calculations
 * → same visual
 *
 * Phone <= 700px:
 * → base Selected Work layout remains
 * → immersive JS module is not loaded
 *
 * Mobile motion magnitude was already
 * intentionally extremely small:
 *
 * visualTravel:   5px
 * headerTravel:   1.25px
 * footerTravel:   1.5px
 * scaleStrength:  0.001
 *
 * Removing that continuous runtime on
 * phones is a much better tradeoff than
 * doing layout reads on every scroll frame.
 */

const SelectedWorkImmersive =
  dynamic(
    () =>
      import(
        "./SelectedWorkImmersive"
      ),
    {
      ssr:
        false,

      loading:
        () => null,
    },
  );

export default function SelectedWorkImmersiveGate() {
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
    const supportedViewport =
      window.matchMedia(
        "(min-width: 701px)",
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
              supportedViewport.matches;

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

    supportedViewport.addEventListener(
      "change",
      commit,
    );

    return () => {
      supportedViewport.removeEventListener(
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
    <SelectedWorkImmersive />
  );
}