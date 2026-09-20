import "@/app/contact-motion.css";
import "@/app/contact-email-fit.css";

import Link from "next/link";

import InnerFooter from "@/components/layout/InnerFooter";
import SiteHeader from "@/components/layout/SiteHeader";

import {
  site,
} from "@/data/site";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getContactMessages,
} from "@/i18n/contact-messages";

import {
  createPageMetadata,
} from "@/lib/page-metadata";

import ContactConversionPolish from "./ContactConversionPolish";
import ContactMagneticSurface from "./ContactMagneticSurface";

import styles from "./Contact.module.css";

const description =
  `Get in touch with ${site.person} / ${site.name} for selected freelance work, collaborations, and creative projects.`;

export const metadata =
  createPageMetadata({
    title:
      "Contact",

    description,

    path:
      "/contact",
  });

export function ContactPageContent({
  locale,
}: {
  locale: Locale;
}) {
  const copy =
    getContactMessages(
      locale,
    );

  const emailParts =
    site.email
      ? site.email.split(
          "@",
        )
      : [];

  const emailLocal =
    emailParts[0] ??
    "";

  const emailDomain =
    emailParts[1] ??
    "";

  const heroLineTwoWords =
    copy.hero
      .headingLine2
      .trim()
      .split(
        /\s+/,
      );

  const heroFinalWord =
    heroLineTwoWords.at(
      -1,
    ) ??
    "";

  const heroLineTwoLead =
    heroLineTwoWords
      .slice(
        0,
        -1,
      )
      .join(
        " ",
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
            copy.primary
              .email,

          lineOne:
            emailLocal,

          lineTwo:
            emailDomain
              ? `@${emailDomain}`
              : "",

          href:
            `mailto:${site.email}`,
        }
      : fallbackSocial
        ? {
            label:
              fallbackSocial.label,

            lineOne:
              fallbackSocial.username,

            lineTwo:
              copy.primary
                .connect,

            href:
              fallbackSocial.href,
          }
        : {
            label:
              copy.primary
                .portfolio,

            lineOne:
              copy.primary
                .explore,

            lineTwo:
              copy.primary
                .work,

            href:
              "/work",
          };

  const primaryIsExternal =
    primaryContact.href.startsWith(
      "http",
    );

  const primaryIsInternal =
    primaryContact.href.startsWith(
      "/",
    );

  const primaryContent = (
    <>
      <span
        className={
          styles.emailLabel
        }
        data-motion-piece="label"
      >
        {
          primaryContact.label
        }
      </span>

      <span
        className={
          styles.emailAddress
        }
        data-motion-piece="address"
      >
        {
          primaryContact.lineOne
        }

        {primaryContact.lineTwo ? (
          <>
            <br />

            {
              primaryContact.lineTwo
            }
          </>
        ) : null}
      </span>

      <span
        className={
          styles.emailArrow
        }
        aria-hidden="true"
        data-motion-piece="arrow"
      >
        ↗
      </span>
    </>
  );

  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className={
          styles.page
        }
        data-motion-page="contact"
        data-contact-conversion-root
      >
        <section
          className={
            styles.hero
          }
        >
          <div className="site-container">
            <div
              className={
                styles.heroTop
              }
              data-motion-contact-hero-piece="top"
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
                    copy.hero
                      .label
                  }
                  {" / "}
                  {
                    site.name
                  }
                </span>
              </div>

              <span
                className={
                  styles.heroMeta
                }
              >
                {
                  site.location
                }
                {" / "}
                {
                  copy.hero
                    .worldwide
                }
              </span>
            </div>

            <div
              className={
                styles.heroMain
              }
            >
              <h1
                className={
                  styles.heading
                }
                data-motion-contact-hero-piece="title"
              >
                {
                  copy.hero
                    .headingLine1
                }

                <br />

                {heroLineTwoLead ? (
                  <>
                    {
                      heroLineTwoLead
                    }
                    {" "}
                  </>
                ) : null}

                <span
                  data-contact-question-cluster="true"
                >
                  {
                    heroFinalWord
                  }

                  <span
                    data-contact-question-mark="true"
                  >
                    ?
                  </span>
                </span>
              </h1>

              <div
                className={
                  styles.heroIntro
                }
                data-motion-contact-hero-piece="intro"
              >
                <p>
                  {
                    copy.hero
                      .description
                  }
                </p>

                <span>
                  {
                    copy.hero
                      .disciplinesLine1
                  }

                  <br />

                  {
                    copy.hero
                      .disciplinesLine2
                  }
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.primaryContact
          }
          data-contact-primary-stage
        >
          <div className="site-container">
            <div
              className={
                styles.primaryHeader
              }
              data-motion-scroll="contact-primary-header"
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
                    copy.primary
                      .label
                  }
                </span>
              </div>

              <span
                className={
                  styles.primaryHint
                }
              >
                {
                  copy.primary
                    .hint
                }
              </span>
            </div>

            <ContactMagneticSurface>
              {primaryIsInternal ? (
                <Link
                  href={
                    localizePath(
                      primaryContact.href,
                      locale,
                    )
                  }
                  className={
                    styles.emailLink
                  }
                >
                  {
                    primaryContent
                  }
                </Link>
              ) : (
                <a
                  href={
                    primaryContact.href
                  }
                  className={
                    styles.emailLink
                  }
                  target={
                    primaryIsExternal
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    primaryIsExternal
                      ? "noreferrer"
                      : undefined
                  }
                >
                  {
                    primaryContent
                  }
                </a>
              )}
            </ContactMagneticSurface>
          </div>
        </section>

        <section
          className={
            styles.details
          }
        >
          <div className="site-container">
            <div
              className={
                styles.detailsGrid
              }
            >
              <div
                className={
                  styles.availability
                }
                data-motion-scroll="contact-availability"
              >
                <div
                  className={
                    styles.sectionLabel
                  }
                  data-motion-piece="label"
                >
                  <span
                    className={
                      styles.dot
                    }
                  />

                  <span>
                    {
                      copy.availability
                        .label
                    }
                  </span>
                </div>

                <div
                  className={
                    styles.availabilityMain
                  }
                  data-motion-piece="content"
                >
                  <div
                    className={
                      styles.status
                    }
                  >
                    <span
                      className={
                        styles.statusDot
                      }
                      data-contact-status-dot
                    />

                    <span>
                      {copy
                        .availability
                        .statusLines
                        .map(
                          (
                            line,
                            index,
                          ) => (
                            <span
                              key={
                                line
                              }
                            >
                              {
                                line
                              }

                              {index <
                                copy
                                  .availability
                                  .statusLines
                                  .length -
                                  1 && (
                                <br />
                              )}
                            </span>
                          ),
                        )}
                    </span>
                  </div>

                  <p>
                    {
                      copy.availability
                        .description
                    }
                  </p>
                </div>

                <div
                  className={
                    styles.contactCv
                  }
                >
                  <span>
                    {
                      copy.availability
                        .professionalProfile
                    }
                  </span>

                  <Link
                    href={localizePath("/cv", locale)}
                    className={
                      styles.contactCvLink
                    }
                    data-contact-interactive-link
                  >
                    {
                      copy.availability
                        .viewCv
                    }

                    <span
                      aria-hidden="true"
                      data-contact-link-arrow
                    >
                      ↗
                    </span>
                  </Link>
                </div>
              </div>

              <div
                className={
                  styles.collaboration
                }
                data-motion-scroll="contact-collaboration"
              >
                <div
                  className={
                    styles.sectionLabel
                  }
                  data-motion-piece="label"
                >
                  <span
                    className={
                      styles.dot
                    }
                  />

                  <span>
                    {
                      copy.collaboration
                        .label
                    }
                  </span>
                </div>

                <div
                  className={
                    styles.collaborationList
                  }
                >
                  {copy
                    .collaboration
                    .items
                    .map(
                      (
                        item,
                        index,
                      ) => (
                        <div
                          className={
                            styles.collaborationItem
                          }
                          key={
                            item
                          }
                          data-motion-piece="item"
                          data-contact-interactive-row="collaboration"
                          data-contact-row-active="false"
                        >
                          <span
                            data-contact-row-number
                          >
                            {String(
                              index +
                                1,
                            ).padStart(
                              2,
                              "0",
                            )}
                          </span>

                          <p
                            data-contact-row-title
                          >
                            {
                              item
                            }
                          </p>
                        </div>
                      ),
                    )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.socialSection
          }
        >
          <div className="site-container">
            <div
              className={
                styles.socialHeader
              }
              data-motion-scroll="contact-social-header"
            >
              <div
                className={
                  styles.label
                }
                data-motion-piece="label"
              >
                <span
                  className={
                    styles.darkDot
                  }
                />

                <span>
                  {
                    copy.social
                      .label
                  }
                </span>
              </div>

              <p
                data-motion-piece="title"
              >
                {
                  copy.social
                    .headingLine1
                }

                <br />

                {
                  copy.social
                    .headingLine2
                }

                <span>
                  .
                </span>
              </p>
            </div>

            <div
              className={
                styles.socialList
              }
            >
              {site.socials.map(
                (
                  social,
                  index,
                ) => (
                  <a
                    href={
                      social.href
                    }
                    className={
                      styles.socialItem
                    }
                    key={
                      social.label
                    }
                    target="_blank"
                    rel="noreferrer"
                    data-motion-scroll="contact-social-item"
                    data-contact-interactive-row="social"
                    data-contact-row-active="false"
                  >
                    <span
                      className={
                        styles.socialNumber
                      }
                      data-contact-row-number
                    >
                      {String(
                        index +
                          1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <span
                      className={
                        styles.socialName
                      }
                      data-contact-row-title
                    >
                      {
                        social.label
                      }
                    </span>

                    <span
                      className={
                        styles.socialUsername
                      }
                      data-contact-row-meta
                    >
                      {
                        social.username
                      }
                    </span>

                    <span
                      className={
                        styles.socialArrow
                      }
                      aria-hidden="true"
                      data-contact-row-arrow
                    >
                      ↗
                    </span>
                  </a>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          className={
            styles.closing
          }
        >
          <div className="site-container">
            <div
              className={
                styles.closingGrid
              }
              data-motion-scroll="contact-closing"
            >
              <div
                className={
                  styles.closingLabel
                }
                data-motion-piece="label"
              >
                <span
                  className={
                    styles.dot
                  }
                />

                <span>
                  {
                    copy.closing
                      .label
                  }
                </span>
              </div>

              <div
                className={
                  styles.closingMain
                }
                data-motion-piece="main"
              >
                <p>
                  {
                    copy.closing
                      .headingLine1
                  }

                  <br />

                  {
                    copy.closing
                      .headingLine2
                  }

                  <span>
                    .
                  </span>
                </p>

                <Link
                  href={localizePath("/work", locale)}
                  className={
                    styles.closingLink
                  }
                  data-contact-interactive-link
                >
                  {
                    copy.closing
                      .action
                  }

                  <span
                    data-contact-link-arrow
                  >
                    ↗
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <ContactConversionPolish />
      </main>

      <InnerFooter />
    </>
  );
}

export default function ContactPage() {
  return (
    <ContactPageContent
      locale="en"
    />
  );
}