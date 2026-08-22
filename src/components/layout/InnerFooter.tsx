"use client";

import {
  usePathname,
} from "next/navigation";

import LocaleLink from "@/components/i18n/LocaleLink";

import {
  getLocaleFromPathname,
  localizePath,
  stripLocaleFromPathname,
} from "@/i18n/config";

import {
  site,
} from "@/data/site";

import styles from "./InnerFooter.module.css";

import {
  getMessages,
} from "@/i18n/messages";

const navigation = [
  {
    key:
      "work",

    href:
      "/work",
  },

  {
    key:
      "about",

    href:
      "/about",
  },

  {
    key:
      "playground",

    href:
      "/playground",
  },

  {
    key:
      "contact",

    href:
      "/contact",
  },
] as const;

export default function InnerFooter() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

    const copy =
  getMessages(
    locale,
  );

  const basePath =
    stripLocaleFromPathname(
      pathname,
    );

  const shouldRender =
    basePath ===
      "/work" ||
    basePath.startsWith(
      "/work/",
    ) ||
    basePath ===
      "/about" ||
    basePath ===
      "/playground" ||
    basePath ===
      "/contact" ||
    basePath ===
      "/cv";

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
  copy.navigation
    .contact,

            href:
              localizePath(
                "/contact",
                locale,
              ),
          };

  const primaryContactIsInternal =
    primaryContact.href.startsWith(
      "/",
    );

  const primaryContactIsExternal =
    primaryContact.href.startsWith(
      "http",
    );

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
          <LocaleLink
            href="/"
            className={
              styles.brand
            }
            aria-label="NATSX home"
          >
            <span
              className={
                styles.logo
              }
              aria-hidden="true"
            />
          </LocaleLink>

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
                <LocaleLink
                  href={
                    item.href
                  }
                  key={
                    item.href
                  }
                >
                  {
  copy.navigation[
    item.key
  ]
}
                </LocaleLink>
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
              {
  copy.footer
    .designedBy
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
              styles.meta
            }
          >
            <span
              className={
                styles.metaLabel
              }
            >
              {
  copy.footer
    .getInTouch
}
            </span>

            {primaryContactIsInternal ? (
              <LocaleLink
                href="/contact"
                className={
                  styles.metaLink
                }
              >
                {
                  primaryContact.label
                }
              </LocaleLink>
            ) : (
              <a
                href={
                  primaryContact.href
                }
                className={
                  styles.metaLink
                }
                target={
                  primaryContactIsExternal
                    ? "_blank"
                    : undefined
                }
                rel={
                  primaryContactIsExternal
                    ? "noreferrer"
                    : undefined
                }
              >
                {
                  primaryContact.label
                }
              </a>
            )}
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
              {
  copy.footer
    .elsewhere
}
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
            className={`${styles.meta} ${styles.profileMeta}`}
          >
            <span
              className={
                styles.metaLabel
              }
            >
              {
  copy.footer
    .profile
}
            </span>

            {basePath !==
            "/cv" ? (
              <LocaleLink
                href="/cv"
                className={
                  styles.metaLink
                }
              >
                {
  copy.footer
    .viewCv
}

                <span
                  className={
                    styles.metaArrow
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>
              </LocaleLink>
            ) : (
              <span>
                CV / Resume
              </span>
            )}
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
              {
  copy.footer
    .backToTop
}

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