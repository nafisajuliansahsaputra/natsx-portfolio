"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/data/site";

import styles from "./SiteHeader.module.css";

const navigation = [
  {
    number: "01",
    label: "Work",
    href: "/work",
  },
  {
    number: "02",
    label: "About",
    href: "/about",
  },
  {
    number: "03",
    label: "Playground",
    href: "/playground",
  },
  {
    number: "04",
    label: "Contact",
    href: "/contact",
  },
];

export default function SiteHeader() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [menuClosing, setMenuClosing] =
    useState(false);

  const closingTimerRef =
    useRef<number | null>(null);

  function isActive(href: string) {
    if (href === "/work") {
      return (
        pathname === "/work" ||
        pathname.startsWith("/work/")
      );
    }

    return pathname === href;
  }

  const closeMenu = useCallback(() => {
    if (!menuOpen || menuClosing) {
      return;
    }

    setMenuClosing(true);

    if (closingTimerRef.current) {
      window.clearTimeout(
        closingTimerRef.current,
      );
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const closeDuration =
      prefersReducedMotion ? 0 : 430;

    closingTimerRef.current =
      window.setTimeout(() => {
        setMenuOpen(false);
        setMenuClosing(false);

        closingTimerRef.current = null;
      }, closeDuration);
  }, [menuOpen, menuClosing]);

  function openMenu() {
    if (menuOpen) {
      return;
    }

    if (closingTimerRef.current) {
      window.clearTimeout(
        closingTimerRef.current,
      );

      closingTimerRef.current = null;
    }

    setMenuClosing(false);
    setMenuOpen(true);
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [closeMenu]);

  useEffect(() => {
    return () => {
      if (closingTimerRef.current) {
        window.clearTimeout(
          closingTimerRef.current,
        );
      }
    };
  }, []);

  const mobilePanelClassName = [
    styles.mobilePanel,
    menuClosing
      ? styles.mobilePanelClosing
      : menuOpen
        ? styles.mobilePanelOpen
        : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className="site-header">
        <div className="site-container site-header__inner">
          <Link
            href="/"
            className="site-logo"
            aria-label="NATSX home"
            onClick={closeMenu}
          >
            <Image
              src="/images/branding/natsx-logo-black.png"
              alt="NATSX"
              width={1110}
              height={380}
              priority
              className="site-logo__image"
            />
          </Link>

          <nav
            className="site-nav"
            aria-label="Main navigation"
          >
            {navigation.map((item) => {
              const active = isActive(
                item.href,
              );

              return (
                <Link
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                  className={
                    active
                      ? "site-nav__link is-active"
                      : "site-nav__link"
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                >
                  <span>
                    {item.label}
                  </span>

                  <span
                    className="site-nav__dot"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>

          <button
            className="site-menu-label"
            type="button"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={toggleMenu}
          >
            {menuOpen
              ? "Close"
              : "Menu"}
          </button>
        </div>
      </header>

      <div
        id="mobile-navigation"
        className={
          mobilePanelClassName
        }
        aria-hidden={!menuOpen}
      >
        <div
          className={`site-container ${styles.mobileInner}`}
        >
          <nav
            className={styles.mobileNav}
            aria-label="Mobile navigation"
          >
            {navigation.map((item) => {
              const active = isActive(
                item.href,
              );

              return (
                <Link
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                  className={
                    styles.mobileLink
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  tabIndex={
                    menuOpen &&
                    !menuClosing
                      ? 0
                      : -1
                  }
                >
                  <span
                    className={
                      styles.mobileNumber
                    }
                  >
                    {item.number}
                  </span>

                  <span
                    className={
                      styles.mobileLabel
                    }
                  >
                    {item.label}
                  </span>

                  <span
                    className={
                      active
                        ? `${styles.mobileIndicator} ${styles.mobileIndicatorActive}`
                        : styles.mobileIndicator
                    }
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>

          <div
            className={
              styles.mobileFooter
            }
          >
            <div>
              <span
                className={
                  styles.mobileMetaLabel
                }
              >
                Digital Creator
              </span>

              <span>
                {site.person}
              </span>
            </div>

            <div
              className={
                styles.mobileFooterRight
              }
            >
              <span>
                {site.location}
              </span>

              <span>
                © {site.year}{" "}
                {site.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}