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

  const [
    headerScrolled,
    setHeaderScrolled,
  ] = useState(false);

  const [
    headerVisible,
    setHeaderVisible,
  ] = useState(true);

  const closingTimerRef =
    useRef<number | null>(null);

  const lastScrollYRef =
    useRef(0);

  const scrollFrameRef =
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

    /*
     * Header must always be visible
     * before the mobile navigation opens.
     */
    setHeaderVisible(true);

    setMenuOpen(true);
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }

  /*
   * Smart sticky navigation:
   *
   * - At the top: normal header.
   * - Scroll down: hide after threshold.
   * - Scroll up: reveal immediately.
   * - Mobile menu open: always visible.
   */
  useEffect(() => {
    lastScrollYRef.current =
      Math.max(
        window.scrollY,
        0,
      );

    const updateHeader = () => {
      const currentY =
        Math.max(
          window.scrollY,
          0,
        );

      const previousY =
        lastScrollYRef.current;

      const delta =
        currentY -
        previousY;

      const isAtTop =
        currentY <= 16;

      setHeaderScrolled(
        currentY > 24,
      );

      if (
        menuOpen ||
        isAtTop
      ) {
        setHeaderVisible(true);
      } else if (
        Math.abs(delta) >= 5
      ) {
        if (
          delta > 0 &&
          currentY > 120
        ) {
          setHeaderVisible(false);
        }

        if (delta < 0) {
          setHeaderVisible(true);
        }
      }

      lastScrollYRef.current =
        currentY;

      scrollFrameRef.current =
        null;
    };

    const handleScroll = () => {
      if (
        scrollFrameRef.current !==
        null
      ) {
        return;
      }

      scrollFrameRef.current =
        window.requestAnimationFrame(
          updateHeader,
        );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    updateHeader();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      if (
        scrollFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          scrollFrameRef.current,
        );

        scrollFrameRef.current =
          null;
      }
    };
  }, [menuOpen]);

  /*
   * Reset header visibility when moving
   * between routes.
   */

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
      if (
        closingTimerRef.current
      ) {
        window.clearTimeout(
          closingTimerRef.current,
        );
      }

      if (
        scrollFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          scrollFrameRef.current,
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

  const headerClassName = [
    "site-header",
    headerScrolled
      ? "is-scrolled"
      : "is-top",
    headerVisible
      ? "is-visible"
      : "is-hidden",
    menuOpen || menuClosing
      ? "is-menu-open"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header
        className={
          headerClassName
        }
      >
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
            {navigation.map(
              (item) => {
                const active =
                  isActive(
                    item.href,
                  );

                return (
                  <Link
                    href={
                      item.href
                    }
                    key={
                      item.href
                    }
                    onClick={
                      closeMenu
                    }
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
                      {
                        item.label
                      }
                    </span>

                    <span
                      className="site-nav__dot"
                      aria-hidden="true"
                    />
                  </Link>
                );
              },
            )}
          </nav>

<button
  className={[
    "site-menu-label",
    menuOpen
      ? "is-open"
      : "",
  ]
    .filter(Boolean)
    .join(" ")}
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
  <span
    className="site-menu-icon"
    aria-hidden="true"
  >
    <span />
    <span />
    <span />
  </span>
</button>
        </div>
      </header>

      <div
        id="mobile-navigation"
        className={
          mobilePanelClassName
        }
        aria-hidden={
          !menuOpen
        }
      >
        <div
          className={`site-container ${styles.mobileInner}`}
        >
          <nav
            className={
              styles.mobileNav
            }
            aria-label="Mobile navigation"
          >
            {navigation.map(
              (item) => {
                const active =
                  isActive(
                    item.href,
                  );

                return (
                  <Link
                    href={
                      item.href
                    }
                    key={
                      item.href
                    }
                    onClick={
                      closeMenu
                    }
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
                      {
                        item.number
                      }
                    </span>

                    <span
                      className={
                        styles.mobileLabel
                      }
                    >
                      {
                        item.label
                      }
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
              },
            )}
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