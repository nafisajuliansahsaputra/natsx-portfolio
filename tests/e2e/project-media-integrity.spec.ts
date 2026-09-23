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
     * Project gallery sekarang punya
     * dua composition mode:
     *
     * GRID
     * - legacy editorial pattern
     * - index 0, 3, 6, ... adalah wide
     * - wide screenshot memakai contain
     *
     * BENTO
     * - ukuran item ditentukan data-size
     * - nth-child bukan lagi source of truth
     * - smart packer menentukan placement
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

    const bentoCss =
      readFileSync(
        join(
          process.cwd(),
          "src",
          "app",
          "work",
          "[slug]",
          "ProjectGalleryBento.module.css",
        ),
        "utf8",
      );

    /*
     * Grid mode masih harus mempertahankan
     * anti-crop contract untuk legacy wide
     * slots.
     */
    expect(
      projectFitCss,
      "grid wide gallery slot must keep a 16:9 media frame",
    ).toMatch(
      /figure:nth-child\(\s*3n\s*\+\s*1\s*\)[\s\S]*?>\s*div\s*\{[\s\S]*?aspect-ratio\s*:\s*16\s*\/\s*9\s*!important\s*;/,
    );

    expect(
      projectFitCss,
      "grid wide gallery image must use contain instead of cover",
    ).toMatch(
      /figure:nth-child\(\s*3n\s*\+\s*1\s*\)[\s\S]*?img\s*\{[\s\S]*?object-fit\s*:\s*contain\s*!important\s*;/,
    );

    expect(
      projectFitCss,
      "grid wide gallery image must stay centered",
    ).toMatch(
      /figure:nth-child\(\s*3n\s*\+\s*1\s*\)[\s\S]*?img\s*\{[\s\S]*?object-position\s*:\s*center center\s*!important\s*;/,
    );

    /*
     * Normal gallery media tetap punya
     * baseline cover treatment.
     */
    expect(
      projectMediaCss,
      "gallery media should retain its baseline cover treatment",
    ).toMatch(
      /\.galleryMedia\s*\{[\s\S]*?object-fit\s*:\s*cover\s*!important\s*;/,
    );

    /*
     * Bento harus secara eksplisit
     * me-reset legacy nth-child sizing.
     *
     * Ini penting supaya smart bento
     * tidak dianggap mengikuti pola
     * grid 01 / 04 / 07 lagi.
     */
    expect(
      bentoCss,
      "bento gallery must reset legacy nth-child layout",
    ).toMatch(
      /\.galleryGrid\[data-layout="bento"\][\s\S]*?\.galleryItem:nth-child\([\s\S]*?3n\s*\+\s*1[\s\S]*?\)[\s\S]*?\{[\s\S]*?grid-column\s*:\s*auto\s*!important\s*;/,
    );

    expect(
      bentoCss,
      "bento gallery must size items from data-size",
    ).toMatch(
      /\.galleryItem\[data-size="wide"\][\s\S]*?grid-column\s*:\s*span\s*2\s*!important\s*;/,
    );

    /*
     * =========================
     * RUNTIME STRUCTURE
     * =========================
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
     * Gallery grid lives inside the
     * project-gallery section.
     *
     * data-layout adalah source of truth
     * runtime untuk menentukan contract
     * mana yang harus diuji.
     */
    const galleryGrid =
      gallery.locator(
        "[data-layout]",
      );

    await expect(
      galleryGrid,
    ).toHaveCount(
      1,
    );

    const layout =
      await galleryGrid.getAttribute(
        "data-layout",
      );

    expect(
      layout,
    ).not.toBeNull();

    const items =
      galleryGrid.locator(
        "figure",
      );

    const itemCount =
      await items.count();

    expect(
      itemCount,
      "BAST gallery must contain media items",
    ).toBeGreaterThan(
      0,
    );

    /*
     * =========================
     * GRID CONTRACT
     * =========================
     */

    if (
      layout ===
      "grid"
    ) {
      const wideItems =
        galleryGrid.locator(
          "figure:nth-child(3n + 1)",
        );

      const portraitItems =
        galleryGrid.locator(
          "figure:not(:nth-child(3n + 1))",
        );

      const expectedWideCount =
        Math.ceil(
          itemCount /
            3,
        );

      const expectedPortraitCount =
        itemCount -
        expectedWideCount;

      await expect(
        wideItems,
      ).toHaveCount(
        expectedWideCount,
      );

      await expect(
        portraitItems,
      ).toHaveCount(
        expectedPortraitCount,
      );

      for (
        let index =
          0;
        index <
        expectedWideCount;
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

      if (
        expectedPortraitCount >
        0
      ) {
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
      }

      return;
    }

    /*
     * =========================
     * BENTO CONTRACT
     * =========================
     *
     * Bento tidak menggunakan index
     * sebagai ukuran visual.
     *
     * data-size adalah source of truth:
     *
     * small / tall
     * -> half-width delivery
     *
     * wide / large
     * -> full-width delivery on mobile
     */

    expect(
      layout,
      "gallery layout must be grid or bento",
    ).toBe(
      "bento",
    );

    for (
      let index =
        0;
      index <
      itemCount;
      index +=
        1
    ) {
      const item =
        items.nth(
          index,
        );

      const size =
        await item.getAttribute(
          "data-size",
        );

      expect(
        [
          "small",
          "wide",
          "tall",
          "large",
        ],
        `gallery item ${index + 1} has invalid data-size`,
      ).toContain(
        size,
      );

      const image =
        item.locator(
          "img",
        );

      await expect(
        image,
      ).toBeAttached();

      await expect(
        image,
      ).toHaveAttribute(
        "src",
        /.+/,
      );

      const responsiveSizes =
        await image.getAttribute(
          "sizes",
        );

      /*
       * Large gallery PNGs are intentionally served as their original
       * Supabase objects when Next's optimizer is bypassed. In that mode
       * next/image does not emit responsive `sizes` / `srcset`, so the
       * old assertion produced a false failure even though the media is
       * rendered correctly and remains uncropped.
       */
      if (
        responsiveSizes ===
        null
      ) {
        await expect(
          image,
        ).toHaveAttribute(
          "src",
          /\/storage\/v1\/object\/public\/portfolio-media\//,
        );

        await expect(
          image,
        ).not.toHaveAttribute(
          "srcset",
          /.+/,
        );

        continue;
      }

      if (
        size ===
          "small" ||
        size ===
          "tall"
      ) {
        expect(
          responsiveSizes,
        ).toBe(
          "(max-width: 700px) 50vw, (max-width: 960px) 34vw, 25vw",
        );

        continue;
      }

      /*
       * wide / large bento tiles
       * menjadi full-width candidates
       * pada mobile, tapi tetap punya
       * responsive tablet/desktop sizes.
       */
      expect(
        responsiveSizes,
      ).toBe(
        "(max-width: 700px) 100vw, (max-width: 960px) 67vw, 50vw",
      );
    }

    /*
     * Pastikan BAST benar-benar punya
     * setidaknya satu wide/large bento
     * tile sehingga branch full-width
     * di atas memang diuji.
     */
    const fullWidthBentoItems =
      galleryGrid.locator(
        'figure[data-size="wide"], figure[data-size="large"]',
      );

    await expect
      .poll(
        async () =>
          fullWidthBentoItems.count(),
      )
      .toBeGreaterThan(
        0,
      );
  },
);