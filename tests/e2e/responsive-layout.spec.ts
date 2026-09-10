import {
  expect,
  test,
  type Locator,
  type Page,
} from "@playwright/test";

/*
 * =========================================================
 * INTRO BYPASS
 * =========================================================
 */

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

/*
 * =========================================================
 * VIEWPORT MATRIX
 * =========================================================
 */

const viewports = [
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
      "mobile-425",

    width:
      425,

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

const mobileViewports =
  viewports.filter(
    (
      viewport,
    ) =>
      viewport.width <=
      425,
  );

const localizedViewports =
  viewports.filter(
    (
      viewport,
    ) =>
      viewport.width <=
      768,
  );

const publicRoutes = [
  "/",
  "/work",
  "/about",
  "/playground",
  "/contact",
  "/cv",
] as const;

const localizedRoutes = [
  "/id",
  "/de",

  "/id/work",
  "/de/work",

  "/id/about",
  "/de/about",

  "/id/playground",
  "/de/playground",

  "/id/contact",
  "/de/contact",

  "/id/cv",
  "/de/cv",
] as const;

/*
 * =========================================================
 * NAVIGATION
 * =========================================================
 */

async function navigateForLayout(
  page: Page,
  route: string,
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
    response,
  ).not.toBeNull();

  expect(
    response?.status(),
  ).toBeLessThan(
    400,
  );

  return response;
}

/*
 * =========================================================
 * LAYOUT READY
 * =========================================================
 */

async function waitForLayoutReady(
  page: Page,
) {
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
}

/*
 * =========================================================
 * OVERFLOW METRICS
 * =========================================================
 */

async function getOverflowMetrics(
  page: Page,
) {
  return page.evaluate(
    () => ({
      viewport:
        window.innerWidth,

      documentWidth:
        document.documentElement
          .scrollWidth,

      bodyWidth:
        document.body
          .scrollWidth,
    }),
  );
}

async function assertNoHorizontalOverflow(
  page: Page,
  label: string,
) {
  await waitForLayoutReady(
    page,
  );

  const initialMetrics =
    await getOverflowMetrics(
      page,
    );

  expect(
    initialMetrics.documentWidth,
    `${label} document overflows horizontally`,
  ).toBeLessThanOrEqual(
    initialMetrics.viewport +
      1,
  );

  expect(
    initialMetrics.bodyWidth,
    `${label} body overflows horizontally`,
  ).toBeLessThanOrEqual(
    initialMetrics.viewport +
      1,
  );

  /*
   * Scroll once so scroll-driven motion
   * also gets exercised.
   */
  await page.evaluate(
    () => {
      window.scrollTo(
        0,
        document.documentElement
          .scrollHeight,
      );
    },
  );

  await page.waitForTimeout(
    120,
  );

  const scrolledMetrics =
    await getOverflowMetrics(
      page,
    );

  expect(
    scrolledMetrics.documentWidth,
    `${label} document overflows after scroll motion`,
  ).toBeLessThanOrEqual(
    scrolledMetrics.viewport +
      1,
  );

  expect(
    scrolledMetrics.bodyWidth,
    `${label} body overflows after scroll motion`,
  ).toBeLessThanOrEqual(
    scrolledMetrics.viewport +
      1,
  );
}

/*
 * =========================================================
 * LAYOUT METRICS
 * =========================================================
 */

type LayoutMetrics = {
  width: number;
  height: number;
};

async function getLayoutMetrics(
  locator: Locator,
): Promise<LayoutMetrics> {
  return locator.evaluate(
    (
      node,
    ) => {
      const element =
        node as HTMLElement;

      return {
        width:
          element.offsetWidth,

        height:
          element.offsetHeight,
      };
    },
  );
}

function expectClose(
  actual: number,
  expected: number,
  message: string,
  tolerance = 2,
) {
  expect(
    Math.abs(
      actual -
        expected,
    ),
    message,
  ).toBeLessThanOrEqual(
    tolerance,
  );
}

/*
 * =========================================================
 * SELECTED WORK MOBILE COMPOSITION
 * =========================================================
 */

async function assertSelectedWorkMobileGeometry(
  page: Page,
  viewportName: string,
) {
  await waitForLayoutReady(
    page,
  );

  const workSection =
    page.locator(
      "#work",
    );

  await expect(
    workSection,
  ).toBeAttached();

  /*
   * Keep immersive controller active
   * during regression testing.
   */
  await workSection.scrollIntoViewIfNeeded();

  await page.waitForTimeout(
    160,
  );

  const projects =
    page.locator(
      '#work [data-motion-scroll="project"]',
    );

  const projectCount =
    await projects.count();

  expect(
    projectCount,
    `${viewportName} should render featured projects`,
  ).toBeGreaterThan(
    0,
  );

  const viewport =
    page.viewportSize();

  expect(
    viewport,
    `${viewportName} should have a viewport`,
  ).not.toBeNull();

  const viewportWidth =
    viewport!.width;

  const visualWidths:
    number[] = [];

  for (
    let index = 0;
    index <
      projectCount;
    index += 1
  ) {
    const project =
      projects.nth(
        index,
      );

    /*
     * Current structure:
     *
     * article
     * ├── div header
     * ├── div visual
     * └── div footer
     */
    const directDivs =
      project.locator(
        ":scope > div",
      );

    await expect(
      directDivs,
      `${viewportName} project ${index + 1} should have layout children`,
    ).toHaveCount(
      3,
    );

    const header =
      directDivs.nth(
        0,
      );

    const visual =
      directDivs.nth(
        1,
      );

    const footer =
      directDivs.nth(
        2,
      );

    /*
     * offsetWidth/offsetHeight read layout
     * geometry before immersive transforms.
     */
    const [
      headerMetrics,
      visualMetrics,
      footerMetrics,
    ] =
      await Promise.all([
        getLayoutMetrics(
          header,
        ),

        getLayoutMetrics(
          visual,
        ),

        getLayoutMetrics(
          footer,
        ),
      ]);

    expect(
      visualMetrics.width,
      `${viewportName} project ${index + 1} visual width should be measurable`,
    ).toBeGreaterThan(
      0,
    );

    expect(
      visualMetrics.height,
      `${viewportName} project ${index + 1} visual height should be measurable`,
    ).toBeGreaterThan(
      0,
    );

    /*
     * Mobile Selected Work:
     *
     * aspect-ratio ≈ 11 / 10
     */
    const visualRatio =
      visualMetrics.width /
      visualMetrics.height;

    expect(
      visualRatio,
      `${viewportName} project ${index + 1} visual became portrait/tall`,
    ).toBeGreaterThanOrEqual(
      1.04,
    );

    expect(
      visualRatio,
      `${viewportName} project ${index + 1} visual became excessively wide`,
    ).toBeLessThanOrEqual(
      1.16,
    );

    expect(
      visualMetrics.width,
      `${viewportName} project ${index + 1} visual exceeds viewport`,
    ).toBeLessThanOrEqual(
      viewportWidth +
        1,
    );

    expect(
      visualMetrics.width,
      `${viewportName} project ${index + 1} visual became too narrow`,
    ).toBeGreaterThanOrEqual(
      viewportWidth *
        0.86,
    );

    expectClose(
      headerMetrics.width,
      visualMetrics.width,
      `${viewportName} project ${index + 1} header width does not align with visual`,
    );

    expectClose(
      footerMetrics.width,
      visualMetrics.width,
      `${viewportName} project ${index + 1} footer width does not align with visual`,
    );

    visualWidths.push(
      visualMetrics.width,
    );
  }

  const referenceWidth =
    visualWidths[0];

  for (
    let index = 1;
    index <
      visualWidths.length;
    index += 1
  ) {
    expectClose(
      visualWidths[index],
      referenceWidth,
      `${viewportName} project ${index + 1} uses a different visual width`,
    );
  }
}

/*
 * =========================================================
 * PUBLIC ROUTES
 * =========================================================
 */

test.describe(
  "responsive public layout",
  () => {
    for (
      const viewport
      of viewports
    ) {
      test(
        `${viewport.name} public routes have no horizontal overflow`,
        async ({
          page,
        }) => {
          test.setTimeout(
            80_000,
          );

          await page.setViewportSize({
            width:
              viewport.width,

            height:
              viewport.height,
          });

          for (
            const route
            of publicRoutes
          ) {
            await navigateForLayout(
              page,
              route,
            );

            await assertNoHorizontalOverflow(
              page,
              `${viewport.name}:${route}`,
            );
          }
        },
      );
    }
  },
);

/*
 * =========================================================
 * LOCALIZED ROUTES
 * =========================================================
 */

test.describe(
  "localized responsive layout",
  () => {
    for (
      const viewport
      of localizedViewports
    ) {
      test(
        `${viewport.name} localized public routes have no horizontal overflow`,
        async ({
          page,
        }) => {
          test.setTimeout(
            110_000,
          );

          await page.setViewportSize({
            width:
              viewport.width,

            height:
              viewport.height,
          });

          for (
            const route
            of localizedRoutes
          ) {
            await navigateForLayout(
              page,
              route,
            );

            await assertNoHorizontalOverflow(
              page,
              `${viewport.name}:${route}`,
            );
          }
        },
      );
    }
  },
);

/*
 * =========================================================
 * SELECTED WORK MOBILE REGRESSION
 * =========================================================
 */

test.describe(
  "selected work mobile composition",
  () => {
    for (
      const viewport
      of mobileViewports
    ) {
      test(
        `${viewport.name} keeps compact consistent project cards`,
        async ({
          page,
        }) => {
          test.setTimeout(
            45_000,
          );

          await page.setViewportSize({
            width:
              viewport.width,

            height:
              viewport.height,
          });

          await navigateForLayout(
            page,
            "/",
          );

          await assertSelectedWorkMobileGeometry(
            page,
            viewport.name,
          );

          await assertNoHorizontalOverflow(
            page,
            `${viewport.name}:/#work`,
          );
        },
      );
    }
  },
);

/*
 * =========================================================
 * PROJECT DETAIL
 * =========================================================
 */

test(
  "project detail stays responsive across viewport sizes",
  async ({
    page,
  }) => {
    test.setTimeout(
      80_000,
    );

    await page.setViewportSize({
      width:
        1440,

      height:
        900,
    });

    await navigateForLayout(
      page,
      "/work",
    );

    const projectLink =
      page
        .locator(
          'main a[href^="/work/"]',
        )
        .first();

    await expect(
      projectLink,
    ).toBeVisible();

    const href =
      await projectLink.getAttribute(
        "href",
      );

    expect(
      href,
    ).toMatch(
      /^\/work\/[^/]+$/,
    );

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

      await navigateForLayout(
        page,
        href!,
      );

      await assertNoHorizontalOverflow(
        page,
        `${viewport.name}:${href}`,
      );
    }
  },
);

/*
 * =========================================================
 * MOBILE NAVIGATION
 * =========================================================
 */

test(
  "mobile navigation remains contained and restores page scrolling",
  async ({
    page,
  }) => {
    test.setTimeout(
      80_000,
    );

    await page.setViewportSize({
      width:
        375,

      height:
        812,
    });

    const routes = [
      "/",
      "/id",
      "/de",
    ] as const;

    for (
      const route
      of routes
    ) {
      await navigateForLayout(
        page,
        route,
      );

      /*
       * SiteHeader now contains multiple
       * viewport-specific navigation
       * controls.
       *
       * Only the phone control is visible
       * at this viewport, so target that
       * actual interactive instance.
       */
      const menuButton =
        page.locator(
          'button[aria-controls="mobile-navigation"]:visible',
        );

      await expect(
        menuButton,
      ).toHaveCount(
        1,
      );

      await expect(
        menuButton,
      ).toBeVisible();

      await expect(
        menuButton,
      ).toHaveAttribute(
        "aria-expanded",
        "false",
      );

      await menuButton.click();

      await expect(
        menuButton,
      ).toHaveAttribute(
        "aria-expanded",
        "true",
      );

      const panel =
        page.locator(
          "#mobile-navigation",
        );

      await expect(
        panel,
      ).toBeVisible();

      await expect(
        panel,
      ).toHaveAttribute(
        "aria-modal",
        "true",
      );

      await expect
        .poll(
          async () =>
            page.evaluate(
              () =>
                document.body.style
                  .overflow,
            ),
        )
        .toBe(
          "hidden",
        );

      const metrics =
        await getOverflowMetrics(
          page,
        );

      expect(
        metrics.documentWidth,
        `${route} mobile menu document overflows`,
      ).toBeLessThanOrEqual(
        metrics.viewport +
          1,
      );

      expect(
        metrics.bodyWidth,
        `${route} mobile menu body overflows`,
      ).toBeLessThanOrEqual(
        metrics.viewport +
          1,
      );

      await page.keyboard.press(
        "Escape",
      );

      /*
       * closeMenu keeps the overlay mounted
       * during its shutter exit animation.
       *
       * Playwright retries this assertion
       * until aria-expanded returns false.
       */
      await expect(
        menuButton,
      ).toHaveAttribute(
        "aria-expanded",
        "false",
      );

      await expect
        .poll(
          async () =>
            page.evaluate(
              () =>
                document.body.style
                  .overflow,
            ),
        )
        .toBe(
          "",
        );
    }
  },
);