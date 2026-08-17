import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import { site } from "@/data/site";

import styles from "./Contact.module.css";

export const metadata: Metadata = {
  title: "Contact",

  description: `Get in touch with ${site.person} / ${site.name} for selected freelance work, collaborations, and creative projects.`,
};

export default function ContactPage() {
  const [emailLocal, emailDomain] =
    site.email.split("@");

  return (
    <>
      <SiteHeader />

      <main
        className={styles.page}
        data-motion-page="contact"
      >
        {/* =========================
            HERO
        ========================= */}

        <section className={styles.hero}>
          <div className="site-container">
            <div
              className={styles.heroTop}
              data-motion-contact-hero-piece="top"
            >
              <div className={styles.label}>
                <span className={styles.dot} />

                <span>
                  Contact / {site.name}
                </span>
              </div>

              <span
                className={styles.heroMeta}
              >
                {site.location} /{" "}
                {site.availability.scope}
              </span>
            </div>

            <div className={styles.heroMain}>
              <h1
                className={styles.heading}
                data-motion-contact-hero-piece="title"
              >
                Have an idea
                <br />
                worth exploring
                <span>?</span>
              </h1>

              <div
                className={styles.heroIntro}
                data-motion-contact-hero-piece="intro"
              >
                <p>
                  I&apos;m open to selected
                  freelance work, creative
                  collaborations, and digital
                  projects where different
                  disciplines can come
                  together.
                </p>

                <span>
                  Design / Development
                  <br />
                  Motion / Creative Direction
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            PRIMARY CONTACT
        ========================= */}

        <section
          className={styles.primaryContact}
        >
          <div className="site-container">
            <div
              className={styles.primaryHeader}
              data-motion-scroll="contact-primary-header"
            >
              <div className={styles.label}>
                <span className={styles.dot} />

                <span>
                  Start a conversation
                </span>
              </div>

              <span
                className={styles.primaryHint}
              >
                Best way to reach me
              </span>
            </div>

            <a
              href={`mailto:${site.email}`}
              className={styles.emailLink}
              data-motion-scroll="contact-email"
            >
              <span
                className={styles.emailLabel}
                data-motion-piece="label"
              >
                Email
              </span>

              <span
                className={styles.emailAddress}
                data-motion-piece="address"
              >
                {emailLocal}

                {emailDomain && (
                  <>
                    <br />@{emailDomain}
                  </>
                )}
              </span>

              <span
                className={styles.emailArrow}
                aria-hidden="true"
                data-motion-piece="arrow"
              >
                ↗
              </span>
            </a>
          </div>
        </section>

        {/* =========================
            DETAILS
        ========================= */}

        <section className={styles.details}>
          <div className="site-container">
            <div
              className={styles.detailsGrid}
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
                    className={styles.dot}
                  />

                  <span>Availability</span>
                </div>

                <div
                  className={
                    styles.availabilityMain
                  }
                  data-motion-piece="content"
                >
                  <div
                    className={styles.status}
                  >
                    <span
                      className={
                        styles.statusDot
                      }
                    />

                    <span>
                      {site.availability.statusLines.map(
                        (line, index) => (
                          <span key={line}>
                            {line}

                            {index <
                              site.availability
                                .statusLines
                                .length -
                                1 && <br />}
                          </span>
                        ),
                      )}
                    </span>
                  </div>

                  <p>
                    {
                      site.availability
                        .description
                    }
                  </p>
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
                    className={styles.dot}
                  />

                  <span>
                    What we could make
                  </span>
                </div>

                <div
                  className={
                    styles.collaborationList
                  }
                >
                  {site.collaborationTypes.map(
                    (item, index) => (
                      <div
                        className={
                          styles.collaborationItem
                        }
                        key={item}
                        data-motion-piece="item"
                      >
                        <span>
                          {String(
                            index + 1,
                          ).padStart(2, "0")}
                        </span>

                        <p>{item}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            SOCIAL
        ========================= */}

        <section
          className={styles.socialSection}
        >
          <div className="site-container">
            <div
              className={styles.socialHeader}
              data-motion-scroll="contact-social-header"
            >
              <div
                className={styles.label}
                data-motion-piece="label"
              >
                <span
                  className={styles.darkDot}
                />

                <span>Elsewhere</span>
              </div>

              <p data-motion-piece="title">
                A few other places
                <br />
                you can find me
                <span>.</span>
              </p>
            </div>

            <div
              className={styles.socialList}
            >
              {site.socials.map(
                (social, index) => (
                  <a
                    href={social.href}
                    className={
                      styles.socialItem
                    }
                    key={social.label}
                    target={
                      social.href.startsWith(
                        "http",
                      )
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      social.href.startsWith(
                        "http",
                      )
                        ? "noreferrer"
                        : undefined
                    }
                    data-motion-scroll="contact-social-item"
                  >
                    <span
                      className={
                        styles.socialNumber
                      }
                    >
                      {String(
                        index + 1,
                      ).padStart(2, "0")}
                    </span>

                    <span
                      className={
                        styles.socialName
                      }
                    >
                      {social.label}
                    </span>

                    <span
                      className={
                        styles.socialUsername
                      }
                    >
                      {social.username}
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
        </section>

        {/* =========================
            CLOSING
        ========================= */}

        <section className={styles.closing}>
          <div className="site-container">
            <div
              className={styles.closingGrid}
              data-motion-scroll="contact-closing"
            >
              <div
                className={
                  styles.closingLabel
                }
                data-motion-piece="label"
              >
                <span className={styles.dot} />

                <span>
                  Still exploring?
                </span>
              </div>

              <div
                className={
                  styles.closingMain
                }
                data-motion-piece="main"
              >
                <p>
                  Take a look at
                  <br />
                  what I&apos;ve been making
                  <span>.</span>
                </p>

                <Link
                  href="/work"
                  className={
                    styles.closingLink
                  }
                >
                  Explore the work
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}