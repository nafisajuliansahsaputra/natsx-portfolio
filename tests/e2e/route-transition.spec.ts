import {
  expect,
  test,
} from "@playwright/test";

async function markIntroSeen(
  page: import("@playwright/test").Page,
) {
  await page.addInitScript(
    () => {
      window.sessionStorage.setItem(
        "natsx:portfolio-intro:v5",
        "1",
      );
    },
  );
}

test.describe(
  "editorial route transition",
  () => {
    test(
      "covers navigation, holds destination motion into reveal, then releases it",
      async ({
        page,
      }) => {
        await markIntroSeen(
          page,
        );

        await page.goto(
          "/",
        );

        const transition =
          page.locator(
            "[data-route-transition-layer]",
          );

        const root =
          page.locator(
            "html",
          );

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-phase",
          "idle",
        );

        await page
          .locator(
            'a[href="/about"]',
          )
          .first()
          .click();

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-phase",
          "covering",
        );

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-direction",
          "forward",
        );

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-label",
          "About",
        );

        await expect(
          root,
        ).toHaveAttribute(
          "data-route-transition-hold",
          "true",
        );

        await expect(
          page,
        ).toHaveURL(
          /\/about$/,
        );

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-phase",
          "revealing",
          {
            timeout:
              2500,
          },
        );

        /*
         * V3 intentionally keeps the
         * destination hero paused for a
         * short beat after the shutters
         * start opening.
         */
        await expect(
          root,
        ).toHaveAttribute(
          "data-route-transition-hold",
          "true",
        );

        await expect(
          root,
        ).not.toHaveAttribute(
          "data-route-transition-hold",
          "true",
          {
            timeout:
              1000,
          },
        );

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-phase",
          "idle",
          {
            timeout:
              3500,
          },
        );
      },
    );

    test(
      "reverses shutter order when navigating backward through the editorial sequence",
      async ({
        page,
      }) => {
        await markIntroSeen(
          page,
        );

        await page.goto(
          "/about",
        );

        const transition =
          page.locator(
            "[data-route-transition-layer]",
          );

        await page
          .locator(
            'a[href="/work"]',
          )
          .first()
          .click();

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-direction",
          "backward",
        );

        await expect(
          page,
        ).toHaveURL(
          /\/work$/,
        );
      },
    );

    test(
      "does not turn same-page hash navigation into a page transition",
      async ({
        page,
      }) => {
        await markIntroSeen(
          page,
        );

        await page.goto(
          "/",
        );

        const transition =
          page.locator(
            "[data-route-transition-layer]",
          );

        await page
          .locator(
            'a[href="#work"]',
          )
          .first()
          .click();

        await expect(
          page,
        ).toHaveURL(
          /#work$/,
        );

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-phase",
          "idle",
        );
      },
    );

    test(
      "respects reduced motion by leaving navigation immediate",
      async ({
        page,
      }) => {
        await page.emulateMedia({
          reducedMotion:
            "reduce",
        });

        await markIntroSeen(
          page,
        );

        await page.goto(
          "/",
        );

        const transition =
          page.locator(
            "[data-route-transition-layer]",
          );

        await page
          .locator(
            'a[href="/about"]',
          )
          .first()
          .click();

        await expect(
          page,
        ).toHaveURL(
          /\/about$/,
        );

        await expect(
          transition,
        ).toHaveAttribute(
          "data-route-transition-phase",
          "idle",
        );
      },
    );
  },
);
