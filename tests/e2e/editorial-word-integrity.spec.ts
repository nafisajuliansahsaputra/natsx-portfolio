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
  "localized editorial headlines preserve whole words",
  async ({
    page,
  }) => {
    await page.setViewportSize({
      width:
        360,

      height:
        800,
    });

    await page.emulateMedia({
      reducedMotion:
        "reduce",
    });

    const cases = [
      {
        route:
          "/id/about",

        selector:
          '[data-motion-scroll="about-story"] [data-motion-piece="title"]',
      },

      {
        route:
          "/de/about",

        selector:
          '[data-motion-scroll="about-story"] [data-motion-piece="title"]',
      },

      {
        route:
          "/id/playground",

        selector:
          '[data-motion-playground-hero-piece="title"]',
      },

      {
        route:
          "/de/playground",

        selector:
          '[data-motion-playground-hero-piece="title"]',
      },

      {
        route:
          "/id/contact",

        selector:
          '[data-motion-scroll="contact-social-header"] [data-motion-piece="title"]',
      },

      {
        route:
          "/de/contact",

        selector:
          '[data-motion-scroll="contact-social-header"] [data-motion-piece="title"]',
      },

      {
        route:
          "/id/work/bast-management-system",

        selector:
          '[data-motion-project-hero-piece="title"] h1',
      },

      {
        route:
          "/de/work/bast-management-system",

        selector:
          '[data-motion-project-hero-piece="title"] h1',
      },
    ] as const;

    for (
      const item
      of cases
    ) {
      const response =
        await page.goto(
          item.route,
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

      const target =
        page.locator(
          item.selector,
        );

      await expect(
        target,
      ).toBeVisible();

      const wrapping =
        await target.evaluate(
          (
            element,
          ) => {
            const style =
              window.getComputedStyle(
                element,
              );

            return {
              wordBreak:
                style.wordBreak,

              overflowWrap:
                style.overflowWrap,

              hyphens:
                style.hyphens,
            };
          },
        );

      expect(
        wrapping.wordBreak,
        `${item.route} must not break editorial words`,
      ).toBe(
        "normal",
      );

      expect(
        wrapping.overflowWrap,
        `${item.route} must not use emergency editorial wrapping`,
      ).toBe(
        "normal",
      );

      expect(
        wrapping.hyphens,
        `${item.route} must not auto-hyphenate editorial headlines`,
      ).toBe(
        "none",
      );
    }
  },
);