"use client";

import {
  useEffect,
} from "react";

import useIntroCompletion from "@/components/intro/useIntroCompletion";

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

type NetworkInformationLike = {
  saveData?:
    boolean;

  effectiveType?:
    string;
};

type NavigatorWithConnection =
  Navigator & {
    connection?:
      NetworkInformationLike;
  };

type IdleDeadlineLike = {
  didTimeout:
    boolean;

  timeRemaining:
    () => number;
};

type WindowWithIdleCallback =
  Window &
  typeof globalThis & {
    requestIdleCallback?:
      (
        callback:
          (
            deadline:
              IdleDeadlineLike,
          ) => void,
        options?: {
          timeout:
            number;
        },
      ) => number;

    cancelIdleCallback?:
      (
        handle:
          number,
      ) => void;
  };

const warmedUrls =
  new Set<
    string
  >();

const inFlightImages =
  new Map<
    string,
    Promise<void>
  >();

/*
 * One background transfer at a time.
 *
 * This preloader is opportunistic only;
 * visible images and scene-specific loaders
 * always have priority over it.
 */
const PRELOAD_CONCURRENCY =
  1;

const POST_INTRO_DELAY_MS =
  1800;

function shouldWarmImages() {
  const connection =
    (
      navigator as
        NavigatorWithConnection
    ).connection;

  if (
    connection
      ?.saveData
  ) {
    return false;
  }

  const effectiveType =
    connection
      ?.effectiveType;

  return (
    effectiveType !==
      "slow-2g" &&
    effectiveType !==
      "2g"
  );
}

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

  const existing =
    inFlightImages.get(
      url,
    );

  if (existing) {
    return existing;
  }

  const request =
    fetch(
      url,
      {
        cache:
          "force-cache",

        mode:
          "no-cors",

        priority:
          "low",
      } as RequestInit,
    )
      .then(
        () => undefined,
      )
      .catch(
        () => undefined,
      )
      .finally(
        () => {
          warmedUrls.add(
            url,
          );

          inFlightImages.delete(
            url,
          );
        },
      );

  inFlightImages.set(
    url,
    request,
  );

  return request;
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
  const introDone =
    useIntroCompletion();

  useEffect(() => {
    if (
      !introDone ||
      !shouldWarmImages()
    ) {
      return;
    }

    let cancelled =
      false;

    let timer:
      number | null =
      null;

    let idleHandle:
      number | null =
      null;

    const idleWindow =
      window as
        WindowWithIdleCallback;

    const start =
      async () => {
        try {
          const response =
            await fetch(
              "/api/image-manifest",
              {
                cache:
                  "force-cache",

                priority:
                  "low",
              } as RequestInit,
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

          /*
           * Global warming is intentionally limited to same-origin
           * assets. Remote Supabase covers are loaded by the visible
           * Next/Image / SceneGate that actually needs them.
           *
           * This keeps idle-time preloading from consuming Storage
           * egress for projects the visitor may never scroll to.
           */
          const urls =
            Array.from(
              new Set(
                payload.images
                  .filter(
                    (
                      item,
                    ) => {
                      if (
                        item.group !==
                        "project-cover"
                      ) {
                        return false;
                      }

                      try {
                        return (
                          new URL(
                            item.url,
                            window.location.origin,
                          ).origin ===
                          window.location.origin
                        );
                      } catch {
                        return false;
                      }
                    },
                  )
                  .map(
                    (
                      item,
                    ) =>
                      item.url,
                  )
                  .filter(
                    Boolean,
                  ),
              ),
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
          if (
            cancelled
          ) {
            return;
          }

          if (
            idleWindow
              .requestIdleCallback
          ) {
            idleHandle =
              idleWindow
                .requestIdleCallback(
                  () => {
                    idleHandle =
                      null;

                    void start();
                  },
                  {
                    timeout:
                      2500,
                  },
                );

            return;
          }

          void start();
        },
        POST_INTRO_DELAY_MS,
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

      if (
        idleHandle !==
          null &&
        idleWindow
          .cancelIdleCallback
      ) {
        idleWindow
          .cancelIdleCallback(
            idleHandle,
          );
      }
    };
  }, [
    introDone,
  ]);

  return null;
}
