"use client";

import {
  useEffect,
} from "react";

type ManifestImage = {
  url:
    string;

  size:
    number;

  group:
    "project-cover" |
    "project-media";
};

type ManifestResponse = {
  images:
    ManifestImage[];
};

const STATIC_IMAGE_URLS = [
  "/images/branding/natsx-logo-animated.svg",
  "/images/branding/natsx-logo-black.png",
  "/images/branding/natsx-logo-motion-ready.svg",
  "/images/branding/natsx-logo.svg",
  "/images/branding/natsx-symbol.png",
  "/images/branding/natsx-wordmark-a.png",
  "/images/branding/natsx-wordmark-n.png",
  "/images/branding/natsx-wordmark-s.png",
  "/images/branding/natsx-wordmark-t.png",
  "/images/branding/natsx-wordmark-x.png",
  "/images/branding/natsx-wordmark.png",
  "/images/natsx-abt.webp",
  "/images/natsx-portrait-hero-altes.png",
  "/images/natsx-portrait-hero-bases.png",
  "/images/projects/5am-vision/5am-logo.png",
  "/images/projects/5am-vision/aven-cutout.png",
] as const;

const warmedUrls =
  new Set<
    string
  >();

const inFlightImages =
  new Map<
    string,
    HTMLImageElement
  >();

const PRELOAD_CONCURRENCY =
  3;

function warmImage(
  url:
    string,
) {
  if (
    warmedUrls.has(
      url,
    )
  ) {
    return Promise.resolve();
  }

  return new Promise<void>(
    (
      resolve,
    ) => {
      const image =
        new Image();

      inFlightImages.set(
        url,
        image,
      );

      image.decoding =
        "async";

      image.loading =
        "eager";

      image.fetchPriority =
        "low";

      const finish =
        () => {
          warmedUrls.add(
            url,
          );

          inFlightImages.delete(
            url,
          );

          resolve();
        };

      image.addEventListener(
        "load",
        finish,
        {
          once:
            true,
        },
      );

      image.addEventListener(
        "error",
        finish,
        {
          once:
            true,
        },
      );

      image.src =
        url;
    },
  );
}

async function warmQueue(
  urls:
    string[],
) {
  let cursor =
    0;

  async function worker() {
    while (
      cursor <
      urls.length
    ) {
      const index =
        cursor;

      cursor +=
        1;

      await warmImage(
        urls[
          index
        ],
      );
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            PRELOAD_CONCURRENCY,
            urls.length,
          ),
      },
      () =>
        worker(),
    ),
  );
}

export default function GlobalImagePreloader() {
  useEffect(() => {
    let cancelled =
      false;

    let timer:
      number | null =
      null;

    const start =
      async () => {
        try {
          const response =
            await fetch(
              "/api/image-manifest",
              {
                cache:
                  "force-cache",
              },
            );

          if (
            !response.ok ||
            cancelled
          ) {
            return;
          }

          const payload =
            await response.json() as
              ManifestResponse;

          const dynamicUrls =
            payload.images
              .map(
                (
                  item,
                ) =>
                  item.url,
              )
              .filter(
                Boolean,
              );

          const urls =
            Array.from(
              new Set([
                ...STATIC_IMAGE_URLS,
                ...dynamicUrls,
              ]),
            );

          if (
            cancelled
          ) {
            return;
          }

          await warmQueue(
            urls,
          );

          if (
            !cancelled
          ) {
            document
              .documentElement
              .dataset
              .imagesWarm =
              "true";
          }
        } catch {
          /*
           * Global image warming is
           * opportunistic and must never
           * block the actual page.
           */
        }
      };

    timer =
      window.setTimeout(
        () => {
          void start();
        },
        150,
      );

    return () => {
      cancelled =
        true;

      if (
        timer !==
        null
      ) {
        window.clearTimeout(
          timer,
        );
      }
    };
  }, []);

  return null;
}
