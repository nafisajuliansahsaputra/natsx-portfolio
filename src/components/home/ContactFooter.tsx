import Image from "next/image";
import Link from "next/link";

import { site } from "@/data/site";

import styles from "./ContactFooter.module.css";

const contactLinks = [
  {
    label: "Email",
    href: `mailto:${site.email}`,
  },

  ...site.socials.map((social) => ({
    label: social.label,
    href: social.href,
  })),
];

export default function ContactFooter() {
  return (
    <section
      className={styles.section}
      id="contact"
    >
      <div className="site-container">
        <div className={styles.top}>
          <div className={styles.label}>
            <span className={styles.dot} />
            <span>06 / Contact</span>
          </div>

          <span
            className={styles.availability}
          >
            {site.availability.statusLines.join(
              " ",
            )}
          </span>
        </div>

        <div className={styles.main}>
          <p className={styles.eyebrow}>
            Have an idea?
          </p>

          <Link
            href="/contact"
            className={styles.mainLink}
          >
            <h2 className={styles.heading}>
              Let&apos;s make
              <br />
              something worth
              <br />
              experiencing
              <span>.</span>
            </h2>

            <span
              className={styles.mainArrow}
            >
              ↗
            </span>
          </Link>
        </div>

        <div className={styles.contactRow}>
          <p
            className={styles.contactIntro}
          >
            For collaborations, freelance
            work, creative projects, or just a
            good conversation.
          </p>

          <div className={styles.socials}>
            {contactLinks.map((item) => (
              <a
                href={item.href}
                key={item.label}
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
                <span>{item.label}</span>

                <span
                  className={
                    styles.socialArrow
                  }
                >
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.brand}>
            <Image
              src="/images/branding/natsx-logo-black.png"
              alt="NATSX"
              width={1110}
              height={380}
              className={styles.logo}
            />
          </div>

          <div
            className={styles.footerMeta}
          >
            <div>
              <span
                className={
                  styles.metaLabel
                }
              >
                Designed & built by
              </span>

              <span>{site.person}</span>
            </div>

            <div>
              <span
                className={
                  styles.metaLabel
                }
              >
                Portfolio
              </span>

              <span>
                {site.name} / {site.role}
              </span>
            </div>

            <div
              className={styles.copyright}
            >
              <span>
                © {site.year} {site.name}
              </span>

              <span>{site.location}</span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}