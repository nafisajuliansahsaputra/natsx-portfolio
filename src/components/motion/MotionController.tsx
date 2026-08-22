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

    /*
     * Homepage memakai
     * auto-generated motion hooks
     * untuk section generik.
     *
     * Locale prefix seperti
     * /id dan /de dinormalisasi
     * menjadi homepage yang sama.
     *
     * Inner pages memakai explicit
     * data-motion-scroll hooks.
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

    const targets =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-motion-scroll]",
        ),
      );

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
      };
    }

    targets.forEach(
      (
        target,
      ) => {
        target.removeAttribute(
          "data-motion-visible",
        );
      },
    );

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

    const observer =
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

              observer.unobserve(
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

    targets.forEach(
      (
        target,
      ) => {
        observer.observe(
          target,
        );
      },
    );

    return () => {
      observer.disconnect();

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
    };
  }, [
    pathname,
  ]);

  return null;
}