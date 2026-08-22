import {
  expect,
  test,
} from "@playwright/test";

const protectedAdminRoutes = [
  "/admin",

  "/admin/projects/new",

  "/admin/projects/00000000-0000-0000-0000-000000000000",

  "/admin/projects/00000000-0000-0000-0000-000000000000/sections",
] as const;

test(
  "admin login response is never cacheable or indexable",
  async ({
    request,
  }) => {
    const response =
      await request.get(
        "/admin/login",
      );

    expect(
      response.status(),
    ).toBeLessThan(
      400,
    );

    const headers =
      response.headers();

    expect(
      headers[
        "cache-control"
      ],
    ).toContain(
      "no-store",
    );

    expect(
      headers[
        "cache-control"
      ],
    ).toContain(
      "max-age=0",
    );

    expect(
      headers[
        "pragma"
      ],
    ).toBe(
      "no-cache",
    );

    expect(
      headers[
        "expires"
      ],
    ).toBe(
      "0",
    );

    expect(
      headers[
        "x-robots-tag"
      ],
    ).toContain(
      "noindex",
    );

    expect(
      headers[
        "x-robots-tag"
      ],
    ).toContain(
      "nofollow",
    );

    expect(
      headers[
        "x-robots-tag"
      ],
    ).toContain(
      "noarchive",
    );
  },
);

test.describe(
  "protected admin routes",
  () => {
    for (
      const route
      of protectedAdminRoutes
    ) {
      test(
        `${route} redirects unauthenticated visitors to login`,
        async ({
          page,
        }) => {
          await page.goto(
            route,
          );

          await expect(
            page,
          ).toHaveURL(
            /\/admin\/login(?:\?.*)?$/,
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
        },
      );

      test(
        `${route} response is non-cacheable before redirect`,
        async ({
          request,
        }) => {
          const response =
            await request.get(
              route,
              {
                maxRedirects:
                  0,
              },
            );

          expect([
            301,
            302,
            303,
            307,
            308,
          ]).toContain(
            response.status(),
          );

          const headers =
            response.headers();

          expect(
            headers[
              "cache-control"
            ],
          ).toContain(
            "no-store",
          );

          expect(
            headers[
              "cache-control"
            ],
          ).toContain(
            "max-age=0",
          );

          expect(
            headers[
              "x-robots-tag"
            ],
          ).toContain(
            "noindex",
          );

          expect(
            headers[
              "x-robots-tag"
            ],
          ).toContain(
            "nofollow",
          );

          expect(
            headers[
              "x-robots-tag"
            ],
          ).toContain(
            "noarchive",
          );
        },
      );
    }
  },
);