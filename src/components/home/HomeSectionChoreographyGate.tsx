"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
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

  useEffect(() => {
    const supportedEnvironment =
      window.matchMedia(
        "(min-width: 961px) and (prefers-reduced-motion: no-preference)",
      );

    function sync() {
      setEnabled(
        supportedEnvironment.matches,
      );
    }

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
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <HomeSectionChoreography />
  );
}