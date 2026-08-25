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
  "contact email keeps its intentional two-line composition across locales and responsive breakpoints",
  async ({
    page,
  }) => {
    test.setTimeout(
      90_000,
    );

    await page.emulateMedia({
      reducedMotion:
        "reduce",
    });

    const routes = [
      "/contact",
      "/id/contact",
      "/de/contact",
    ] as const;

    const viewports = [
      [360, 800],
      [375, 812],
      [430, 932],
      [768, 1024],
      [1024, 768],
      [1280, 800],
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

        await page.evaluate(
          async () => {
            await document.fonts.ready;
          },
        );

        const address =
          page.locator(
            '[data-motion-scroll="contact-email"] [data-motion-piece="address"]',
          );

        await expect(
          address,
        ).toBeVisible();

        const metrics =
          await address.evaluate(
            (
              element,
            ) => {
              const node =
                element as HTMLElement;

              const addressRect =
                node.getBoundingClientRect();

              const textNodes =
                Array.from(
                  node.childNodes,
                ).filter(
                  (
                    child,
                  ) =>
                    child.nodeType ===
                      Node.TEXT_NODE &&
                    (
                      child.textContent ??
                      ""
                    )
                      .trim()
                      .length >
                      0,
                );

              return {
                addressLeft:
                  addressRect.left,

                addressRight:
                  addressRect.right,

                viewportWidth:
                  window.innerWidth,

                lines:
                  textNodes.map(
                    (
                      textNode,
                    ) => {
                      const range =
                        document.createRange();

                      range.selectNodeContents(
                        textNode,
                      );

                      const rects =
                        Array.from(
                          range.getClientRects(),
                        ).filter(
                          (
                            rect,
                          ) =>
                            rect.width >
                              0 &&
                            rect.height >
                              0,
                        );

                      return {
                        text:
                          (
                            textNode.textContent ??
                            ""
                          ).trim(),

                        visualLines:
                          rects.length,

                        left:
                          rects.length
                            ? Math.min(
                                ...rects.map(
                                  (
                                    rect,
                                  ) =>
                                    rect.left,
                                ),
                              )
                            : 0,

                        right:
                          rects.length
                            ? Math.max(
                                ...rects.map(
                                  (
                                    rect,
                                  ) =>
                                    rect.right,
                                ),
                              )
                            : 0,
                      };
                    },
                  ),
              };
            },
          );

        expect(
          metrics.lines,
          `${width}px:${route} email must contain exactly two intentional text lines`,
        ).toHaveLength(
          2,
        );

        expect(
          metrics.lines[0]
            ?.text,
        ).toBe(
          "nafisajuliansahsaputra",
        );

        expect(
          metrics.lines[1]
            ?.text,
        ).toBe(
          "@gmail.com",
        );

        for (
          const line
          of metrics.lines
        ) {
          expect(
            line.visualLines,
            `${width}px:${route} "${line.text}" wrapped unexpectedly`,
          ).toBe(
            1,
          );

          expect(
            line.left,
          ).toBeGreaterThanOrEqual(
            metrics.addressLeft -
              1,
          );

          expect(
            line.right,
          ).toBeLessThanOrEqual(
            metrics.addressRight +
              1,
          );

          expect(
            line.left,
          ).toBeGreaterThanOrEqual(
            -1,
          );

          expect(
            line.right,
          ).toBeLessThanOrEqual(
            metrics.viewportWidth +
              1,
          );
        }
      }
    }
  },
);