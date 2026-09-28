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

const homepageRoutes = [
  "/",
  "/id",
  "/de",
] as const;

const baseHeroImageName =
  "natsx-portrait-hero-bases.png";

const alternateHeroImageName =
  "natsx-portrait-hero-altes.png";

/*
 * =========================================================
 * HERO IMAGE LOCATORS
 * =========================================================
 *
 * Hero mempunyai dua image layer:
 *
 * 1. base portrait
 *    - accessible
 *    - alt berisi deskripsi
 *    - preload
 *
 * 2. alternate portrait
 *    - decorative transition layer
 *    - alt=""
 *
 * Jangan gunakan:
 *
 * [data-motion-portrait] img
 *
 * karena selector tersebut sengaja
 * menemukan kedua layer.
 */
function getBasePortrait(
  page: Page,
) {
  return page.locator(
    '[data-motion-portrait] img:not([alt=""])',
  );
}

function getAlternatePortrait(
  page: Page,
) {
  return page.locator(
    '[data-motion-portrait] img[alt=""]',
  );
}

/*
 * =========================================================
 * RESPONSIVE HERO DELIVERY
 * =========================================================
 */
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
            getBasePortrait(
              page,
            );

          await expect(
            portrait,
          ).toHaveCount(
            1,
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

          expect(
            srcSet,
          ).toContain(
            baseHeroImageName,
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
            baseHeroImageName,
          );

          /*
           * Pastikan layer alternate
           * memang tetap ada dan
           * menggunakan asset yang benar.
           */
          const alternatePortrait =
            getAlternatePortrait(
              page,
            );

          await expect(
            alternatePortrait,
          ).toHaveCount(
            1,
          );

          const alternateSrc =
            await alternatePortrait.getAttribute(
              "src",
            );

          expect(
            alternateSrc,
          ).toContain(
            "/_next/image",
          );

          expect(
            alternateSrc,
          ).toContain(
            alternateHeroImageName,
          );
        },
      );
    }
  },
);

/*
 * =========================================================
 * HERO PRELOAD
 * =========================================================
 */
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
        (
          expectedImageName,
        ) => {
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
                  expectedImageName,
                )
              );
            },
          );
        },
        baseHeroImageName,
      );

    expect(
      heroPreloaded,
    ).toBeTruthy();
  },
);

/*
 * =========================================================
 * OPTIMIZED RESPONSE
 * =========================================================
 */
test(
  "optimized hero response is an image and is cacheable",
  async ({
    page,
  }) => {
    await page.goto(
      "/",
    );

    const portrait =
      getBasePortrait(
        page,
      );

    await expect(
      portrait,
    ).toHaveCount(
      1,
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

    expect(
      currentSrc,
    ).toContain(
      baseHeroImageName,
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

/*
 * =========================================================
 * 5AM VISION IMAGE DELIVERY
 * =========================================================
 */
test(
  "5AM Vision artwork uses optimized Next.js image delivery",
  async ({
    page,
  }) => {
    await page.goto(
      "/",
    );

    const selectors = [
      '[data-vision-part="top-logo"] img',
      '[data-vision-part="character"] img',
    ] as const;

    for (
      const selector of
      selectors
    ) {
      const image =
        page
          .locator(
            selector,
          )
          .first();

      await expect(
        image,
      ).toHaveCount(
        1,
      );

      const src =
        await image.getAttribute(
          "src",
        );

      const srcSet =
        await image.getAttribute(
          "srcset",
        );

      expect(
        src,
      ).toContain(
        "/_next/image",
      );

      expect(
        srcSet,
      ).toBeTruthy();

      expect(
        srcSet,
      ).toContain(
        "/_next/image",
      );
    }
  },
);


/*
 * =========================================================
 * NO DIRECT STORAGE EGRESS
 * =========================================================
 *
 * Public browsing must not fetch portfolio-media objects straight from
 * Supabase. Browser-visible delivery should stay same-origin through
 * Next Image, static mirrors, or content-addressed runtime assets.
 */
for (
  const route of
  [
    "/",
    "/work",
  ] as const
) {
  test(
    `${route} does not directly request Supabase portfolio Storage`,
    async ({
      page,
    }) => {
      const directStorageRequests:
        string[] =
        [];

      page.on(
        "request",
        (
          request,
        ) => {
          const url =
            request.url();

          if (
            url.includes(
              ".supabase.co/storage/v1/object/public/portfolio-media/",
            )
          ) {
            directStorageRequests.push(
              url,
            );
          }
        },
      );

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

      /*
       * Give idle warmers / near-viewport scene gates time to run. A former
       * regression downloaded project media in the background after paint.
       */
      await page.waitForTimeout(
        2500,
      );

      expect(
        directStorageRequests,
        `Direct Supabase Storage requests detected on ${route}:\n${directStorageRequests.join(
          "\n",
        )}`,
      ).toEqual(
        [],
      );
    },
  );
}


test(
  "project social preview metadata uses the same-origin image cache",
  async ({
    page,
  }) => {
    const response =
      await page.goto(
        "/work/bast-management-system",
      );

    expect(
      response,
    ).not.toBeNull();

    expect(
      response?.status(),
    ).toBeLessThan(
      400,
    );

    const openGraphImage =
      page.locator(
        'meta[property="og:image"]',
      );

    await expect(
      openGraphImage,
    ).toHaveCount(
      1,
    );

    const openGraphUrl =
      await openGraphImage.getAttribute(
        "content",
      );

    expect(
      openGraphUrl,
    ).toContain(
      "/_next/image?",
    );

    expect(
      openGraphUrl,
    ).not.toContain(
      ".supabase.co/storage/v1/object/public/portfolio-media/",
    );

    const twitterImage =
      page.locator(
        'meta[name="twitter:image"]',
      );

    await expect(
      twitterImage,
    ).toHaveCount(
      1,
    );

    const twitterUrl =
      await twitterImage.getAttribute(
        "content",
      );

    expect(
      twitterUrl,
    ).toContain(
      "/_next/image?",
    );

    expect(
      twitterUrl,
    ).not.toContain(
      ".supabase.co/storage/v1/object/public/portfolio-media/",
    );
  },
);
