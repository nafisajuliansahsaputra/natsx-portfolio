import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import styles from "./Contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Nafisa Juliansah Saputra / NATSX for selected freelance work, collaborations, and creative projects.",
};

const collaborationTypes = [
  "Digital Products",
  "Web Experiences",
  "UI / UX Design",
  "Brand Identity",
  "Creative Direction",
  "Motion & Visuals",
];

const socials = [
  {
    label: "LinkedIn",
    username: "Nafisa Juliansah Saputra",
    href: "#",
  },
  {
    label: "Instagram",
    username: "@natsx",
    href: "#",
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="site-container">
            <div className={styles.heroTop}>
              <div className={styles.label}>
                <span className={styles.dot} />
                <span>Contact / NATSX</span>
              </div>

              <span className={styles.heroMeta}>
                Indonesia / Available Worldwide
              </span>
            </div>

            <div className={styles.heroMain}>
              <h1 className={styles.heading}>
                Have an idea
                <br />
                worth exploring<span>?</span>
              </h1>

              <div className={styles.heroIntro}>
                <p>
                  I&apos;m open to selected freelance work, creative
                  collaborations, and digital projects where different
                  disciplines can come together.
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

        <section className={styles.primaryContact}>
          <div className="site-container">
            <div className={styles.primaryHeader}>
              <div className={styles.label}>
                <span className={styles.dot} />
                <span>Start a conversation</span>
              </div>

              <span className={styles.primaryHint}>
                Best way to reach me
              </span>
            </div>

            <a
              href="mailto:your-email@example.com"
              className={styles.emailLink}
            >
              <span className={styles.emailLabel}>Email</span>

              <span className={styles.emailAddress}>
                your-email
                <br />
                @example.com
              </span>

              <span
                className={styles.emailArrow}
                aria-hidden="true"
              >
                ↗
              </span>
            </a>
          </div>
        </section>

        <section className={styles.details}>
          <div className="site-container">
            <div className={styles.detailsGrid}>
              <div className={styles.availability}>
                <div className={styles.sectionLabel}>
                  <span className={styles.dot} />
                  <span>Availability</span>
                </div>

                <div className={styles.availabilityMain}>
                  <div className={styles.status}>
                    <span className={styles.statusDot} />

                    <span>
                      Open to selected
                      <br />
                      opportunities
                    </span>
                  </div>

                  <p>
                    For projects with a clear idea, interesting problem,
                    or enough room to create something thoughtful.
                  </p>
                </div>
              </div>

              <div className={styles.collaboration}>
                <div className={styles.sectionLabel}>
                  <span className={styles.dot} />
                  <span>What we could make</span>
                </div>

                <div className={styles.collaborationList}>
                  {collaborationTypes.map((item, index) => (
                    <div
                      className={styles.collaborationItem}
                      key={item}
                    >
                      <span>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.socialSection}>
          <div className="site-container">
            <div className={styles.socialHeader}>
              <div className={styles.label}>
                <span className={styles.darkDot} />
                <span>Elsewhere</span>
              </div>

              <p>
                A few other places
                <br />
                you can find me<span>.</span>
              </p>
            </div>

            <div className={styles.socialList}>
              {socials.map((social, index) => (
                <a
                  href={social.href}
                  className={styles.socialItem}
                  key={social.label}
                  target={
                    social.href.startsWith("http")
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    social.href.startsWith("http")
                      ? "noreferrer"
                      : undefined
                  }
                >
                  <span className={styles.socialNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className={styles.socialName}>
                    {social.label}
                  </span>

                  <span className={styles.socialUsername}>
                    {social.username}
                  </span>

                  <span
                    className={styles.socialArrow}
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className="site-container">
            <div className={styles.closingGrid}>
              <div className={styles.closingLabel}>
                <span className={styles.dot} />
                <span>Still exploring?</span>
              </div>

              <div className={styles.closingMain}>
                <p>
                  Take a look at
                  <br />
                  what I&apos;ve been making<span>.</span>
                </p>

                <Link
                  href="/work"
                  className={styles.closingLink}
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