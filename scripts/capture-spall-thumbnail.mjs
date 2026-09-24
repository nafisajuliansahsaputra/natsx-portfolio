import { chromium } from "@playwright/test";
import sharp from "sharp";

// Run against the local app: node scripts/capture-spall-thumbnail.mjs [base URL]
// Capture the Selected Work artwork itself at the archive pane's aspect ratio.
// No screen replacement or overlay is added during capture or image encoding.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  await page.addInitScript(() => {
    sessionStorage.setItem("natsx:portfolio-intro:v5", "1");
  });
  await page.goto(process.argv[2] ?? "http://localhost:3000/");
  const artwork = page.locator('[data-spall-featured="true"]');
  await artwork.scrollIntoViewIfNeeded();
  await artwork.locator("canvas").waitFor({ timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await artwork.evaluate((element) => {
    Object.assign(element.style, {
      position: "fixed",
      inset: "0 auto auto 0",
      width: "652px",
      height: "374px",
      zIndex: "9999",
    });
  });
  // Allow ResizeObserver, the WebGL render, and the ready fade to settle.
  await page.waitForTimeout(2000);
  const capture = await artwork.screenshot();
  await sharp(capture)
    .webp({ quality: 95 })
    .toFile("public/images/work-thumbnails/spall.webp");
  console.log("Captured Selected Work → public/images/work-thumbnails/spall.webp");
} finally {
  await browser.close();
}
