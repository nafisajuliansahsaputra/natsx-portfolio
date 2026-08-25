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
    await page.setViewportSize({
      width:
        1440,

      height:
        900,
    });

    await page.goto(
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

      const response =
        await page.goto(
          href!,
        );

      expect(
        response,
      ).not.toBeNull();

      expect(
        response?.status(),
      ).toBeLessThan(
        400,
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
      await page.goto(
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