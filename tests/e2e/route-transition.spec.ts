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
      "covers an internal page navigation and settles after route change",
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
          "data-route-transition-label",
          "About",
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
          "idle",
          {
            timeout:
              3000,
          },
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
