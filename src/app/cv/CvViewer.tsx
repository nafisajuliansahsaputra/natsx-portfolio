"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  cvVersions,
  type CvVersion,
} from "@/data/cv";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getCvMessages,
} from "@/i18n/cv-messages";

import styles from "./Cv.module.css";

type CvViewerProps = {
  initialVersion:
    CvVersion;

  locale:
    Locale;
};

export default function CvViewer({
  initialVersion,
  locale,
}: CvViewerProps) {
  const copy =
    getCvMessages(
      locale,
    );

  const [
    activeVersion,
    setActiveVersion,
  ] = useState(
    initialVersion,
  );

  function selectVersion(
    version: CvVersion,
  ) {
    setActiveVersion(
      version,
    );

    const url =
      new URL(
        window.location.href,
      );

    /*
     * Query ?lang hanya
     * mengontrol bahasa PDF.
     *
     * URL locale website tidak
     * berubah.
     *
     * /de/cv?lang=en
     * berarti:
     * - UI Deutsch
     * - PDF English
     */
    url.searchParams.set(
      "lang",
      version.id,
    );

    window.history.replaceState(
      null,
      "",
      url,
    );
  }

  return (
    <>
      <section
        className={
          styles.languageSection
        }
      >
        <div className="site-container">
          <div
            className={
              styles.sectionHeader
            }
            data-motion-scroll="cv-language-header"
          >
            <div
              className={
                styles.label
              }
              data-motion-piece="label"
            >
              <span
                className={
                  styles.dot
                }
              />

              <span>
                {
                  copy.language
                    .label
                }
              </span>
            </div>

            <span
              className={
                styles.sectionMeta
              }
              data-motion-piece="meta"
            >
              {
                copy.language
                  .versions
              }
            </span>
          </div>

          <div
            className={
              styles.languageList
            }
            data-motion-scroll="cv-language-list"
          >
            {cvVersions.map(
              (
                version,
              ) => {
                const isActive =
                  version.id ===
                  activeVersion.id;

                return (
                  <button
                    type="button"
                    data-motion-piece="item"
                    className={[
                      styles.languageItem,

                      isActive
                        ? styles.languageItemActive
                        : "",
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(
                        " ",
                      )}
                    key={
                      version.id
                    }
                    onClick={() =>
                      selectVersion(
                        version,
                      )
                    }
                    aria-pressed={
                      isActive
                    }
                  >
                    <span
                      className={
                        styles.languageNumber
                      }
                    >
                      {
                        version.number
                      }
                    </span>

                    <span
                      className={
                        styles.languageName
                      }
                    >
                      {
                        version.language
                      }
                    </span>

                    <span
                      className={
                        styles.languageState
                      }
                    >
                      {isActive
                        ? copy
                            .language
                            .selected
                        : copy
                            .language
                            .view}
                    </span>

                    <span
                      className={[
                        styles.languageIndicator,

                        isActive
                          ? styles.languageIndicatorActive
                          : "",
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          " ",
                        )}
                      aria-hidden="true"
                    />
                  </button>
                );
              },
            )}
          </div>
        </div>
      </section>

      <section
        className={
          styles.viewerSection
        }
      >
        <div className="site-container">
          <div
            className={
              styles.viewerHeader
            }
            data-motion-scroll="cv-viewer-header"
          >
            <div
              data-motion-piece="title"
            >
              <span
                className={
                  styles.viewerEyebrow
                }
              >
                {
                  copy.viewer
                    .eyebrow
                }
              </span>

              <h2>
                {
                  activeVersion.language
                }

                <span>
                  .
                </span>
              </h2>
            </div>

            <div
              className={
                styles.viewerActions
              }
              data-motion-piece="actions"
            >
              <a
                href={
                  activeVersion.file
                }
                target="_blank"
                rel="noreferrer"
                className={
                  styles.secondaryAction
                }
              >
                {
                  copy.viewer
                    .openPdf
                }

                <span>
                  ↗
                </span>
              </a>

              <a
                href={
                  activeVersion.file
                }
                download={
                  activeVersion.downloadName
                }
                className={
                  styles.primaryAction
                }
              >
                {
                  copy.viewer
                    .download
                }

                <span>
                  ↓
                </span>
              </a>
            </div>
          </div>

          <div
            className={
              styles.viewer
            }
            data-motion-scroll="cv-viewer"
          >
            <div
              className={
                styles.viewerToolbar
              }
            >
              <span>
                {
                  activeVersion.shortLabel
                }
              </span>

              <span>
                NAFISA JULIANSAH SAPUTRA / 2026
              </span>
            </div>

            <div
              className={
                styles.pdfArea
              }
            >
              <object
                key={
                  activeVersion.file
                }
                className={
                  styles.pdfObject
                }
                data={`${activeVersion.file}#page=1&view=FitH&toolbar=0&navpanes=0`}
                type="application/pdf"
                aria-label={`CV ${activeVersion.language}`}
              >
                <div
                  className={
                    styles.pdfFallback
                  }
                >
                  <span>
                    {
                      copy.viewer
                        .fallbackTitle
                    }
                  </span>

                  <p>
                    {
                      copy.viewer
                        .fallbackDescription
                    }
                  </p>

                  <a
                    href={
                      activeVersion.file
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {
                      copy.viewer
                        .fallbackAction
                    }

                    <span>
                      ↗
                    </span>
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      </section>

      <section
        className={
          styles.closing
        }
      >
        <div className="site-container">
          <div
            className={
              styles.closingGrid
            }
            data-motion-scroll="cv-closing"
          >
            <div
              className={
                styles.closingLabel
              }
              data-motion-piece="label"
            >
              <span
                className={
                  styles.dot
                }
              />

              <span>
                {
                  copy.closing
                    .label
                }
              </span>
            </div>

            <div
              className={
                styles.closingMain
              }
              data-motion-piece="main"
            >
              <p>
                {
                  copy.closing
                    .heading
                }

                <span>
                  .
                </span>
              </p>

              <Link
                href={localizePath("/contact", locale)}
                className={
                  styles.closingLink
                }
              >
                {
                  copy.closing
                    .action
                }

                <span>
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}