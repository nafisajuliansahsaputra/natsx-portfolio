import {
  expect,
  test,
} from "@playwright/test";

import {
  isTrustedCloudinaryUrl,
} from "../../src/lib/cloudinary-media";

test.describe("Cloudinary media URL safety", () => {
  const id = "12345678-1234-1234-1234-123456789abc";
  const path = `projects/${id}/sections/${id}/gallery/${id}.webp`;
  const validUrl =
    `https://res.cloudinary.com/natsx-test/image/upload/v1793290000/natsx/portfolio/${path}`;

  test("only accepts versioned URLs from configured Cloudinary cloud and exact logical path", () => {
    const old = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "natsx-test";

    try {
      expect(isTrustedCloudinaryUrl(validUrl, path)).toBe(true);
      expect(isTrustedCloudinaryUrl(validUrl, `projects/${id}/covers/hero/${id}.webp`)).toBe(false);
      expect(isTrustedCloudinaryUrl(validUrl.replace("natsx-test", "another-cloud"), path)).toBe(false);
      expect(isTrustedCloudinaryUrl(validUrl.replace("https://", "http://"), path)).toBe(false);
      expect(isTrustedCloudinaryUrl(validUrl.replace("/v1793290000/", "/f_auto,q_auto/"), path)).toBe(false);
      expect(isTrustedCloudinaryUrl(`https://evil.example/?url=${encodeURIComponent(validUrl)}`, path)).toBe(false);
    } finally {
      if (old === undefined) {
        delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      } else {
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = old;
      }
    }
  });
});
