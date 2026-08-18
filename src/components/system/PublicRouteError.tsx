"use client";

import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import styles from "./PublicRouteError.module.css";

export default function PublicRouteError({
  reset,
}: {
  reset:
    () => void;
}) {
  return (
    <>
      <SiteHeader />

      <main
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

              SYSTEM /
              TEMPORARY ERROR
            </div>

            <h1
              className={
                styles.heading
              }
            >
              Something
              <br />
              went wrong

              <span>
                .
              </span>
            </h1>

            <p
              className={
                styles.description
              }
            >
              The portfolio
              couldn&apos;t load
              this content right
              now. Try the request
              again or return to
              the homepage.
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
                Try again ↗
              </button>

              <Link
                href="/"
                className={
                  styles.secondary
                }
              >
                Back home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}