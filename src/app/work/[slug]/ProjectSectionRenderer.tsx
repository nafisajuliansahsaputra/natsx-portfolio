import Link from "next/link";

import {
  getFinaleSectionMedia,
  getGallerySectionMedia,
  getImageSectionMedia,
} from "@/lib/portfolio-media";

import {
  getFinaleSectionContent,
  getMetricsSectionContent,
  getQuoteSectionContent,
} from "@/lib/project-section-content";

import type {
  PublicProjectSection,
} from "@/lib/public-projects";

import {
  createPublicClient,
} from "@/lib/supabase/public";

import styles from "./ProjectDetail.module.css";

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

function getMediaUrl(
  bucket: string,
  path: string,
) {
  const supabase =
    createPublicClient();

  return supabase.storage
    .from(bucket)
    .getPublicUrl(path)
    .data.publicUrl;
}

function BodyCopy({
  body,
}: {
  body: string;
}) {
  const paragraphs =
    body
      .split(/\n{2,}/)
      .map(
        (paragraph) =>
          paragraph.trim(),
      )
      .filter(Boolean);

  if (
    paragraphs.length === 0
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

function SectionIntroduction({
  section,
}: {
  section: PublicProjectSection;
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
      >
        <span
          className={
            styles.dot
          }
        />

        <span>
          {section.eyebrow ||
            section.sectionType}
        </span>
      </div>

      <div
        className={
          styles.sectionIntroductionMain
        }
      >
        {section.heading ? (
          <h2>
            {section.heading}
          </h2>
        ) : null}

        <BodyCopy
          body={section.body}
        />
      </div>
    </div>
  );
}

function OverviewSection({
  section,
}: {
  section: PublicProjectSection;
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
        <div
          className={
            styles.overviewLayout
          }
        >
          <div
            className={
              styles.sectionEyebrow
            }
          >
            <span
              className={
                styles.dot
              }
            />

            <span>
              {section.eyebrow ||
                "Project Overview"}
            </span>
          </div>

          <div
            className={
              styles.overviewContent
            }
          >
            {section.heading ? (
              <h2>
                {section.heading}
                <span>.</span>
              </h2>
            ) : null}

            <BodyCopy
              body={section.body}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function NarrativeSection({
  section,
}: {
  section: PublicProjectSection;
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
          section={section}
        />
      </div>
    </section>
  );
}

function StatementSection({
  section,
}: {
  section: PublicProjectSection;
}) {
  const statement =
    section.heading ||
    section.body;

  if (!statement) {
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
          >
            {section.eyebrow ||
              "Statement"}
          </span>

          <p>
            {statement}
          </p>
        </div>
      </div>
    </section>
  );
}

function ImageSection({
  section,
}: {
  section: PublicProjectSection;
}) {
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
      ? getMediaUrl(
          media.asset.bucket,
          media.asset.path,
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
          section={section}
        />

        {imageUrl &&
        media ? (
          <figure
            className={
              styles.imageFigure
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={
                media.alt ||
                section.heading ||
                "Project image"
              }
            />

            {media.caption ? (
              <figcaption>
                <span>
                  {
                    media
                      .asset
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

function GallerySection({
  section,
}: {
  section: PublicProjectSection;
}) {
  const gallery =
    getGallerySectionMedia(
      section.content,
    );

  if (
    (!gallery ||
      gallery.items.length ===
        0) &&
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
      data-motion-scroll="project-gallery"
    >
      <div className="site-container">
        <SectionIntroduction
          section={section}
        />

        {gallery &&
        gallery.items.length >
          0 ? (
          <div
            className={
              styles.galleryGrid
            }
          >
            {gallery.items.map(
              (
                item,
                index,
              ) => {
                const imageUrl =
                  getMediaUrl(
                    item.asset
                      .bucket,
                    item.asset
                      .path,
                  );

                return (
                  <figure
                    className={
                      styles.galleryItem
                    }
                    key={
                      item.id
                    }
                  >
                    <div
                      className={
                        styles.galleryImage
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          imageUrl
                        }
                        alt={
                          item.alt ||
                          `Gallery image ${
                            index +
                            1
                          }`
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

function MetricsSection({
  section,
}: {
  section: PublicProjectSection;
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
          section={section}
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
                >
                  <span
                    className={
                      styles.metricIndex
                    }
                  >
                    {String(
                      index + 1,
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

function QuoteSection({
  section,
}: {
  section: PublicProjectSection;
}) {
  const quote =
    getQuoteSectionContent(
      section.content,
    );

  if (!quote.text) {
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
          >
            “
          </span>

          <blockquote>
            {quote.text}
          </blockquote>

          {(quote.source ||
            quote.context) && (
            <div
              className={
                styles.quoteSource
              }
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

function FinaleSection({
  section,
}: {
  section: PublicProjectSection;
}) {
  const finale =
    getFinaleSectionContent(
      section.content,
    );

  const media =
    getFinaleSectionMedia(
      section.content,
    );

  if (!finale.title) {
    return null;
  }

  const mediaUrl =
    media
      ? getMediaUrl(
          media.asset.bucket,
          media.asset.path,
        )
      : null;

  const cta =
    finale.ctaLabel &&
    finale.ctaUrl;

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
          >
            <span
              className={
                styles.finaleEyebrow
              }
            >
              {section.eyebrow ||
                "Final Showcase"}
            </span>

            <h2>
              {finale.title}
            </h2>

            {finale.body ? (
              <p>
                {finale.body}
              </p>
            ) : null}

            {cta ? (
              finale.ctaUrl.startsWith(
                "/",
              ) ? (
                <Link
                  href={
                    finale.ctaUrl
                  }
                  className={
                    styles.finaleCta
                  }
                >
                  {
                    finale.ctaLabel
                  }
                  <span>↗</span>
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
                  <span>↗</span>
                </a>
              )
            ) : null}
          </div>

          {mediaUrl &&
          media ? (
            <div
              className={
                styles.finaleMedia
              }
            >
              {media.kind ===
              "video" ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      mediaUrl
                    }
                    alt={
                      media.alt ||
                      finale.title
                    }
                  />
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function ProjectSectionRenderer({
  section,
}: {
  section: PublicProjectSection;
}) {
  switch (
    section.sectionType
  ) {
    case "overview":
      return (
        <OverviewSection
          section={section}
        />
      );

    case "narrative":
      return (
        <NarrativeSection
          section={section}
        />
      );

    case "statement":
      return (
        <StatementSection
          section={section}
        />
      );

    case "image":
      return (
        <ImageSection
          section={section}
        />
      );

    case "gallery":
      return (
        <GallerySection
          section={section}
        />
      );

    case "metrics":
      return (
        <MetricsSection
          section={section}
        />
      );

    case "quote":
      return (
        <QuoteSection
          section={section}
        />
      );

    case "finale":
      return (
        <FinaleSection
          section={section}
        />
      );

    default:
      return null;
  }
}