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

import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

import {
  site,
} from "@/data/site";

import {
  getLocaleFromPathname,
  localizePath,
  stripLocaleFromPathname,
} from "@/i18n/config";

import {
  getMessages,
} from "@/i18n/messages";

import styles from "./SiteHeader.module.css";

const navigation = [
  {
    number:
      "01",

    key:
      "work",

    href:
      "/work",
  },

  {
    number:
      "02",

    key:
      "about",

    href:
      "/about",
  },

  {
    number:
      "03",

    key:
      "playground",

    href:
      "/playground",
  },

  {
    number:
      "04",

    key:
      "contact",

    href:
      "/contact",
  },
] as const;

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

  const copy =
    getMessages(
      locale,
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
    if (
      menuOpen
    ) {
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

    setHeaderVisible(
      true,
    );

    setMenuOpen(
      true,
    );
  }

  function toggleMenu() {
    if (
      menuOpen
    ) {
      closeMenu();

      return;
    }

    openMenu();
  }

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
        passive:
          true,
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

  useEffect(() => {
    if (
      !menuOpen
    ) {
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
        {
          copy.accessibility
            .skipToMain
        }
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
            aria-label={
              copy.accessibility
                .home
            }
            onClick={
              closeMenu
            }
          >
            <span
              className="site-logo__image"
              aria-hidden="true"
            />
          </Link>

          <div className="site-header__desktop-actions">
            <nav
              className="site-nav"
              aria-label={
                copy.accessibility
                  .mainNavigation
              }
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
                          copy.navigation[
                            item.key
                          ]
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

            <LanguageSwitcher />
          </div>

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
                ? copy
                    .accessibility
                    .closeMenu
                : copy
                    .accessibility
                    .openMenu
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
        aria-label={
          copy.accessibility
            .mobileNavigation
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
            aria-label={
              copy.accessibility
                .mobileNavigation
            }
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
                        copy.navigation[
                          item.key
                        ]
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

          <LanguageSwitcher
            variant="mobile"
            onNavigate={
              closeMenu
            }
          />

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
                {
                  copy.identity
                    .digitalCreator
                }
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