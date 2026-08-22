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
  getLocaleFromPathname,
  localeLabels,
  locales,
  localizePath,
  type Locale,
} from "@/i18n/config";

import styles from "./LanguageSwitcher.module.css";

const STORAGE_KEY =
  "natsx:locale";

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

  const [
    open,
    setOpen,
  ] = useState(false);

  const rootRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(() => {
    document.documentElement.lang =
      currentLocale;
  }, [
    currentLocale,
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
        setOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
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
      setOpen(false);
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        locale,
      );
    } catch {
      // Preference storage
      // is optional.
    }

    const targetPath =
      localizePath(
        pathname,
        locale,
      );

    const suffix =
      `${window.location.search}${window.location.hash}`;

    setOpen(false);

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
        aria-label="Language"
      >
        <span
          className={
            styles.mobileLabel
          }
        >
          Language
        </span>

        <div
          className={
            styles.mobileOptions
          }
        >
          {locales.map(
            (locale) => {
              const active =
                locale ===
                currentLocale;

              return (
                <button
                  type="button"
                  key={locale}
                  className={
                    active
                      ? `${styles.mobileOption} ${styles.mobileOptionActive}`
                      : styles.mobileOption
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
      ref={rootRef}
      className={
        styles.desktop
      }
    >
      <button
        type="button"
        className={
          styles.trigger
        }
        aria-haspopup="menu"
        aria-expanded={
          open
        }
        onClick={() =>
          setOpen(
            (value) =>
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
        className={
          open
            ? `${styles.menu} ${styles.menuOpen}`
            : styles.menu
        }
        role="menu"
        aria-hidden={
          !open
        }
      >
        {locales.map(
          (locale) => {
            const active =
              locale ===
              currentLocale;

            return (
              <button
                type="button"
                role="menuitemradio"
                aria-checked={
                  active
                }
                key={locale}
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

                <span>
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