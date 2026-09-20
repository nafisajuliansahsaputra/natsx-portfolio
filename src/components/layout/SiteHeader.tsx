"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { site } from "@/data/site";

import {
  getLocaleFromPathname,
  localizePath,
  stripLocaleFromPathname,
} from "@/i18n/config";

import { getMessages } from "@/i18n/messages";

import floatStyles from "./SiteHeaderFloating.module.css";
import menuStyles from "./SiteHeaderMenuReveal.module.css";
import mobileStyles from "./SiteHeaderMobileMode.module.css";
import styles from "./SiteHeader.module.css";

const MOBILE_FLOATING_QUERY =
  "(max-width: 700px)";

const navigation = [
  {
    number: "01",
    key: "work",
    href: "/work",
  },
  {
    number: "02",
    key: "about",
    href: "/about",
  },
  {
    number: "03",
    key: "playground",
    href: "/playground",
  },
  {
    number: "04",
    key: "contact",
    href: "/contact",
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
  ] =
    useState(false);

  const [
    menuClosing,
    setMenuClosing,
  ] =
    useState(false);

  const [
    headerCompact,
    setHeaderCompact,
  ] =
    useState(false);

  const [
    floatingLeaving,
    setFloatingLeaving,
  ] =
    useState(false);

  const closingTimerRef =
    useRef<number | null>(
      null,
    );

  const floatingExitTimerRef =
    useRef<number | null>(
      null,
    );

  const headerCompactRef =
    useRef(false);

  const floatingLeavingRef =
    useRef(false);

  const headerMenuButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const desktopFloatingMenuButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const mobileFloatingMenuButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const mobilePanelRef =
    useRef<HTMLDivElement>(
      null,
    );

  const scrollFrameRef =
    useRef<number | null>(
      null,
    );

  function isActive(
    href: string,
  ) {
    if (
      href === "/work"
    ) {
      return (
        basePath === "/work" ||
        basePath.startsWith(
          "/work/",
        )
      );
    }

    return basePath === href;
  }

  const activeNavigationItem =
    navigation.find(
      (item) =>
        isActive(
          item.href,
        ),
    );

  const currentIndex =
    basePath === "/cv"
      ? "CV"
      : activeNavigationItem
          ?.number ??
        "00";

  /*
   * =========================================================
   * MENU VISUAL STATE
   * =========================================================
   *
   * menuOpen:
   * controls whether the navigation is
   * still physically mounted / active.
   *
   * menuClosing:
   * keeps the panel alive while its
   * shutter choreography finishes.
   *
   * menuVisualOpen:
   * controls only the MENU ↔ CLOSE
   * appearance.
   *
   * Therefore clicking CLOSE immediately
   * starts the reverse button morph even
   * though the panel itself remains alive
   * during its closing sequence.
   */
  const menuVisualOpen =
    menuOpen &&
    !menuClosing;

  /* =========================
     VIEWPORT HELPERS
  ========================= */

  const isPhoneViewport =
    useCallback(() => {
      if (
        typeof window ===
        "undefined"
      ) {
        return false;
      }

      return window
        .matchMedia(
          MOBILE_FLOATING_QUERY,
        )
        .matches;
    }, []);

  /* =========================
     ACTIVE MENU BUTTON
  ========================= */

  const getActiveMenuButton =
    useCallback(() => {
      if (
        isPhoneViewport()
      ) {
        return (
          mobileFloatingMenuButtonRef
            .current
        );
      }

      if (
        headerCompactRef.current
      ) {
        return (
          desktopFloatingMenuButtonRef
            .current
        );
      }

      return (
        headerMenuButtonRef
          .current
      );
    }, [
      isPhoneViewport,
    ]);

  /* =========================
     CLOSE MENU
  ========================= */

  const closeMenu =
    useCallback(() => {
      if (
        !menuOpen ||
        menuClosing
      ) {
        return;
      }

      /*
       * This immediately makes
       * menuVisualOpen false.
       *
       * Button reverse motion therefore
       * begins on the exact frame CLOSE
       * is pressed.
       */
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
          : 650;

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

  /* =========================
     HERO EXIT / RETURN
  ========================= */

  useEffect(() => {
    const main =
      document.querySelector(
        "main",
      );

    const hero =
      document.querySelector<HTMLElement>(
        "[data-home-hero]",
      ) ??
      main?.querySelector<HTMLElement>(
        "section",
      ) ??
      null;

    const clearFloatingExitTimer =
      () => {
        if (
          floatingExitTimerRef.current !==
          null
        ) {
          window.clearTimeout(
            floatingExitTimerRef.current,
          );

          floatingExitTimerRef.current =
            null;
        }
      };

    const resetDesktopFloating =
      () => {
        clearFloatingExitTimer();

        headerCompactRef.current =
          false;

        floatingLeavingRef.current =
          false;

        setHeaderCompact(
          false,
        );

        setFloatingLeaving(
          false,
        );
      };

    const showFloating =
      () => {
        clearFloatingExitTimer();

        floatingLeavingRef.current =
          false;

        setFloatingLeaving(
          false,
        );

        if (
          !headerCompactRef.current
        ) {
          headerCompactRef.current =
            true;

          setHeaderCompact(
            true,
          );
        }
      };

    const hideFloating =
      () => {
        if (
          !headerCompactRef.current ||
          floatingLeavingRef.current
        ) {
          return;
        }

        const prefersReducedMotion =
          window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

        const exitDuration =
          prefersReducedMotion
            ? 0
            : 760;

        floatingLeavingRef.current =
          true;

        setFloatingLeaving(
          true,
        );

        clearFloatingExitTimer();

        floatingExitTimerRef.current =
          window.setTimeout(
            () => {
              headerCompactRef.current =
                false;

              floatingLeavingRef.current =
                false;

              setHeaderCompact(
                false,
              );

              setFloatingLeaving(
                false,
              );

              floatingExitTimerRef.current =
                null;
            },
            exitDuration,
          );
      };

    const mobileFloatingQuery =
      window.matchMedia(
        MOBILE_FLOATING_QUERY,
      );

    let heroExited =
      hero
        ? hero
            .getBoundingClientRect()
            .bottom <= 0
        : false;

    const syncCompactState =
      () => {
        if (
          mobileFloatingQuery.matches
        ) {
          if (
            headerCompactRef.current ||
            floatingLeavingRef.current
          ) {
            resetDesktopFloating();
          }

          return;
        }

        const shouldCompact =
          hero
            ? heroExited
            : window.scrollY >=
                window.innerHeight *
                  0.8;

        if (
          shouldCompact
        ) {
          showFloating();
        } else {
          hideFloating();
        }
      };

    const updateFallbackState =
      () => {
        if (
          hero
        ) {
          heroExited =
            hero
              .getBoundingClientRect()
              .bottom <= 0;
        }

        syncCompactState();

        scrollFrameRef.current =
          null;
      };

    const requestFallbackUpdate =
      () => {
        if (
          scrollFrameRef.current !==
          null
        ) {
          return;
        }

        scrollFrameRef.current =
          window.requestAnimationFrame(
            updateFallbackState,
          );
      };

    let heroObserver:
      IntersectionObserver |
      null =
      null;

    const canObserveHero =
      Boolean(
        hero &&
        typeof IntersectionObserver !==
          "undefined",
      );

    if (
      hero &&
      canObserveHero
    ) {
      heroObserver =
        new IntersectionObserver(
          (
            [
              entry,
            ],
          ) => {
            if (
              !entry
            ) {
              return;
            }

            heroExited =
              !entry.isIntersecting &&
              entry.boundingClientRect.bottom <=
                0;

            syncCompactState();
          },
          {
            threshold:
              0,
          },
        );

      heroObserver.observe(
        hero,
      );
    } else {
      window.addEventListener(
        "scroll",
        requestFallbackUpdate,
        {
          passive:
            true,
        },
      );

      window.addEventListener(
        "resize",
        requestFallbackUpdate,
      );
    }

    mobileFloatingQuery.addEventListener(
      "change",
      syncCompactState,
    );

    syncCompactState();

    return () => {
      heroObserver
        ?.disconnect();

      window.removeEventListener(
        "scroll",
        requestFallbackUpdate,
      );

      window.removeEventListener(
        "resize",
        requestFallbackUpdate,
      );

      mobileFloatingQuery.removeEventListener(
        "change",
        syncCompactState,
      );

      clearFloatingExitTimer();

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
    pathname,
  ]);

  /* =========================
     SCROLL LOCK
  ========================= */

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
        (element) => ({
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
      });
    };
  }, [
    menuOpen,
  ]);

  /* =========================
     INITIAL FOCUS
  ========================= */

  useEffect(() => {
    if (
      !menuOpen ||
      menuClosing
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          const firstLink =
            mobilePanelRef.current
              ?.querySelector<HTMLElement>(
                'nav a[href]:not([tabindex="-1"])',
              );

          firstLink?.focus();
        },
        310,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    menuOpen,
    menuClosing,
  ]);

  /* =========================
     FOCUS TRAP
  ========================= */

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
        event.key !== "Tab"
      ) {
        return;
      }

      const panel =
        mobilePanelRef.current;

      const button =
        getActiveMenuButton();

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
            ].join(","),
          ),
        );

      const focusable = [
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

      const currentFocusIndex =
        focusable.indexOf(
          activeElement as HTMLElement,
        );

      if (
        event.shiftKey &&
        currentFocusIndex ===
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
        currentFocusIndex ===
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
    getActiveMenuButton,
  ]);

  /* =========================
     ESCAPE
  ========================= */

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

        getActiveMenuButton()
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
    getActiveMenuButton,
    menuOpen,
  ]);

  /* =========================
     CLEANUP
  ========================= */

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
        floatingExitTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          floatingExitTimerRef.current,
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

  /* =========================
     CLASSES
  ========================= */

  const mobilePanelClassName =
    [
      styles.mobilePanel,
      menuStyles.panel,

      headerCompact
        ? styles.mobilePanelCompact
        : "",

      menuClosing
        ? styles.mobilePanelClosing
        : menuOpen
          ? styles.mobilePanelOpen
          : "",

      menuClosing
        ? menuStyles.closing
        : menuOpen
          ? menuStyles.open
          : "",
    ]
      .filter(Boolean)
      .join(" ");

  const headerClassName =
    [
      "site-header",

      headerCompact
        ? "is-compact"
        : "is-hero",

      menuOpen ||
      menuClosing
        ? "is-menu-open"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

  const desktopFloatingButtonClassName =
    [
      floatStyles.button,
      mobileStyles.desktopFloatingControl,
      mobileStyles.menuToggleControl,

      headerCompact &&
      !floatingLeaving
        ? floatStyles.visible
        : "",

      floatingLeaving
        ? floatStyles.leaving
        : "",

      menuVisualOpen
        ? mobileStyles.menuToggleOpen
        : "",
    ]
      .filter(Boolean)
      .join(" ");

  const mobileFloatingButtonClassName =
    [
      floatStyles.button,
      floatStyles.visible,
      mobileStyles.mobileFloatingControl,
      mobileStyles.menuToggleControl,

      menuVisualOpen
        ? mobileStyles.menuToggleOpen
        : "",
    ]
      .filter(Boolean)
      .join(" ");

  /* =========================
     RENDER
  ========================= */

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

      {/* =========================
          NORMAL TOP NAV
      ========================= */}

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
                (item) => {
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
              headerMenuButtonRef
            }
            className={[
              "site-menu-label",
              mobileStyles.headerMenuControl,

              menuVisualOpen
                ? "is-open"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            type="button"
            aria-label={
              menuOpen
                ? copy.accessibility
                    .closeMenu
                : copy.accessibility
                    .openMenu
            }
            aria-expanded={
              menuOpen
            }
            aria-controls="mobile-navigation"
            tabIndex={
              headerCompact
                ? -1
                : 0
            }
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

      {/* =========================
          HORIZONTAL SHUTTER MENU
      ========================= */}

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
          className={
            menuStyles.shutters
          }
          aria-hidden="true"
        >
          <span
            className={
              menuStyles.shutter
            }
          />

          <span
            className={
              menuStyles.shutter
            }
          />

          <span
            className={
              menuStyles.shutter
            }
          />

          <span
            className={
              menuStyles.shutter
            }
          />
        </div>

        {/* =========================
            HOME LOGO
        ========================= */}

        <div
          className={`site-container ${menuStyles.homeHeader}`}
        >
          <Link
            href={
              localizePath(
                "/",
                locale,
              )
            }
            className={`site-logo ${menuStyles.homeLogo}`}
            aria-label={
              copy.accessibility
                .home
            }
            onClick={
              closeMenu
            }
            tabIndex={
              menuOpen &&
              !menuClosing
                ? 0
                : -1
            }
          >
            <span
              className="site-logo__image"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div
          className={`site-container ${styles.mobileInner} ${menuStyles.inner}`}
        >
          <nav
            className={`${styles.mobileNav} ${menuStyles.nav}`}
            aria-label={
              copy.accessibility
                .mobileNavigation
            }
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
                    className={`${styles.mobileLink} ${menuStyles.link}`}
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
                      className={`${styles.mobileNumber} ${menuStyles.number}`}
                    >
                      {
                        item.number
                      }
                    </span>

                    <span
                      className={`${styles.mobileLabel} ${menuStyles.label}`}
                    >
                      {
                        copy.navigation[
                          item.key
                        ]
                      }
                    </span>

                    <span
                      className={[
                        styles.mobileIndicator,
                        menuStyles.indicator,

                        active
                          ? styles.mobileIndicatorActive
                          : "",

                        active
                          ? menuStyles.activeIndicator
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden="true"
                    />
                  </Link>
                );
              },
            )}
          </nav>

          <div
            className={
              menuStyles.language
            }
          >
            <LanguageSwitcher
              variant="mobile"
              onNavigate={
                closeMenu
              }
              syncPreference={
                false
              }
            />
          </div>

          <div
            className={`${styles.mobileFooter} ${menuStyles.footer}`}
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

      {/* =========================
          DESKTOP / TABLET
          FLOATING CONTROL
      ========================= */}

      <button
        ref={
          desktopFloatingMenuButtonRef
        }
        className={
          desktopFloatingButtonClassName
        }
        type="button"
        aria-label={
          menuOpen
            ? copy.accessibility
                .closeMenu
            : copy.accessibility
                .openMenu
        }
        aria-expanded={
          menuOpen
        }
        aria-controls="mobile-navigation"
        aria-hidden={
          !headerCompact ||
          floatingLeaving
        }
        tabIndex={
          headerCompact &&
          !floatingLeaving
            ? 0
            : -1
        }
        onClick={
          toggleMenu
        }
      >
        <span
          className={
            floatStyles.index
          }
          aria-hidden="true"
        >
          {
            currentIndex
          }
        </span>

        <span
          className={`${floatStyles.word} ${mobileStyles.menuToggleWord}`}
          aria-hidden="true"
        >
          {
            menuVisualOpen
              ? "CLOSE"
              : "MENU"
          }
        </span>

        <span
          className="site-menu-icon"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* =========================
          PHONE FLOATING CONTROL
      ========================= */}

      <button
        ref={
          mobileFloatingMenuButtonRef
        }
        className={
          mobileFloatingButtonClassName
        }
        type="button"
        aria-label={
          menuOpen
            ? copy.accessibility
                .closeMenu
            : copy.accessibility
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
          className={
            floatStyles.index
          }
          aria-hidden="true"
        >
          {
            currentIndex
          }
        </span>

        <span
          className={`${floatStyles.word} ${mobileStyles.menuToggleWord}`}
          aria-hidden="true"
        >
          {
            menuVisualOpen
              ? "CLOSE"
              : "MENU"
          }
        </span>

        <span
          className="site-menu-icon"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </span>
      </button>
    </>
  );
}