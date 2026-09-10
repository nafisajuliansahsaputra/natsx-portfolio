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

/*
 * =========================================================
 * PROJECT COLOR UTILITIES
 * =========================================================
 *
 * Project transition content is white.
 *
 * Very light project accent colors are
 * darkened only as much as necessary to
 * keep transition content readable.
 *
 * This is the exact same treatment for:
 *
 * - Work archive → Project
 * - Project → Next Project
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

  /*
   * Preserve other valid CSS color
   * formats instead of discarding them.
   */
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

  /*
   * Already safe with white content.
   */
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

  /*
   * Preserve hue while mixing toward
   * the portfolio foreground until
   * white content has enough contrast.
   */
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
 *
 * There are currently two project-entry
 * surfaces:
 *
 * 1. Work archive row
 *
 *    accent:
 *    --row-accent
 *
 * 2. Next Project handoff
 *
 *    accent:
 *    --next-project-accent
 *
 * CSS custom properties inherit, so the
 * Next Project accent can be read from
 * the clicked anchor even though it is
 * assigned to its parent section.
 *
 * This keeps one single transition
 * pipeline for both navigation paths.
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

  /*
   * =========================
   * PROJECT NUMBER
   * =========================
   *
   * Work archive:
   * first direct span of row.
   *
   * Next Project:
   * section's data-next-project-number.
   */

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

  /*
   * =========================
   * DESTINATION ACCENT
   * =========================
   *
   * Work row:
   * --row-accent
   *
   * Next Project:
   * --next-project-accent
   *
   * We check inline values first, then
   * computed values so inherited custom
   * properties are supported too.
   */

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

  const [
    meta,
    setMeta,
  ] =
    useState<TransitionMeta>(
      initialMeta,
    );

  /*
   * Scoped transition accent.
   *
   * null:
   * normal NATSX violet.
   *
   * project navigation:
   * accent of the DESTINATION project.
   */
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

      /*
       * Project accent is scoped only to
       * one transition lifecycle.
       */
      setTransitionAccent(
        null,
      );
    }, [
      clearDocumentState,
      clearTimers,
    ]);

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

      /* =====================================================
         DESTINATION META + DESTINATION PROJECT ACCENT
      ===================================================== */

      const fallbackMeta =
        getTransitionMeta(
          destination.pathname,
        );

      /*
       * Work archive project card.
       */
      const isWorkArchiveProject =
        currentBasePath ===
          "/work" &&
        destinationBasePath.startsWith(
          "/work/",
        ) &&
        anchor.matches(
          '[data-motion-scroll="work-project"]',
        );

      /*
       * Project Detail → Next Project.
       *
       * This is the path that previously
       * fell through to the default NATSX
       * violet.
       */
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

      /*
       * Both project-entry surfaces now
       * use exactly the same transition
       * hint + readability pipeline.
       */
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

  /*
   * Route transition CSS already uses
   * var(--accent).
   *
   * Override it only on this overlay,
   * so the actual page theme never gets
   * mutated during navigation.
   */
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