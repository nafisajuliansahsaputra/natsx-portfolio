import {
  expect,
  test,
} from "@playwright/test";

test("Cloudinary signing endpoint requires an authenticated portfolio admin", async ({
  request,
}) => {
  const response = await request.post(
    "/api/admin/media/cloudinary-sign",
    {
      data: {
        path:
          "projects/12345678-1234-1234-1234-123456789abc/covers/hero/12345678-1234-1234-1234-123456789abc.webp",
        mimeType: "image/webp",
        size: 1024,
      },
    },
  );

  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toContain("no-store");

  const body = await response.json();
  expect(body).not.toHaveProperty("signature");
  expect(body).not.toHaveProperty("apiSecret");
  expect(body).not.toHaveProperty("apiKey");
});
