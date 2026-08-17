"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Work",
    href: "/work",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Playground",
    href: "/playground",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function SiteHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/work") {
      return pathname === "/work" || pathname.startsWith("/work/");
    }

    return pathname === href;
  }

  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link
          href="/"
          className="site-logo"
          aria-label="NATSX home"
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
            const active = isActive(item.href);

            return (
              <Link
                href={item.href}
                key={item.href}
                className={active ? "site-nav__link is-active" : "site-nav__link"}
                aria-current={active ? "page" : undefined}
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
          aria-label="Open navigation menu"
        >
          Menu
        </button>
      </div>
    </header>
  );
}