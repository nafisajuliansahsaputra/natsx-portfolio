"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useRef,
  useState,
} from "react";

/*
 * =========================================================
 * HOME SECTION CHOREOGRAPHY — DESKTOP RUNTIME GATE
 * =========================================================
 *
 * Existing choreography already considers
 * <= 960px a compact layout and resets all
 * desktop movement there.
 *
 * Instead of:
 *
 * mobile/tablet
 * → hydrate module
 * → query sections
 * → set dataset
 * → attach scroll listener
 * → attach resize listener
 * → attach ResizeObserver
 * → reset everything
 *
 * we now do:
 *
 * mobile/tablet
 * → no choreography module
 *
 * Desktop keeps the exact existing engine.
 */

const HomeSectionChoreography =
  dynamic(
    () =>
      import(
        "./HomeSectionChoreography"
      ),
    {
      ssr:
        false,

      loading:
        () => null,
    },
  );

export default function HomeSectionChoreographyGate() {
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
    const supportedEnvironment =
      window.matchMedia(
        "(min-width: 961px) and (prefers-reduced-motion: no-preference)",
      );

    const firstAnimatedSection =
      document.getElementById(
        "capabilities",
      );

    let nearAnimatedSections =
      typeof IntersectionObserver ===
      "undefined" ||
      !firstAnimatedSection;

    function sync() {
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

            setEnabled(
              supportedEnvironment.matches &&
              nearAnimatedSections,
            );
          },
        );
    }

    const observer =
      !nearAnimatedSections &&
      firstAnimatedSection
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

              nearAnimatedSections =
                true;

              observer.disconnect();

              sync();
            },
            {
              rootMargin:
                "120% 0px 120% 0px",

              threshold:
                0,
            },
          )
        : null;

    observer?.observe(
      firstAnimatedSection,
    );

    sync();

    supportedEnvironment.addEventListener(
      "change",
      sync,
    );

    return () => {
      supportedEnvironment.removeEventListener(
        "change",
        sync,
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
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <HomeSectionChoreography />
  );
}