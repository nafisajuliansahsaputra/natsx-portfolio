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
  "homepage hero image delivery",
  () => {
    for (
      const route
      of homepageRoutes
    ) {
      test(
        `${route} serves an optimized responsive hero portrait`,
        async ({
          page,
        }) => {
          await page.goto(
            route,
          );

          const portrait =
            page.locator(
              "[data-motion-portrait] img",
            );

          await expect(
            portrait,
          ).toBeVisible();

          await expect(
            portrait,
          ).toHaveAttribute(
            "sizes",
            "(max-width: 960px) 100vw, 42vw",
          );

          const srcSet =
            await portrait.getAttribute(
              "srcset",
            );

          expect(
            srcSet,
          ).toBeTruthy();

          expect(
            srcSet,
          ).toContain(
            "/_next/image",
          );

          const imageState =
            await portrait.evaluate(
              (
                image,
              ) => {
                const element =
                  image as HTMLImageElement;

                return {
                  complete:
                    element.complete,

                  naturalWidth:
                    element.naturalWidth,

                  naturalHeight:
                    element.naturalHeight,

                  currentSrc:
                    element.currentSrc,
                };
              },
            );

          expect(
            imageState.complete,
          ).toBeTruthy();

          expect(
            imageState.naturalWidth,
          ).toBeGreaterThan(
            0,
          );

          expect(
            imageState.naturalHeight,
          ).toBeGreaterThan(
            0,
          );

          expect(
            imageState.currentSrc,
          ).toContain(
            "/_next/image",
          );

          expect(
            imageState.currentSrc,
          ).toContain(
            "natsx-portrait-hero.png",
          );
        },
      );
    }
  },
);

test(
  "homepage preloads the optimized hero image",
  async ({
    page,
  }) => {
    await page.goto(
      "/",
    );

    const heroPreloaded =
      await page.evaluate(
        () => {
          const preloadLinks =
            Array.from(
              document.querySelectorAll<HTMLLinkElement>(
                'link[rel="preload"][as="image"]',
              ),
            );

          return preloadLinks.some(
            (
              link,
            ) => {
              const source =
                [
                  link.href,
                  link.getAttribute(
                    "imagesrcset",
                  ) ??
                    "",
                ].join(
                  " ",
                );

              return (
                source.includes(
                  "/_next/image",
                ) &&
                source.includes(
                  "natsx-portrait-hero.png",
                )
              );
            },
          );
        },
      );

    expect(
      heroPreloaded,
    ).toBeTruthy();
  },
);

test(
  "optimized hero response is an image and is cacheable",
  async ({
    page,
  }) => {
    await page.goto(
      "/",
    );

    const portrait =
      page.locator(
        "[data-motion-portrait] img",
      );

    await expect(
      portrait,
    ).toBeVisible();

    const currentSrc =
      await portrait.evaluate(
        (
          image,
        ) =>
          (
            image as HTMLImageElement
          ).currentSrc,
      );

    expect(
      currentSrc,
    ).toContain(
      "/_next/image",
    );

    const response =
      await page.request.get(
        currentSrc,
        {
          headers: {
            Accept:
              "image/avif,image/webp,image/*,*/*;q=0.8",
          },
        },
      );

    expect(
      response.ok(),
    ).toBeTruthy();

    expect(
      response.headers()[
        "content-type"
      ],
    ).toMatch(
      /^image\//,
    );

    expect(
      response.headers()[
        "cache-control"
      ] ??
        "",
    ).not.toContain(
      "no-store",
    );
  },
);