"use client";

import {
  useEffect,
} from "react";

import {
  track,
} from "@vercel/analytics";

export default function ProjectOpenAnalytics({
  slug,
}: {
  slug: string;
}) {
  useEffect(
    () => {
      const params =
        new URLSearchParams(
          window.location.search,
        );

      const source =
        params.get(
          "utm_source",
        ) ??
        (
          document.referrer
            ? "referral"
            : "direct"
        );

      const dedupeKey =
        `natsx:analytics:project-open:${window.location.pathname}:${source}`;

      try {
        if (
          window.sessionStorage.getItem(
            dedupeKey,
          ) ===
          "1"
        ) {
          return;
        }

        window.sessionStorage.setItem(
          dedupeKey,
          "1",
        );
      } catch {
        /*
         * Analytics should never block
         * the recruiter experience.
         */
      }

      track(
        "project_open",
        {
          project:
            slug,

          source,
        },
      );
    },
    [
      slug,
    ],
  );

  return null;
}
