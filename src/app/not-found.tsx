import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

<main
  id="main-content"
  tabIndex={-1}
  className={styles.page}
  data-motion-page="not-found"
>
        <div className="site-container">
          <div
            className={styles.top}
            data-motion-not-found-piece="top"
          >
            <div className={styles.label}>
              <span className={styles.dot} />

              <span>
                Error / 404
              </span>
            </div>

            <span
              className={styles.status}
            >
              Page not found / NATSX
            </span>
          </div>

          <div className={styles.main}>
            <div
              className={styles.number}
              aria-hidden="true"
              data-motion-not-found-piece="number"
            >
              404<span>.</span>
            </div>

            <div className={styles.message}>
              <p
                className={styles.eyebrow}
                data-motion-not-found-piece="eyebrow"
              >
                Wrong turn?
              </p>

              <h1
                data-motion-not-found-piece="title"
              >
                Looks like this idea
                <br />
                never made it to
                <br />
                production
                <span>.</span>
              </h1>

              <p
                className={
                  styles.description
                }
                data-motion-not-found-piece="description"
              >
                The page you&apos;re
                looking for doesn&apos;t
                exist, has moved, or is
                still somewhere between
                an idea and a finished
                project.
              </p>

              <div
                className={styles.actions}
                data-motion-not-found-piece="actions"
              >
                <Link
                  href="/"
                  className={
                    styles.primaryAction
                  }
                >
                  Back Home
                  <span>↗</span>
                </Link>

                <Link
                  href="/work"
                  className={
                    styles.secondaryAction
                  }
                >
                  Explore Work
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>

          <div
            className={styles.bottom}
            data-motion-not-found-piece="bottom"
          >
            <span>
              Nafisa Juliansah Saputra
            </span>

            <span
              className={styles.plus}
              aria-hidden="true"
            >
              +
            </span>

            <span>
              NATSX / Digital Creator
            </span>
          </div>
        </div>
      </main>
    </>
  );
}