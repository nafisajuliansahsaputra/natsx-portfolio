"use client";

import {
  usePathname,
} from "next/navigation";

import LocaleLink from "@/components/i18n/LocaleLink";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  getLocaleFromPathname,
} from "@/i18n/config";

import {
  getSystemMessages,
} from "@/i18n/system-messages";

import styles from "./PublicRouteError.module.css";

export default function PublicRouteError({
  reset,
}: {
  reset:
    () => void;
}) {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const copy =
    getSystemMessages(
      locale,
    ).error;

  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className={
          styles.page
        }
      >
        <div className="site-container">
          <div
            className={
              styles.inner
            }
          >
            <div
              className={
                styles.eyebrow
              }
            >
              <span
                className={
                  styles.dot
                }
              />

              {
                copy.eyebrow
              }
            </div>

            <h1
              className={
                styles.heading
              }
            >
              {
                copy.headingLine1
              }

              <br />

              {
                copy.headingLine2
              }

              <span>
                .
              </span>
            </h1>

            <p
              className={
                styles.description
              }
            >
              {
                copy.description
              }
            </p>

            <div
              className={
                styles.actions
              }
            >
              <button
                type="button"
                className={
                  styles.primary
                }
                onClick={
                  reset
                }
              >
                {
                  copy.retry
                }{" "}
                <span
                  aria-hidden="true"
                >
                  ↗
                </span>
              </button>

              <LocaleLink
                href="/"
                className={
                  styles.secondary
                }
              >
                {
                  copy.backHome
                }
              </LocaleLink>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}