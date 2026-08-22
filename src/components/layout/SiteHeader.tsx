"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import {
  site,
} from "@/data/site";

import styles from "./SiteHeader.module.css";

import {
  getLocaleFromPathname,
  localizePath,
  stripLocaleFromPathname,
} from "@/i18n/config";

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
  const pathname =
    usePathname();

    const locale =
  getLocaleFromPathname(
    pathname,
  );

const basePath =
  stripLocaleFromPathname(
    pathname,
  );

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    menuClosing,
    setMenuClosing,
  ] = useState(false);

  const [
    headerScrolled,
    setHeaderScrolled,
  ] = useState(false);

  const [
    headerVisible,
    setHeaderVisible,
  ] = useState(true);

  const closingTimerRef =
    useRef<number | null>(
      null,
    );

  const menuButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const mobilePanelRef =
    useRef<HTMLDivElement>(
      null,
    );

  const lastScrollYRef =
    useRef(0);

  const scrollFrameRef =
    useRef<number | null>(
      null,
    );

function isActive(
  href: string,
) {
  if (
    href ===
    "/work"
  ) {
    return (
      basePath ===
        "/work" ||
      basePath.startsWith(
        "/work/",
      )
    );
  }

  return (
    basePath ===
    href
  );
}

  const closeMenu =
    useCallback(() => {
      if (
        !menuOpen ||
        menuClosing
      ) {
        return;
      }

      setMenuClosing(
        true,
      );

      if (
        closingTimerRef.current
      ) {
        window.clearTimeout(
          closingTimerRef.current,
        );
      }

      const prefersReducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

      const closeDuration =
        prefersReducedMotion
          ? 0
          : 430;

      closingTimerRef.current =
        window.setTimeout(
          () => {
            setMenuOpen(
              false,
            );

            setMenuClosing(
              false,
            );

            closingTimerRef.current =
              null;
          },
          closeDuration,
        );
    }, [
      menuOpen,
      menuClosing,
    ]);

  function openMenu() {
    if (menuOpen) {
      return;
    }

    if (
      closingTimerRef.current
    ) {
      window.clearTimeout(
        closingTimerRef.current,
      );

      closingTimerRef.current =
        null;
    }

    setMenuClosing(
      false,
    );

    /*
     * Header harus terlihat
     * sebelum mobile navigation
     * dibuka.
     */
    setHeaderVisible(
      true,
    );

    setMenuOpen(
      true,
    );
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  }

  /*
   * =========================
   * SMART STICKY HEADER
   * =========================
   *
   * - Top: terlihat normal.
   * - Scroll down: hide.
   * - Scroll up: reveal.
   * - Menu open: selalu terlihat.
   */
  useEffect(() => {
    lastScrollYRef.current =
      Math.max(
        window.scrollY,
        0,
      );

    const updateHeader =
      () => {
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
          currentY <=
          16;

        setHeaderScrolled(
          currentY >
            24,
        );

        if (
          menuOpen ||
          isAtTop
        ) {
          setHeaderVisible(
            true,
          );
        } else if (
          Math.abs(
            delta,
          ) >= 5
        ) {
          if (
            delta > 0 &&
            currentY >
              120
          ) {
            setHeaderVisible(
              false,
            );
          }

          if (
            delta < 0
          ) {
            setHeaderVisible(
              true,
            );
          }
        }

        lastScrollYRef.current =
          currentY;

        scrollFrameRef.current =
          null;
      };

    const handleScroll =
      () => {
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
  }, [
    menuOpen,
  ]);

  /*
   * =========================
   * BACKGROUND LOCK
   * =========================
   *
   * Ketika mobile menu terbuka,
   * main dan footer dibuat inert
   * agar keyboard / screen reader
   * tidak masuk ke page di belakang.
   */
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    const backgroundRegions =
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "main, footer",
        ),
      );

    const previousInertStates =
      backgroundRegions.map(
        (
          element,
        ) => ({
          element,

          inert:
            element.inert,
        }),
      );

    document.body.style.overflow =
      "hidden";

    previousInertStates.forEach(
      ({
        element,
      }) => {
        element.inert =
          true;
      },
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      previousInertStates.forEach(
        ({
          element,
          inert,
        }) => {
          element.inert =
            inert;
        },
      );
    };
  }, [
    menuOpen,
  ]);

  /*
   * =========================
   * INITIAL MENU FOCUS
   * =========================
   *
   * Setelah menu terbuka,
   * fokus langsung masuk
   * ke link pertama.
   */
  useEffect(() => {
    if (
      !menuOpen ||
      menuClosing
    ) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          const firstLink =
            mobilePanelRef.current
              ?.querySelector<HTMLElement>(
                'a[href]:not([tabindex="-1"])',
              );

          firstLink?.focus();
        },
      );

    return () => {
      window.cancelAnimationFrame(
        frame,
      );
    };
  }, [
    menuOpen,
    menuClosing,
  ]);

  /*
   * =========================
   * MOBILE MENU FOCUS TRAP
   * =========================
   */
  useEffect(() => {
    if (
      !menuOpen ||
      menuClosing
    ) {
      return;
    }

    function handleMenuTab(
      event: KeyboardEvent,
    ) {
      if (
        event.key !==
        "Tab"
      ) {
        return;
      }

      const panel =
        mobilePanelRef.current;

      const button =
        menuButtonRef.current;

      if (
        !panel ||
        !button
      ) {
        return;
      }

      const panelFocusable =
        Array.from(
          panel.querySelectorAll<HTMLElement>(
            [
              'a[href]:not([tabindex="-1"])',
              'button:not([disabled]):not([tabindex="-1"])',
              '[tabindex]:not([tabindex="-1"])',
            ].join(
              ",",
            ),
          ),
        );

      const focusable =
        [
          button,
          ...panelFocusable,
        ];

      if (
        focusable.length <=
        1
      ) {
        return;
      }

      const activeElement =
        document.activeElement;

      const currentIndex =
        focusable.indexOf(
          activeElement as HTMLElement,
        );

      if (
        event.shiftKey &&
        currentIndex ===
          0
      ) {
        event.preventDefault();

        focusable[
          focusable.length -
            1
        ]?.focus();

        return;
      }

      if (
        !event.shiftKey &&
        currentIndex ===
          focusable.length -
            1
      ) {
        event.preventDefault();

        button.focus();
      }
    }

    document.addEventListener(
      "keydown",
      handleMenuTab,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleMenuTab,
      );
    };
  }, [
    menuOpen,
    menuClosing,
  ]);

  /*
   * =========================
   * ESCAPE KEY
   * =========================
   *
   * Escape menutup menu
   * dan mengembalikan focus
   * ke hamburger.
   */
  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
        menuOpen
      ) {
        event.preventDefault();

        menuButtonRef.current
          ?.focus();

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
  }, [
    closeMenu,
    menuOpen,
  ]);

  /*
   * =========================
   * CLEANUP
   * =========================
   */
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

  const mobilePanelClassName =
    [
      styles.mobilePanel,

      menuClosing
        ? styles.mobilePanelClosing
        : menuOpen
          ? styles.mobilePanelOpen
          : "",
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      );

  const headerClassName =
    [
      "site-header",

      headerScrolled
        ? "is-scrolled"
        : "is-top",

      headerVisible
        ? "is-visible"
        : "is-hidden",

      menuOpen ||
      menuClosing
        ? "is-menu-open"
        : "",
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      );

  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main
        content
      </a>

      <header
        className={
          headerClassName
        }
      >
        <div className="site-container site-header__inner">
          <Link
href={
  localizePath(
    "/",
    locale,
  )
}
            className="site-logo"
            aria-label="NATSX home"
            onClick={
              closeMenu
            }
          >
<span
  className="site-logo__image"
  aria-hidden="true"
/>
          </Link>

          <nav
            className="site-nav"
            aria-label="Main navigation"
          >
            {navigation.map(
              (
                item,
              ) => {
                const active =
                  isActive(
                    item.href,
                  );

                return (
                  <Link
href={
  localizePath(
    item.href,
    locale,
  )
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
            ref={
              menuButtonRef
            }
            className={[
              "site-menu-label",

              menuOpen
                ? "is-open"
                : "",
            ]
              .filter(
                Boolean,
              )
              .join(
                " ",
              )}
            type="button"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={
              menuOpen
            }
            aria-controls="mobile-navigation"
            onClick={
              toggleMenu
            }
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
        ref={
          mobilePanelRef
        }
        id="mobile-navigation"
        className={
          mobilePanelClassName
        }
        role="dialog"
        aria-modal={
          menuOpen
            ? "true"
            : undefined
        }
        aria-label="Main navigation menu"
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
              (
                item,
              ) => {
                const active =
                  isActive(
                    item.href,
                  );

                return (
                  <Link
href={
  localizePath(
    item.href,
    locale,
  )
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
                Digital
                Creator
              </span>

              <span>
                {
                  site.person
                }
              </span>
            </div>

            <div
              className={
                styles.mobileFooterRight
              }
            >
              <span>
                {
                  site.location
                }
              </span>

              <span>
                ©{" "}
                {
                  site.year
                }{" "}
                {
                  site.name
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}