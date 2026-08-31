"use client";

import {
  useEffect,
} from "react";

const desktopHandoffDelay =
  76;

const mobileHandoffDelay =
  58;

function getHandoffDelay() {
  return window.matchMedia(
    "(max-width: 700px)",
  ).matches
    ? mobileHandoffDelay
    : desktopHandoffDelay;
}

export default function RouteTransitionHandoff() {
  useEffect(() => {
    const root =
      document.documentElement;

    let releaseTimer:
      | number
      | null =
      null;

    const clearReleaseTimer =
      () => {
        if (
          releaseTimer !==
          null
        ) {
          window.clearTimeout(
            releaseTimer,
          );

          releaseTimer =
            null;
        }
      };

    const syncHandoff =
      () => {
        const phase =
          root.dataset
            .routeTransitionPhase;

        clearReleaseTimer();

        if (
          phase ===
          "revealing"
        ) {
          /*
           * Keep the destination hero
           * frozen for one short beat
           * after the shutters start
           * opening.
           *
           * This lets the page appear
           * through the first gap before
           * its own entrance choreography
           * begins, so both systems read
           * as one continuous reveal.
           */
          root.dataset
            .routeTransitionHold =
            "true";

          releaseTimer =
            window.setTimeout(
              () => {
                if (
                  root.dataset
                    .routeTransitionPhase ===
                  "revealing"
                ) {
                  delete root.dataset
                    .routeTransitionHold;
                }

                releaseTimer =
                  null;
              },
              getHandoffDelay(),
            );

          return;
        }

        if (
          phase === "idle" ||
          !phase
        ) {
          delete root.dataset
            .routeTransitionHold;
        }
      };

    const observer =
      new MutationObserver(
        syncHandoff,
      );

    observer.observe(
      root,
      {
        attributes: true,
        attributeFilter: [
          "data-route-transition-phase",
        ],
      },
    );

    syncHandoff();

    return () => {
      observer.disconnect();
      clearReleaseTimer();
    };
  }, []);

  return null;
}
