import SiteHeader from "@/components/layout/SiteHeader";

import styles from "./WorkLoading.module.css";

export default function WorkLoading() {
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
                styles.top
              }
            >
              <span
                className={`${styles.line} ${styles.lineSmall}`}
              />

              <span
                className={`${styles.line} ${styles.lineMedium}`}
              />
            </div>

            <div
              className={
                styles.hero
              }
            >
              <span
                className={
                  styles.title
                }
              />

              <span
                className={
                  styles.copy
                }
              />
            </div>

            <div
              className={
                styles.rows
              }
            >
              {Array.from({
                length: 3,
              }).map(
                (
                  _,
                  index,
                ) => (
                  <div
                    className={
                      styles.row
                    }
                    key={
                      index
                    }
                  >
                    <span
                      className={
                        styles.rowLine
                      }
                    />

                    <span
                      className={
                        styles.rowTitle
                      }
                    />

                    <span
                      className={
                        styles.rowLine
                      }
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}