import { expect, test } from "@playwright/test";

const origin = "https://natsx.my.id";

test("homepage serves canonical, hreflang and NATSX identity schema", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle(/NATSX.*Nafisa Juliansah Saputra.*Full-Stack Developer/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", origin);

  for (const [lang, path] of [["en", "/"], ["id", "/id"], ["de", "/de"]]) {
    await expect(page.locator('link[rel="alternate"][hreflang="' + lang + '"]'))
      .toHaveAttribute("href", path === "/" ? origin : origin + path);
  }

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const graph = schemas.map((raw) => JSON.parse(raw)).find((item) => Array.isArray(item["@graph"]));
  expect(graph).toBeTruthy();

  const person = graph["@graph"].find((item: { "@type": string }) => item["@type"] === "Person");
  expect(person.name).toBe("Nafisa Juliansah Saputra");
  expect(person.alternateName).toBe("NATSX");
  expect(graph["@graph"].some((item: { "@type": string }) => item["@type"] === "WebSite")).toBe(true);
});

test("localized homepages expose their own canonical URLs", async ({ page }) => {
  for (const locale of ["id", "de"]) {
    const response = await page.goto("/" + locale, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", origin + "/" + locale);
    await expect(page).toHaveTitle(/NATSX.*Nafisa Juliansah Saputra/);
  }
});

test("published case study exposes CreativeWork schema", async ({ page }) => {
  await page.goto("/work", { waitUntil: "domcontentloaded" });
  const href = await page.locator('main a[href^="/work/"]').first().getAttribute("href");
  expect(href).toBeTruthy();

  await page.goto(href!, { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", origin + href);

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const works = schemas.map((raw) => JSON.parse(raw)).filter((item) => item["@type"] === "CreativeWork");
  expect(works).toHaveLength(1);
  expect(works[0].url).toBe(origin + href);
  expect(works[0].creator["@id"]).toBe(origin + "/#person");
});

test("unpublished playground is excluded from sitemap", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  expect(await response.text()).not.toContain("/playground");
});

test("personal identity is explicit on About and CV search metadata", async ({ page }) => {
  const aboutPages = [
    ["/about", "About Nafisa Juliansah Saputra"],
    ["/id/about", "Tentang Nafisa Juliansah Saputra"],
    ["/de/about", "Über Nafisa Juliansah Saputra"],
  ] as const;

  for (const [path, title] of aboutPages) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(title));

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const profile = scripts.map((text) => JSON.parse(text)).find((data) => data["@type"] === "ProfilePage");
    expect(profile?.mainEntity["@id"]).toBe(origin + "/#person");
    expect(profile?.url).toBe(origin + path);
  }

  for (const [path, title] of [
    ["/cv", "CV of Nafisa Juliansah Saputra"],
    ["/id/cv", "CV Nafisa Juliansah Saputra"],
    ["/de/cv", "Lebenslauf Nafisa Juliansah Saputra"],
  ]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(new RegExp(title));
  }
});

test("case studies describe their topics and expose breadcrumbs", async ({ page }) => {
  const cases = [
    ["/work/smart-attendance-system", /RFID & Face Verification/],
    ["/work/bast-management-system", /Laravel Document Management System/],
    ["/work/natsx-controller", /Android to Windows Gamepad/],
    ["/work/5am-vision", /Brand Identity & Art Direction/],
  ] as const;
  for (const [path, title] of cases) {
    expect((await page.goto(path, { waitUntil: "domcontentloaded" }))?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const crumbs = schemas.map((raw) => JSON.parse(raw)).find((item) => item["@type"] === "BreadcrumbList");
    expect(crumbs?.itemListElement).toHaveLength(3);
    expect(crumbs?.itemListElement[2].item).toBe(origin + path);
  }
});

test("localized project titles are distinct", async ({ page }) => {
  await page.goto("/id/work/smart-attendance-system", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Absensi RFID & Verifikasi Wajah/);
  await page.goto("/de/work/bast-management-system", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Dokumentenverwaltung mit Laravel/);
});

test("homepage links to projects with descriptive accessible names", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /View Project: Smart Attendance System/ }))
    .toHaveAttribute("href", "/work/smart-attendance-system");
});

test("work archive advertises case studies", async ({ page }) => {
  await page.goto("/work", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Full-Stack Projects & Case Studies/);
});

test("homepage project headings contain descriptive crawlable links", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const heading = page.getByRole("heading", { name: "Smart Attendance System" });
  await expect(heading.getByRole("link", { name: "Smart Attendance System" }))
    .toHaveAttribute("href", "/work/smart-attendance-system");
});

test("project galleries use meaningful contextual alt text when CMS alt is missing", async ({ page }) => {
  const cases = [
    ["/work/bast-management-system", "BAST"],
    ["/work/smart-attendance-system", "Smart Attendance System"],
    ["/work/5am-vision", "5AM Vision"],
  ] as const;

  for (const [path, projectName] of cases) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator('img[alt="Gallery image 1"]')).toHaveCount(0);
    const altTexts = await page.locator('main img[alt]').evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("alt")),
    );
    expect(altTexts.some((alt) => Boolean(alt?.includes(projectName)))).toBe(true);
  }
});

test("image-free project details still provide a shareable social image", async ({ page, request }) => {
  await page.goto("/work/natsx-controller", { waitUntil: "domcontentloaded" });
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(image).toBe(origin + "/opengraph-image");
  expect((await request.get("/opengraph-image")).ok()).toBe(true);
});

test("sitemap exposes discoverable portfolio images", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const body = await response.text();

  expect(body).toContain("<image:image>");
  expect(body).toContain("https://natsx.my.id/images/natsx-portrait-hero-bases.png");
  expect(body).toContain("https://natsx.my.id/images/work-thumbnails/attendance.webp");
  expect(body).toContain("https://natsx.my.id/images/work-thumbnails/bast.webp");
});

test("route transition identity matches current full-stack role", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-route-transition-part="bottom"]'))
    .toContainText("FULL-STACK DEVELOPER");
});

test("original engineering notes are crawlable and linked to source evidence", async ({ page }) => {
  const response = await page.goto("/engineering", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Engineering Notes/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", origin + "/engineering");
  for (const [slug, subject] of [
    ["rfid-face-verification-attendance-system", /RFID/],
    ["laravel-document-workflow-rbac", /Laravel/],
    ["android-windows-gamepad-connection-recovery", /Android/],
  ] as const) {
    const path = "/engineering/" + slug;
    const articleResponse = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(articleResponse?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(subject);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", origin + path);
    await expect(page.locator('link[rel="alternate"][hreflang="id"]')).toHaveCount(0);
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    const article = schemas.map((s) => JSON.parse(s)).find((data) => data["@type"] === "Article");
    expect(article?.author?.["@id"]).toBe(origin + "/#person");
    expect(article?.citation).toMatch(/^https:\/\/github\.com\/nafisajuliansahsaputra\//);
    await expect(page.getByRole("link", { name: /Read source code and documentation/ }))
      .toHaveAttribute("href", article.citation);
  }
});

test("engineering notes appear in the sitemap with no invented translations", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  expect(xml).toContain("<loc>" + origin + "/engineering</loc>");
  expect(xml).toContain("<loc>" + origin + "/engineering/laravel-document-workflow-rbac</loc>");
  expect(xml).not.toContain(origin + "/id/engineering");
  expect(xml).not.toContain(origin + "/de/engineering");
});

test("flagship case studies link to relevant technical analyses", async ({ page }) => {
  await page.goto("/work/smart-attendance-system", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /Read the full engineering analysis/ }))
    .toHaveAttribute("href", "/engineering/rfid-face-verification-attendance-system");
  await page.goto("/work/natsx-controller", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: /Read the full engineering analysis/ }))
    .toHaveAttribute("href", "/engineering/android-windows-gamepad-connection-recovery");
});
