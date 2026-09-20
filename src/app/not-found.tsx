"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  site,
} from "@/data/site";

import {
  getLocaleFromPathname,
  localizePath,
} from "@/i18n/config";

import {
  getSystemMessages,
} from "@/i18n/system-messages";

import styles from "./NotFound.module.css";

export default function NotFound() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const copy =
    getSystemMessages(
      locale,
    ).notFound;

  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className={
          styles.page
        }
        data-motion-page="not-found"
      >
        <div className="site-container">
          <div
            className={
              styles.top
            }
            data-motion-not-found-piece="top"
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
                  copy.label
                }
              </span>
            </div>

            <span
              className={
                styles.status
              }
            >
              {
                copy.status
              }
            </span>
          </div>

          <div
            className={
              styles.main
            }
          >
            <div
              className={
                styles.number
              }
              aria-hidden="true"
              data-motion-not-found-piece="number"
            >
              404
              <span>
                .
              </span>
            </div>

            <div
              className={
                styles.message
              }
            >
              <p
                className={
                  styles.eyebrow
                }
                data-motion-not-found-piece="eyebrow"
              >
                {
                  copy.eyebrow
                }
              </p>

              <h1
                data-motion-not-found-piece="title"
              >
                {
                  copy.headingLine1
                }

                <br />

                {
                  copy.headingLine2
                }

                <br />

                {
                  copy.headingLine3
                }

                <span>
                  .
                </span>
              </h1>

              <p
                className={
                  styles.description
                }
                data-motion-not-found-piece="description"
              >
                {
                  copy.description
                }
              </p>

              <div
                className={
                  styles.actions
                }
                data-motion-not-found-piece="actions"
              >
                <Link
                  href={localizePath("/", locale)}
                  className={
                    styles.primaryAction
                  }
                >
                  {
                    copy.backHome
                  }

                  <span
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </Link>

                <Link
                  href={localizePath("/work", locale)}
                  className={
                    styles.secondaryAction
                  }
                >
                  {
                    copy.exploreWork
                  }

                  <span
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div
            className={
              styles.bottom
            }
            data-motion-not-found-piece="bottom"
          >
            <span>
              {
                site.person
              }
            </span>

            <span
              className={
                styles.plus
              }
              aria-hidden="true"
            >
              +
            </span>

            <span>
              {
                copy.identity
              }
            </span>
          </div>
        </div>
      </main>
    </>
  );
}