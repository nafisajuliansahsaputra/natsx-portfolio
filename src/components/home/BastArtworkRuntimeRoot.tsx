"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useRef,
} from "react";

type BastArtworkRuntimeRootProps = {
  children:
    ReactNode;

  className:
    string;
};

export default function BastArtworkRuntimeRoot({
  children,
  className,
}: BastArtworkRuntimeRootProps) {
  const artworkRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(() => {
    const artwork =
      artworkRef.current;

    if (!artwork) {
      return;
    }

    let inView =
      typeof IntersectionObserver ===
      "undefined";

    const syncActivity =
      () => {
        artwork.dataset.bastActive =
          inView &&
          !document.hidden
            ? "true"
            : "false";
      };

    const observer =
      typeof IntersectionObserver !==
      "undefined"
        ? new IntersectionObserver(
            (
              [
                entry,
              ],
            ) => {
              inView =
                Boolean(
                  entry
                    ?.isIntersecting,
                );

              syncActivity();
            },
            {
              rootMargin:
                "15% 0px 15% 0px",

              threshold:
                0,
            },
          )
        : null;

    observer?.observe(
      artwork,
    );

    syncActivity();

    document.addEventListener(
      "visibilitychange",
      syncActivity,
    );

    return () => {
      observer
        ?.disconnect();

      document.removeEventListener(
        "visibilitychange",
        syncActivity,
      );

      delete artwork.dataset
        .bastActive;
    };
  }, []);

  return (
    <div
      ref={
        artworkRef
      }
      className={
        className
      }
      data-bast-featured="true"
      data-bast-active="false"
    >
      {
        children
      }
    </div>
  );
}
