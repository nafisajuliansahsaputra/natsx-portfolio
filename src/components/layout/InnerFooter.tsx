import Link from "next/link";

import {
  site,
} from "@/data/site";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getMessages,
} from "@/i18n/messages";

import InnerFooterBackToTop from "./InnerFooterBackToTop";

import styles from "./InnerFooter.module.css";

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

type InnerFooterProps = {
  locale:
    Locale;

  isCv?:
    boolean;
};

export default function InnerFooter({
  locale,
  isCv = false,
}: InnerFooterProps) {
  const copy =
    getMessages(
      locale,
    );

  const fallbackSocial =
    site.socials.find(
      (
        social,
      ) =>
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
          <div
  className={
    styles.brandRow
  }
>
  <Link
    href={localizePath("/", locale)}
    className={
      styles.brand
    }
    aria-label={
      copy.accessibility
        .home
    }
  >
    <span
      className={
        styles.logo
      }
      aria-hidden="true"
    />
  </Link>

  <div
    className={
      styles.brandMeta
    }
  >
    <span>
      {
        site.role
      }
    </span>

    <span>
      {
        site.location
      }{" / "}
      {
        site.year
      }
    </span>
  </div>
</div>

          <nav
            className={
              styles.navigation
            }
            aria-label={
              copy.accessibility
                .footerNavigation
            }
          >
            {navigation.map(
              (
                item,
              ) => (
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
                >
                  {
                    copy.navigation[
                      item.key
                    ]
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
              <Link
                href={localizePath("/contact", locale)}
                className={
                  styles.metaLink
                }
              >
                {
                  primaryContact.label
                }
              </Link>
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

            {!isCv ? (
              <Link
                href={localizePath("/cv", locale)}
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
              </Link>
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
</div>

            <InnerFooterBackToTop
              label={
                copy.footer
                  .backToTop
              }
            />
          </div>
        </div>
      </div>
    </footer>
  );
}