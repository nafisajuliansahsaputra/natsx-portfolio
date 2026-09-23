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
    const supportedViewport =
      window.matchMedia(
        "(min-width: 701px)",
      );

    const work =
      document.getElementById(
        "work",
      );

    let nearWork =
      typeof IntersectionObserver ===
      "undefined" ||
      !work;

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
              supportedViewport.matches &&
              nearWork;

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

    const observer =
      !nearWork &&
      work
        ? new IntersectionObserver(
            (
              [
                entry,
              ],
            ) => {
              if (
                !entry
                  ?.isIntersecting
              ) {
                return;
              }

              nearWork =
                true;

              observer?.disconnect();

              commit();
            },
            {
              rootMargin:
                "100% 0px 100% 0px",

              threshold:
                0,
            },
          )
        : null;

    if (
      observer &&
      work
    ) {
      observer.observe(
        work,
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

      observer?.disconnect();

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
    <SelectedWorkImmersive />
  );
}