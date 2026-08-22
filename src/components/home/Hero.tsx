import Link from "next/link";

import {
  site,
} from "@/data/site";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import {
  getMessages,
} from "@/i18n/messages";

import HeroVisual from "./HeroVisual";

import styles from "./Hero.module.css";

type HeroProps = {
  locale: Locale;
};

export default function Hero({
  locale,
}: HeroProps) {
  const copy =
    getHomeMessages(
      locale,
    );

  const sharedCopy =
    getMessages(
      locale,
    );

  return (
    <section
      className={
        styles.hero
      }
      data-home-hero
      data-ambient-active="false"
    >
      <div
        className={`site-container ${styles.inner}`}
      >
        <div
          className={
            styles.content
          }
        >
          <div
            className={
              styles.contentInner
            }
          >
            <p
              className={
                styles.eyebrow
              }
              data-motion-hero-piece="eyebrow"
            >
              <span
                className={
                  styles.eyebrowDot
                }
              />

              {
                site.person
              }{" "}
              |{" "}
              {
                sharedCopy
                  .identity
                  .digitalCreator
              }
            </p>

            <h1
              className={
                styles.title
              }
              data-motion-hero-piece="title"
            >
              <span
                className={
                  styles.titleLine
                }
              >
                <strong>
                  {
                    copy.hero
                      .titlePrimary
                  }
                </strong>{" "}

                <span
                  className={`${styles.titleLight} ${styles.kineticWord}`}
                >
                  {
                    copy.hero
                      .titleSecondary
                  }
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
                  {
                    copy.hero
                      .titleTertiary
                  }
                </span>{" "}

                <strong>
                  {
                    copy.hero
                      .titleQuaternary
                  }

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

            <div
              className={
                styles.intro
              }
              data-motion-hero-piece="intro"
            >
              <p
                className={
                  styles.description
                }
              >
                {
                  copy.hero
                    .description
                }
              </p>

              <div
                className={
                  styles.actions
                }
              >
                <a
                  href="#work"
                  className={
                    styles.primaryLink
                  }
                >
                  <span>
                    {
                      copy.hero
                        .selectedWork
                    }
                  </span>

                  <span
                    className={`${styles.arrow} ${styles.arrowDown}`}
                    aria-hidden="true"
                  >
                    ↘
                  </span>
                </a>

                <Link
                  href={
                    localizePath(
                      "/about",
                      locale,
                    )
                  }
                  className={
                    styles.secondaryLink
                  }
                >
                  <span>
                    {
                      copy.hero
                        .aboutMe
                    }
                  </span>

                  <span
                    className={`${styles.arrow} ${styles.arrowUp}`}
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <HeroVisual
          locale={
            locale
          }
        />
      </div>
    </section>
  );
}