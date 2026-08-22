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

const localizedSelectors = [
  {
    path:
      "/",

    trigger:
      "Change language",

    group:
      "Language selector",
  },

  {
    path:
      "/id",

    trigger:
      "Ganti bahasa",

    group:
      "Pemilih bahasa",
  },

  {
    path:
      "/de",

    trigger:
      "Sprache ändern",

    group:
      "Sprachauswahl",
  },
] as const;

test.describe(
  "localized desktop language selector semantics",
  () => {
    for (
      const {
        path,
        trigger,
        group,
      } of localizedSelectors
    ) {
      test(
        `${path} exposes localized accessible language controls`,
        async ({
          page,
        }) => {
          await page.setViewportSize({
            width:
              1440,

            height:
              900,
          });

          await page.goto(
            path,
          );

          const triggerButton =
            page.getByRole(
              "button",
              {
                name:
                  trigger,
              },
            );

          await expect(
            triggerButton,
          ).toBeVisible();

          await expect(
            triggerButton,
          ).toHaveAttribute(
            "aria-expanded",
            "false",
          );

          await expect(
            triggerButton,
          ).toHaveAttribute(
            "aria-controls",
            "language-selector-options",
          );

          await expect(
            triggerButton,
          ).not.toHaveAttribute(
            "aria-haspopup",
            "menu",
          );

          await triggerButton.click();

          await expect(
            triggerButton,
          ).toHaveAttribute(
            "aria-expanded",
            "true",
          );

          const selectorGroup =
            page.getByRole(
              "group",
              {
                name:
                  group,
              },
            );

          await expect(
            selectorGroup,
          ).toBeVisible();

          await expect(
            selectorGroup.getByRole(
              "button",
              {
                name:
                  "English",
              },
            ),
          ).toBeVisible();

          await expect(
            selectorGroup.getByRole(
              "button",
              {
                name:
                  "Indonesia",
              },
            ),
          ).toBeVisible();

          await expect(
            selectorGroup.getByRole(
              "button",
              {
                name:
                  "Deutsch",
              },
            ),
          ).toBeVisible();

          await expect(
            page.getByRole(
              "menu",
            ),
          ).toHaveCount(
            0,
          );

          await expect(
            page.getByRole(
              "menuitemradio",
            ),
          ).toHaveCount(
            0,
          );
        },
      );
    }
  },
);

test(
  "desktop selector supports natural tab order and escape focus restoration",
  async ({
    page,
  }) => {
    await page.setViewportSize({
      width:
        1440,

      height:
        900,
    });

    await page.goto(
      "/",
    );

    const trigger =
      page.getByRole(
        "button",
        {
          name:
            "Change language",
        },
      );

    await trigger.focus();

    await page.keyboard.press(
      "Enter",
    );

    await expect(
      trigger,
    ).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    const group =
      page.getByRole(
        "group",
        {
          name:
            "Language selector",
        },
      );

    const english =
      group.getByRole(
        "button",
        {
          name:
            "English",
        },
      );

    const indonesia =
      group.getByRole(
        "button",
        {
          name:
            "Indonesia",
        },
      );

    await expect(
      english,
    ).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await expect(
      indonesia,
    ).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await page.keyboard.press(
      "Tab",
    );

    await expect(
      english,
    ).toBeFocused();

    await page.keyboard.press(
      "Tab",
    );

    await expect(
      indonesia,
    ).toBeFocused();

    await page.keyboard.press(
      "Escape",
    );

    await expect(
      trigger,
    ).toBeFocused();

    await expect(
      trigger,
    ).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await expect(
      page.locator(
        "#language-selector-options",
      ),
    ).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
);

test(
  "mobile language selector exposes grouped toggle buttons",
  async ({
    page,
  }) => {
    await page.setViewportSize({
      width:
        375,

      height:
        812,
    });

    await page.goto(
      "/",
    );

    const menuButton =
      page.locator(
        'button[aria-controls="mobile-navigation"]',
      );

    await menuButton.click();

    await expect(
      menuButton,
    ).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    const selectorGroup =
      page.getByRole(
        "group",
        {
          name:
            "Language selector",
        },
      );

    await expect(
      selectorGroup,
    ).toBeVisible();

    await expect(
      selectorGroup.getByRole(
        "button",
        {
          name:
            "English",
        },
      ),
    ).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await expect(
      selectorGroup.getByRole(
        "button",
        {
          name:
            "Indonesia",
        },
      ),
    ).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await expect(
      selectorGroup.getByRole(
        "button",
        {
          name:
            "Deutsch",
        },
      ),
    ).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  },
);