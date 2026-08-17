"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const main =
      document.querySelector<HTMLElement>("main");

    if (!main) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    if (prefersReducedMotion) {
      return;
    }

    /*
     * Generic homepage sections.
     *
     * Hero punya entrance choreography sendiri.
     * Selected Work juga punya choreography sendiri.
     */
    const directSections = Array.from(
      main.querySelectorAll<HTMLElement>(
        ":scope > section, :scope > footer",
      ),
    );

    const generatedSections: HTMLElement[] = [];

    directSections.forEach(
      (section, index) => {
        const isHero = index === 0;
        const isSelectedWork =
          section.id === "work";

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

        generatedSections.push(section);
      },
    );

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-motion-scroll]",
      ),
    );

    targets.forEach((target) => {
      target.removeAttribute(
        "data-motion-visible",
      );
    });

    if (
      !("IntersectionObserver" in window)
    ) {
      targets.forEach((target) => {
        target.dataset.motionVisible =
          "true";
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const target =
              entry.target as HTMLElement;

            target.dataset.motionVisible =
              "true";

            observer.unobserve(target);
          });
        },
        {
          threshold: 0.08,

          rootMargin:
            "0px 0px -6% 0px",
        },
      );

    targets.forEach((target) => {
      observer.observe(target);
    });

    return () => {
      observer.disconnect();

      generatedSections.forEach(
        (section) => {
          delete section.dataset.motionScroll;
          delete section.dataset.motionGenerated;
          delete section.dataset.motionVisible;
        },
      );
    };
  }, [pathname]);

  return null;
}