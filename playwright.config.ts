import {
  defineConfig,
  devices,
} from "@playwright/test";

const E2E_PORT =
  Number(
    process.env.PLAYWRIGHT_PORT ??
      3100,
  );

const E2E_BASE_URL =
  `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir:
    "./tests/e2e",

  fullyParallel:
    true,

  forbidOnly:
    Boolean(
      process.env.CI,
    ),

  retries:
    process.env.CI
      ? 2
      : 0,

  workers:
    process.env.CI
      ? 1
      : 4,

  reporter: [
    [
      "list",
    ],

    [
      "html",
      {
        outputFolder:
          "playwright-report",

        open:
          "never",
      },
    ],
  ],

  use: {
    baseURL:
      E2E_BASE_URL,

    trace:
      "on-first-retry",

    screenshot:
      "only-on-failure",

    video:
      "retain-on-failure",
  },

  projects: [
    {
      name:
        "chromium",

      use: {
        ...devices[
          "Desktop Chrome"
        ],
      },
    },
  ],

  webServer: {
    command:
      `npm run start -- -p ${E2E_PORT}`,

    url:
      E2E_BASE_URL,

    reuseExistingServer:
      false,

    timeout:
      120_000,
  },
});