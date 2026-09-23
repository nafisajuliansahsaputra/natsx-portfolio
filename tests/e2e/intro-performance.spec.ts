import {
  expect,
  test,
} from "@playwright/test";

test(
  "first-entry intro does not compete with heavy homepage preloads",
  async ({
    page,
  }) => {
    const heavyRequests:
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
            "/models/",
          ) ||
          url.includes(
            "/api/image-manifest",
          )
        ) {
          heavyRequests.push(
            url,
          );
        }
      },
    );

    const response =
      await page.goto(
        "/?intro=1",
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
        "html",
      ),
    ).toHaveAttribute(
      "data-intro",
      "running",
    );

    /*
     * Stay well inside the 2820ms running
     * phase. Heavy homepage resources must
     * remain asleep while the intro owns
     * the screen.
     */
    await page.waitForTimeout(
      900,
    );

    expect(
      heavyRequests,
    ).toEqual(
      [],
    );
  },
);
