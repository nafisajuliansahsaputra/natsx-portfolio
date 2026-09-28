"use client";

import {
  useEffect,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from "react";

type ViewportVideoProps =
  Omit<
    VideoHTMLAttributes<HTMLVideoElement>,
    "src" | "preload"
  > & {
    src: string;

    rootMargin?:
      string;
  };

export default function ViewportVideo({
  src,
  rootMargin =
    "75% 0px 75% 0px",
  ...props
}: ViewportVideoProps) {
  const ref =
    useRef<HTMLVideoElement>(
      null,
    );

  const [
    shouldLoad,
    setShouldLoad,
  ] =
    useState(
      false,
    );

  useEffect(() => {
    const video =
      ref.current;

    if (
      !video
    ) {
      return;
    }

    if (
      typeof IntersectionObserver ===
      "undefined"
    ) {
      setShouldLoad(
        true,
      );

      return;
    }

    const observer =
      new IntersectionObserver(
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

          setShouldLoad(
            true,
          );

          observer.disconnect();
        },
        {
          root:
            null,

          rootMargin,

          threshold:
            0,
        },
      );

    observer.observe(
      video,
    );

    return () => {
      observer.disconnect();
    };
  }, [
    rootMargin,
  ]);

  return (
    <video
      ref={
        ref
      }
      {...props}
      src={
        shouldLoad
          ? src
          : undefined
      }
      preload={
        shouldLoad
          ? "metadata"
          : "none"
      }
    />
  );
}
