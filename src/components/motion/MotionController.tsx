"use client";

import {
  useEffect,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  stripLocaleFromPathname,
} from "@/i18n/config";

export default function MotionController() {
  const pathname =
    usePathname();

  useEffect(() => {
    const main =
      document.querySelector<HTMLElement>(
        "main",
      );

    if (!main) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const basePath =
      stripLocaleFromPathname(
        pathname,
      );

    const isHomepage =
      basePath === "/";

    const isProjectDetail =
      basePath.startsWith(
        "/work/",
      );

    /*
     * =========================
     * GENERATED HOMEPAGE HOOKS
     * =========================
     */

    const generatedSections:
      HTMLElement[] = [];

    if (isHomepage) {
      const directSections =
        Array.from(
          main.querySelectorAll<HTMLElement>(
            ":scope > section, :scope > footer",
          ),
        );

      directSections.forEach(
        (
          section,
          index,
        ) => {
          const isHero =
            index === 0;

          const isSelectedWork =
            section.id ===
            "work";

          if (
            isHero ||
            isSelectedWork ||
            section.hasAttribute(
              "data-motion-scroll",
            )
          ) {
            return;
          }

          section.dataset.motionScroll =
            "section";

          section.dataset.motionGenerated =
            "true";

          generatedSections.push(
            section,
          );
        },
      );
    }

    /*
     * =========================
     * PROJECT MEDIA HOOKS
     * =========================
     *
     * Project screenshots need their
     * OWN observer lifecycle.
     *
     * Section-level visibility is not
     * enough because one section can
     * contain multiple screenshots.
     *
     * We generate explicit motion
     * targets for:
     *
     * - single image media
     * - every gallery screenshot
     * - finale media
     *
     * No JSX modification required.
     */

    const generatedProjectMedia:
      HTMLElement[] = [];

    if (isProjectDetail) {
      const projectMedia =
        Array.from(
          main.querySelectorAll<HTMLElement>(
            [
              '[data-motion-piece="media"]',
              '[data-motion-scroll="project-gallery"] [data-motion-piece="item"]',
            ].join(","),
          ),
        );

      projectMedia.forEach(
        (
          target,
        ) => {
          if (
            target.hasAttribute(
              "data-motion-scroll",
            )
          ) {
            return;
          }

          target.dataset.motionScroll =
            "project-media-item";

          target.dataset.motionMediaGenerated =
            "true";

          generatedProjectMedia.push(
            target,
          );
        },
      );
    }

    /*
     * =========================
     * ALL MOTION TARGETS
     * =========================
     */

    const targets =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-motion-scroll]",
        ),
      );

    /*
     * =========================
     * REDUCED MOTION
     * =========================
     */

    if (
      prefersReducedMotion
    ) {
      targets.forEach(
        (
          target,
        ) => {
          target.dataset.motionVisible =
            "true";
        },
      );

      return () => {
        generatedSections.forEach(
          (
            section,
          ) => {
            delete section
              .dataset
              .motionScroll;

            delete section
              .dataset
              .motionGenerated;

            delete section
              .dataset
              .motionVisible;
          },
        );

        generatedProjectMedia.forEach(
          (
            target,
          ) => {
            delete target
              .dataset
              .motionScroll;

            delete target
              .dataset
              .motionMediaGenerated;

            delete target
              .dataset
              .motionVisible;
          },
        );
      };
    }

    /*
     * Reset before observing.
     */

    targets.forEach(
      (
        target,
      ) => {
        target.removeAttribute(
          "data-motion-visible",
        );
      },
    );

    /*
     * =========================
     * FALLBACK
     * =========================
     */

    if (
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      targets.forEach(
        (
          target,
        ) => {
          target.dataset.motionVisible =
            "true";
        },
      );

      return;
    }

    /*
     * =========================
     * STANDARD PAGE OBSERVER
     * =========================
     *
     * Existing behavior remains.
     */

    const projectMediaSet =
      new Set(
        generatedProjectMedia,
      );

    const standardTargets =
      targets.filter(
        (
          target,
        ) =>
          !projectMediaSet.has(
            target,
          ),
      );

    const standardObserver =
      new IntersectionObserver(
        (
          entries,
        ) => {
          entries.forEach(
            (
              entry,
            ) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              const target =
                entry.target as HTMLElement;

              target.dataset.motionVisible =
                "true";

              standardObserver.unobserve(
                target,
              );
            },
          );
        },
        {
          threshold:
            0.08,

          rootMargin:
            "0px 0px -6% 0px",
        },
      );

    standardTargets.forEach(
      (
        target,
      ) => {
        standardObserver.observe(
          target,
        );
      },
    );

    /*
     * =========================
     * PROJECT MEDIA OBSERVER
     * =========================
     *
     * IMPORTANT:
     *
     * Positive bottom rootMargin means
     * media reveal starts BEFORE the
     * screenshot actually enters the
     * visible viewport.
     *
     * Result:
     *
     * approaching viewport
     * -> animation starts
     *
     * screenshot enters
     * -> animation almost complete
     *
     * screenshot reaches reading area
     * -> 100% settled
     */

    const mediaObserver =
      new IntersectionObserver(
        (
          entries,
        ) => {
          entries.forEach(
            (
              entry,
            ) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              const target =
                entry.target as HTMLElement;

              target.dataset.motionVisible =
                "true";

              mediaObserver.unobserve(
                target,
              );
            },
          );
        },
        {
          threshold:
            0.01,

          rootMargin:
            "0px 0px 18% 0px",
        },
      );

    generatedProjectMedia.forEach(
      (
        target,
      ) => {
        mediaObserver.observe(
          target,
        );
      },
    );

    /*
     * =========================
     * CLEANUP
     * =========================
     */

    return () => {
      standardObserver.disconnect();

      mediaObserver.disconnect();

      generatedSections.forEach(
        (
          section,
        ) => {
          delete section
            .dataset
            .motionScroll;

          delete section
            .dataset
            .motionGenerated;

          delete section
            .dataset
            .motionVisible;
        },
      );

      generatedProjectMedia.forEach(
        (
          target,
        ) => {
          delete target
            .dataset
            .motionScroll;

          delete target
            .dataset
            .motionMediaGenerated;

          delete target
            .dataset
            .motionVisible;
        },
      );
    };
  }, [
    pathname,
  ]);

  return null;
}