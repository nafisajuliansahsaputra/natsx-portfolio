import {
  createHash,
} from "node:crypto";

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
  "invalid CV language query falls back to the website locale",
  async ({
    page,
  }) => {
    const cases = [
      {
        path:
          "/cv?lang=invalid",

        expected:
          "English",
      },

      {
        path:
          "/id/cv?lang=invalid",

        expected:
          "Bahasa Indonesia",
      },

      {
        path:
          "/de/cv?lang=invalid",

        expected:
          "Deutsch",
      },
    ] as const;

    for (
      const item
      of cases
    ) {
      const response =
        await page.goto(
          item.path,
        );

      expect(
        response,
      ).not.toBeNull();

      expect(
        response?.status(),
      ).toBeLessThan(
        400,
      );

      const languageList =
        page.locator(
          '[data-motion-scroll="cv-language-list"]',
        );

      await expect(
        languageList,
      ).toBeVisible();

      /*
       * Scope hanya ke CV language
       * selector.
       *
       * Header website juga memiliki
       * aria-pressed controls untuk
       * language switching, jadi
       * selector global akan memberi
       * false positive.
       */
      const activeVersion =
        languageList.locator(
          'button[aria-pressed="true"]',
        );

      await expect(
        activeVersion,
      ).toHaveCount(
        1,
      );

      await expect(
        activeVersion,
      ).toContainText(
        item.expected,
      );

      /*
       * Pastikan dua versi lainnya
       * benar-benar tidak aktif.
       */
      await expect(
        languageList.locator(
          'button[aria-pressed="false"]',
        ),
      ).toHaveCount(
        2,
      );
    }
  },
);

test(
  "published CV language PDFs are available and distinct",
  async ({
    request,
  }) => {
    const files = [
      "/cv/nafisa-juliansah-saputra-cv-id.pdf",
      "/cv/nafisa-juliansah-saputra-cv-en.pdf",
      "/cv/nafisa-juliansah-saputra-cv-de.pdf",
    ] as const;

    const hashes:
      string[] =
      [];

    for (
      const file
      of files
    ) {
      const response =
        await request.get(
          file,
        );

      expect(
        response.status(),
      ).toBe(
        200,
      );

      expect(
        response.headers()[
          "content-type"
        ],
      ).toContain(
        "application/pdf",
      );

      const body =
        await response.body();

      expect(
        body.length,
      ).toBeGreaterThan(
        1000,
      );

      hashes.push(
        createHash(
          "sha256",
        )
          .update(
            body,
          )
          .digest(
            "hex",
          ),
      );
    }

    /*
     * ID, EN, dan DE harus benar-benar
     * file berbeda.
     *
     * Ini mencegah regression lama:
     * CV Deutsch ternyata copy exact
     * dari PDF Indonesia.
     */
    expect(
      new Set(
        hashes,
      ).size,
    ).toBe(
      files.length,
    );
  },
);