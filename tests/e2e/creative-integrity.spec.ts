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

    test(
      "about portrait keeps its sticky scroll-reactive composition",
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
          "/about",
        );

        const root =
          page.locator(
            "[data-about-identity]",
          );

        const sticky =
          page.locator(
            "[data-about-identity-sticky]",
          );

        const column =
          page.locator(
            '[data-motion-scroll="about-portrait"]',
          );

        await expect(
          root,
        ).toBeVisible();

        await expect(
          sticky,
        ).toBeVisible();

        expect(
          await sticky.evaluate(
            (
              element,
            ) =>
              window.getComputedStyle(
                element,
              ).position,
          ),
        ).toBe(
          "sticky",
        );

        const metrics =
          await column.evaluate(
            (
              element,
            ) => {
              const rect =
                element.getBoundingClientRect();

              return {
                top:
                  rect.top +
                  window.scrollY,

                height:
                  rect.height,
              };
            },
          );

        await page.evaluate(
          (
            top,
          ) => {
            window.scrollTo({
              top:
                Math.max(
                  0,
                  top -
                    160,
                ),

              behavior:
                "instant",
            });
          },
          metrics.top,
        );

        await page.waitForTimeout(
          80,
        );

        const before =
          await root.evaluate(
            (
              element,
            ) =>
              Number.parseFloat(
                (
                  element as HTMLElement
                ).style.getPropertyValue(
                  "--circle-x",
                ),
              ) ||
              0,
          );

        await page.evaluate(
          ({
            top,
            height,
          }) => {
            window.scrollTo({
              top:
                top +
                Math.min(
                  height *
                    0.48,
                  760,
                ),

              behavior:
                "instant",
            });
          },
          metrics,
        );

        await expect
          .poll(
            async () => {
              const current =
                await root.evaluate(
                  (
                    element,
                  ) =>
                    Number.parseFloat(
                      (
                        element as HTMLElement
                      ).style.getPropertyValue(
                        "--circle-x",
                      ),
                    ) ||
                    0,
                );

              return Math.abs(
                current -
                  before,
              );
            },
          )
          .toBeGreaterThan(
            0.5,
          );
      },
    );

    test(
      "contact primary email remains magnetic",
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
          "/contact",
        );

        const surface =
          page.locator(
            "[data-contact-magnetic]",
          );

        await surface.scrollIntoViewIfNeeded();

        const box =
          await surface.boundingBox();

        expect(
          box,
        ).not.toBeNull();

        if (!box) {
          return;
        }

        await page.mouse.move(
          box.x +
            box.width *
              0.82,

          box.y +
            box.height *
              0.38,
        );

        await expect
          .poll(
            async () => {
              const value =
                await surface.evaluate(
                  (
                    element,
                  ) =>
                    Number.parseFloat(
                      (
                        element as HTMLElement
                      ).style.getPropertyValue(
                        "--contact-magnetic-x",
                      ),
                    ) ||
                    0,
                );

              return Math.abs(
                value,
              );
            },
          )
          .toBeGreaterThan(
            0.5,
          );
      },
    );

    test(
      "contact elsewhere links reveal with the section",
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
          "/contact",
        );

        const header =
          page.locator(
            '[data-motion-scroll="contact-social-header"]',
          );

        const items =
          page.locator(
            '[data-motion-scroll="contact-social-item"]',
          );

        await expect
          .poll(
            async () =>
              items.count(),
          )
          .toBeGreaterThan(
            0,
          );

        await header.scrollIntoViewIfNeeded();

        await expect(
          header,
        ).toHaveAttribute(
          "data-motion-visible",
          "true",
        );

        const firstItem =
          items.first();

        await expect
          .poll(
            async () =>
              firstItem.evaluate(
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
      "intro keyboard skip exits gracefully and releases keyboard control",
      async ({
        page,
      }) => {
        await page.setViewportSize({
          width:
            1440,

          height:
            900,
        });

        const keys = [
          "Enter",
          "Space",
          "Escape",
        ] as const;

        for (
          const [
            index,
            key,
          ]
          of keys.entries()
        ) {
          const response =
            await page.goto(
              `/?intro=1&keyboard-guard=${index}`,
            );

          expect(
            response,
          ).not.toBeNull();

          expect(
            response?.status(),
          ).toBeLessThan(
            400,
          );

          const intro =
            page.locator(
              "[data-portfolio-intro]",
            );

          await expect(
            intro,
          ).toHaveAttribute(
            "data-phase",
            "running",
          );

          await page.keyboard.press(
            key,
          );

          await expect(
            intro,
          ).toHaveAttribute(
            "data-phase",
            "exit",
          );

          await expect(
            page.locator(
              "html",
            ),
          ).toHaveAttribute(
            "data-intro",
            "exit",
          );

          await expect(
            intro,
          ).toHaveCount(
            0,
            {
              timeout:
                2000,
            },
          );

          const leakedKeyboardControl =
            await page.evaluate(
              () => {
                const event =
                  new KeyboardEvent(
                    "keydown",
                    {
                      key:
                        " ",

                      code:
                        "Space",

                      bubbles:
                        true,

                      cancelable:
                        true,
                    },
                  );

                window.dispatchEvent(
                  event,
                );

                return event.defaultPrevented;
              },
            );

          expect(
            leakedKeyboardControl,
          ).toBe(
            false,
          );
        }
      },
    );

    test(
      "intro pointer skip preserves its exit choreography",
      async ({
        page,
      }) => {
        await page.setViewportSize({
          width:
            1440,

          height:
            900,
        });

        const response =
          await page.goto(
            "/?intro=1&pointer-guard=1",
          );

        expect(
          response,
        ).not.toBeNull();

        const intro =
          page.locator(
            "[data-portfolio-intro]",
          );

        await expect(
          intro,
        ).toHaveAttribute(
          "data-phase",
          "running",
        );

        await page.mouse.click(
          48,
          48,
        );

        await expect(
          intro,
        ).toHaveAttribute(
          "data-phase",
          "exit",
        );

        await expect(
          page.locator(
            "html",
          ),
        ).toHaveAttribute(
          "data-intro",
          "exit",
        );
      },
    );
  },
);