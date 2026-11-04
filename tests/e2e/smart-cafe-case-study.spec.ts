import { expect, test } from "@playwright/test";
import { getSiteUrl } from "../../src/lib/site-url";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("natsx:portfolio-intro:v5", "1");
  });
});

const cases = [
  {
    locale: "en",
    work: "/work",
    detail: "/work/smart-cafe-system",
    cta: "Explore case study",
    title: /Smart Cafe System/i,
    disclaimer: "Not production deployed",
  },
  {
    locale: "id",
    work: "/id/work",
    detail: "/id/work/smart-cafe-system",
    cta: "Lihat studi kasus",
    title: /Smart Cafe System/i,
    disclaimer: "Belum deployment produksi",
  },
  {
    locale: "de",
    work: "/de/work",
    detail: "/de/work/smart-cafe-system",
    cta: "Fallstudie ansehen",
    title: /Smart Cafe System/i,
    disclaimer: "Noch nicht produktiv eingesetzt",
  },
] as const;

for (const item of cases) {
  test(`Smart Cafe is linked from ${item.locale} Work, translated and source-backed`, async ({ page }) => {
    const archive = await page.goto(item.work);
    expect(archive?.status()).toBe(200);
    const entry = page.getByRole("link", { name: item.cta });
    await expect(entry).toBeVisible();
    await expect(entry).toHaveAttribute("href", item.detail);
    await entry.click();
    await expect(page).toHaveURL(new RegExp(`${item.detail.replace(/\//g, "\\/")}$`));
    await expect(page.getByRole("heading", { level: 1, name: item.title })).toBeVisible();
    await expect(page.getByText(item.disclaimer, { exact: false }).first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href", `${getSiteUrl()}${item.detail}`,
    );
    await expect(page.getByRole("link", { name: /case study|studi kasus|Fallstudie/i }).first())
      .toBeVisible();
    await expect(page.locator('a[href*="github.com/nafisajuliansahsaputra/smart-cafe-system"]'))
      .toHaveCount(2);
    const html = await page.locator("main").innerText();
    expect(html).toContain("PostgreSQL");
    expect(html).toContain("Spring Boot");
    // Never misstate that this page is a functioning merchant POS or real payment demo.
    expect(html).not.toMatch(/live payment enabled|production POS is ready/i);

    await page.setViewportSize({ width: 320, height: 740 });
    await expect.poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(1);
  });
}

test("Smart Cafe case study is indexed with three locale entries", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  for (const uri of ["/work/smart-cafe-system", "/id/work/smart-cafe-system", "/de/work/smart-cafe-system"])
    expect(xml).toContain(`${getSiteUrl()}${uri}`);
});
