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

import styles from "./AboutPreview.module.css";

type AboutPreviewProps = {
  locale: Locale;
};

export default function AboutPreview({
  locale,
}: AboutPreviewProps) {
  const copy =
    getHomeMessages(
      locale,
    ).about;

  const sharedCopy =
    getMessages(
      locale,
    );

  return (
    <section
      className={
        styles.section
      }
      id="about"
    >
      <div className="site-container">
        <div
          className={
            styles.top
          }
        >
          <div
            className={
              styles.sectionLabel
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
        </div>

        <div
          className={
            styles.main
          }
        >
          <h2
            className={
              styles.heading
            }
          >
            {
              copy.headingPrefix
            }{" "}
            {
              site.firstName
            }
            —
            <br />

            {
              copy.headingLine2
            }

            <br />

            {
              copy.headingLine3
            }{" "}

            <span>
              NATSX
            </span>
            .
          </h2>

          <div
            className={
              styles.content
            }
          >
            <p
              className={
                styles.lead
              }
            >
              {
                copy.lead
              }
            </p>

            <p
              className={
                styles.body
              }
            >
              {
                copy.body
              }
            </p>

            <div
              className={
                styles.actions
              }
            >
              <LocaleLink
                href="/about"
                className={
                  styles.link
                }
              >
                <span>
                  {
                    copy.moreAbout
                  }
                </span>

                <span
                  className={
                    styles.arrow
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>
              </LocaleLink>

              <LocaleLink
                href="/cv"
                className={`${styles.link} ${styles.cvLink}`}
              >
                <span>
                  {
                    copy.viewCv
                  }
                </span>

                <span
                  className={
                    styles.cvArrow
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>
              </LocaleLink>
            </div>
          </div>
        </div>

        <div
          className={
            styles.footer
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
                copy.basedIn
              }
            </span>

            <span>
              {
                site.location
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
                copy.role
              }
            </span>

            <span>
              {
                sharedCopy
                  .identity
                  .digitalCreator
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
                copy.creativeIdentity
              }
            </span>

            <span>
              {
                site.name
              }
            </span>
          </div>

          <div
            className={
              styles.mark
            }
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