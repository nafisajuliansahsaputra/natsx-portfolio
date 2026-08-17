"use client";

import { useEffect, useState } from "react";
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

  function isActive(href: string) {
    if (href === "/work") {
      return (
        pathname === "/work" ||
        pathname.startsWith("/work/")
      );
    }

    return pathname === href;
  }

  function closeMenu() {
    setMenuOpen(false);
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
        setMenuOpen(false);
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
  }, []);

  return (
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
                <span>{item.label}</span>

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
          onClick={() =>
            setMenuOpen(
              (current) => !current,
            )
          }
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

<div
  id="mobile-navigation"
  className={`${styles.mobilePanel} ${
    menuOpen
      ? styles.mobilePanelOpen
      : ""
  }`}
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
                    menuOpen ? 0 : -1
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
            className={styles.mobileFooter}
          >
            <div>
              <span
                className={
                  styles.mobileMetaLabel
                }
              >
                Digital Creator
              </span>

              <span>{site.person}</span>
            </div>

            <div
              className={
                styles.mobileFooterRight
              }
            >
              <span>{site.location}</span>

              <span>
                © {site.year} {site.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}