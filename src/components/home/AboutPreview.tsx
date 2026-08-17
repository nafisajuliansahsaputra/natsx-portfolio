import Link from "next/link";

import styles from "./AboutPreview.module.css";

export default function AboutPreview() {
  return (
    <section
      className={styles.section}
      id="about"
    >
      <div className="site-container">
        <div className={styles.top}>
          <div
            className={
              styles.sectionLabel
            }
          >
            <span className={styles.dot} />
            <span>04 / About</span>
          </div>
        </div>

        <div className={styles.main}>
          <h2 className={styles.heading}>
            I&apos;m Nafisa—
            <br />
            the person
            <br />
            behind <span>NATSX</span>.
          </h2>

          <div className={styles.content}>
            <p className={styles.lead}>
              A multidisciplinary digital
              creator working across design,
              development, motion, and visual
              storytelling.
            </p>

            <p className={styles.body}>
              I enjoy taking ideas from
              something abstract into
              something people can actually
              see, use, and
              experience—combining different
              disciplines instead of treating
              them as separate parts.
            </p>

            <Link
              href="/about"
              className={styles.link}
            >
              <span>More About Me</span>

              <span
                className={styles.arrow}
              >
                ↗
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.meta}>
            <span
              className={
                styles.metaLabel
              }
            >
              Based in
            </span>

            <span>Indonesia</span>
          </div>

          <div className={styles.meta}>
            <span
              className={
                styles.metaLabel
              }
            >
              Role
            </span>

            <span>Digital Creator</span>
          </div>

          <div className={styles.meta}>
            <span
              className={
                styles.metaLabel
              }
            >
              Creative Identity
            </span>

            <span>NATSX</span>
          </div>

          <div
            className={styles.mark}
            aria-hidden="true"
          >
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}