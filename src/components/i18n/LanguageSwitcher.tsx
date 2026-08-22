"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  defaultLocale,
  getLocaleFromPathname,
  isLocale,
  localeLabels,
  locales,
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getMessages,
} from "@/i18n/messages";

import styles from "./LanguageSwitcher.module.css";

const STORAGE_KEY =
  "natsx:locale";

const DESKTOP_OPTIONS_ID =
  "language-selector-options";

type LanguageSwitcherProps = {
  variant?:
    | "desktop"
    | "mobile";

  onNavigate?:
    () => void;
};

export default function LanguageSwitcher({
  variant = "desktop",
  onNavigate,
}: LanguageSwitcherProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const currentLocale =
    getLocaleFromPathname(
      pathname,
    );

  const copy =
    getMessages(
      currentLocale,
    );

  const [
    open,
    setOpen,
  ] = useState(
    false,
  );

  const rootRef =
    useRef<HTMLDivElement>(
      null,
    );

  const triggerRef =
    useRef<HTMLButtonElement>(
      null,
    );

  /*
   * Keep the real document
   * language synchronized with
   * the active route locale.
   */
  useEffect(() => {
    document.documentElement.lang =
      currentLocale;
  }, [
    currentLocale,
  ]);

  /*
   * ============================
   * LANGUAGE PREFERENCE SYNC
   * ============================
   *
   * Explicit localized URL:
   * /id/... or /de/...
   * becomes the newest preference.
   *
   * Default English URL:
   * /...
   * follows a previously saved
   * ID / DE preference.
   *
   * Auto navigation uses replace()
   * so it does not add an extra
   * entry to browser history.
   */
  useEffect(() => {
    let storedLocale:
      | Locale
      | null =
      null;

    try {
      const storedValue =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (
        isLocale(
          storedValue,
        )
      ) {
        storedLocale =
          storedValue;
      }
    } catch {
      /*
       * localStorage is optional.
       * Route locale still works
       * normally when unavailable.
       */
      return;
    }

    /*
     * No valid preference yet.
     * Use the current route as
     * the initial preference.
     */
    if (
      !storedLocale
    ) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          currentLocale,
        );
      } catch {
        /*
         * Preference storage
         * is optional.
         */
      }

      return;
    }

    /*
     * A localized route is explicit.
     * Treat it as the newest user
     * preference.
     */
    if (
      currentLocale !==
      defaultLocale
    ) {
      if (
        storedLocale !==
        currentLocale
      ) {
        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            currentLocale,
          );
        } catch {
          /*
           * Preference storage
           * is optional.
           */
        }
      }

      return;
    }

    /*
     * English is already the saved
     * preference, so nothing to do.
     */
    if (
      storedLocale ===
      defaultLocale
    ) {
      return;
    }

    const targetPath =
      localizePath(
        pathname,
        storedLocale,
      );

    const suffix =
      `${window.location.search}${window.location.hash}`;

    router.replace(
      `${targetPath}${suffix}`,
    );
  }, [
    currentLocale,
    pathname,
    router,
  ]);

  useEffect(() => {
    if (
      variant !==
        "desktop" ||
      !open
    ) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent,
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(
          false,
        );
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      event.preventDefault();

      setOpen(
        false,
      );

      triggerRef.current
        ?.focus();
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    variant,
  ]);

  function changeLocale(
    locale: Locale,
  ) {
    if (
      locale ===
      currentLocale
    ) {
      setOpen(
        false,
      );

      if (
        variant ===
        "desktop"
      ) {
        triggerRef.current
          ?.focus();
      }

      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        locale,
      );
    } catch {
      /*
       * Preference storage is
       * optional. Navigation must
       * still work without it.
       */
    }

    const targetPath =
      localizePath(
        pathname,
        locale,
      );

    const suffix =
      `${window.location.search}${window.location.hash}`;

    setOpen(
      false,
    );

    if (
      variant ===
      "desktop"
    ) {
      triggerRef.current
        ?.focus();
    }

    onNavigate?.();

    router.push(
      `${targetPath}${suffix}`,
    );
  }

  if (
    variant ===
    "mobile"
  ) {
    return (
      <div
        className={
          styles.mobile
        }
        role="group"
        aria-label={
          copy
            .accessibility
            .languageSelector
        }
      >
        <span
          className={
            styles.mobileLabel
          }
        >
          {
            copy.language
              .label
          }
        </span>

        <div
          className={
            styles.mobileOptions
          }
        >
          {locales.map(
            (
              locale,
            ) => {
              const active =
                locale ===
                currentLocale;

              return (
                <button
                  type="button"
                  key={
                    locale
                  }
                  className={
                    active
                      ? `${styles.mobileOption} ${styles.mobileOptionActive}`
                      : styles.mobileOption
                  }
                  aria-label={
                    localeLabels[
                      locale
                    ].label
                  }
                  aria-pressed={
                    active
                  }
                  onClick={() =>
                    changeLocale(
                      locale,
                    )
                  }
                >
                  {
                    localeLabels[
                      locale
                    ].short
                  }
                </button>
              );
            },
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={
        rootRef
      }
      className={
        styles.desktop
      }
    >
      <button
        ref={
          triggerRef
        }
        type="button"
        className={
          styles.trigger
        }
        aria-label={
          copy
            .accessibility
            .changeLanguage
        }
        aria-expanded={
          open
        }
        aria-controls={
          DESKTOP_OPTIONS_ID
        }
        onClick={() =>
          setOpen(
            (
              value,
            ) =>
              !value,
          )
        }
      >
        <span>
          {
            localeLabels[
              currentLocale
            ].short
          }
        </span>

        <span
          className={
            open
              ? `${styles.chevron} ${styles.chevronOpen}`
              : styles.chevron
          }
          aria-hidden="true"
        >
          ↓
        </span>
      </button>

      <div
        id={
          DESKTOP_OPTIONS_ID
        }
        className={
          open
            ? `${styles.menu} ${styles.menuOpen}`
            : styles.menu
        }
        role="group"
        aria-label={
          copy
            .accessibility
            .languageSelector
        }
        aria-hidden={
          !open
        }
      >
        {locales.map(
          (
            locale,
          ) => {
            const active =
              locale ===
              currentLocale;

            return (
              <button
                type="button"
                aria-label={
                  localeLabels[
                    locale
                  ].label
                }
                aria-pressed={
                  active
                }
                key={
                  locale
                }
                className={
                  active
                    ? `${styles.option} ${styles.optionActive}`
                    : styles.option
                }
                tabIndex={
                  open
                    ? 0
                    : -1
                }
                onClick={() =>
                  changeLocale(
                    locale,
                  )
                }
              >
                <span>
                  {
                    localeLabels[
                      locale
                    ].label
                  }
                </span>

                <span
                  aria-hidden="true"
                >
                  {
                    localeLabels[
                      locale
                    ].short
                  }
                </span>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}