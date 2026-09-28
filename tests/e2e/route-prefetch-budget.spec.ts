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

function collectProjectDetailRscRequests(
  page:
    Page,
) {
  const requests:
    string[] =
    [];

  page.on(
    "request",
    (
      request,
    ) => {
      const url =
        new URL(
          request.url(),
        );

      if (
        !url.searchParams.has(
          "_rsc",
        )
      ) {
        return;
      }

      if (
        /^\/(?:id\/|de\/)?work\/[^/]+\/?$/.test(
          url.pathname,
        )
      ) {
        requests.push(
          url.toString(),
        );
      }
    },
  );

  return requests;
}

test(
  "work archive does not fan out automatic project route prefetches",
  async ({
    page,
  }) => {
    const requests =
      collectProjectDetailRscRequests(
        page,
      );

    const response =
      await page.goto(
        "/work",
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

    await page.waitForTimeout(
      2500,
    );

    expect(
      requests,
      `Unexpected automatic project RSC prefetches:\n${requests.join(
        "\n",
      )}`,
    ).toEqual(
      [],
    );
  },
);

test(
  "homepage selected work does not prefetch project detail routes while idle",
  async ({
    page,
  }) => {
    const requests =
      collectProjectDetailRscRequests(
        page,
      );

    const response =
      await page.goto(
        "/",
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

    const selectedWork =
      page.locator(
        "#work",
      );

    await selectedWork.scrollIntoViewIfNeeded();

    await expect(
      selectedWork,
    ).toBeVisible();

    await page.waitForTimeout(
      2500,
    );

    expect(
      requests,
      `Unexpected automatic selected-work RSC prefetches:\n${requests.join(
        "\n",
      )}`,
    ).toEqual(
      [],
    );
  },
);
