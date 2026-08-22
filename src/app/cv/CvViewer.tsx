"use client";

import {
  useState,
} from "react";

import {
  cvVersions,
  type CvVersion,
} from "@/data/cv";

import styles from "./Cv.module.css";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  getLocaleFromPathname,
  localizePath,
} from "@/i18n/config";

type CvViewerProps = {
  initialVersion: CvVersion;
};

export default function CvViewer({
  initialVersion,
}: CvViewerProps) {
  const [
    activeVersion,
    setActiveVersion,
  ] = useState(
    initialVersion,
  );
  
  const pathname =
  usePathname();

const locale =
  getLocaleFromPathname(
    pathname,
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
      {/* =========================
          LANGUAGE
      ========================= */}

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
                Select language
              </span>
            </div>

<span
  className={
    styles.sectionMeta
  }
  data-motion-piece="meta"
>
              03 / Versions
            </span>
          </div>

          <div
            className={
              styles.languageList
            }
            data-motion-scroll="cv-language-list"
          >
            {cvVersions.map(
              (version) => {
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
                      .join(" ")}
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
                        ? "Selected"
                        : "View"}
                    </span>

                    <span
  className={[
    styles.languageIndicator,
    isActive
      ? styles.languageIndicatorActive
      : "",
  ]
    .filter(Boolean)
    .join(" ")}
  aria-hidden="true"
/>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* =========================
          PDF
      ========================= */}

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
                Currently viewing
              </span>

              <h2>
                {
                  activeVersion.language
                }
                <span>.</span>
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
                Open PDF

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
                Download CV

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
                data={
  `${activeVersion.file}#page=1&view=FitH&toolbar=0&navpanes=0`
}
                type="application/pdf"
                aria-label={`CV ${activeVersion.language}`}
              >
                <div
                  className={
                    styles.pdfFallback
                  }
                >
                  <span>
                    PDF Preview
                  </span>

                  <p>
                    Your browser
                    does not support
                    embedded PDF
                    preview.
                  </p>

                  <a
                    href={
                      activeVersion.file
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open CV
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

      {/* =========================
          CLOSING
      ========================= */}

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
                Prefer to talk?
              </span>
            </div>

<div
  className={
    styles.closingMain
  }
  data-motion-piece="main"
>
              <p>
                A CV tells part
                of the story
                <span>.</span>
              </p>

<Link
  href={
    localizePath(
      "/contact",
      locale,
    )
  }
  className={
    styles.closingLink
  }
>
  Start a conversation

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