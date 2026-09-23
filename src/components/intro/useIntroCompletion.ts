"use client";

import {
  useEffect,
  useState,
} from "react";

/*
 * =========================================================
 * INTRO COMPLETION GATE
 * =========================================================
 *
 * The root bootstrap script sets html[data-intro]
 * before the body paints.
 *
 * Heavy homepage runtime must not compete with
 * the first-entry intro while it is:
 *
 * pending
 * running
 * exit
 *
 * This hook stays intentionally tiny:
 * one attribute observer, disconnected forever
 * as soon as the intro is fully done.
 */

function isIntroComplete() {
  if (
    typeof document ===
    "undefined"
  ) {
    return false;
  }

  const state =
    document.documentElement
      .dataset.intro;

  return (
    state !==
      "pending" &&
    state !==
      "running" &&
    state !==
      "exit"
  );
}

export default function useIntroCompletion() {
  const [
    introDone,
    setIntroDone,
  ] =
    useState(
      false,
    );

  useEffect(() => {
    const root =
      document.documentElement;

    let observer:
      MutationObserver |
      null =
      null;

    const sync =
      () => {
        const done =
          isIntroComplete();

        setIntroDone(
          (
            current,
          ) =>
            current ===
            done
              ? current
              : done,
        );

        if (
          done
        ) {
          observer
            ?.disconnect();

          observer =
            null;
        }
      };

    sync();

    if (
      isIntroComplete()
    ) {
      return;
    }

    observer =
      new MutationObserver(
        sync,
      );

    observer.observe(
      root,
      {
        attributes:
          true,

        attributeFilter: [
          "data-intro",
        ],
      },
    );

    return () => {
      observer
        ?.disconnect();
    };
  }, []);

  return introDone;
}
