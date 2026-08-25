import {
  readFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

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
  "wide project gallery media remains uncropped on mobile",
  async ({
    page,
  }) => {
    /*
     * =========================
     * SOURCE CONTRACT
     * =========================
     *
     * Visual regression awal:
     *
     * wide screenshot
     * +
     * mobile 4:5 frame
     * +
     * object-fit: cover
     *
     * =
     *
     * screenshot terpotong.
     *
     * Browser geometry dari media
     * offscreen/lazy-loaded ternyata
     * bukan signal yang deterministic
     * untuk test ini.
     *
     * Jadi kita jaga contract CSS
     * yang secara langsung menentukan
     * crop behavior.
     */

    const projectFitCss =
      readFileSync(
        join(
          process.cwd(),
          "src",
          "app",
          "project-fit.css",
        ),
        "utf8",
      );

    const projectMediaCss =
      readFileSync(
        join(
          process.cwd(),
          "src",
          "app",
          "work",
          "[slug]",
          "ProjectMedia.module.css",
        ),
        "utf8",
      );

    /*
     * Wide frame harus mempertahankan
     * landscape 16:9.
     */
    expect(
      projectFitCss,
      "wide gallery slot must keep a 16:9 media frame",
    ).toMatch(
      /figure:nth-child\(\s*3n\s*\+\s*1\s*\)[\s\S]*?>\s*div\s*\{[\s\S]*?aspect-ratio\s*:\s*16\s*\/\s*9\s*!important\s*;/,
    );

    /*
     * Wide image harus memakai contain.
     *
     * Ini adalah core anti-crop rule.
     */
    expect(
      projectFitCss,
      "wide gallery image must use contain instead of cover",
    ).toMatch(
      /figure:nth-child\(\s*3n\s*\+\s*1\s*\)[\s\S]*?img\s*\{[\s\S]*?object-fit\s*:\s*contain\s*!important\s*;/,
    );

    /*
     * Image juga harus tetap centered
     * saat ada letterboxing.
     */
    expect(
      projectFitCss,
      "wide gallery image must stay centered",
    ).toMatch(
      /figure:nth-child\(\s*3n\s*\+\s*1\s*\)[\s\S]*?img\s*\{[\s\S]*?object-position\s*:\s*center center\s*!important\s*;/,
    );

    /*
     * Existing portrait treatment
     * jangan ikut diratakan menjadi
     * contain.
     *
     * Normal gallery masih cover.
     */
    expect(
      projectMediaCss,
      "portrait gallery media should retain its existing cover treatment",
    ).toMatch(
      /\.galleryMedia\s*\{[\s\S]*?object-fit\s*:\s*cover\s*!important\s*;/,
    );

    /*
     * =========================
     * RUNTIME STRUCTURE
     * =========================
     *
     * CSS contract saja belum cukup.
     *
     * Kita pastikan actual BAST page
     * memang masih menghasilkan wide
     * dan portrait gallery slots.
     */

    await page.setViewportSize({
      width:
        430,

      height:
        932,
    });

    await page.emulateMedia({
      reducedMotion:
        "reduce",
    });

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

    const gallery =
      page.locator(
        '[data-motion-scroll="project-gallery"]',
      );

    await expect(
      gallery,
    ).toBeAttached();

    /*
     * BAST saat ini punya 6 gallery
     * images.
     *
     * Pattern:
     *
     * 01 wide
     * 02 portrait
     * 03 portrait
     * 04 wide
     * 05 portrait
     * 06 portrait
     */
    const wideItems =
      gallery.locator(
        "figure:nth-child(3n + 1)",
      );

    const portraitItems =
      gallery.locator(
        "figure:not(:nth-child(3n + 1))",
      );

    await expect(
      wideItems,
    ).toHaveCount(
      2,
    );

    await expect(
      portraitItems,
    ).toHaveCount(
      4,
    );

    /*
     * Wide renderer memang memberi
     * sizes="100vw".
     *
     * Jadi wide screenshot diperlakukan
     * sebagai full-width media slot.
     */
    for (
      let index =
        0;
      index <
      2;
      index +=
        1
    ) {
      const image =
        wideItems
          .nth(
            index,
          )
          .locator(
            "img",
          );

      await expect(
        image,
      ).toBeAttached();

      await expect(
        image,
      ).toHaveAttribute(
        "sizes",
        "100vw",
      );

      await expect(
        image,
      ).toHaveAttribute(
        "src",
        /.+/,
      );
    }

    /*
     * Portrait slot masih memakai
     * responsive two-column delivery
     * pada desktop.
     *
     * Ini membantu memastikan renderer
     * masih membedakan wide dan normal
     * item secara struktural.
     */
    const firstPortraitImage =
      portraitItems
        .first()
        .locator(
          "img",
        );

    await expect(
      firstPortraitImage,
    ).toBeAttached();

    await expect(
      firstPortraitImage,
    ).toHaveAttribute(
      "sizes",
      "(max-width: 700px) 100vw, 50vw",
    );
  },
);