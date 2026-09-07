import {
  expect,
  test,
  type Page,
} from "@playwright/test";

type TransitionSnapshot = {
  phase:
    string | null;

  hold:
    string | null;

  active:
    string | null;
};

async function markIntroSeen(
  page: Page,
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

async function installTransitionRecorder(
  page: Page,
) {
  await page.evaluate(
    () => {
      type RecorderWindow =
        Window &
        typeof globalThis & {
          __natsxRouteTransitionHistory?:
            Array<{
              phase:
                string | null;

              hold:
                string | null;

              active:
                string | null;
            }>;

          __natsxRouteTransitionObserver?:
            MutationObserver;
        };

      const recorderWindow =
        window as RecorderWindow;

      recorderWindow
        .__natsxRouteTransitionObserver
        ?.disconnect();

      recorderWindow
        .__natsxRouteTransitionHistory =
        [];

      const root =
        document.documentElement;

      const record =
        () => {
          recorderWindow
            .__natsxRouteTransitionHistory
            ?.push({
              phase:
                root.getAttribute(
                  "data-route-transition-phase",
                ),

              hold:
                root.getAttribute(
                  "data-route-transition-hold",
                ),

              active:
                root.getAttribute(
                  "data-route-transition-active",
                ),
            });
        };

      const observer =
        new MutationObserver(
          record,
        );

      observer.observe(
        root,
        {
          attributes:
            true,

          attributeFilter: [
            "data-route-transition-phase",
            "data-route-transition-hold",
            "data-route-transition-active",
          ],
        },
      );

      recorderWindow
        .__natsxRouteTransitionObserver =
        observer;

      record();
    },
  );
}

async function readTransitionHistory(
  page: Page,
): Promise<
  TransitionSnapshot[]
> {
  return page.evaluate(
    () => {
      type RecorderWindow =
        Window &
        typeof globalThis & {
          __natsxRouteTransitionHistory?:
            Array<{
              phase:
                string | null;

              hold:
                string | null;

              active:
                string | null;
            }>;
        };

      const recorderWindow =
        window as RecorderWindow;

      return (
        recorderWindow
          .__natsxRouteTransitionHistory ??
        []
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

        /*
         * Install before the click so we capture
         * the short reveal handoff even if it
         * lasts less than one Playwright assertion.
         */
        await installTransitionRecorder(
          page,
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
         * The handoff hold intentionally lasts
         * only a very short beat.
         *
         * Instead of trying to observe that
         * ephemeral attribute after another
         * Playwright command has already run,
         * verify from the mutation history that
         * revealing + hold=true really occurred.
         */
        await expect
          .poll(
            async () => {
              const history =
                await readTransitionHistory(
                  page,
                );

              return history.some(
                (
                  snapshot,
                ) =>
                  snapshot.phase ===
                    "revealing" &&
                  snapshot.hold ===
                    "true",
              );
            },
            {
              message:
                "destination motion should be held briefly during reveal",

              timeout:
                1000,
            },
          )
          .toBeTruthy();

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

        const history =
          await readTransitionHistory(
            page,
          );

        expect(
          history.some(
            (
              snapshot,
            ) =>
              snapshot.phase ===
                "covering" &&
              snapshot.hold ===
                "true",
          ),
          "covering phase should hold destination motion",
        ).toBeTruthy();

        expect(
          history.some(
            (
              snapshot,
            ) =>
              snapshot.phase ===
                "revealing" &&
              snapshot.hold ===
                "true",
          ),
          "revealing phase should briefly preserve the destination hold",
        ).toBeTruthy();

        /*
         * Final state must be fully released.
         */
        await expect(
          root,
        ).not.toHaveAttribute(
          "data-route-transition-active",
          "true",
        );

        await expect(
          root,
        ).not.toHaveAttribute(
          "data-route-transition-hold",
          "true",
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