import type {
  CSSProperties,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import {
  getProjectMessages,
} from "@/i18n/project-messages";

import {
  getFinaleSectionMedia,
  getGallerySectionMedia,
  getImageSectionMedia,
  type GalleryItemSize,
  type GalleryLayout,
} from "@/lib/portfolio-media";

import {
  getFinaleSectionContent,
  getMetricsSectionContent,
  getQuoteSectionContent,
} from "@/lib/project-section-content";

import {
  getPortfolioMediaPublicUrl,
} from "@/lib/public-media";

import type {
  PublicProjectSection,
} from "@/lib/public-projects";

import {
  getSmartBentoPlacements,
  type SmartBentoPlacement,
} from "@/lib/smart-bento-layout";

import galleryStyles from "./ProjectGalleryBento.module.css";
import mediaStyles from "./ProjectMedia.module.css";
import styles from "./ProjectDetail.module.css";


/* =========================================================
   SHARED
========================================================= */

function getTheme(
  theme: string,
) {
  if (
    theme === "dark" ||
    theme === "accent"
  ) {
    return theme;
  }

  return "light";
}


function isAnimatedImage(
  mimeType: string,
) {
  return (
    mimeType ===
    "image/gif"
  );
}


function getSectionFallbackLabel(
  sectionType: string,
  locale: Locale,
) {
  const copy =
    getProjectMessages(
      locale,
    ).sections;

  switch (
    sectionType
  ) {
    case "overview":
      return copy.overview;

    case "narrative":
      return copy.narrative;

    case "statement":
      return copy.statement;

    case "image":
      return copy.image;

    case "gallery":
      return copy.gallery;

    case "metrics":
      return copy.metrics;

    case "quote":
      return copy.quote;

    case "finale":
      return copy.finale;

    default:
      return copy.generic;
  }
}


/* =========================================================
   BODY COPY
========================================================= */

function BodyCopy({
  body,
}: {
  body: string;
}) {
  const paragraphs =
    body
      .split(
        /\n{2,}/,
      )
      .map(
        (
          paragraph,
        ) =>
          paragraph.trim(),
      )
      .filter(
        Boolean,
      );

  if (
    paragraphs.length ===
    0
  ) {
    return null;
  }

  return (
    <div
      className={
        styles.sectionBody
      }
    >
      {paragraphs.map(
        (
          paragraph,
          index,
        ) => (
          <p
            key={`${index}-${paragraph.slice(
              0,
              24,
            )}`}
          >
            {paragraph}
          </p>
        ),
      )}
    </div>
  );
}


/* =========================================================
   SECTION INTRODUCTION
========================================================= */

function SectionIntroduction({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  if (
    !section.eyebrow &&
    !section.heading &&
    !section.body
  ) {
    return null;
  }

  return (
    <div
      className={
        styles.sectionIntroduction
      }
    >
      <div
        className={
          styles.sectionEyebrow
        }
        data-motion-piece="label"
      >
        <span
          className={
            styles.dot
          }
        />

        <span>
          {section.eyebrow ||
            getSectionFallbackLabel(
              section.sectionType,
              locale,
            )}
        </span>
      </div>

      <div
        className={
          styles.sectionIntroductionMain
        }
        data-motion-piece="content"
      >
        {section.heading ? (
          <h2>
            {
              section.heading
            }
          </h2>
        ) : null}

        <BodyCopy
          body={
            section.body
          }
        />
      </div>
    </div>
  );
}


/* =========================================================
   OVERVIEW
========================================================= */

function OverviewSection({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  const copy =
    getProjectMessages(
      locale,
    );

  return (
    <section
      className={
        styles.storySection
      }
      data-theme={getTheme(
        section.theme,
      )}
      data-motion-scroll="project-section"
    >
      <div className="site-container">
        <div
          className={
            styles.overviewLayout
          }
        >
          <div
            className={
              styles.sectionEyebrow
            }
            data-motion-piece="label"
          >
            <span
              className={
                styles.dot
              }
            />

            <span>
              {section.eyebrow ||
                copy.sections
                  .overview}
            </span>
          </div>

          <div
            className={
              styles.overviewContent
            }
            data-motion-piece="content"
          >
            {section.heading ? (
              <h2>
                {
                  section.heading
                }

                <span>
                  .
                </span>
              </h2>
            ) : null}

            <BodyCopy
              body={
                section.body
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   NARRATIVE
========================================================= */

function NarrativeSection({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  return (
    <section
      className={
        styles.storySection
      }
      data-theme={getTheme(
        section.theme,
      )}
      data-motion-scroll="project-section"
    >
      <div className="site-container">
        <SectionIntroduction
          section={
            section
          }
          locale={
            locale
          }
        />
      </div>
    </section>
  );
}


/* =========================================================
   STATEMENT
========================================================= */

function StatementSection({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  const copy =
    getProjectMessages(
      locale,
    );

  const statement =
    section.heading ||
    section.body;

  if (
    !statement
  ) {
    return null;
  }

  return (
    <section
      className={`${styles.storySection} ${styles.statementSection}`}
      data-theme={getTheme(
        section.theme,
      )}
      data-motion-scroll="project-statement"
    >
      <div className="site-container">
        <div
          className={
            styles.statementLayout
          }
        >
          <span
            className={
              styles.statementEyebrow
            }
            data-motion-piece="label"
          >
            {section.eyebrow ||
              copy.sections
                .statement}
          </span>

          <p
            data-motion-piece="content"
          >
            {statement}
          </p>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   IMAGE
========================================================= */

function ImageSection({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  const copy =
    getProjectMessages(
      locale,
    );

  const media =
    getImageSectionMedia(
      section.content,
    );

  if (
    !media &&
    !section.heading &&
    !section.body
  ) {
    return null;
  }

  const imageUrl =
    media
      ? getPortfolioMediaPublicUrl(
          media.asset
            .bucket,

          media.asset
            .path,
        )
      : null;

  return (
    <section
      className={
        styles.storySection
      }
      data-theme={getTheme(
        section.theme,
      )}
      data-motion-scroll="project-image"
    >
      <div className="site-container">
        <SectionIntroduction
          section={
            section
          }
          locale={
            locale
          }
        />

        {imageUrl &&
        media ? (
          <figure
            className={
              styles.imageFigure
            }
            data-motion-piece="media"
          >
            <div
              className={
                mediaStyles.imageFrame
              }
            >
              <Image
                src={
                  imageUrl
                }
                alt={
                  media.alt ||
                  section.heading ||
                  copy.sections
                    .imageAlt
                }
                fill
                sizes="100vw"
                unoptimized={isAnimatedImage(
                  media.asset
                    .mimeType,
                )}
                className={
                  mediaStyles.imageMedia
                }
              />
            </div>

            {media.caption ? (
              <figcaption>
                <span>
                  {
                    media.asset
                      .originalName
                  }
                </span>

                <p>
                  {
                    media.caption
                  }
                </p>
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </section>
  );
}


/* =========================================================
   GALLERY — IMAGE SIZES
========================================================= */

function getGalleryImageSizes(
  layout:
    GalleryLayout,

  size:
    GalleryItemSize,

  index:
    number,
) {
  if (
    layout ===
    "grid"
  ) {
    const isWideItem =
      index % 3 ===
      0;

    return isWideItem
      ? "100vw"
      : "(max-width: 700px) 100vw, 50vw";
  }

  if (
    size ===
      "small" ||
    size ===
      "tall"
  ) {
    return (
      "(max-width: 700px) 50vw, " +
      "(max-width: 960px) 34vw, " +
      "25vw"
    );
  }

  return (
    "(max-width: 700px) 100vw, " +
    "(max-width: 960px) 67vw, " +
    "50vw"
  );
}


/* =========================================================
   SMART BENTO STYLE VARIABLES
========================================================= */

type BentoPlacementStyle =
  CSSProperties & {
    "--bento-tablet-column"?:
      string;

    "--bento-tablet-row"?:
      string;

    "--bento-tablet-column-span"?:
      string;

    "--bento-tablet-row-span"?:
      string;

    "--bento-mobile-column"?:
      string;

    "--bento-mobile-row"?:
      string;

    "--bento-mobile-column-span"?:
      string;

    "--bento-mobile-row-span"?:
      string;
  };


function getBentoPlacementStyle(
  tablet:
    SmartBentoPlacement | undefined,

  mobile:
    SmartBentoPlacement | undefined,
): BentoPlacementStyle | undefined {
  if (
    !tablet ||
    !mobile
  ) {
    return undefined;
  }

  return {
    "--bento-tablet-column":
      String(
        tablet.columnStart,
      ),

    "--bento-tablet-row":
      String(
        tablet.rowStart,
      ),

    "--bento-tablet-column-span":
      String(
        tablet.columnSpan,
      ),

    "--bento-tablet-row-span":
      String(
        tablet.rowSpan,
      ),

    "--bento-mobile-column":
      String(
        mobile.columnStart,
      ),

    "--bento-mobile-row":
      String(
        mobile.rowStart,
      ),

    "--bento-mobile-column-span":
      String(
        mobile.columnSpan,
      ),

    "--bento-mobile-row-span":
      String(
        mobile.rowSpan,
      ),
  };
}


/* =========================================================
   GALLERY
========================================================= */

function GallerySection({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  const copy =
    getProjectMessages(
      locale,
    );

  const gallery =
    getGallerySectionMedia(
      section.content,
    );

  if (
    (
      !gallery ||
      gallery.items.length ===
        0
    ) &&
    !section.heading &&
    !section.body
  ) {
    return null;
  }

  const layout:
    GalleryLayout =
    gallery?.layout ??
    "grid";


  /*
   * =====================================================
   * SMART BENTO PACKING
   * =====================================================
   *
   * Desktop:
   * CSS tetap mempertahankan urutan
   * editorial dari dashboard.
   *
   * Tablet:
   * packer menyusun ulang posisi visual
   * ke 3 columns.
   *
   * Mobile:
   * packer menyusun ulang posisi visual
   * ke 2 columns.
   *
   * Order data / DOM tidak diubah.
   */

  const gallerySizes:
    GalleryItemSize[] =
    gallery?.items.map(
      (
        item,
      ) =>
        item.size ??
        "small",
    ) ??
    [];


  const tabletPlacements =
    layout ===
    "bento"
      ? getSmartBentoPlacements(
          gallerySizes,
          3,
        )
      : [];


  const mobilePlacements =
    layout ===
    "bento"
      ? getSmartBentoPlacements(
          gallerySizes,
          2,
        )
      : [];


  return (
    <section
      className={
        styles.storySection
      }
      data-theme={getTheme(
        section.theme,
      )}
      data-motion-scroll="project-gallery"
    >
      <div className="site-container">
        <SectionIntroduction
          section={
            section
          }
          locale={
            locale
          }
        />

        {gallery &&
        gallery.items.length >
          0 ? (
          <div
            className={`${styles.galleryGrid} ${galleryStyles.galleryGrid}`}
            data-layout={
              layout
            }
          >
            {gallery.items.map(
              (
                item,
                index,
              ) => {
                const imageUrl =
                  getPortfolioMediaPublicUrl(
                    item.asset
                      .bucket,

                    item.asset
                      .path,
                  );


                const size:
                  GalleryItemSize =
                  item.size ??
                  "small";


                const imageSizes =
                  getGalleryImageSizes(
                    layout,
                    size,
                    index,
                  );


                const bentoPlacementStyle =
                  layout ===
                  "bento"
                    ? getBentoPlacementStyle(
                        tabletPlacements[
                          index
                        ],

                        mobilePlacements[
                          index
                        ],
                      )
                    : undefined;


                return (
                  <figure
                    className={`${styles.galleryItem} ${galleryStyles.galleryItem}`}
                    key={
                      item.id
                    }
                    data-size={
                      size
                    }
                    style={
                      bentoPlacementStyle
                    }
                    data-motion-piece="item"
                  >
                    <div
                      className={`${styles.galleryImage} ${mediaStyles.positionedFrame} ${galleryStyles.galleryImage}`}
                    >
                      <Image
                        src={
                          imageUrl
                        }
                        alt={
                          item.alt ||
                          `${copy.sections.galleryImageAlt} ${
                            index +
                            1
                          }`
                        }
                        fill
                        sizes={
                          imageSizes
                        }
                        unoptimized
                        className={
                          mediaStyles.galleryMedia
                        }
                      />
                    </div>

                    {(item.caption ||
                      item.alt) && (
                      <figcaption>
                        <span>
                          {String(
                            index +
                              1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <p>
                          {item.caption ||
                            item.alt}
                        </p>
                      </figcaption>
                    )}
                  </figure>
                );
              },
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}


/* =========================================================
   METRICS
========================================================= */

function MetricsSection({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  const metrics =
    getMetricsSectionContent(
      section.content,
    );

  if (
    metrics.items.length ===
      0 &&
    !section.heading &&
    !section.body
  ) {
    return null;
  }

  return (
    <section
      className={
        styles.storySection
      }
      data-theme={getTheme(
        section.theme,
      )}
      data-motion-scroll="project-metrics"
    >
      <div className="site-container">
        <SectionIntroduction
          section={
            section
          }
          locale={
            locale
          }
        />

        {metrics.items.length >
        0 ? (
          <div
            className={
              styles.metricsGrid
            }
            data-columns={
              metrics.columns
            }
          >
            {metrics.items.map(
              (
                item,
                index,
              ) => (
                <article
                  className={
                    styles.metric
                  }
                  key={
                    item.id
                  }
                  data-motion-piece="item"
                >
                  <span
                    className={
                      styles.metricIndex
                    }
                  >
                    {String(
                      index +
                        1,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <strong>
                    {
                      item.value
                    }
                  </strong>

                  <h3>
                    {
                      item.label
                    }
                  </h3>

                  {item.detail ? (
                    <p>
                      {
                        item.detail
                      }
                    </p>
                  ) : null}
                </article>
              ),
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}


/* =========================================================
   QUOTE
========================================================= */

function QuoteSection({
  section,
}: {
  section:
    PublicProjectSection;
}) {
  const quote =
    getQuoteSectionContent(
      section.content,
    );

  if (
    !quote.text
  ) {
    return null;
  }

  return (
    <section
      className={`${styles.storySection} ${styles.quoteSection}`}
      data-theme={getTheme(
        section.theme,
      )}
      data-alignment={
        quote.alignment
      }
      data-motion-scroll="project-quote"
    >
      <div className="site-container">
        <div
          className={
            styles.quoteInner
          }
        >
          <span
            className={
              styles.quoteMark
            }
            data-motion-piece="label"
          >
            “
          </span>

          <blockquote
            data-motion-piece="quote"
          >
            {quote.text}
          </blockquote>

          {(quote.source ||
            quote.context) && (
            <div
              className={
                styles.quoteSource
              }
              data-motion-piece="source"
            >
              {quote.source ? (
                <strong>
                  {
                    quote.source
                  }
                </strong>
              ) : null}

              {quote.context ? (
                <span>
                  {
                    quote.context
                  }
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   FINALE
========================================================= */

function FinaleSection({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  const copy =
    getProjectMessages(
      locale,
    );

  const finale =
    getFinaleSectionContent(
      section.content,
    );

  const media =
    getFinaleSectionMedia(
      section.content,
    );

  if (
    !finale.title
  ) {
    return null;
  }

  const mediaUrl =
    media
      ? getPortfolioMediaPublicUrl(
          media.asset
            .bucket,

          media.asset
            .path,
        )
      : null;

  const hasCta =
    Boolean(
      finale.ctaLabel &&
        finale.ctaUrl,
    );

  return (
    <section
      className={`${styles.storySection} ${styles.finaleSection}`}
      data-theme={getTheme(
        section.theme,
      )}
      data-motion-scroll="project-finale"
    >
      <div className="site-container">
        <div
          className={
            styles.finaleGrid
          }
        >
          <div
            className={
              styles.finaleCopy
            }
            data-motion-piece="content"
          >
            <span
              className={
                styles.finaleEyebrow
              }
            >
              {section.eyebrow ||
                copy.sections
                  .finale}
            </span>

            <h2>
              {
                finale.title
              }
            </h2>

            {finale.body ? (
              <p>
                {
                  finale.body
                }
              </p>
            ) : null}

            {hasCta ? (
              finale.ctaUrl.startsWith(
                "/",
              ) ? (
                <Link
                  href={
                    localizePath(
                      finale.ctaUrl,
                      locale,
                    )
                  }
                  className={
                    styles.finaleCta
                  }
                >
                  {
                    finale.ctaLabel
                  }

                  <span>
                    ↗
                  </span>
                </Link>
              ) : (
                <a
                  href={
                    finale.ctaUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className={
                    styles.finaleCta
                  }
                >
                  {
                    finale.ctaLabel
                  }

                  <span>
                    ↗
                  </span>
                </a>
              )
            ) : null}
          </div>

          {mediaUrl &&
          media ? (
            <div
              className={`${styles.finaleMedia} ${mediaStyles.positionedFrame}`}
              data-motion-piece="media"
            >
              {media.kind ===
              "video" ? (
                <video
                  src={
                    mediaUrl
                  }
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                />
              ) : (
                <Image
                  src={
                    mediaUrl
                  }
                  alt={
                    media.alt ||
                    finale.title
                  }
                  fill
                  sizes="(max-width: 960px) 100vw, 55vw"
                  unoptimized={isAnimatedImage(
                    media.asset
                      .mimeType,
                  )}
                  className={
                    mediaStyles.finaleImage
                  }
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   RENDERER
========================================================= */

export default function ProjectSectionRenderer({
  section,
  locale,
}: {
  section:
    PublicProjectSection;

  locale:
    Locale;
}) {
  switch (
    section.sectionType
  ) {
    case "overview":
      return (
        <OverviewSection
          section={
            section
          }
          locale={
            locale
          }
        />
      );

    case "narrative":
      return (
        <NarrativeSection
          section={
            section
          }
          locale={
            locale
          }
        />
      );

    case "statement":
      return (
        <StatementSection
          section={
            section
          }
          locale={
            locale
          }
        />
      );

    case "image":
      return (
        <ImageSection
          section={
            section
          }
          locale={
            locale
          }
        />
      );

    case "gallery":
      return (
        <GallerySection
          section={
            section
          }
          locale={
            locale
          }
        />
      );

    case "metrics":
      return (
        <MetricsSection
          section={
            section
          }
          locale={
            locale
          }
        />
      );

    case "quote":
      return (
        <QuoteSection
          section={
            section
          }
        />
      );

    case "finale":
      return (
        <FinaleSection
          section={
            section
          }
          locale={
            locale
          }
        />
      );

    default:
      return null;
  }
}