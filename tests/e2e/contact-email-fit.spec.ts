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
  "mobile contact email keeps its intentional two-line composition across locales",
  async ({
    page,
  }) => {
    const routes = [
      "/contact",
      "/id/contact",
      "/de/contact",
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

        const address =
          page.locator(
            '[data-motion-scroll="contact-email"] [data-motion-piece="address"]',
          );

        await expect(
          address,
        ).toBeAttached();

        const metrics =
          await address.evaluate(
            (
              element,
            ) => {
              const node =
                element as HTMLElement;

              const style =
                window.getComputedStyle(
                  node,
                );

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

              const lines =
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
                        rects.length >
                        0
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
                        rects.length >
                        0
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
                );

              return {
                overflowWrap:
                  style.overflowWrap,

                wordBreak:
                  style.wordBreak,

                hyphens:
                  style.hyphens,

                viewport:
                  window.innerWidth,

                lines,
              };
            },
          );

        expect(
          metrics.overflowWrap,
          `${viewport.width}px:${route} email must not emergency-wrap`,
        ).toBe(
          "normal",
        );

        expect(
          metrics.wordBreak,
          `${viewport.width}px:${route} email must preserve designed lines`,
        ).toBe(
          "normal",
        );

        expect(
          metrics.hyphens,
          `${viewport.width}px:${route} email must not hyphenate`,
        ).toBe(
          "none",
        );

        expect(
          metrics.lines,
          `${viewport.width}px:${route} should contain local-part and domain`,
        ).toHaveLength(
          2,
        );

        for (
          const line
          of metrics.lines
        ) {
          expect(
            line.visualLines,
            `${viewport.width}px:${route} "${line.text}" wrapped unexpectedly`,
          ).toBe(
            1,
          );

          expect(
            line.left,
            `${viewport.width}px:${route} "${line.text}" escapes left`,
          ).toBeGreaterThanOrEqual(
            -1,
          );

          expect(
            line.right,
            `${viewport.width}px:${route} "${line.text}" escapes right`,
          ).toBeLessThanOrEqual(
            metrics.viewport +
              1,
          );
        }
      }
    }
  },
);