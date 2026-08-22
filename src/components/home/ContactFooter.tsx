import Image from "next/image";

import LocaleLink from "@/components/i18n/LocaleLink";

import {
  site,
} from "@/data/site";

import type {
  Locale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import {
  getMessages,
} from "@/i18n/messages";

import styles from "./ContactFooter.module.css";

const contactLinks = [
  ...(site.email
    ? [
        {
          label:
            "Email",

          href:
            `mailto:${site.email}`,
        },
      ]
    : []),

  ...site.socials.map(
    (
      social,
    ) => ({
      label:
        social.label,

      href:
        social.href,
    }),
  ),
];

type ContactFooterProps = {
  locale: Locale;
};

export default function ContactFooter({
  locale,
}: ContactFooterProps) {
  const copy =
    getHomeMessages(
      locale,
    ).contact;

  const sharedCopy =
    getMessages(
      locale,
    );

  return (
    <section
      className={
        styles.section
      }
      id="contact"
    >
      <div className="site-container">
        <div
          className={
            styles.top
          }
        >
          <div
            className={
              styles.label
            }
          >
            <span
              className={
                styles.dot
              }
            />

            <span>
              {
                copy.sectionLabel
              }
            </span>
          </div>

          <span
            className={
              styles.availability
            }
          >
            {
              copy.availability
            }
          </span>
        </div>

        <div
          className={
            styles.main
          }
        >
          <p
            className={
              styles.eyebrow
            }
          >
            {
              copy.eyebrow
            }
          </p>

          <LocaleLink
            href="/contact"
            className={
              styles.mainLink
            }
          >
            <h2
              className={
                styles.heading
              }
            >
              <span
                className={
                  styles.headingLine
                }
              >
                {
                  copy.headingLine1
                }
              </span>

              <span
                className={
                  styles.headingLine
                }
              >
                {
                  copy.headingLine2
                }
              </span>

              <span
                className={
                  styles.headingLine
                }
              >
                {
                  copy.headingLine3
                }

                <span
                  className={
                    styles.headingAccent
                  }
                >
                  .
                </span>
              </span>
            </h2>

            <span
              className={
                styles.mainArrow
              }
              aria-hidden="true"
            >
              ↗
            </span>
          </LocaleLink>
        </div>

        <div
          className={
            styles.contactRow
          }
        >
          <p
            className={
              styles.contactIntro
            }
          >
            {
              copy.intro
            }
          </p>

          <div
            className={
              styles.socials
            }
          >
            {contactLinks.map(
              (
                item,
              ) => (
                <a
                  href={
                    item.href
                  }
                  key={
                    item.label
                  }
                  target={
                    item.href.startsWith(
                      "http",
                    )
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    item.href.startsWith(
                      "http",
                    )
                      ? "noreferrer"
                      : undefined
                  }
                >
                  <span>
                    {
                      item.label
                    }
                  </span>

                  <span
                    className={
                      styles.socialArrow
                    }
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              ),
            )}
          </div>
        </div>

        <footer
          className={
            styles.footer
          }
        >
          <div
            className={
              styles.brand
            }
          >
            <Image
              src="/images/branding/natsx-logo-black.png"
              alt="NATSX"
              width={1110}
              height={380}
              className={
                styles.logo
              }
            />
          </div>

          <div
            className={
              styles.footerMeta
            }
          >
            <div>
              <span
                className={
                  styles.metaLabel
                }
              >
                {
                  copy.designedBy
                }
              </span>

              <span>
                {
                  site.person
                }
              </span>
            </div>

            <div>
              <span
                className={
                  styles.metaLabel
                }
              >
                {
                  copy.portfolio
                }
              </span>

              <span>
                {
                  site.name
                }{" "}
                /{" "}
                {
                  sharedCopy
                    .identity
                    .digitalCreator
                }
              </span>
            </div>

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
          </div>
        </footer>
      </div>
    </section>
  );
}