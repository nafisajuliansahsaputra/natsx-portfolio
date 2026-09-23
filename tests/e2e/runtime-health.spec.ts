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

const publicRoutes = [
  "/",
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
] as const;

type RuntimeIssue = {
  type:
    | "pageerror"
    | "console";
  message: string;
};

function watchRuntimeIssues(
  page: Page,
) {
  const issues:
    RuntimeIssue[] = [];

  page.on(
    "pageerror",
    (
      error,
    ) => {
      issues.push({
        type:
          "pageerror",

        message:
          error.message,
      });
    },
  );

  page.on(
    "console",
    (
      message,
    ) => {
      if (
        message.type() !==
        "error"
      ) {
        return;
      }

      issues.push({
        type:
          "console",

        message:
          message.text(),
      });
    },
  );

  return issues;
}

async function assertRuntimeHealthy(
  page: Page,
  route: string,
) {
  const issues =
    watchRuntimeIssues(
      page,
    );

  /*
   * The app intentionally warms project images in the background after
   * hydration. Waiting for "networkidle" therefore no longer describes
   * runtime health: the page can be fully interactive while low-priority
   * cache warming is still active.
   *
   * Use DOM readiness, then explicitly assert the hydrated app shell and
   * give client effects a short window to surface real runtime errors.
   */
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

  await expect(
    page.locator(
      "#main-content",
    ),
  ).toBeVisible();

  /*
   * Give effects, hydration,
   * IntersectionObserver callbacks,
   * image loading, and other
   * client work a short chance
   * to surface runtime failures.
   */
  await page.waitForTimeout(
    250,
  );

  expect(
    issues,
    `${route} emitted browser runtime errors:\n${issues
      .map(
        (
          issue,
        ) =>
          `[${issue.type}] ${issue.message}`,
      )
      .join(
        "\n",
      )}`,
  ).toEqual(
    [],
  );
}

test.describe(
  "public runtime health",
  () => {
    for (
      const route
      of publicRoutes
    ) {
      test(
        `${route} hydrates without browser errors`,
        async ({
          page,
        }) => {
          await assertRuntimeHealthy(
            page,
            route,
          );
        },
      );
    }
  },
);

test(
  "project detail hydrates without browser errors",
  async ({
    page,
  }) => {
    await page.goto(
      "/work",
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

    await assertRuntimeHealthy(
      page,
      href!,
    );
  },
);

test(
  "localized project details hydrate without browser errors",
  async ({
    page,
  }) => {
    for (
      const locale
      of [
        "id",
        "de",
      ] as const
    ) {
      await page.goto(
        `/${locale}/work`,
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

      await assertRuntimeHealthy(
        page,
        href!,
      );
    }
  },
);