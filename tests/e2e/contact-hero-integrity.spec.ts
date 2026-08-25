import {
  expect,
  test,
} from "@playwright/test";

test.beforeEach(
  async ({
    page,
  }) => {
    await page.addInitScript(
      () => {
        window.sessionStorage.setItem(
          "natsx:portfolio-intro:v5",
          "1",
        );
      },
    );
  },
);

test(
  "contact hero preserves entrance motion while only the question mark owns ambient motion",
  async ({
    page,
  }) => {
    test.setTimeout(
      90_000,
    );

    await page.emulateMedia({
      reducedMotion:
        "no-preference",
    });

    const routes = [
      "/contact",
      "/id/contact",
      "/de/contact",
    ] as const;

    const viewports = [
      [375, 812],
      [768, 1024],
      [1440, 900],
    ] as const;

    for (
      const [
        width,
        height,
      ]
      of viewports
    ) {
      await page.setViewportSize({
        width,
        height,
      });

      for (
        const route
        of routes
      ) {
        const response =
          await page.goto(
            route,
            {
              waitUntil:
                "domcontentloaded",
            },
          );

        expect(
          response?.status(),
          `${width}px:${route}`,
        ).toBeLessThan(
          400,
        );

        await expect(
          page.locator(
            "html",
          ),
        ).toHaveAttribute(
          "data-motion",
          "enabled",
        );

        await page.evaluate(
          async () => {
            await document.fonts.ready;
          },
        );

        const heading =
          page.locator(
            '[data-motion-contact-hero-piece="title"]',
          );

        const cluster =
          heading.locator(
            "[data-contact-question-cluster]",
          );

        const marker =
          cluster.locator(
            "[data-contact-question-mark]",
          );

        await expect(
          heading,
        ).toBeVisible();

        await expect(
          cluster,
        ).toBeVisible();

        await expect(
          marker,
        ).toHaveText(
          "?",
        );

        const metrics =
          await page.evaluate(
            () => {
              const heading =
                document.querySelector<HTMLElement>(
                  '[data-motion-contact-hero-piece="title"]',
                );

              const cluster =
                document.querySelector<HTMLElement>(
                  "[data-contact-question-cluster]",
                );

              const marker =
                document.querySelector<HTMLElement>(
                  "[data-contact-question-mark]",
                );

              if (
                !heading ||
                !cluster ||
                !marker
              ) {
                return null;
              }

              const headingStyle =
                getComputedStyle(
                  heading,
                );

              const clusterStyle =
                getComputedStyle(
                  cluster,
                );

              const markerStyle =
                getComputedStyle(
                  marker,
                );

              const clusterRects =
                Array.from(
                  cluster.getClientRects(),
                ).filter(
                  (
                    rect,
                  ) =>
                    rect.width >
                      0 &&
                    rect.height >
                      0,
                );

              const markerRect =
                marker.getBoundingClientRect();

              return {
                headingAnimation:
                  headingStyle.animationName,

                headingDuration:
                  headingStyle.animationDuration,

                headingIterations:
                  headingStyle.animationIterationCount,

                clusterAnimation:
                  clusterStyle.animationName,

                clusterWhiteSpace:
                  clusterStyle.whiteSpace,

                clusterColor:
                  clusterStyle.color,

                markerAnimation:
                  markerStyle.animationName,

                markerDuration:
                  markerStyle.animationDuration,

                markerDelay:
                  markerStyle.animationDelay,

                markerIterations:
                  markerStyle.animationIterationCount,

                clusterRectCount:
                  clusterRects.length,

                clusterRight:
                  clusterRects[0]
                    ?.right ??
                  0,

                markerRight:
                  markerRect.right,

                viewportWidth:
                  innerWidth,

                clusterText:
                  cluster.textContent ??
                  "",
              };
            },
          );

        expect(
          metrics,
        ).not.toBeNull();

        if (!metrics) {
          continue;
        }

        /*
         * Whole title keeps original
         * one-shot entrance.
         */
        expect(
          metrics.headingAnimation,
        ).toContain(
          "natsx-contact-title-in",
        );

        expect(
          metrics.headingDuration,
        ).toContain(
          "1.08s",
        );

        expect(
          metrics.headingIterations,
        ).not.toContain(
          "infinite",
        );

        /*
         * Structural final-word cluster
         * must never animate itself.
         */
        expect(
          metrics.clusterAnimation,
        ).toBe(
          "none",
        );

        expect(
          metrics.clusterWhiteSpace,
        ).toBe(
          "nowrap",
        );

        expect(
          metrics.clusterRectCount,
          `${width}px:${route} final word and question mark split across lines`,
        ).toBe(
          1,
        );

        expect(
          metrics.clusterText.trim(),
        ).toMatch(
          /.+\?$/,
        );

        /*
         * Only question mark owns
         * recurring ambient motion.
         */
        expect(
          metrics.markerAnimation,
        ).toContain(
          "contact-page-question",
        );

        expect(
          metrics.markerDuration,
        ).toContain(
          "5.4s",
        );

        expect(
          metrics.markerDelay,
        ).toContain(
          "1.2s",
        );

        expect(
          metrics.markerIterations,
        ).toContain(
          "infinite",
        );

        expect(
          metrics.markerRight,
        ).toBeLessThanOrEqual(
          metrics.clusterRight +
            1,
        );

        expect(
          metrics.markerRight,
        ).toBeLessThanOrEqual(
          metrics.viewportWidth +
            1,
        );
      }
    }
  },
);