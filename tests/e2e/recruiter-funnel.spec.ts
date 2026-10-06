import {
  expect,
  test,
} from "@playwright/test";

test.describe(
  "recruiter verification funnel",
  () => {
    test(
      "project detail exposes tracked demo and source actions",
      async ({
        page,
      }) => {
        const response =
          await page.goto(
            "/work/bast-management-system?utm_source=cv",
          );

        expect(
          response?.status(),
        ).toBeLessThan(
          400,
        );

        await expect(
          page.locator(
            '[data-analytics-event="live_demo_click"]',
          ),
        ).toHaveCount(
          1,
        );

        await expect(
          page.locator(
            '[data-analytics-event="github_click"]',
          ),
        ).toHaveCount(
          1,
        );

        await expect(
          page.locator(
            '[data-analytics-event="github_click"]',
          ),
        ).toHaveAttribute(
          "href",
          /github\.com\/nafisajuliansahsaputra\/bast/,
        );
      },
    );

    test(
      "CV download is measurable",
      async ({
        page,
      }) => {
        const response =
          await page.goto(
            "/cv?lang=id",
          );

        expect(
          response?.status(),
        ).toBeLessThan(
          400,
        );

        await expect(
          page.locator(
            '[data-analytics-event="cv_download"]',
          ),
        ).toHaveCount(
          1,
        );
      },
    );

    test(
      "contact actions are measurable",
      async ({
        page,
      }) => {
        const response =
          await page.goto(
            "/contact",
          );

        expect(
          response?.status(),
        ).toBeLessThan(
          400,
        );

        expect(
          await page.locator(
            '[data-analytics-event="contact_click"]',
          ).count(),
        ).toBeGreaterThan(
          0,
        );
      },
    );
  },
);
