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

const englishRoutes = [
  {
    path:
      "/",

    heading:
      /Designing Ideas/i,
  },

  {
    path:
      "/work",

    heading:
      /^Work\s*\.?$/i,
  },

  {
    path:
      "/about",

    heading:
      /Different disciplines/i,
  },

  {
    path:
      "/playground",

    heading:
      /Where ideas/i,
  },

  {
    path:
      "/contact",

    heading:
      /Have an idea/i,
  },

  {
    path:
      "/cv",

    heading:
      /Curriculum Vitae/i,
  },
];

const localizedRoutes = [
  "/",
  "/work",
  "/about",
  "/playground",
  "/contact",
  "/cv",
] as const;

const localizedLocales = [
  {
    locale:
      "id",

    navigationLabel:
      "Karya",

    notFoundHeading:
      /Sepertinya ide ini/i,
  },

  {
    locale:
      "de",

    navigationLabel:
      "Arbeiten",

    notFoundHeading:
      /Sieht so aus/i,
  },
] as const;

test.describe(
  "english public portfolio",
  () => {
    for (
      const {
        path,
        heading,
      } of englishRoutes
    ) {
      test(
        `${path} loads`,
        async ({
          page,
        }) => {
const response = await page.goto(path, {
  waitUntil: "domcontentloaded",
});

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
            page
              .getByRole(
                "heading",
                {
                  name:
                    heading,
                },
              )
              .first(),
          ).toBeVisible();
        },
      );
    }
  },
);

test.describe(
  "localized public portfolio",
  () => {
    for (
      const {
        locale,
        navigationLabel,
      } of localizedLocales
    ) {
      for (
        const path
        of localizedRoutes
      ) {
        const localizedPath =
          path === "/"
            ? `/${locale}`
            : `/${locale}${path}`;

        test(
          `${localizedPath} loads with ${locale} locale`,
          async ({
            page,
          }) => {
            const response =
              await page.goto(
                localizedPath,
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

            const documentRoot =
              page.locator(
                `html[data-locale="${locale}"]`,
              );

            await expect(
              documentRoot,
            ).toHaveCount(
              1,
            );

            await expect(
              documentRoot,
            ).toHaveAttribute(
              "lang",
              locale,
            );

            await expect(
              page
                .getByRole(
                  "navigation",
                  {
                    name:
                      locale ===
                      "id"
                        ? "Navigasi utama"
                        : "Hauptnavigation",
                  },
                )
                .getByRole(
                  "link",
                  {
                    name:
                      navigationLabel,
                  },
                ),
            ).toBeVisible();

            await expect
              .poll(
                async () =>
                  page.locator(
                    "html",
                  ).getAttribute(
                    "lang",
                  ),
              )
              .toBe(
                locale,
              );
          },
        );
      }
    }
  },
);

test.describe(
  "published project details",
  () => {
    test(
      "english project detail loads",
      async ({
        page,
      }) => {
        const response =
          await page.goto(
            "/work",
          );

        expect(
          response,
        ).not.toBeNull();

        expect(
          response?.status(),
        ).toBeLessThan(
          400,
        );

        const projectLink =
          page
            .locator(
              'main a[href^="/work/"]',
            )
            .first();

        await expect(
          projectLink,
        ).toBeVisible();

        const href =
          await projectLink.getAttribute(
            "href",
          );

        expect(
          href,
        ).toMatch(
          /^\/work\/[^/]+$/,
        );

        const projectResponse =
          await page.goto(
            href!,
          );

        expect(
          projectResponse,
        ).not.toBeNull();

        expect(
          projectResponse?.status(),
        ).toBeLessThan(
          400,
        );

        await expect(
          page.locator(
            "#main-content",
          ),
        ).toBeVisible();

        await expect(
          page.getByRole(
            "heading",
            {
              level:
                1,
            },
          ),
        ).toBeVisible();
      },
    );

    for (
      const {
        locale,
      } of localizedLocales
    ) {
      test(
        `${locale} project detail loads`,
        async ({
          page,
        }) => {
          const archivePath =
            `/${locale}/work`;

          const archiveResponse =
            await page.goto(
              archivePath,
            );

          expect(
            archiveResponse,
          ).not.toBeNull();

          expect(
            archiveResponse?.status(),
          ).toBeLessThan(
            400,
          );

          const projectLink =
            page
              .locator(
                `main a[href^="/${locale}/work/"]`,
              )
              .first();

          await expect(
            projectLink,
          ).toBeVisible();

          const href =
            await projectLink.getAttribute(
              "href",
            );

          expect(
            href,
          ).toMatch(
            new RegExp(
              `^/${locale}/work/[^/]+$`,
            ),
          );

          const projectResponse =
            await page.goto(
              href!,
            );

          expect(
            projectResponse,
          ).not.toBeNull();

          expect(
            projectResponse?.status(),
          ).toBeLessThan(
            400,
          );

          await expect(
            page.locator(
              "#main-content",
            ),
          ).toBeVisible();

          const documentRoot =
            page.locator(
              `html[data-locale="${locale}"]`,
            );

          await expect(
            documentRoot,
          ).toHaveCount(
            1,
          );

          await expect(
            documentRoot,
          ).toHaveAttribute(
            "lang",
            locale,
          );

          await expect(
            page.getByRole(
              "heading",
              {
                level:
                  1,
              },
            ),
          ).toBeVisible();
        },
      );
    }
  },
);

test.describe(
  "localized error states",
  () => {
    test(
      "english unknown route returns localized 404",
      async ({
        page,
      }) => {
        const response =
          await page.goto(
            "/this-route-should-not-exist",
          );

        expect(
          response?.status(),
        ).toBe(
          404,
        );

        await expect(
          page.getByRole(
            "heading",
            {
              name:
                /Looks like this idea/i,
            },
          ),
        ).toBeVisible();
      },
    );

    for (
      const {
        locale,
        notFoundHeading,
      } of localizedLocales
    ) {
      test(
        `${locale} unknown route returns localized 404`,
        async ({
          page,
        }) => {
          const response =
            await page.goto(
              `/${locale}/this-route-should-not-exist`,
            );

          expect(
            response?.status(),
          ).toBe(
            404,
          );

          await expect(
            page.getByRole(
              "heading",
              {
                name:
                  notFoundHeading,
              },
            ),
          ).toBeVisible();

          const homeLink =
            page
              .locator(
                `main a[href="/${locale}"]`,
              )
              .first();

          await expect(
            homeLink,
          ).toBeVisible();

          const workLink =
            page
              .locator(
                `main a[href="/${locale}/work"]`,
              )
              .first();

          await expect(
            workLink,
          ).toBeVisible();
        },
      );
    }
  },
);

test(
  "language preference persists across default route visits",
  async ({
    page,
  }) => {
    await page.goto(
      "/",
    );

    const trigger =
      page.getByRole(
        "button",
        {
          name:
            "Change language",
        },
      );

    await trigger.click();

    const selector =
      page.getByRole(
        "group",
        {
          name:
            "Language selector",
        },
      );

    await selector
      .getByRole(
        "button",
        {
          name:
            "Indonesia",
        },
      )
      .click();

    await expect(
      page,
    ).toHaveURL(
      /\/id$/,
    );

    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              window.localStorage.getItem(
                "natsx:locale",
              ),
          ),
      )
      .toBe(
        "id",
      );

    await page.goto(
      "/",
    );

    await expect(
      page,
    ).toHaveURL(
      /\/id$/,
    );
  },
);

test(
  "language switch preserves query and hash",
  async ({
    page,
  }) => {
    await page.goto(
      "/work?source=e2e#archive",
    );

    const trigger =
      page.getByRole(
        "button",
        {
          name:
            "Change language",
        },
      );

    await trigger.click();

    const selector =
      page.getByRole(
        "group",
        {
          name:
            "Language selector",
        },
      );

    await selector
      .getByRole(
        "button",
        {
          name:
            "Deutsch",
        },
      )
      .click();

    await expect(
      page,
    ).toHaveURL(
      /\/de\/work\?source=e2e#archive$/,
    );
  },
);

test(
  "unauthenticated admin redirects to login",
  async ({
    page,
  }) => {
    await page.goto(
      "/admin",
    );

    await expect(
      page,
    ).toHaveURL(
      /\/admin\/login/,
    );

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            /Welcome back/i,
        },
      ),
    ).toBeVisible();

    await expect(
      page.getByRole(
        "button",
        {
          name:
            /Enter dashboard/i,
        },
      ),
    ).toBeVisible();
  },
);

test.describe(
  "legacy Spall catalog URLs",
  () => {
    for (
      const path
      of [
        "/media-sosial",
        "/aksesoris",
      ]
    ) {
      test(
        `${path} returns explicit 410 Gone`,
        async ({
          request,
        }) => {
          const response =
            await request.get(
              path,
            );

          expect(
            response.status(),
          ).toBe(
            410,
          );

          expect(
            response.headers()[
              "x-robots-tag"
            ],
          ).toBe(
            "noindex, nofollow",
          );

          const body =
            await response.text();

          expect(
            body,
          ).toContain(
            "410 Gone",
          );
        },
      );
    }
  },
);

test(
  "robots and multilingual sitemap are available",
  async ({
    request,
  }) => {
    const robots =
      await request.get(
        "/robots.txt",
      );

    expect(
      robots.ok(),
    ).toBeTruthy();

    expect(
      await robots.text(),
    ).toContain(
      "Sitemap:",
    );

    const sitemap =
      await request.get(
        "/sitemap.xml",
      );

    expect(
      sitemap.ok(),
    ).toBeTruthy();

    const sitemapBody =
      await sitemap.text();

    const expectedStaticPaths = [
      "/work",
      "/about",
      "/playground",
      "/contact",
      "/cv",
      "/id",
      "/id/work",
      "/id/about",
      "/id/playground",
      "/id/contact",
      "/id/cv",
      "/de",
      "/de/work",
      "/de/about",
      "/de/playground",
      "/de/contact",
      "/de/cv",
    ];

    for (
      const path
      of expectedStaticPaths
    ) {
      expect(
        sitemapBody,
      ).toContain(
        path,
      );
    }

    expect(
      sitemapBody,
    ).toContain(
      'hreflang="en"',
    );

    expect(
      sitemapBody,
    ).toContain(
      'hreflang="id"',
    );

    expect(
      sitemapBody,
    ).toContain(
      'hreflang="de"',
    );

    expect(
      sitemapBody,
    ).toContain(
      'hreflang="x-default"',
    );

    expect(
      sitemapBody,
    ).not.toContain(
      "/media-sosial",
    );

    expect(
      sitemapBody,
    ).not.toContain(
      "/aksesoris",
    );
  },
);