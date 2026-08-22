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

    await page.emulateMedia({
      reducedMotion:
        "reduce",
    });
  },
);

const homepageRoutes = [
  "/",
  "/id",
  "/de",
] as const;

test.describe(
  "reduced motion homepage",
  () => {
    for (
      const route
      of homepageRoutes
    ) {
      test(
        `${route} exposes content without scroll animation gating`,
        async ({
          page,
        }) => {
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
                    "[data-motion-scroll]",
                  )
                  .count(),
            )
            .toBeGreaterThan(
              0,
            );

          const hiddenTargets =
            page.locator(
              '[data-motion-scroll]:not([data-motion-visible="true"])',
            );

          await expect(
            hiddenTargets,
          ).toHaveCount(
            0,
          );
        },
      );
    }
  },
);

test(
  "hero ambient motion stays disabled when reduced motion is requested",
  async ({
    page,
  }) => {
    await page.goto(
      "/",
    );

    const hero =
      page.locator(
        "[data-home-hero]",
      );

    await expect(
      hero,
    ).toBeVisible();

    await expect
      .poll(
        async () =>
          hero.getAttribute(
            "data-ambient-active",
          ),
      )
      .toBe(
        "false",
      );
  },
);

test(
  "hero parallax does not react to pointer movement with reduced motion",
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
      "/",
    );

    const visual =
      page.locator(
        '[data-motion-hero-piece="visual"]',
      );

    await expect(
      visual,
    ).toBeVisible();

    const box =
      await visual.boundingBox();

    expect(
      box,
    ).not.toBeNull();

    await page.mouse.move(
      box!.x +
        box!.width *
          0.9,
      box!.y +
        box!.height *
          0.1,
    );

    await page.waitForTimeout(
      150,
    );

    const parallax =
      await visual.evaluate(
        (
          element,
        ) => {
          const style =
            (
              element as HTMLElement
            ).style;

          return {
            portraitX:
              style.getPropertyValue(
                "--portrait-x",
              ),

            portraitY:
              style.getPropertyValue(
                "--portrait-y",
              ),

            circleX:
              style.getPropertyValue(
                "--circle-x",
              ),

            archX:
              style.getPropertyValue(
                "--arch-x",
              ),
          };
        },
      );

    expect(
      parallax.portraitX,
    ).not.toMatch(
      /[1-9]/,
    );

    expect(
      parallax.portraitY,
    ).not.toMatch(
      /[1-9]/,
    );

    expect(
      parallax.circleX,
    ).not.toMatch(
      /[1-9]/,
    );

    expect(
      parallax.archX,
    ).not.toMatch(
      /[1-9]/,
    );
  },
);

test(
  "inner pages remain readable with reduced motion",
  async ({
    page,
  }) => {
    const routes = [
      "/work",
      "/about",
      "/playground",
      "/contact",
    ] as const;

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

      await expect(
        page.locator(
          "#main-content",
        ),
      ).toBeVisible();

      const motionTargets =
        page.locator(
          "[data-motion-scroll]",
        );

      const count =
        await motionTargets.count();

      if (
        count >
        0
      ) {
        const hiddenTargets =
          page.locator(
            '[data-motion-scroll]:not([data-motion-visible="true"])',
          );

        await expect(
          hiddenTargets,
        ).toHaveCount(
          0,
        );
      }
    }
  },
);