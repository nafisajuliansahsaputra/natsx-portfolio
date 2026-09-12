"use client";

import type {
  CSSProperties,
} from "react";

import Image from "next/image";

import {
  usePathname,
} from "next/navigation";

import FiveAmVisionArtwork from "@/components/home/FiveAmVisionArtwork";

import homeStyles from "@/components/home/SelectedWork.module.css";
import phoneStyles from "@/components/home/SpallPhone.module.css";

import {
  getLocaleFromPathname,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import {
  getProjectPrimaryVisualUrl,
  getProjectSecondaryVisualUrl,
} from "@/lib/public-media";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./WorkArchiveHomepagePreview.module.css";



type HomepageArchiveVariant =
  | "spall"
  | "vision"
  | "bast";


type WorkArchiveHomepagePreviewProps = {
  project:
    PublicProject;

  fallbackImage:
    | string
    | null;
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
  fallbackImage,
}: WorkArchiveHomepagePreviewProps) {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const copy =
    getHomeMessages(
      locale,
    ).selectedWork;

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
          loading="eager"
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


  const primaryVisual =
    getProjectPrimaryVisualUrl(
      project,
    );

  const secondaryVisual =
    getProjectSecondaryVisualUrl(
      project,
    );

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
        className={`${styles.root} ${homeStyles.visual_spall}`}
        data-archive-home-preview="spall"
        style={
          rootStyle
        }
      >
        <div
          className={
            homeStyles.spallArtwork
          }
        >
          <div
            className={
              homeStyles.spallBrowser
            }
            data-archive-part="spall-browser"
          >
            <BrowserChrome
              className={
                homeStyles.spallBrowserTop
              }
              part="spall-browser-top"
            />

            <div
              className={
                homeStyles.spallBrowserBody
              }
            >
              {primaryVisual ? (
<ShowcaseImage
  src={
    primaryVisual
  }
  alt={`${project.title} desktop interface`}
  className={
    homeStyles.spallPrimaryImage
  }
  part="spall-primary-image"
  sizes="420px"
  unoptimized
/>
              ) : (
                <div
                  className={
                    homeStyles.spallFallback
                  }
                  data-archive-part="spall-fallback"
                >
                  <span
                    className={
                      homeStyles.spallMiniLabel
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
                homeStyles.spallCard
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
              homeStyles.visualLabel
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
      className={`${styles.root} ${homeStyles.visual_bast}`}
      data-archive-home-preview="bast"
      style={
        rootStyle
      }
    >
      <div
        className={
          homeStyles.bastArtwork
        }
      >
        <div
          className={
            homeStyles.bastGrid
          }
          data-archive-part="bast-grid"
          aria-hidden="true"
        />

        <div
          className={
            homeStyles.bastIndex
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
            homeStyles.bastDashboard
          }
          data-archive-part="bast-dashboard"
        >
          <div
            className={
              homeStyles.bastDashboardTop
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
              homeStyles.bastDashboardViewport
            }
          >
            {primaryVisual ? (
<ShowcaseImage
  src={
    primaryVisual
  }
  alt={`${project.title} main system interface`}
  className={
    homeStyles.bastPrimaryImage
  }
  part="bast-primary-image"
  sizes="420px"
  unoptimized
/>
            ) : (
              <BastFallback />
            )}
          </div>
        </div>

        <div
          className={
            homeStyles.bastDocument
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
    homeStyles.bastSecondaryImage
  }
  part="bast-secondary-image"
  sizes="140px"
  unoptimized
/>
          ) : (
            <div
              className={
                homeStyles.bastDocumentFallback
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
            homeStyles.bastStatus
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
            homeStyles.visualLabel
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
  unoptimized
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
  unoptimized = false,
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

  unoptimized?:
    boolean;
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
      loading="eager"
      sizes={
        sizes
      }
      className={
        className
      }
      data-archive-part={
        part
      }
      unoptimized={
        unoptimized
      }
    />
  );
}


function BastFallback() {
  return (
    <div
      className={
        homeStyles.bastFallback
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
          homeStyles.bastFallbackMain
        }
      >
        <div
          className={
            homeStyles.bastFallbackHeader
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
            homeStyles.bastFallbackCards
          }
        >
          <span />
          <span />
          <span />
        </div>

        <div
          className={
            homeStyles.bastFallbackTable
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