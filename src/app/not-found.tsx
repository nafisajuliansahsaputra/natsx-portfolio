import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <div className="site-container">
          <div className={styles.top}>
            <div className={styles.label}>
              <span className={styles.dot} />
              <span>Error / 404</span>
            </div>

            <span className={styles.status}>
              Page not found / NATSX
            </span>
          </div>

          <div className={styles.main}>
            <div className={styles.number} aria-hidden="true">
              404<span>.</span>
            </div>

            <div className={styles.message}>
              <p className={styles.eyebrow}>
                Wrong turn?
              </p>

              <h1>
                Looks like this idea
                <br />
                never made it to
                <br />
                production<span>.</span>
              </h1>

              <p className={styles.description}>
                The page you&apos;re looking for doesn&apos;t exist,
                has moved, or is still somewhere between an idea
                and a finished project.
              </p>

              <div className={styles.actions}>
                <Link
                  href="/"
                  className={styles.primaryAction}
                >
                  Back Home
                  <span>↗</span>
                </Link>

                <Link
                  href="/work"
                  className={styles.secondaryAction}
                >
                  Explore Work
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.bottom}>
            <span>Nafisa Juliansah Saputra</span>

            <span className={styles.plus} aria-hidden="true">
              +
            </span>

            <span>NATSX / Digital Creator</span>
          </div>
        </div>
      </main>
    </>
  );
}