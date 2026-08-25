import {
  expect,
  test,
  type Page,
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

async function getTextFitIssues(
  page: Page,
  selectors:
    readonly string[],
) {
  return page.evaluate(
    (
      targetSelectors,
    ) => {
      const elements:
        HTMLElement[] =
        [];

      const seen =
        new Set<Element>();

      for (
        const selector
        of targetSelectors
      ) {
        for (
          const element
          of document.querySelectorAll<HTMLElement>(
            selector,
          )
        ) {
          if (
            seen.has(
              element,
            )
          ) {
            continue;
          }

          seen.add(
            element,
          );

          elements.push(
            element,
          );
        }
      }

      const issues:
        Array<{
          text:
            string;

          reason:
            string;

          left:
            number;

          right:
            number;

          viewport:
            number;

          clientWidth:
            number;

          scrollWidth:
            number;
        }> =
        [];

      for (
        const element
        of elements
      ) {
        const style =
          window.getComputedStyle(
            element,
          );

        const rect =
          element.getBoundingClientRect();

        if (
          style.display ===
            "none" ||
          style.visibility ===
            "hidden" ||
          rect.width <=
            0 ||
          rect.height <=
            0
        ) {
          continue;
        }

        const text =
          element.innerText
            .replace(
              /\s+/g,
              " ",
            )
            .trim()
            .slice(
              0,
              120,
            );

        if (!text) {
          continue;
        }

        const range =
          document.createRange();

        range.selectNodeContents(
          element,
        );

        const textRects =
          Array.from(
            range.getClientRects(),
          ).filter(
            (
              textRect,
            ) =>
              textRect.width >
                0 &&
              textRect.height >
                0,
          );

        const textLeft =
          textRects.length >
          0
            ? Math.min(
                ...textRects.map(
                  (
                    textRect,
                  ) =>
                    textRect.left,
                ),
              )
            : rect.left;

        const textRight =
          textRects.length >
          0
            ? Math.max(
                ...textRects.map(
                  (
                    textRect,
                  ) =>
                    textRect.right,
                ),
              )
            : rect.right;

        const tolerance =
          3;

        if (
          element.scrollWidth >
          element.clientWidth +
            tolerance
        ) {
          issues.push({
            text,

            reason:
              "internal horizontal clipping",

            left:
              textLeft,

            right:
              textRight,

            viewport:
              window.innerWidth,

            clientWidth:
              element.clientWidth,

            scrollWidth:
              element.scrollWidth,
          });

          continue;
        }

        if (
          textLeft <
          -tolerance
        ) {
          issues.push({
            text,

            reason:
              "text escapes left viewport edge",

            left:
              textLeft,

            right:
              textRight,

            viewport:
              window.innerWidth,

            clientWidth:
              element.clientWidth,

            scrollWidth:
              element.scrollWidth,
          });

          continue;
        }

        if (
          textRight >
          window.innerWidth +
            tolerance
        ) {
          issues.push({
            text,

            reason:
              "text escapes right viewport edge",

            left:
              textLeft,

            right:
              textRight,

            viewport:
              window.innerWidth,

            clientWidth:
              element.clientWidth,

            scrollWidth:
              element.scrollWidth,
          });
        }
      }

      return issues;
    },
    [
      ...selectors,
    ],
  );
}

test(
  "localized homepage hero lines stay inside their composition",
  async ({
    page,
  }) => {
    const locales = [
      "/id",
      "/de",
    ] as const;

    const viewports = [
      {
        name:
          "small-mobile",

        width:
          360,

        height:
          800,
      },

      {
        name:
          "mobile",

        width:
          375,

        height:
          812,
      },

      {
        name:
          "wide-mobile",

        width:
          430,

        height:
          900,
      },

      {
        name:
          "tablet",

        width:
          768,

        height:
          1024,
      },

      {
        name:
          "desktop",

        width:
          1440,

        height:
          900,
      },
    ] as const;

    for (
      const viewport
      of viewports
    ) {
      await page.setViewportSize({
        width:
          viewport.width,

        height:
          viewport.height,
      });

      for (
        const route
        of locales
      ) {
        const response =
          await page.goto(
            route,
          );

        expect(
          response,
        ).not.toBeNull();

        expect(
          response?.status(),
        ).toBeLessThan(
          400,
        );

        await page.evaluate(
          async () => {
            await document.fonts.ready;
          },
        );

        const title =
          page.locator(
            "[data-home-hero-title]",
          );

        const lines =
          page.locator(
            "[data-home-hero-title-line]",
          );

        await expect(
          title,
        ).toBeVisible();

        await expect(
          lines,
        ).toHaveCount(
          2,
        );

        const result =
          await page.evaluate(
            () => {
              const titleElement =
                document.querySelector<HTMLElement>(
                  "[data-home-hero-title]",
                );

              const lineElements =
                Array.from(
                  document.querySelectorAll<HTMLElement>(
                    "[data-home-hero-title-line]",
                  ),
                );

              if (
                !titleElement
              ) {
                return null;
              }

              const titleRect =
                titleElement.getBoundingClientRect();

              return {
                viewportWidth:
                  window.innerWidth,

                titleLeft:
                  titleRect.left,

                titleRight:
                  titleRect.right,

                lines:
                  lineElements.map(
                    (
                      line,
                    ) => {
                      const rect =
                        line.getBoundingClientRect();

                      return {
                        left:
                          rect.left,

                        right:
                          rect.right,
                      };
                    },
                  ),
              };
            },
          );

        expect(
          result,
          `${viewport.name}:${route} missing hero metrics`,
        ).not.toBeNull();

        if (!result) {
          continue;
        }

        for (
          const [
            index,
            line,
          ]
          of result.lines.entries()
        ) {
          expect(
            line.left,
            `${viewport.name}:${route} hero line ${index + 1} escapes left`,
          ).toBeGreaterThanOrEqual(
            result.titleLeft -
              1,
          );

          expect(
            line.right,
            `${viewport.name}:${route} hero line ${index + 1} is visually clipped`,
          ).toBeLessThanOrEqual(
            Math.min(
              result.titleRight,
              result.viewportWidth,
            ) +
              1,
          );
        }
      }
    }
  },
);

test(
  "project detail oversized titles remain readable on mobile",
  async ({
    page,
  }) => {
    const routes = [
      "/work/bast-management-system",
      "/id/work/bast-management-system",
      "/de/work/bast-management-system",
    ] as const;

    const viewports = [
      {
        width:
          360,

        height:
          800,
      },

      {
        width:
          375,

        height:
          812,
      },

      {
        width:
          430,

        height:
          932,
      },
    ] as const;

    for (
      const viewport
      of viewports
    ) {
      await page.setViewportSize(
        viewport,
      );

      for (
        const route
        of routes
      ) {
        const response =
          await page.goto(
            route,
          );

        expect(
          response,
        ).not.toBeNull();

        expect(
          response?.status(),
        ).toBeLessThan(
          400,
        );

        await page.evaluate(
          async () => {
            await document.fonts.ready;
          },
        );

        const heroTitle =
          page.locator(
            '[data-motion-project-hero-piece="title"] h1',
          );

        await expect(
          heroTitle,
        ).toBeVisible();

        const heroIssues =
          await getTextFitIssues(
            page,
            [
              '[data-motion-project-hero-piece="title"] h1',
            ],
          );

        expect(
          heroIssues,
          `${viewport.width}px:${route} project hero clipping`,
        ).toEqual(
          [],
        );

        const nextTitles =
          page.locator(
            '[data-motion-scroll="project-next-link"] h2',
          );

        if (
          (await nextTitles.count()) >
          0
        ) {
          await expect(
            nextTitles.first(),
          ).toBeAttached();

          const nextIssues =
            await getTextFitIssues(
              page,
              [
                '[data-motion-scroll="project-next-link"] h2',
              ],
            );

          expect(
            nextIssues,
            `${viewport.width}px:${route} next-project clipping`,
          ).toEqual(
            [],
          );
        }
      }
    }
  },
);

test(
  "localized editorial typography stays inside mobile composition",
  async ({
    page,
  }) => {
    test.setTimeout(
      60_000,
    );

    await page.emulateMedia({
      reducedMotion:
        "reduce",
    });

    const viewports = [
      {
        width:
          360,

        height:
          800,
      },

      {
        width:
          375,

        height:
          812,
      },

      {
        width:
          430,

        height:
          932,
      },
    ] as const;

    const pageTargets = [
      {
        path:
          "/work",

        selectors: [
          '[data-motion-work-hero-piece="title"]',
          '[data-motion-scroll="work-project"] h2',
          '[data-motion-scroll="work-closing"] p',
        ],
      },

      {
        path:
          "/about",

        selectors: [
          '[data-motion-about-hero-piece="title"]',

          '[data-motion-scroll="about-story"] [data-motion-piece="title"]',

          '[data-motion-scroll="about-approach-header"] [data-motion-piece="title"]',

          '[data-motion-scroll="about-principle"] h3',

          '[data-motion-scroll="about-disciplines-header"] [data-motion-piece="title"]',

          '[data-motion-scroll="about-discipline"] h2',

          '[data-motion-scroll="about-closing"] [data-motion-piece="main"] p',
        ],
      },

      {
        path:
          "/playground",

        selectors: [
          '[data-motion-playground-hero-piece="title"]',

          '[data-motion-scroll="playground-manifesto"] [data-motion-piece="title"]',

          '[data-motion-scroll="playground-closing"] [data-motion-piece="main"] p',
        ],
      },

      {
        path:
          "/contact",

        selectors: [
          '[data-motion-contact-hero-piece="title"]',

          '[data-motion-scroll="contact-email"] [data-motion-piece="address"]',

          '[data-motion-scroll="contact-collaboration"] [data-motion-piece="item"] p',

          '[data-motion-scroll="contact-social-header"] [data-motion-piece="title"]',

          '[data-motion-scroll="contact-closing"] [data-motion-piece="main"] p',
        ],
      },

      {
        path:
          "/cv",

        selectors: [
          '[data-motion-cv-hero-piece="title"]',

          '[data-motion-scroll="cv-language-list"] button',

          '[data-motion-scroll="cv-viewer-header"] h2',

          '[data-motion-scroll="cv-closing"] [data-motion-piece="main"] p',
        ],
      },
    ] as const;

    const locales = [
      "id",
      "de",
    ] as const;

    for (
      const viewport
      of viewports
    ) {
      await page.setViewportSize(
        viewport,
      );

      for (
        const locale
        of locales
      ) {
        for (
          const target
          of pageTargets
        ) {
          const route =
            `/${locale}${target.path}`;

          const response =
            await page.goto(
              route,
            );

          expect(
            response,
            `${viewport.width}px:${route}`,
          ).not.toBeNull();

          expect(
            response?.status(),
            `${viewport.width}px:${route}`,
          ).toBeLessThan(
            400,
          );

          await expect(
            page.locator(
              "#main-content",
            ),
          ).toBeVisible();

          await page.evaluate(
            async () => {
              await document.fonts.ready;
            },
          );

          const issues =
            await getTextFitIssues(
              page,
              target.selectors,
            );

          expect(
            issues,
            `${viewport.width}px:${route} has clipped localized typography`,
          ).toEqual(
            [],
          );
        }
      }
    }
  },
);