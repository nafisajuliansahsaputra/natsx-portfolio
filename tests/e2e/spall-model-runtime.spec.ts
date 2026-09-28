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

test(
  "Spall GLB loads embedded textures without browser errors",
  async ({
    page,
  }) => {
    const gltfErrors:
      string[] = [];

    const glbRequests:
      string[] = [];

    page.on(
      "request",
      (
        request,
      ) => {
        const url =
          request.url();

        if (
          /\.glb(?:\?|$)/i.test(
            url,
          )
        ) {
          glbRequests.push(
            url,
          );
        }
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

        const text =
          message.text();

        if (
          text.includes(
            "THREE.GLTFLoader",
          ) ||
          text.includes(
            "[SpallEditorialScene]",
          )
        ) {
          gltfErrors.push(
            text,
          );
        }
      },
    );

    await page.goto(
      "/",
    );

    const artwork =
      page.locator(
        '[data-spall-featured="true"]',
      );

    await artwork.scrollIntoViewIfNeeded();

    await expect(
      artwork,
    ).toBeVisible();

    const canvas =
      artwork.locator(
        "canvas",
      );

    await expect(
      canvas,
    ).toBeVisible({
      timeout:
        15000,
    });

    await page.waitForTimeout(
      1000,
    );

    expect(
      gltfErrors,
      `Spall emitted GLTF runtime errors:\n${gltfErrors.join(
        "\n",
      )}`,
    ).toEqual(
      [],
    );


    await expect
      .poll(
        () =>
          glbRequests.length,
      )
      .toBeGreaterThan(
        0,
      );

    for (
      const requestUrl of
      glbRequests
    ) {
      const pathname =
        new URL(
          requestUrl,
        ).pathname;

      expect(
        pathname,
        `GLB must use content-addressed runtime delivery: ${pathname}`,
      ).toMatch(
        /^\/runtime-models\/.+\.[a-f0-9]{12}\.glb$/i,
      );

      expect(
        pathname,
      ).not.toMatch(
        /^\/models\//,
      );
    }
  },
);
