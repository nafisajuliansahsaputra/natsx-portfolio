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

async function openPublicPage(
  page: Page,
  path: string,
) {
  const response =
    await page.goto(
      path,
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
}

test.describe(
  "creative integrity",
  () => {
    test(
      "capabilities keeps its desktop sticky choreography",
      async ({
        page,
      }) => {
        await page.setViewportSize({
          width:
            1440,

          height:
            900,
        });

        await openPublicPage(
          page,
          "/",
        );

        const section =
          page.locator(
            "#capabilities",
          );

        await expect(
          section,
        ).toBeVisible();

        const heading =
          section
            .locator(
              "h2",
            )
            .first();

        const intro =
          heading.locator(
            "..",
          );

        await intro.scrollIntoViewIfNeeded();

        const stickyState =
          await intro.evaluate(
            (
              element,
            ) => {
              const style =
                window.getComputedStyle(
                  element,
                );

              return {
                position:
                  style.position,

                top:
                  Number.parseFloat(
                    style.top,
                  ),
              };
            },
          );

        expect(
          stickyState.position,
        ).toBe(
          "sticky",
        );

        expect(
          Number.isFinite(
            stickyState.top,
          ),
        ).toBe(
          true,
        );

        const documentTop =
          await intro.evaluate(
            (
              element,
            ) =>
              element.getBoundingClientRect()
                .top +
              window.scrollY,
          );

        await page.evaluate(
          (
            scrollTop,
          ) => {
            window.scrollTo({
              top:
                scrollTop,

              behavior:
                "instant",
            });
          },
          documentTop +
            120,
        );

        await page.waitForTimeout(
          100,
        );

        const pinnedTop =
          await intro.evaluate(
            (
              element,
            ) =>
              element.getBoundingClientRect()
                .top,
          );

        expect(
          Math.abs(
            pinnedTop -
              stickyState.top,
          ),
        ).toBeLessThanOrEqual(
          3,
        );
      },
    );

    test(
      "homepage live lab reacts to pointer movement",
      async ({
        page,
      }) => {
        await page.setViewportSize({
          width:
            1440,

          height:
            900,
        });

        await openPublicPage(
          page,
          "/",
        );

        const labLabel =
          page.getByText(
            "NATSX / LIVE LAB",
            {
              exact:
                true,
            },
          );

        await expect(
          labLabel,
        ).toBeVisible();

        const lab =
          labLabel.locator(
            "xpath=../..",
          );

        await lab.scrollIntoViewIfNeeded();

        const box =
          await lab.boundingBox();

        expect(
          box,
        ).not.toBeNull();

        if (!box) {
          return;
        }

        await page.mouse.move(
          box.x +
            box.width *
              0.78,

          box.y +
            box.height *
              0.28,
        );

        await expect
          .poll(
            async () =>
              lab.evaluate(
                (
                  element,
                ) =>
                  (
                    element as HTMLElement
                  ).style.getPropertyValue(
                    "--lab-x",
                  ),
              ),
          )
          .not.toBe(
            "",
          );

        const pointerState =
          await lab.evaluate(
            (
              element,
            ) => {
              const style =
                (
                  element as HTMLElement
                ).style;

              return {
                x:
                  style.getPropertyValue(
                    "--lab-x",
                  ),

                y:
                  style.getPropertyValue(
                    "--lab-y",
                  ),

                cursorX:
                  style.getPropertyValue(
                    "--cursor-x",
                  ),

                cursorY:
                  style.getPropertyValue(
                    "--cursor-y",
                  ),
              };
            },
          );

        expect(
          pointerState.x,
        ).not.toBe(
          "0px",
        );

        expect(
          pointerState.cursorX,
        ).not.toBe(
          "",
        );

        expect(
          pointerState.cursorY,
        ).not.toBe(
          "",
        );
      },
    );

    test(
      "work archive keeps floating visual previews",
      async ({
        page,
      }) => {
        await page.setViewportSize({
          width:
            1440,

          height:
            900,
        });

        await openPublicPage(
          page,
          "/work",
        );

        const visualProjects =
          page.locator(
            '[data-has-preview="true"]',
          );

        await expect
          .poll(
            async () =>
              visualProjects.count(),
          )
          .toBeGreaterThan(
            0,
          );

        const project =
          visualProjects.first();

        await project.scrollIntoViewIfNeeded();

        const previewImage =
          project
            .locator(
              "img",
            )
            .first();

        await expect(
          previewImage,
        ).toBeAttached();

        const previewStage =
          previewImage.locator(
            "xpath=../..",
          );

        const initialOpacity =
          await previewStage.evaluate(
            (
              element,
            ) =>
              Number.parseFloat(
                window.getComputedStyle(
                  element,
                ).opacity,
              ),
          );

        expect(
          initialOpacity,
        ).toBeLessThanOrEqual(
          0.05,
        );

        await project.hover();

        await expect
          .poll(
            async () =>
              previewStage.evaluate(
                (
                  element,
                ) =>
                  Number.parseFloat(
                    window.getComputedStyle(
                      element,
                    ).opacity,
                  ),
              ),
          )
          .toBeGreaterThanOrEqual(
            0.95,
          );
      },
    );

    test(
      "playground magnetic field remains physically reactive",
      async ({
        page,
      }) => {
        await page.setViewportSize({
          width:
            1440,

          height:
            900,
        });

        await openPublicPage(
          page,
          "/playground",
        );

        const dots =
          page.locator(
            "[data-magnetic-dot]",
          );

        await expect(
          dots,
        ).toHaveCount(
          54,
        );

        const firstDot =
          dots.nth(
            0,
          );

        const secondDot =
          dots.nth(
            1,
          );

        await firstDot.scrollIntoViewIfNeeded();

        const box =
          await firstDot.boundingBox();

        expect(
          box,
        ).not.toBeNull();

        if (!box) {
          return;
        }

        const initialTransform =
          await secondDot.evaluate(
            (
              element,
            ) =>
              (
                element as HTMLElement
              ).style.transform,
          );

        expect(
          initialTransform,
        ).toBe(
          "",
        );

        await page.mouse.move(
          box.x +
            box.width /
              2,

          box.y +
            box.height /
              2,
        );

        await expect
          .poll(
            async () =>
              secondDot.evaluate(
                (
                  element,
                ) =>
                  (
                    element as HTMLElement
                  ).style.transform,
              ),
          )
          .not.toBe(
            "",
          );

        const transformed =
          await secondDot.evaluate(
            (
              element,
            ) =>
              (
                element as HTMLElement
              ).style.transform,
          );

        expect(
          transformed,
        ).toContain(
          "translate3d",
        );
      },
    );
  },
);