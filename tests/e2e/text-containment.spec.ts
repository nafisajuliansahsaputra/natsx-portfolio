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

const routes = [
  "/",
  "/work",
  "/about",
  "/playground",
  "/contact",
  "/cv",

  "/id",
  "/id/work",
  "/id/about",
  "/id/playground",
  "/id/contact",
  "/id/cv",

  "/de",
  "/de/work",
  "/de/about",
  "/de/playground",
  "/de/contact",
  "/de/cv",
] as const;

const viewports = [
  {
    name:
      "mobile-360",

    width:
      360,

    height:
      800,
  },

  {
    name:
      "mobile-375",

    width:
      375,

    height:
      812,
  },

  {
    name:
      "mobile-430",

    width:
      430,

    height:
      932,
  },

  {
    name:
      "tablet-768",

    width:
      768,

    height:
      1024,
  },

  {
    name:
      "desktop-1024",

    width:
      1024,

    height:
      768,
  },

  {
    name:
      "desktop-1280",

    width:
      1280,

    height:
      800,
  },

  {
    name:
      "desktop-1440",

    width:
      1440,

    height:
      900,
  },

  {
    name:
      "desktop-1920",

    width:
      1920,

    height:
      1080,
  },
] as const;

type MotionMode =
  | "normal"
  | "reduced";

const motionModes:
  MotionMode[] = [
    "normal",
    "reduced",
  ];

type TextRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

type ClippedTextIssue = {
  text: string;

  tag:
    string;

  selector:
    string;

  reason:
    string;

  elementRect:
    TextRect;

  textRect:
    TextRect;

  overflowX:
    string;

  overflowY:
    string;

  clipPath:
    string;
};

async function navigate(
  page: Page,
  route: string,
  motionMode: MotionMode,
) {
  await page.emulateMedia({
    reducedMotion:
      motionMode ===
      "reduced"
        ? "reduce"
        : "no-preference",
  });

  const response =
    await page.goto(
      route,
      {
        waitUntil:
          "domcontentloaded",
      },
    );

  expect(
    response,
    route,
  ).not.toBeNull();

  expect(
    response?.status(),
    route,
  ).toBeLessThan(
    400,
  );

  await page.evaluate(
    async () => {
      await document.fonts.ready;
    },
  );

  /*
   * Normal motion needs time for the
   * above-fold entrance choreography
   * to settle before measuring text.
   */
  if (
    motionMode ===
    "normal"
  ) {
    await page.waitForTimeout(
      1300,
    );
  }
}

async function finishFiniteAnimations(
  page: Page,
) {
  await page.evaluate(
    async () => {
      /*
       * Geometry audits should inspect the
       * settled state of finite entrance /
       * reveal animations.
       *
       * Infinite ambient motion is left
       * untouched.
       */
      for (
        const animation
        of document.getAnimations()
      ) {
        const timing =
          animation.effect
            ?.getTiming();

        if (
          timing?.iterations ===
          Infinity
        ) {
          continue;
        }

        try {
          animation.finish();
        } catch {
          /*
           * Some animations cannot be
           * finished in their current
           * playback state.
           */
        }
      }

      await new Promise<void>(
        (
          resolve,
        ) => {
          window.requestAnimationFrame(
            () => {
              window.requestAnimationFrame(
                () => {
                  resolve();
                },
              );
            },
          );
        },
      );
    },
  );
}

async function settleWholePage(
  page: Page,
  motionMode: MotionMode,
): Promise<
  ClippedTextIssue[]
> {
  const scrollMetrics =
    await page.evaluate(
      () => {
        const viewportHeight =
          Math.max(
            window.innerHeight,
            1,
          );

        const maxScroll =
          Math.max(
            document.documentElement
              .scrollHeight -
              viewportHeight,
            0,
          );

        const step =
          Math.max(
            viewportHeight *
              0.7,
            320,
          );

        return {
          maxScroll,
          step,
        };
      },
    );

  const positions:
    number[] = [];

  for (
    let y = 0;
    y < scrollMetrics.maxScroll;
    y += scrollMetrics.step
  ) {
    positions.push(
      y,
    );
  }

  positions.push(
    scrollMetrics.maxScroll,
  );

  const collected:
    ClippedTextIssue[] = [];

  const seen =
    new Set<string>();

  for (
    const y
    of positions
  ) {
    await page.evaluate(
      (
        scrollY,
      ) => {
        window.scrollTo(
          0,
          scrollY,
        );
      },
      y,
    );

    await page.waitForTimeout(
      motionMode ===
        "normal"
        ? 80
        : 25,
    );

    await finishFiniteAnimations(
      page,
    );

    const sample =
      await findClippedText(
        page,
      );

    for (
      const issue
      of sample
    ) {
      const key = [
        issue.selector,
        issue.text,
        issue.reason,
      ].join(
        "|",
      );

      if (
        seen.has(
          key,
        )
      ) {
        continue;
      }

      seen.add(
        key,
      );

      collected.push(
        issue,
      );
    }
  }

  await page.evaluate(
    () => {
      window.scrollTo(
        0,
        0,
      );
    },
  );

  return collected;
}

async function findClippedText(
  page: Page,
): Promise<
  ClippedTextIssue[]
> {
  return page.evaluate(
    () => {
      const tolerance =
        2.5;

      const ignoredTags =
        new Set([
          "SCRIPT",
          "STYLE",
          "NOSCRIPT",
          "SVG",
          "PATH",
        ]);

      const selectors = [
        "main h1",
        "main h2",
        "main h3",
        "main h4",
        "main h5",
        "main h6",
        "main p",
        "main a",
        "main button",
        "main span",
        "main strong",
        "main small",
        "main li",
      ].join(
        ",",
      );

      function isTreeVisible(
        element: HTMLElement,
      ) {
        let current:
          HTMLElement |
          null =
          element;

        while (
          current &&
          current !==
            document.documentElement
        ) {
          const style =
            window.getComputedStyle(
              current,
            );

          const opacity =
            Number.parseFloat(
              style.opacity ||
                "1",
            );

          if (
            style.display ===
              "none" ||
            style.visibility ===
              "hidden" ||
            style.visibility ===
              "collapse" ||
            style.contentVisibility ===
              "hidden" ||
            opacity <=
              0.01 ||
            current.getAttribute(
              "aria-hidden",
            ) ===
              "true"
          ) {
            return false;
          }

          current =
            current.parentElement;
        }

        return true;
      }

      function isVisible(
        element: HTMLElement,
      ) {
        if (
          !isTreeVisible(
            element,
          )
        ) {
          return false;
        }

        const rect =
          element.getBoundingClientRect();

        /*
         * Horizontal intersection is
         * intentionally NOT required.
         *
         * We need to detect accidental
         * horizontal text overflow.
         *
         * Intentional horizontal scrollers
         * are handled separately below.
         */
        const intersectsViewport =
          rect.bottom >
            -tolerance &&
          rect.top <
            window.innerHeight +
              tolerance;

        return (
          rect.width >
            0 &&
          rect.height >
            0 &&
          intersectsViewport
        );
      }

      function hasText(
        element: HTMLElement,
      ) {
        return (
          element.textContent ??
          ""
        )
          .replace(
            /\s+/g,
            " ",
          )
          .trim()
          .length >
          0;
      }

      function rectToObject(
        rect:
          DOMRect |
          {
            left: number;
            right: number;
            top: number;
            bottom: number;
            width: number;
            height: number;
          },
      ): TextRect {
        return {
          left:
            rect.left,

          right:
            rect.right,

          top:
            rect.top,

          bottom:
            rect.bottom,

          width:
            rect.width,

          height:
            rect.height,
        };
      }

      function getTextRect(
        element: HTMLElement,
      ):
        | TextRect
        | null {
        /*
         * Measure only text that is
         * actually painted.
         *
         * A Range over the whole element
         * would include opacity: 0 reveal
         * children and create false
         * clipping reports.
         */
        const walker =
          document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
          );

        const rects:
          DOMRect[] = [];

        let node =
          walker.nextNode();

        while (
          node
        ) {
          const value =
            node.textContent ??
            "";

          if (
            value
              .replace(
                /\s+/g,
                " ",
              )
              .trim()
              .length >
            0
          ) {
            const parent =
              node.parentElement;

            if (
              parent &&
              isTreeVisible(
                parent,
              )
            ) {
              const range =
                document.createRange();

              range.selectNodeContents(
                node,
              );

              rects.push(
                ...Array.from(
                  range.getClientRects(),
                ).filter(
                  (
                    rect,
                  ) =>
                    rect.width >
                      0 &&
                    rect.height >
                      0,
                ),
              );
            }
          }

          node =
            walker.nextNode();
        }

        if (
          rects.length ===
          0
        ) {
          return null;
        }

        const left =
          Math.min(
            ...rects.map(
              (
                rect,
              ) =>
                rect.left,
            ),
          );

        const right =
          Math.max(
            ...rects.map(
              (
                rect,
              ) =>
                rect.right,
            ),
          );

        const top =
          Math.min(
            ...rects.map(
              (
                rect,
              ) =>
                rect.top,
            ),
          );

        const bottom =
          Math.max(
            ...rects.map(
              (
                rect,
              ) =>
                rect.bottom,
            ),
          );

        return {
          left,
          right,
          top,
          bottom,

          width:
            right -
            left,

          height:
            bottom -
            top,
        };
      }

      function isClippingOverflow(
        value: string,
      ) {
        return [
          "hidden",
          "clip",
          "scroll",
          "auto",
        ].includes(
          value,
        );
      }

      /*
       * =========================
       * INTENTIONAL X SCROLL
       * =========================
       *
       * Work category filters and other
       * horizontal tracks are allowed to
       * contain items that currently sit
       * outside the viewport.
       *
       * A container qualifies only when:
       *
       * - overflow-x is auto / scroll
       * - scrollWidth is genuinely larger
       *   than clientWidth
       *
       * overflow:hidden / clip still count
       * as real clipping.
       */
      function isIntentionalHorizontalScroller(
        element: HTMLElement,
      ) {
        const style =
          window.getComputedStyle(
            element,
          );

        const scrollableOverflow =
          style.overflowX ===
            "auto" ||
          style.overflowX ===
            "scroll";

        return (
          scrollableOverflow &&
          element.scrollWidth >
            element.clientWidth +
              1
        );
      }

      function getHorizontalScrollAncestor(
        element: HTMLElement,
      ):
        | HTMLElement
        | null {
        let ancestor:
          HTMLElement |
          null =
          element.parentElement;

        while (
          ancestor &&
          ancestor !==
            document.body &&
          ancestor !==
            document.documentElement
        ) {
          if (
            isIntentionalHorizontalScroller(
              ancestor,
            )
          ) {
            return ancestor;
          }

          ancestor =
            ancestor.parentElement;
        }

        return null;
      }

      function getSelector(
        element: HTMLElement,
      ) {
        if (
          element.id
        ) {
          return `#${element.id}`;
        }

        const usefulData =
          Array.from(
            element.attributes,
          ).find(
            (
              attr,
            ) =>
              attr.name.startsWith(
                "data-motion",
              ) ||
              attr.name.startsWith(
                "data-contact",
              ) ||
              attr.name.startsWith(
                "data-work",
              ),
          );

        if (
          usefulData
        ) {
          return `${
            element.tagName.toLowerCase()
          }[${usefulData.name}="${usefulData.value}"]`;
        }

        const classes =
          Array.from(
            element.classList,
          )
            .slice(
              0,
              2,
            )
            .join(
              ".",
            );

        return classes
          ? `${
              element.tagName.toLowerCase()
            }.${classes}`
          : element.tagName.toLowerCase();
      }

      function addIssue(
        issues:
          ClippedTextIssue[],
        element:
          HTMLElement,
        textRect:
          TextRect,
        reason:
          string,
      ) {
        const elementRect =
          element.getBoundingClientRect();

        const style =
          window.getComputedStyle(
            element,
          );

        issues.push({
          text:
            (
              element.textContent ??
                ""
            )
              .replace(
                /\s+/g,
                " ",
              )
              .trim()
              .slice(
                0,
                160,
              ),

          tag:
            element.tagName,

          selector:
            getSelector(
              element,
            ),

          reason,

          elementRect:
            rectToObject(
              elementRect,
            ),

          textRect,

          overflowX:
            style.overflowX,

          overflowY:
            style.overflowY,

          clipPath:
            style.clipPath,
        });
      }

      const issues:
        ClippedTextIssue[] =
        [];

      const candidates =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            selectors,
          ),
        );

      for (
        const element
        of candidates
      ) {
        if (
          ignoredTags.has(
            element.tagName,
          ) ||
          element.getAttribute(
            "aria-hidden",
          ) ===
            "true" ||
          !isVisible(
            element,
          ) ||
          !hasText(
            element,
          )
        ) {
          continue;
        }

        const textRect =
          getTextRect(
            element,
          );

        if (
          !textRect
        ) {
          continue;
        }

        const elementRect =
          element.getBoundingClientRect();

        const style =
          window.getComputedStyle(
            element,
          );

        const horizontalScrollAncestor =
          getHorizontalScrollAncestor(
            element,
          );

        /*
         * =========================
         * VIEWPORT CLIPPING
         * =========================
         *
         * An item inside a genuine
         * horizontal scroller may sit
         * outside the current viewport.
         *
         * That is scrollable content,
         * not accidental clipping.
         */
        if (
          !horizontalScrollAncestor &&
          (
            textRect.left <
              -tolerance ||
            textRect.right >
              window.innerWidth +
                tolerance
          )
        ) {
          addIssue(
            issues,
            element,
            textRect,
            "text extends outside viewport",
          );

          continue;
        }

        /*
         * =========================
         * OWN OVERFLOW CLIPPING
         * =========================
         */

        const ownClipsX =
          isClippingOverflow(
            style.overflowX,
          );

        const ownClipsY =
          isClippingOverflow(
            style.overflowY,
          );

        if (
          ownClipsX &&
          (
            textRect.left <
              elementRect.left -
                tolerance ||
            textRect.right >
              elementRect.right +
                tolerance ||
            element.scrollWidth >
              element.clientWidth +
                1
          )
        ) {
          addIssue(
            issues,
            element,
            textRect,
            "text clipped by its own horizontal overflow",
          );

          continue;
        }

        if (
          ownClipsY &&
          (
            textRect.top <
              elementRect.top -
                tolerance ||
            textRect.bottom >
              elementRect.bottom +
                tolerance ||
            element.scrollHeight >
              element.clientHeight +
                1
          )
        ) {
          addIssue(
            issues,
            element,
            textRect,
            "text clipped by its own vertical overflow",
          );

          continue;
        }

        /*
         * =========================
         * ANCESTOR CLIPPING
         * =========================
         *
         * Inner ancestors before an
         * intentional horizontal scroller
         * are still fully audited.
         *
         * Once the intentional scroller is
         * reached, horizontal clipping from
         * that point outward is expected.
         *
         * Vertical clipping is NEVER
         * ignored.
         */

        let ancestor:
          HTMLElement |
          null =
          element.parentElement;

        let reachedHorizontalScroller =
          false;

        while (
          ancestor &&
          ancestor !==
            document.body &&
          ancestor !==
            document.documentElement
        ) {
          if (
            ancestor ===
            horizontalScrollAncestor
          ) {
            reachedHorizontalScroller =
              true;
          }

          const ancestorStyle =
            window.getComputedStyle(
              ancestor,
            );

          const ancestorRect =
            ancestor.getBoundingClientRect();

          const clipsX =
            isClippingOverflow(
              ancestorStyle
                .overflowX,
            );

          const clipsY =
            isClippingOverflow(
              ancestorStyle
                .overflowY,
            );

          if (
            clipsX &&
            !reachedHorizontalScroller &&
            (
              textRect.left <
                ancestorRect.left -
                  tolerance ||
              textRect.right >
                ancestorRect.right +
                  tolerance
            )
          ) {
            addIssue(
              issues,
              element,
              textRect,
              `horizontally clipped by ancestor ${getSelector(
                ancestor,
              )}`,
            );

            break;
          }

          if (
            clipsY &&
            (
              textRect.top <
                ancestorRect.top -
                  tolerance ||
              textRect.bottom >
                ancestorRect.bottom +
                  tolerance
            )
          ) {
            addIssue(
              issues,
              element,
              textRect,
              `vertically clipped by ancestor ${getSelector(
                ancestor,
              )}`,
            );

            break;
          }

          ancestor =
            ancestor.parentElement;
        }
      }

      /*
       * Deduplicate nested text reports.
       *
       * Keep the most useful first report
       * for each text + reason pair.
       */
      return issues.filter(
        (
          issue,
          index,
          all,
        ) =>
          all.findIndex(
            (
              candidate,
            ) =>
              candidate.text ===
                issue.text &&
              candidate.reason ===
                issue.reason,
          ) ===
          index,
      );
    },
  );
}

test.describe(
  "global text containment",
  () => {
    for (
      const motionMode
      of motionModes
    ) {
      for (
        const viewport
        of viewports
      ) {
        test(
          `${motionMode}:${viewport.name} has no clipped editorial text`,
          async ({
            page,
          }) => {
            test.setTimeout(
              180_000,
            );

            await page.setViewportSize({
              width:
                viewport.width,

              height:
                viewport.height,
            });

            for (
              const route
              of routes
            ) {
              await navigate(
                page,
                route,
                motionMode,
              );

              const issues =
                await settleWholePage(
                  page,
                  motionMode,
                );

              expect(
                issues,
                [
                  "",
                  `motion: ${motionMode}`,
                  `viewport: ${viewport.name}`,
                  `route: ${route}`,
                  "",
                  JSON.stringify(
                    issues,
                    null,
                    2,
                  ),
                ].join(
                  "\n",
                ),
              ).toEqual(
                [],
              );
            }
          },
        );
      }
    }
  },
);