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

const publicRoutes = [
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

test.describe(
  "public portfolio",
  () => {
    for (
      const {
        path,
        heading,
      } of publicRoutes
    ) {
      test(
        `${path} loads`,
        async ({
          page,
        }) => {
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

          await expect(
            page.getByRole(
              "heading",
              {
                name:
                  heading,
              },
            ).first(),
          ).toBeVisible();
        },
      );
    }
  },
);

test(
  "published project detail loads",
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

test(
  "unknown public route returns 404",
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

test(
  "robots and sitemap are available",
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

    expect(
      sitemapBody,
    ).toContain(
      "/work",
    );

    expect(
      sitemapBody,
    ).toContain(
      "/cv",
    );
  },
);