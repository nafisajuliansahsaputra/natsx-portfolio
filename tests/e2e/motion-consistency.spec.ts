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

const homepageRoutes = [
  "/",
  "/id",
  "/de",
] as const;

test.describe(
  "localized homepage motion",
  () => {
    for (
      const route
      of homepageRoutes
    ) {
      test(
        `${route} receives generated homepage motion hooks`,
        async ({
          page,
        }) => {
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

          await expect(
            page.locator(
              "#main-content",
            ),
          ).toBeVisible();

          await expect
            .poll(
              async () =>
                page
                  .locator(
                    '[data-motion-generated="true"]',
                  )
                  .count(),
            )
            .toBeGreaterThan(
              0,
            );
        },
      );
    }
  },
);

const innerRoutes = [
  "/work",
  "/id/work",
  "/de/work",
] as const;

test.describe(
  "inner page motion",
  () => {
    for (
      const route
      of innerRoutes
    ) {
      test(
        `${route} does not receive homepage-generated hooks`,
        async ({
          page,
        }) => {
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

          await expect(
            page.locator(
              "#main-content",
            ),
          ).toBeVisible();

          await expect(
            page.locator(
              '[data-motion-generated="true"]',
            ),
          ).toHaveCount(
            0,
          );
        },
      );
    }
  },
);