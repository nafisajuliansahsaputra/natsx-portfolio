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

const viewports = [
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

const localizedViewports =
  viewports.filter(
    (
      viewport,
    ) =>
      viewport.name ===
        "mobile" ||
      viewport.name ===
        "tablet",
  );

async function navigateForLayout(
  page: Page,
  route: string,
) {
  /*
   * Layout tests do not need the full
   * window "load" lifecycle.
   *
   * Waiting for load also waits on
   * image/resource delivery and can
   * unnecessarily block loop-heavy
   * responsive tests.
   *
   * DOMContentLoaded is enough because
   * every assertion below waits for the
   * actual rendered page element and
   * fonts before measuring layout.
   */
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

async function assertNoHorizontalOverflow(
  page: Page,
  route: string,
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

  const initialMetrics =
    await page.evaluate(
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

  expect(
    initialMetrics.documentWidth,
    `${route} document overflows horizontally`,
  ).toBeLessThanOrEqual(
    initialMetrics.viewport +
      1,
  );

  expect(
    initialMetrics.bodyWidth,
    `${route} body overflows horizontally`,
  ).toBeLessThanOrEqual(
    initialMetrics.viewport +
      1,
  );

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
    100,
  );

  const scrolledMetrics =
    await page.evaluate(
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

  expect(
    scrolledMetrics.documentWidth,
    `${route} document overflows after scroll motion`,
  ).toBeLessThanOrEqual(
    scrolledMetrics.viewport +
      1,
  );

  expect(
    scrolledMetrics.bodyWidth,
    `${route} body overflows after scroll motion`,
  ).toBeLessThanOrEqual(
    scrolledMetrics.viewport +
      1,
  );
}

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
          /*
           * Six routes are intentionally
           * checked inside one test.
           *
           * 60s prevents unrelated local
           * server scheduling from turning
           * a valid layout suite into a
           * 30s false timeout.
           */
          test.setTimeout(
            60_000,
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
              route,
            );
          }
        },
      );
    }
  },
);

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
          /*
           * This test intentionally visits
           * twelve localized routes.
           */
          test.setTimeout(
            90_000,
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

test(
  "project detail stays responsive across viewport sizes",
  async ({
    page,
  }) => {
    test.setTimeout(
      60_000,
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

test(
  "mobile navigation remains contained and restores page scrolling",
  async ({
    page,
  }) => {
    test.setTimeout(
      60_000,
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

      const menuButton =
        page.locator(
          'button[aria-controls="mobile-navigation"]',
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

      await assertNoHorizontalOverflow(
        page,
        `${route}:mobile-menu`,
      );

      await page.keyboard.press(
        "Escape",
      );

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