"use client";

import type {
  CSSProperties,
} from "react";

import Image from "next/image";

import FiveAmVisionArtwork from "@/components/home/FiveAmVisionArtwork";

import artworkStyles from "./WorkArchiveArtwork.module.css";
import phoneStyles from "@/components/home/SpallPhone.module.css";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./WorkArchiveHomepagePreview.module.css";



type HomepageArchiveVariant =
  | "spall"
  | "vision"
  | "bast";


export type WorkArchivePreviewCopy = {
  selectedProject:
    string;

  visionArtwork: {
    disciplineLabel:
      string;

    identity:
      string;

    artDirection:
      string;

    digitalDesign:
      string;

    philosophyLine1:
      string;

    philosophyLine2:
      string;

    philosophyLine3:
      string;

    tagline:
      string;
  };
};


type WorkArchiveHomepagePreviewProps = {
  project:
    Pick<
      PublicProject,
      | "slug"
      | "number"
      | "title"
      | "disciplines"
      | "accentColor"
      | "secondaryColor"
    >;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  fallbackImage:
    | string
    | null;

  copy:
    WorkArchivePreviewCopy;
};


function getHomepageArchiveVariant(
  slug:
    string,
):
  | HomepageArchiveVariant
  | null {
  switch (
    slug
  ) {
    case "spall-spill":
      return "spall";

    case "5am-vision":
      return "vision";

    case "bast-management-system":
      return "bast";

    default:
      return null;
  }
}


export function hasHomepageArchiveArtwork(
  slug:
    string,
) {
  return (
    getHomepageArchiveVariant(
      slug,
    ) !==
    null
  );
}


export default function WorkArchiveHomepagePreview({
  project,
  primaryVisual,
  secondaryVisual,
  fallbackImage,
  copy,
}: WorkArchiveHomepagePreviewProps) {
  const variant =
    getHomepageArchiveVariant(
      project.slug,
    );

  const rootStyle = {
    "--accent":
      project.accentColor,

    "--project-secondary":
      project.secondaryColor ??
      "#deddd7",
  } as CSSProperties;


  /*
   * ==========================================
   * NON-HOMEPAGE PROJECT
   * ==========================================
   *
   * Project yang tidak punya coded homepage
   * artwork tetap memakai preview lama.
   */

  if (
    !variant
  ) {
    if (
      !fallbackImage
    ) {
      return null;
    }

    return (
      <div
        className={
          styles.root
        }
        data-archive-home-preview="fallback"
        style={
          rootStyle
        }
      >
        <Image
          src={
            fallbackImage
          }
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 700px) 1px, (max-width: 1200px) 420px, 480px"
          className={
            styles.fallbackImage
          }
        />
      </div>
    );
  }


  /*
   * ==========================================
   * 5AM VISION
   * ==========================================
   *
   * Ini component YANG SAMA dengan homepage.
   * Bukan screenshot baru dan bukan duplicate.
   *
   * mode="archive" cuma mengubah bagaimana
   * composition merespons canvas yang lebih
   * lebar.
   */

  if (
    variant ===
    "vision"
  ) {
    return (
      <div
        className={
          styles.root
        }
        data-archive-home-preview="vision"
        style={
          rootStyle
        }
      >
        <FiveAmVisionArtwork
          copy={
            copy.visionArtwork
          }
          mode="archive"
        />
      </div>
    );
  }


  const visualLabel =
    project.disciplines
      .slice(
        0,
        2,
      )
      .join(
        " / ",
      ) ||
    copy.selectedProject;


  /*
   * ==========================================
   * SPALL SPILL
   * ==========================================
   *
   * Struktur artwork sama dengan homepage.
   * CSS utama juga memakai class yang sama.
   */

  if (
    variant ===
    "spall"
  ) {
    const titleLines =
      getTitleLines(
        project.title,
      );

    return (
      <div
        className={`${styles.root} ${artworkStyles.visual_spall}`}
        data-archive-home-preview="spall"
        style={
          rootStyle
        }
      >
        <div
          className={
            artworkStyles.spallArtwork
          }
        >
          <div
            className={
              artworkStyles.spallBrowser
            }
            data-archive-part="spall-browser"
          >
            <BrowserChrome
              className={
                artworkStyles.spallBrowserTop
              }
              part="spall-browser-top"
            />

            <div
              className={
                artworkStyles.spallBrowserBody
              }
            >
              {primaryVisual ? (
<ShowcaseImage
  src={
    primaryVisual
  }
  alt={`${project.title} desktop interface`}
  className={
    artworkStyles.spallPrimaryImage
  }
  part="spall-primary-image"
  sizes="420px"
/>
              ) : (
                <div
                  className={
                    artworkStyles.spallFallback
                  }
                  data-archive-part="spall-fallback"
                >
                  <span
                    className={
                      artworkStyles.spallMiniLabel
                    }
                    data-archive-part="spall-mini-label"
                  >
                    {
                      project.number
                    }{" "}
                    / NATSX
                  </span>

                  <strong>
                    {
                      titleLines[0]
                    }

                    {titleLines[1] ? (
                      <>
                        <br />

                        {
                          titleLines[1]
                        }
                      </>
                    ) : null}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {secondaryVisual ? (
            <SpallPhone
              project={
                project
              }
              image={
                secondaryVisual
              }
            />
          ) : (
            <div
              className={
                artworkStyles.spallCard
              }
              data-archive-part="spall-card"
            >
              <span>
                {
                  project.number
                }
              </span>

              <strong>
                SELECTED
              </strong>

              <strong>
                WORK
              </strong>
            </div>
          )}

          <span
            className={
              artworkStyles.visualLabel
            }
            data-archive-part="visual-label"
          >
            {
              visualLabel
            }
          </span>
        </div>
      </div>
    );
  }


  /*
   * ==========================================
   * BAST
   * ==========================================
   */

  return (
    <div
      className={`${styles.root} ${artworkStyles.visual_bast}`}
      data-archive-home-preview="bast"
      style={
        rootStyle
      }
    >
      <div
        className={
          artworkStyles.bastArtwork
        }
      >
        <div
          className={
            artworkStyles.bastGrid
          }
          data-archive-part="bast-grid"
          aria-hidden="true"
        />

        <div
          className={
            artworkStyles.bastIndex
          }
          data-archive-part="bast-index"
          aria-hidden="true"
        >
          <span>
            SYSTEM
          </span>

          <strong>
            BAST
          </strong>

          <span>
            2024—26
          </span>
        </div>

        <div
          className={
            artworkStyles.bastDashboard
          }
          data-archive-part="bast-dashboard"
        >
          <div
            className={
              artworkStyles.bastDashboardTop
            }
            data-archive-part="bast-dashboard-top"
          >
            <div>
              <span />
              <span />
              <span />
            </div>

            <span>
              MANAGEMENT SYSTEM
            </span>
          </div>

          <div
            className={
              artworkStyles.bastDashboardViewport
            }
          >
            {primaryVisual ? (
<ShowcaseImage
  src={
    primaryVisual
  }
  alt={`${project.title} main system interface`}
  className={
    artworkStyles.bastPrimaryImage
  }
  part="bast-primary-image"
  sizes="420px"
/>
            ) : (
              <BastFallback />
            )}
          </div>
        </div>

        <div
          className={
            artworkStyles.bastDocument
          }
          data-archive-part="bast-document"
        >
          {secondaryVisual ? (
<ShowcaseImage
  src={
    secondaryVisual
  }
  alt={`${project.title} supporting workflow visual`}
  className={
    artworkStyles.bastSecondaryImage
  }
  part="bast-secondary-image"
  sizes="140px"
/>
          ) : (
            <div
              className={
                artworkStyles.bastDocumentFallback
              }
              data-archive-part="bast-document-fallback"
            >
              <span>
                BAST / DOC
              </span>

              <div />
              <div />
              <div />

              <strong>
                VERIFIED
              </strong>
            </div>
          )}
        </div>

        <div
          className={
            artworkStyles.bastStatus
          }
          data-archive-part="bast-status"
          aria-hidden="true"
        >
          <span />

          <div>
            <small>
              STATUS
            </small>

            <strong>
              ACTIVE
            </strong>
          </div>
        </div>

        <span
          className={
            artworkStyles.visualLabel
          }
          data-archive-part="visual-label"
        >
          {
            visualLabel
          }
        </span>
      </div>
    </div>
  );
}


function SpallPhone({
  project,
  image,
}: {
  project:
    PublicProject;

  image:
    string;
}) {
  return (
    <div
      className={
        phoneStyles.stage
      }
      data-archive-part="spall-phone"
    >
      <div
        className={
          phoneStyles.phone
        }
        data-archive-part="spall-phone-device"
      >
        <div
          className={
            phoneStyles.screen
          }
          data-archive-part="spall-phone-screen"
        >
<ShowcaseImage
  src={
    image
  }
  alt={`${project.title} mobile interface`}
  className={
    phoneStyles.image
  }
  part="spall-phone-image"
  sizes="100px"
/>
        </div>

        <div
          className={
            phoneStyles.hardware
          }
          data-archive-part="spall-phone-hardware"
          aria-hidden="true"
        >
          <span
            className={
              phoneStyles.speaker
            }
            data-archive-part="spall-phone-speaker"
          />

          <span
            className={
              phoneStyles.camera
            }
            data-archive-part="spall-phone-camera"
          />
        </div>
      </div>
    </div>
  );
}


function BrowserChrome({
  className,
  part,
}: {
  className:
    string;

  part:
    string;
}) {
  return (
    <div
      className={
        className
      }
      data-archive-part={
        part
      }
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </div>
  );
}


function ShowcaseImage({
  src,
  alt,
  className,
  part,
  sizes,
}: {
  src:
    string;

  alt:
    string;

  className:
    string;

  part:
    string;

  sizes:
    string;
}) {
  return (
    <Image
      src={
        src
      }
      alt={
        alt
      }
      fill
      loading="lazy"
      sizes={
        sizes
      }
      className={
        className
      }
      data-archive-part={
        part
      }
    />
  );
}


function BastFallback() {
  return (
    <div
      className={
        artworkStyles.bastFallback
      }
      data-archive-part="bast-fallback"
    >
      <aside>
        <span>
          NATSX
        </span>

        <i />
        <i />
        <i />
        <i />
      </aside>

      <div
        className={
          artworkStyles.bastFallbackMain
        }
      >
        <div
          className={
            artworkStyles.bastFallbackHeader
          }
        >
          <span>
            Dashboard
          </span>

          <span>
            ●
          </span>
        </div>

        <div
          className={
            artworkStyles.bastFallbackCards
          }
        >
          <span />
          <span />
          <span />
        </div>

        <div
          className={
            artworkStyles.bastFallbackTable
          }
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}


function getTitleLines(
  title:
    string,
) {
  const words =
    title
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      );

  if (
    words.length <=
    1
  ) {
    return [
      title.trim(),
    ];
  }

  const midpoint =
    Math.ceil(
      words.length /
        2,
    );

  return [
    words
      .slice(
        0,
        midpoint,
      )
      .join(
        " ",
      ),

    words
      .slice(
        midpoint,
      )
      .join(
        " ",
      ),
  ].filter(
    Boolean,
  );
}