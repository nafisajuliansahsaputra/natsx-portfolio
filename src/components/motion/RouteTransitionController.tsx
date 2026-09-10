"use client";

import type {
  CSSProperties,
} from "react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  getLocaleFromPathname,
  stripLocaleFromPathname,
} from "@/i18n/config";

import {
  getMessages,
} from "@/i18n/messages";

import {
  site,
} from "@/data/site";

import styles from "./RouteTransitionController.module.css";

type TransitionPhase =
  | "idle"
  | "covering"
  | "revealing";

type TransitionKind =
  | "home"
  | "page"
  | "project";

type TransitionDirection =
  | "forward"
  | "backward";

type TransitionMeta = {
  index: string;
  label: string;
  kind: TransitionKind;
};

type ProjectTransitionHint = {
  meta: TransitionMeta;
  accent: string | null;
};

const initialMeta: TransitionMeta = {
  index: "00",
  label: site.name,
  kind: "home",
};

const desktopCoverDelay =
  560;

const mobileCoverDelay =
  470;

const desktopRevealDuration =
  660;

const mobileRevealDuration =
  560;

/*
 * Hard refresh overlay sudah full covered
 * sebelum hydration melalui bootstrap CSS.
 *
 * React hanya butuh satu beat kecil untuk
 * mengambil ownership.
 */

const desktopRefreshCoveredDelay =
  72;

const mobileRefreshCoveredDelay =
  56;

const routeSettleDelay =
  24;

const navigationSafetyTimeout =
  5000;

const routeOrder =
  new Map<string, number>([
    ["/", 0],
    ["/work", 1],
    ["/about", 2],
    ["/playground", 3],
    ["/contact", 4],
    ["/cv", 5],
  ]);

function normalizePathname(
  pathname: string,
) {
  if (
    pathname.length > 1 &&
    pathname.endsWith("/")
  ) {
    return pathname.slice(
      0,
      -1,
    );
  }

  return pathname;
}

function isAdminPath(
  pathname: string,
) {
  const cleanPath =
    stripLocaleFromPathname(
      pathname,
    );

  return (
    cleanPath === "/admin" ||
    cleanPath.startsWith(
      "/admin/",
    )
  );
}

function isTransitionRoute(
  pathname: string,
) {
  const cleanPath =
    stripLocaleFromPathname(
      pathname,
    );

  return (
    cleanPath === "/" ||
    cleanPath === "/work" ||
    cleanPath === "/about" ||
    cleanPath === "/playground" ||
    cleanPath === "/contact" ||
    cleanPath === "/cv" ||
    cleanPath.startsWith(
      "/work/",
    )
  );
}

function getRoutePosition(
  pathname: string,
) {
  const cleanPath =
    stripLocaleFromPathname(
      pathname,
    );

  if (
    cleanPath.startsWith(
      "/work/",
    )
  ) {
    return 1.5;
  }

  return (
    routeOrder.get(
      cleanPath,
    ) ?? 0
  );
}

function getTransitionDirection(
  currentPathname: string,
  destinationPathname: string,
): TransitionDirection {
  return getRoutePosition(
    destinationPathname,
  ) >=
    getRoutePosition(
      currentPathname,
    )
    ? "forward"
    : "backward";
}

function getProjectLabel(
  pathname: string,
) {
  const slug =
    pathname
      .split("/")
      .filter(Boolean)
      .at(-1) ??
    "project";

  try {
    return decodeURIComponent(
      slug,
    )
      .replace(
        /[-_]+/g,
        " ",
      )
      .trim();
  } catch {
    return slug
      .replace(
        /[-_]+/g,
        " ",
      )
      .trim();
  }
}

function getTransitionMeta(
  pathname: string,
): TransitionMeta {
  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const copy =
    getMessages(
      locale,
    );

  const cleanPath =
    stripLocaleFromPathname(
      pathname,
    );

  if (
    cleanPath === "/"
  ) {
    return {
      index: "00",
      label: site.name,
      kind: "home",
    };
  }

  if (
    cleanPath === "/work"
  ) {
    return {
      index: "01",
      label:
        copy.navigation.work,
      kind: "page",
    };
  }

  if (
    cleanPath === "/about"
  ) {
    return {
      index: "02",
      label:
        copy.navigation.about,
      kind: "page",
    };
  }

  if (
    cleanPath ===
    "/playground"
  ) {
    return {
      index: "03",
      label:
        copy.navigation
          .playground,
      kind: "page",
    };
  }

  if (
    cleanPath === "/contact"
  ) {
    return {
      index: "04",
      label:
        copy.navigation.contact,
      kind: "page",
    };
  }

  if (
    cleanPath === "/cv"
  ) {
    return {
      index: "CV",
      label:
        "Curriculum Vitae",
      kind: "page",
    };
  }

  if (
    cleanPath.startsWith(
      "/work/",
    )
  ) {
    return {
      index: "PROJECT",
      label:
        getProjectLabel(
          cleanPath,
        ),
      kind: "project",
    };
  }

  return initialMeta;
}

function getCoverDelay() {
  return window.matchMedia(
    "(max-width: 700px)",
  ).matches
    ? mobileCoverDelay
    : desktopCoverDelay;
}

function getRevealDuration() {
  return window.matchMedia(
    "(max-width: 700px)",
  ).matches
    ? mobileRevealDuration
    : desktopRevealDuration;
}

function getRefreshCoveredDelay() {
  return window.matchMedia(
    "(max-width: 700px)",
  ).matches
    ? mobileRefreshCoveredDelay
    : desktopRefreshCoveredDelay;
}

/*
 * =========================================================
 * PROJECT COLOR UTILITIES
 * =========================================================
 */

function getRelativeLuminance(
  red: number,
  green: number,
  blue: number,
) {
  const toLinear = (
    channel: number,
  ) => {
    const value =
      channel / 255;

    return value <=
      0.04045
      ? value / 12.92
      : Math.pow(
          (
            value +
            0.055
          ) /
            1.055,
          2.4,
        );
  };

  return (
    0.2126 *
      toLinear(
        red,
      ) +
    0.7152 *
      toLinear(
        green,
      ) +
    0.0722 *
      toLinear(
        blue,
      )
  );
}

function getWhiteContrast(
  red: number,
  green: number,
  blue: number,
) {
  const luminance =
    getRelativeLuminance(
      red,
      green,
      blue,
    );

  return (
    1.05 /
    (
      luminance +
      0.05
    )
  );
}

function getReadableTransitionAccent(
  rawColor: string,
) {
  const color =
    rawColor.trim();

  const match =
    color.match(
      /^#([0-9a-f]{6})$/i,
    );

  if (!match) {
    return (
      color ||
      null
    );
  }

  const hex =
    match[1];

  const red =
    Number.parseInt(
      hex.slice(
        0,
        2,
      ),
      16,
    );

  const green =
    Number.parseInt(
      hex.slice(
        2,
        4,
      ),
      16,
    );

  const blue =
    Number.parseInt(
      hex.slice(
        4,
        6,
      ),
      16,
    );

  if (
    getWhiteContrast(
      red,
      green,
      blue,
    ) >=
    4.5
  ) {
    return color;
  }

  const targetRed =
    17;

  const targetGreen =
    17;

  const targetBlue =
    17;

  let mix =
    0.12;

  let outputRed =
    red;

  let outputGreen =
    green;

  let outputBlue =
    blue;

  while (
    mix <=
      0.72 &&
    getWhiteContrast(
      outputRed,
      outputGreen,
      outputBlue,
    ) <
      4.5
  ) {
    outputRed =
      Math.round(
        red *
          (
            1 -
            mix
          ) +
        targetRed *
          mix,
      );

    outputGreen =
      Math.round(
        green *
          (
            1 -
            mix
          ) +
        targetGreen *
          mix,
      );

    outputBlue =
      Math.round(
        blue *
          (
            1 -
            mix
          ) +
        targetBlue *
          mix,
      );

    mix +=
      0.06;
  }

  return `rgb(${outputRed} ${outputGreen} ${outputBlue})`;
}

/*
 * =========================================================
 * PROJECT TRANSITION HINT
 * =========================================================
 */

function getProjectTransitionHint(
  anchor: HTMLAnchorElement,
  fallbackMeta: TransitionMeta,
): ProjectTransitionHint {
  const title =
    anchor
      .querySelector(
        "h2",
      )
      ?.textContent
      ?.trim();

  const archiveNumber =
    anchor
      .querySelector(
        ":scope > span",
      )
      ?.textContent
      ?.trim();

  const nextProjectSection =
    anchor.closest<HTMLElement>(
      "[data-next-project-handoff]",
    );

  const nextProjectNumber =
    nextProjectSection
      ?.dataset
      .nextProjectNumber
      ?.trim();

  const number =
    nextProjectNumber ||
    archiveNumber;

  const inlineRowAccent =
    anchor.style
      .getPropertyValue(
        "--row-accent",
      )
      .trim();

  const inlineNextAccent =
    anchor.style
      .getPropertyValue(
        "--next-project-accent",
      )
      .trim();

  const computedStyle =
    window.getComputedStyle(
      anchor,
    );

  const computedRowAccent =
    computedStyle
      .getPropertyValue(
        "--row-accent",
      )
      .trim();

  const computedNextAccent =
    computedStyle
      .getPropertyValue(
        "--next-project-accent",
      )
      .trim();

  const rawAccent =
    inlineRowAccent ||
    inlineNextAccent ||
    computedRowAccent ||
    computedNextAccent;

  const accent =
    getReadableTransitionAccent(
      rawAccent,
    );

  return {
    meta: {
      ...fallbackMeta,

      index:
        number ||
        fallbackMeta.index,

      label:
        title ||
        fallbackMeta.label,
    },

    accent,
  };
}

export default function RouteTransitionController() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    phase,
    setPhase,
  ] =
    useState<TransitionPhase>(
      "idle",
    );

  const [
    direction,
    setDirection,
  ] =
    useState<TransitionDirection>(
      "forward",
    );

  /*
   * Current pathname is already known
   * during initial render.
   *
   * This is especially important for
   * hard refresh because bootstrap CSS
   * can display correct route copy before
   * React transition state starts.
   */

  const [
    meta,
    setMeta,
  ] =
    useState<TransitionMeta>(
      () =>
        getTransitionMeta(
          pathname,
        ),
    );

  const [
    transitionAccent,
    setTransitionAccent,
  ] =
    useState<string | null>(
      null,
    );

  const phaseRef =
    useRef<TransitionPhase>(
      "idle",
    );

  const expectedPathRef =
    useRef<string | null>(
      null,
    );

  const hasHandledRefreshRef =
    useRef(
      false,
    );

  const navigationTimerRef =
    useRef<number | null>(
      null,
    );

  const revealTimerRef =
    useRef<number | null>(
      null,
    );

  const safetyTimerRef =
    useRef<number | null>(
      null,
    );

  const clearTimers =
    useCallback(() => {
      [
        navigationTimerRef,
        revealTimerRef,
        safetyTimerRef,
      ].forEach(
        (
          timerRef,
        ) => {
          if (
            timerRef.current !==
            null
          ) {
            window.clearTimeout(
              timerRef.current,
            );

            timerRef.current =
              null;
          }
        },
      );
    }, []);

  const clearDocumentState =
    useCallback(() => {
      const root =
        document.documentElement;

      delete root.dataset
        .routeTransitionActive;

      delete root.dataset
        .routeTransitionPhase;

      delete root.dataset
        .routeTransitionHold;

      delete root.dataset
        .routeRefresh;
    }, []);

  const resetTransition =
    useCallback(() => {
      clearTimers();
      clearDocumentState();

      expectedPathRef.current =
        null;

      phaseRef.current =
        "idle";

      setPhase(
        "idle",
      );

      setTransitionAccent(
        null,
      );
    }, [
      clearDocumentState,
      clearTimers,
    ]);

  /*
   * =========================================================
   * HARD REFRESH HANDOFF
   * =========================================================
   *
   * Root bootstrap memberi:
   *
   * data-route-refresh="pending"
   *
   * sebelum hydration.
   *
   * intro-motion.css membuat overlay
   * transition sudah berada pada full
   * covered state.
   *
   * IMPORTANT:
   *
   * Tidak ada state React yang diubah
   * secara synchronous dari effect.
   *
   * Ownership dipindahkan pada timer task
   * berikutnya agar compatible dengan
   * react-hooks/set-state-in-effect.
   */

  useEffect(() => {
    if (
      hasHandledRefreshRef.current
    ) {
      return;
    }

    hasHandledRefreshRef.current =
      true;

    const root =
      document.documentElement;

    if (
      isAdminPath(
        pathname,
      )
    ) {
      delete root.dataset
        .routeRefresh;

      return;
    }

    if (
      root.dataset
        .routeRefresh !==
      "pending"
    ) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    if (
      prefersReducedMotion ||
      !isTransitionRoute(
        pathname,
      )
    ) {
      delete root.dataset
        .routeRefresh;

      delete root.dataset
        .routeTransitionHold;

      return;
    }

    /*
     * Bootstrap CSS masih menahan full
     * screen selama timer 0ms ini.
     *
     * Jadi tidak ada flash / gap.
     */

    navigationTimerRef.current =
      window.setTimeout(
        () => {
          navigationTimerRef.current =
            null;

          /*
           * Initial state sudah:
           *
           * meta      = current pathname
           * accent    = null
           * direction = forward
           *
           * Jadi tidak perlu setMeta /
           * setDirection /
           * setTransitionAccent di sini.
           */

          phaseRef.current =
            "covering";

          setPhase(
            "covering",
          );

          /*
           * Beri satu covered beat sebelum
           * menjalankan reveal.
           */

          revealTimerRef.current =
            window.setTimeout(
              () => {
                /*
                 * React sekarang sudah
                 * memiliki full-covered
                 * .covering state.
                 *
                 * Bootstrap marker aman
                 * dilepas.
                 */

                delete root.dataset
                  .routeRefresh;

                /*
                 * Samakan lifecycle dengan
                 * normal client transition:
                 *
                 * destination entrance mulai
                 * saat shutters mulai reveal.
                 */

                delete root.dataset
                  .routeTransitionHold;

                phaseRef.current =
                  "revealing";

                setPhase(
                  "revealing",
                );

                revealTimerRef.current =
                  window.setTimeout(
                    resetTransition,
                    getRevealDuration(),
                  );
              },
              getRefreshCoveredDelay(),
            );
        },
        0,
      );

    safetyTimerRef.current =
      window.setTimeout(
        resetTransition,
        navigationSafetyTimeout,
      );
  }, [
    pathname,
    resetTransition,
  ]);

  /*
   * =========================================================
   * ROOT DATASET SYNC
   * =========================================================
   */

  useEffect(() => {
    phaseRef.current =
      phase;

    const root =
      document.documentElement;

    if (
      phase === "idle"
    ) {
      delete root.dataset
        .routeTransitionActive;

      delete root.dataset
        .routeTransitionPhase;

      return;
    }

    root.dataset
      .routeTransitionActive =
      "true";

    root.dataset
      .routeTransitionPhase =
      phase;
  }, [
    phase,
  ]);

  /*
   * =========================================================
   * SCROLL INTERCEPTION
   * =========================================================
   */

  useEffect(() => {
    if (
      phase === "idle"
    ) {
      return;
    }

    const preventScroll = (
      event: Event,
    ) => {
      event.preventDefault();
    };

    window.addEventListener(
      "wheel",
      preventScroll,
      {
        passive: false,
      },
    );

    window.addEventListener(
      "touchmove",
      preventScroll,
      {
        passive: false,
      },
    );

    return () => {
      window.removeEventListener(
        "wheel",
        preventScroll,
      );

      window.removeEventListener(
        "touchmove",
        preventScroll,
      );
    };
  }, [
    phase,
  ]);

  /*
   * =========================================================
   * CLIENT-SIDE LINK NAVIGATION
   * =========================================================
   */

  useEffect(() => {
    if (
      isAdminPath(
        pathname,
      )
    ) {
      return;
    }

    const handleDocumentClick = (
      event: MouseEvent,
    ) => {
      if (
        phaseRef.current !==
          "idle" ||
        event.defaultPrevented ||
        event.button !==
          0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target;

      if (
        !(
          target instanceof
          Element
        )
      ) {
        return;
      }

      const anchor =
        target.closest<HTMLAnchorElement>(
          "a[href]",
        );

      if (
        !anchor ||
        anchor.dataset
          .routeTransition ===
          "off" ||
        anchor.hasAttribute(
          "download",
        ) ||
        (
          anchor.target &&
          anchor.target !==
            "_self"
        )
      ) {
        return;
      }

      const rawHref =
        anchor.getAttribute(
          "href",
        );

      if (
        !rawHref ||
        rawHref.startsWith(
          "#",
        )
      ) {
        return;
      }

      let destination:
        URL;

      try {
        destination =
          new URL(
            anchor.href,
            window.location.href,
          );
      } catch {
        return;
      }

      if (
        destination.origin !==
          window.location.origin ||
        ![
          "http:",
          "https:",
        ].includes(
          destination.protocol,
        ) ||
        isAdminPath(
          destination.pathname,
        ) ||
        !isTransitionRoute(
          destination.pathname,
        )
      ) {
        return;
      }

      const currentPath =
        normalizePathname(
          window.location.pathname,
        );

      const destinationPath =
        normalizePathname(
          destination.pathname,
        );

      if (
        currentPath ===
        destinationPath
      ) {
        return;
      }

      const currentBasePath =
        stripLocaleFromPathname(
          currentPath,
        );

      const destinationBasePath =
        stripLocaleFromPathname(
          destinationPath,
        );

      if (
        currentBasePath ===
        destinationBasePath
      ) {
        return;
      }

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );

      if (
        reducedMotion.matches
      ) {
        return;
      }

      event.preventDefault();

      const destinationHref =
        `${
          destination.pathname
        }${
          destination.search
        }${
          destination.hash
        }`;

      expectedPathRef.current =
        destinationPath;

      const fallbackMeta =
        getTransitionMeta(
          destination.pathname,
        );

      const isWorkArchiveProject =
        currentBasePath ===
          "/work" &&
        destinationBasePath.startsWith(
          "/work/",
        ) &&
        anchor.matches(
          '[data-motion-scroll="work-project"]',
        );

      const isNextProjectHandoff =
        currentBasePath.startsWith(
          "/work/",
        ) &&
        destinationBasePath.startsWith(
          "/work/",
        ) &&
        anchor.matches(
          "[data-next-project-link]",
        );

      if (
        isWorkArchiveProject ||
        isNextProjectHandoff
      ) {
        const hint =
          getProjectTransitionHint(
            anchor,
            fallbackMeta,
          );

        setMeta(
          hint.meta,
        );

        setTransitionAccent(
          hint.accent,
        );
      } else {
        setMeta(
          fallbackMeta,
        );

        setTransitionAccent(
          null,
        );
      }

      setDirection(
        getTransitionDirection(
          currentPath,
          destinationPath,
        ),
      );

      document
        .documentElement
        .dataset
        .routeTransitionHold =
        "true";

      phaseRef.current =
        "covering";

      setPhase(
        "covering",
      );

      router.prefetch(
        destinationHref,
      );

      navigationTimerRef.current =
        window.setTimeout(
          () => {
            router.push(
              destinationHref,
            );
          },
          getCoverDelay(),
        );

      safetyTimerRef.current =
        window.setTimeout(
          resetTransition,
          navigationSafetyTimeout,
        );
    };

    document.addEventListener(
      "click",
      handleDocumentClick,
      true,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleDocumentClick,
        true,
      );
    };
  }, [
    pathname,
    resetTransition,
    router,
  ]);

  /*
   * =========================================================
   * CLIENT ROUTE DESTINATION HANDOFF
   * =========================================================
   */

  useEffect(() => {
    const expectedPath =
      expectedPathRef.current;

    if (
      !expectedPath ||
      phaseRef.current !==
        "covering" ||
      normalizePathname(
        pathname,
      ) !==
        expectedPath
    ) {
      return;
    }

    if (
      navigationTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        navigationTimerRef.current,
      );

      navigationTimerRef.current =
        null;
    }

    revealTimerRef.current =
      window.setTimeout(
        () => {
          delete document
            .documentElement
            .dataset
            .routeTransitionHold;

          phaseRef.current =
            "revealing";

          setPhase(
            "revealing",
          );

          revealTimerRef.current =
            window.setTimeout(
              resetTransition,
              getRevealDuration(),
            );
        },
        routeSettleDelay,
      );
  }, [
    pathname,
    resetTransition,
  ]);

  /*
   * =========================================================
   * CLEANUP
   * =========================================================
   */

  useEffect(() => {
    return () => {
      clearTimers();
      clearDocumentState();
    };
  }, [
    clearDocumentState,
    clearTimers,
  ]);

  if (
    isAdminPath(
      pathname,
    )
  ) {
    return null;
  }

  const rootClassName =
    [
      styles.root,
      styles[phase],
      styles[direction],

      meta.kind ===
      "project"
        ? styles.project
        : "",
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      );

  const rootStyle =
    transitionAccent
      ? ({
          "--accent":
            transitionAccent,
        } as CSSProperties)
      : undefined;

  return (
    <div
      className={
        rootClassName
      }
      style={
        rootStyle
      }
      data-route-transition-layer
      data-route-transition-phase={
        phase
      }
      data-route-transition-direction={
        direction
      }
      data-route-transition-label={
        meta.label
      }
      aria-hidden="true"
    >
      <div
        className={
          styles.rail
        }
      />

      <div
        className={
          styles.slices
        }
      >
        {[0, 1, 2, 3].map(
          (
            slice,
          ) => (
            <span
              key={
                slice
              }
              className={
                styles.slice
              }
            />
          ),
        )}
      </div>

      <div
        className={
          styles.content
        }
      >
        <div
          className={`site-container ${styles.inner}`}
        >
          <div
            className={
              styles.top
            }
          >
            <span>
              {
                site.name
              }
              {" / PORTFOLIO"}
            </span>

            <span
              className={
                styles.index
              }
            >
              {
                meta.index
              }
            </span>
          </div>

          <div
            className={
              styles.titleStage
            }
          >
            <span
              className={
                styles.titleIndex
              }
            >
              {
                meta.index
              }
            </span>

            <div
              className={
                styles.titleWrap
              }
            >
              <span
                className={
                  styles.title
                }
              >
                {
                  meta.label
                }
              </span>
            </div>

            <span
              className={
                styles.axis
              }
            />
          </div>

          <div
            className={
              styles.bottom
            }
          >
            <span>
              DIGITAL CREATOR
            </span>

            <span>
              ©{" "}
              {
                site.year
              }{" "}
              {
                site.name
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}