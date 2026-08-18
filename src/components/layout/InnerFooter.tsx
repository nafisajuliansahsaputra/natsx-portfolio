"use client";

import Image from "next/image";
import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  site,
} from "@/data/site";

import styles from "./InnerFooter.module.css";

const navigation = [
  {
    label:
      "Work",

    href:
      "/work",
  },

  {
    label:
      "About",

    href:
      "/about",
  },

  {
    label:
      "Playground",

    href:
      "/playground",
  },

  {
    label:
      "Contact",

    href:
      "/contact",
  },
];

export default function InnerFooter() {
  const pathname =
    usePathname();

  const shouldRender =
    pathname ===
      "/work" ||
    pathname.startsWith(
      "/work/",
    ) ||
    pathname ===
      "/about" ||
    pathname ===
      "/playground" ||
    pathname ===
      "/contact";

  if (!shouldRender) {
    return null;
  }

  const fallbackSocial =
    site.socials.find(
      (social) =>
        social.label ===
        "LinkedIn",
    ) ??
    site.socials[0];

  const primaryContact =
    site.email
      ? {
          label:
            site.email,

          href:
            `mailto:${site.email}`,
        }
      : fallbackSocial
        ? {
            label:
              fallbackSocial.label,

            href:
              fallbackSocial.href,
          }
        : {
            label:
              "Contact",

            href:
              "/contact",
          };

  function scrollToTop() {
    window.scrollTo({
      top: 0,

      behavior:
        "smooth",
    });
  }

  return (
    <footer
      className={
        styles.footer
      }
    >
      <div className="site-container">
        <div
          className={
            styles.top
          }
        >
          <Link
            href="/"
            className={
              styles.brand
            }
            aria-label="NATSX home"
          >
            <Image
              src="/images/branding/natsx-logo-black.png"
              alt="NATSX"
              width={
                1110
              }
              height={
                380
              }
              className={
                styles.logo
              }
            />
          </Link>

          <nav
            className={
              styles.navigation
            }
            aria-label="Footer navigation"
          >
            {navigation.map(
              (
                item,
              ) => (
                <Link
                  href={
                    item.href
                  }
                  key={
                    item.href
                  }
                >
                  {
                    item.label
                  }
                </Link>
              ),
            )}
          </nav>
        </div>

        <div
          className={
            styles.bottom
          }
        >
          <div
            className={
              styles.meta
            }
          >
            <span
              className={
                styles.metaLabel
              }
            >
              Designed &
              built by
            </span>

            <span>
              {
                site.person
              }
            </span>
          </div>

          <div
            className={
              styles.meta
            }
          >
            <span
              className={
                styles.metaLabel
              }
            >
              Get in touch
            </span>

            <a
              href={
                primaryContact.href
              }
              className={
                styles.metaLink
              }
              target={
                primaryContact.href.startsWith(
                  "http",
                )
                  ? "_blank"
                  : undefined
              }
              rel={
                primaryContact.href.startsWith(
                  "http",
                )
                  ? "noreferrer"
                  : undefined
              }
            >
              {
                primaryContact.label
              }
            </a>
          </div>

          <div
            className={
              styles.meta
            }
          >
            <span
              className={
                styles.metaLabel
              }
            >
              Elsewhere
            </span>

            <div
              className={
                styles.socialLinks
              }
            >
              {site.socials.map(
                (
                  social,
                ) => (
                  <a
                    href={
                      social.href
                    }
                    key={
                      social.label
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {
                      social.label
                    }
                  </a>
                ),
              )}
            </div>
          </div>

          <div
            className={`${styles.meta} ${styles.right}`}
          >
            <div
              className={
                styles.copyright
              }
            >
              <span>
                ©{" "}
                {
                  site.year
                }{" "}
                {
                  site.name
                }
              </span>

              <span>
                {
                  site.location
                }
              </span>
            </div>

            <button
              type="button"
              className={
                styles.backToTop
              }
              onClick={
                scrollToTop
              }
            >
              Back to top

              <span
                aria-hidden="true"
              >
                ↑
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}