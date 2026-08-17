import Image from "next/image";
import Link from "next/link";

import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div
        className={`site-container ${styles.inner}`}
      >
        <div className={styles.content}>
          <div
            className={
              styles.contentInner
            }
          >
            <p className={styles.eyebrow}>
              <span
                className={
                  styles.eyebrowDot
                }
              />

              Nafisa Juliansah Saputra |
              Digital Creator
            </p>

            <h1 className={styles.title}>
              <span
                className={
                  styles.titleLine
                }
              >
                <strong>Designing</strong>{" "}
                <span
                  className={
                    styles.titleLight
                  }
                >
                  Ideas
                </span>
              </span>

              <span
                className={
                  styles.titleLine
                }
              >
                <span
                  className={
                    styles.titleLight
                  }
                >
                  Into
                </span>{" "}
                <strong>
                  Experience
                  <span
                    className={
                      styles.titleAccent
                    }
                  >
                    .
                  </span>
                </strong>
              </span>
            </h1>

            <div className={styles.intro}>
              <p
                className={
                  styles.description
                }
              >
                Multidisciplinary digital
                creator working across
                design, development, motion,
                and visual experiences.
              </p>

              <div
                className={styles.actions}
              >
                <a
                  href="#work"
                  className={
                    styles.primaryLink
                  }
                >
                  <span>
                    Selected Work
                  </span>

                  <span
                    className={
                      styles.arrow
                    }
                  >
                    ↘
                  </span>
                </a>

                <Link
                  href="/about"
                  className={
                    styles.secondaryLink
                  }
                >
                  <span>About Me</span>

                  <span
                    className={
                      styles.arrow
                    }
                  >
                    ↗
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div
            className={styles.accentPlus}
            aria-hidden="true"
          >
            <span />
            <span />
          </div>

          <div
            className={`${styles.shape} ${styles.shapeCircle}`}
            aria-hidden="true"
          />

          <div
            className={`${styles.shape} ${styles.shapeArch}`}
            aria-hidden="true"
          />

          <div className={styles.portrait}>
            <Image
              src="/images/natsx-portrait-hero.png"
              alt="Portrait of Nafisa Juliansah Saputra"
              fill
              priority
              sizes="(max-width: 960px) 100vw, 42vw"
              className={
                styles.portraitImage
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}