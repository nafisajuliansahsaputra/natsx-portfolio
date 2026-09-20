import {
  getHomeMessages,
} from "@/i18n/home-messages";

import {
  getWorkMessages,
} from "@/i18n/work-messages";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import InnerFooter from "@/components/layout/InnerFooter";
import SiteHeader from "@/components/layout/SiteHeader";

import Link from "next/link";

import {
  createPageMetadata,
} from "@/lib/page-metadata";

import {
  getProjectPrimaryVisualUrl,
  getProjectSecondaryVisualUrl,
} from "@/lib/public-media";

import {
  getPublishedProjects,
  getPublicProjectYearRange,
} from "@/lib/public-projects";

import {
  getPublicWorkTaxonomy,
} from "@/lib/public-work-categories";

import WorkArchiveFilter, {
  type WorkArchiveProject,
} from "./WorkArchiveFilter";

import WorkArchiveHomepagePreview, {
  hasHomepageArchiveArtwork,
} from "./WorkArchiveHomepagePreview";

import styles from "./Work.module.css";

import "@/app/work-motion.css";
import "@/app/work-motion-fit.css";


export const revalidate =
  3600;


const description =
  "Selected projects by NATSX across product design, development, identity, and creative direction.";


export const metadata =
  createPageMetadata({
    title:
      "Work",

    description,

    path:
      "/work",
  });


type WorkPageContentProps = {
  locale:
    Locale;

  initialCategory?:
    string;
};


type WorkPageProps = {
  searchParams:
    Promise<{
      category?:
        | string
        | string[];
    }>;
};


function getRequestedCategory(
  value:
    | string
    | string[]
    | undefined,
) {
  if (
    typeof value !==
    "string"
  ) {
    return "all";
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  return normalized ||
    "all";
}


export async function WorkPageContent({
  locale,
  initialCategory = "all",
}: WorkPageContentProps) {
  const copy =
    getWorkMessages(
      locale,
    );

  const selectedWorkCopy =
    getHomeMessages(
      locale,
    ).selectedWork;

  const previewCopy = {
    selectedProject:
      selectedWorkCopy
        .selectedProject,

    visionArtwork:
      selectedWorkCopy
        .visionArtwork,
  };

  const [
    projects,
    taxonomy,
  ] =
    await Promise.all([
      getPublishedProjects(
        locale,
      ),

      getPublicWorkTaxonomy(),
    ]);


  const categorySlugSet =
    new Set(
      taxonomy.categories.map(
        (
          category,
        ) =>
          category.slug,
      ),
    );


  const resolvedInitialCategory =
    initialCategory !==
      "all" &&
    categorySlugSet.has(
      initialCategory,
    )
      ? initialCategory
      : "all";


  const archiveEntries =
    projects.map(
      (
        project,
      ) => {
        const primaryVisual =
          getProjectPrimaryVisualUrl(
            project,
          );

        const secondaryVisual =
          getProjectSecondaryVisualUrl(
            project,
          );

        const previewImage =
          primaryVisual ??
          secondaryVisual;

        const hasPreview =
          hasHomepageArchiveArtwork(
            project.slug,
          ) ||
          Boolean(
            previewImage,
          );

        const archiveProject:
          WorkArchiveProject = {
          project: {
            id:
              project.id,

            slug:
              project.slug,

            number:
              project.number,

            title:
              project.title,

            year:
              project.year,

            disciplines:
              project.disciplines,

            accentColor:
              project.accentColor,
          },

          categorySlugs:
            taxonomy
              .categorySlugsByProjectId[
              project.id
            ] ??
            [],

          hasPreview,
        };

        const preview =
          hasPreview
            ? (
              <WorkArchiveHomepagePreview
                project={
                  project
                }
                primaryVisual={
                  primaryVisual
                }
                secondaryVisual={
                  secondaryVisual
                }
                fallbackImage={
                  previewImage
                }
                copy={
                  previewCopy
                }
              />
            )
            : null;

        return {
          archiveProject,
          preview,
        };
      },
    );

  const archiveProjects =
    archiveEntries.map(
      (
        entry,
      ) =>
        entry.archiveProject,
    );

  const archivePreviews =
    archiveEntries.map(
      (
        entry,
      ) =>
        entry.preview,
    );


  const projectCount =
    String(
      projects.length,
    ).padStart(
      2,
      "0",
    );


  const projectPeriod =
    getPublicProjectYearRange(
      projects,
    );


  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={
          -1
        }
        className={
          styles.page
        }
        data-motion-page="work"
      >
        {/* =========================
            HERO
        ========================= */}

        <section
          className={
            styles.hero
          }
        >
          <div className="site-container">
            <div
              className={
                styles.heroTop
              }
              data-motion-work-hero-piece="top"
            >
              <div
                className={
                  styles.label
                }
              >
                <span
                  className={
                    styles.dot
                  }
                />

                <span>
                  {
                    copy.hero
                      .label
                  }
                </span>
              </div>

              <span
                className={
                  styles.heroIndex
                }
              >
                {
                  copy.hero
                    .index
                }
              </span>
            </div>

            <div
              className={
                styles.heroMain
              }
            >
              <h1
                className={
                  styles.heading
                }
                data-motion-work-hero-piece="title"
              >
                {
                  copy.hero
                    .heading
                }

                <span>
                  .
                </span>
              </h1>

              <div
                className={
                  styles.intro
                }
              >
                <p
                  data-motion-work-hero-piece="intro"
                >
                  {
                    copy.hero
                      .description
                  }
                </p>

                <div
                  className={
                    styles.introMeta
                  }
                  data-motion-work-hero-piece="meta"
                >
                  <div>
                    <span
                      className={
                        styles.metaLabel
                      }
                    >
                      {
                        copy.hero
                          .projects
                      }
                    </span>

                    <span>
                      {
                        projectCount
                      }
                    </span>
                  </div>

                  <div>
                    <span
                      className={
                        styles.metaLabel
                      }
                    >
                      {
                        copy.hero
                          .period
                      }
                    </span>

                    <span>
                      {projectPeriod ||
                        "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            ARCHIVE
        ========================= */}

        <section
          className={
            styles.archive
          }
        >
          <div className="site-container">
            <div
              className={
                styles.archiveHeader
              }
              data-motion-scroll="work-archive-header"
            >
              <span>
                {
                  copy.archive
                    .heading
                }
              </span>

              <span
                className={
                  styles.archiveCount
                }
              >
                {
                  projectCount
                }

                {" / "}

                {
                  copy.archive
                    .current
                }
              </span>
            </div>

            <WorkArchiveFilter
              locale={
                locale
              }
              projects={
                archiveProjects
              }
              categories={
                taxonomy.categories
              }
              initialCategory={
                resolvedInitialCategory
              }
              previews={
                archivePreviews
              }
            />

            {/* =========================
                CLOSING
            ========================= */}

            {projects.length ===
            0 ? (
              <div
                className={
                  styles.closing
                }
                data-motion-scroll="work-closing"
              >
                <div
                  className={
                    styles.closingLabel
                  }
                >
                  <span
                    className={
                      styles.dot
                    }
                  />

                  <span>
                    {
                      copy.empty
                        .label
                    }
                  </span>
                </div>

                <div
                  className={
                    styles.closingMain
                  }
                >
                  <p>
                    {
                      copy.empty
                        .description
                    }
                  </p>

                  <Link
                    href={localizePath("/contact", locale)}
                    className={
                      styles.contactLink
                    }
                  >
                    {
                      copy.empty
                        .contact
                    }

                    <span>
                      ↗
                    </span>
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className={
                  styles.closing
                }
                data-motion-scroll="work-closing"
              >
                <div
                  className={
                    styles.closingLabel
                  }
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
                >
                  <p>
                    {
                      copy.closing
                        .description
                    }
                  </p>

                  <Link
                    href={localizePath("/contact", locale)}
                    className={
                      styles.contactLink
                    }
                  >
                    {
                      copy.closing
                        .contact
                    }

                    <span>
                      ↗
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <InnerFooter
        locale={
          locale
        }
      />
    </>
  );
}


export default async function WorkPage({
  searchParams,
}: WorkPageProps) {
  const params =
    await searchParams;

  return (
    <WorkPageContent
      locale="en"
      initialCategory={
        getRequestedCategory(
          params.category,
        )
      }
    />
  );
}