"use client";

import type {
  CSSProperties,
  ReactNode,
} from "react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  localizePath,
  type Locale,
} from "@/i18n/config";

import type {
  PublicProject,
} from "@/lib/public-projects";

import type {
  PublicWorkCategory,
} from "@/lib/public-work-categories";

import filterStyles from "./WorkArchiveFilter.module.css";

import styles from "./Work.module.css";


export type WorkArchiveProject = {
  project:
    Pick<
      PublicProject,
      | "id"
      | "slug"
      | "number"
      | "title"
      | "year"
      | "disciplines"
      | "accentColor"
    >;

  categorySlugs:
    string[];

  hasPreview:
    boolean;
};


type WorkArchiveFilterProps = {
  locale:
    Locale;

  projects:
    WorkArchiveProject[];

  categories:
    PublicWorkCategory[];

  initialCategory:
    string;

  previews:
    ReactNode[];
};


type FilterPhase =
  | "idle"
  | "leaving"
  | "entering";


const FILTER_EXIT_DURATION =
  180;

const FILTER_ENTER_DURATION =
  620;


function getPreviewVariant(
  index:
    number,
) {
  if (
    index % 3 ===
    1
  ) {
    return "drop";
  }

  if (
    index % 3 ===
    2
  ) {
    return "center";
  }

  return "rise";
}


function getProjectMatchesCategory(
  category:
    string,

  categorySlugs:
    string[],
) {
  return (
    category ===
      "all" ||
    categorySlugs.includes(
      category,
    )
  );
}



export default function WorkArchiveFilter({
  locale,
  projects,
  categories,
  initialCategory,
  previews,
}: WorkArchiveFilterProps) {
  /*
   * activeCategory:
   * button / URL state.
   *
   * renderedCategory:
   * category currently rendered by
   * the project archive.
   *
   * Separating these two lets the old
   * archive animate OUT before the new
   * archive replaces it.
   */
  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState(
      initialCategory,
    );

  const [
    renderedCategory,
    setRenderedCategory,
  ] =
    useState(
      initialCategory,
    );

  const [
    phase,
    setPhase,
  ] =
    useState<FilterPhase>(
      "idle",
    );

  const [
    canScrollRight,
    setCanScrollRight,
  ] =
    useState(
      false,
    );


  const trackRef =
    useRef<HTMLDivElement>(
      null,
    );

  const buttonRefs =
    useRef<
      Record<
        string,
        HTMLButtonElement | null
      >
    >({});

  const exitTimerRef =
    useRef<number | null>(
      null,
    );

  const enterTimerRef =
    useRef<number | null>(
      null,
    );


  const categorySlugSet =
    useMemo(
      () =>
        new Set(
          categories.map(
            (
              category,
            ) =>
              category.slug,
          ),
        ),
      [
        categories,
      ],
    );


  const categoryCounts =
    useMemo(
      () => {
        const counts:
          Record<
            string,
            number
          > = {};

        for (
          const category of
          categories
        ) {
          counts[
            category.slug
          ] =
            0;
        }

        for (
          const item of
          projects
        ) {
          for (
            const slug of
            item.categorySlugs
          ) {
            if (
              slug in
              counts
            ) {
              counts[
                slug
              ] +=
                1;
            }
          }
        }

        return counts;
      },
      [
        categories,
        projects,
      ],
    );


  const activeVisibleCount =
    useMemo(
      () => {
        if (
          activeCategory ===
          "all"
        ) {
          return projects.length;
        }

        return projects.filter(
          (
            item,
          ) =>
            item.categorySlugs.includes(
              activeCategory,
            ),
        ).length;
      },
      [
        activeCategory,
        projects,
      ],
    );


  const renderedVisibleCount =
    useMemo(
      () => {
        if (
          renderedCategory ===
          "all"
        ) {
          return projects.length;
        }

        return projects.filter(
          (
            item,
          ) =>
            item.categorySlugs.includes(
              renderedCategory,
            ),
        ).length;
      },
      [
        renderedCategory,
        projects,
      ],
    );


  /* =========================
     TIMER CLEANUP
  ========================= */

  const clearTransitionTimers =
    useCallback(() => {
      if (
        exitTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          exitTimerRef.current,
        );

        exitTimerRef.current =
          null;
      }

      if (
        enterTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          enterTimerRef.current,
        );

        enterTimerRef.current =
          null;
      }
    }, []);


  useEffect(() => {
    return () => {
      clearTransitionTimers();
    };
  }, [
    clearTransitionTimers,
  ]);


  /* =========================
     MOBILE TRACK CUE
  ========================= */

  useEffect(() => {
    const track =
      trackRef.current;

    if (
      !track
    ) {
      return;
    }

    const updateScrollState =
      () => {
        const remaining =
          track.scrollWidth -
          track.clientWidth -
          track.scrollLeft;

        setCanScrollRight(
          remaining >
            3,
        );
      };

    updateScrollState();

    track.addEventListener(
      "scroll",
      updateScrollState,
      {
        passive:
          true,
      },
    );

    window.addEventListener(
      "resize",
      updateScrollState,
    );

    let resizeObserver:
      ResizeObserver |
      null =
      null;

    if (
      typeof ResizeObserver !==
      "undefined"
    ) {
      resizeObserver =
        new ResizeObserver(
          updateScrollState,
        );

      resizeObserver.observe(
        track,
      );
    }

    return () => {
      track.removeEventListener(
        "scroll",
        updateScrollState,
      );

      window.removeEventListener(
        "resize",
        updateScrollState,
      );

      resizeObserver?.disconnect();
    };
  }, [
    categories,
  ]);


  /* =========================
     AUTO SCROLL ACTIVE FILTER
  ========================= */

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(max-width: 700px)",
      );

    if (
      !mediaQuery.matches
    ) {
      return;
    }

    const button =
      buttonRefs.current[
        activeCategory
      ];

    if (
      !button
    ) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const frame =
      window.requestAnimationFrame(
        () => {
          button.scrollIntoView({
            behavior:
              prefersReducedMotion
                ? "auto"
                : "smooth",

            block:
              "nearest",

            inline:
              "center",
          });
        },
      );

    return () => {
      window.cancelAnimationFrame(
        frame,
      );
    };
  }, [
    activeCategory,
  ]);


  /* =========================
     CATEGORY TRANSITION
  ========================= */

  const transitionToCategory =
    useCallback(
      (
        requestedCategory:
          string,

        updateHistory:
          boolean,
      ) => {
        const resolvedCategory =
          requestedCategory !==
            "all" &&
          categorySlugSet.has(
            requestedCategory,
          )
            ? requestedCategory
            : "all";

        if (
          resolvedCategory ===
            activeCategory &&
          phase ===
            "idle"
        ) {
          return;
        }

        clearTransitionTimers();

        setActiveCategory(
          resolvedCategory,
        );

        if (
          updateHistory
        ) {
          const url =
            new URL(
              window.location.href,
            );

          if (
            resolvedCategory ===
            "all"
          ) {
            url.searchParams.delete(
              "category",
            );
          } else {
            url.searchParams.set(
              "category",
              resolvedCategory,
            );
          }

          window.history.pushState(
            null,
            "",
            `${url.pathname}${url.search}${url.hash}`,
          );
        }

        const prefersReducedMotion =
          window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

        if (
          prefersReducedMotion
        ) {
          setRenderedCategory(
            resolvedCategory,
          );

          setPhase(
            "idle",
          );

          return;
        }

        setPhase(
          "leaving",
        );

        exitTimerRef.current =
          window.setTimeout(
            () => {
              setRenderedCategory(
                resolvedCategory,
              );

              setPhase(
                "entering",
              );

              exitTimerRef.current =
                null;

              enterTimerRef.current =
                window.setTimeout(
                  () => {
                    setPhase(
                      "idle",
                    );

                    enterTimerRef.current =
                      null;
                  },
                  FILTER_ENTER_DURATION,
                );
            },
            FILTER_EXIT_DURATION,
          );
      },
      [
        activeCategory,
        categorySlugSet,
        clearTransitionTimers,
        phase,
      ],
    );


  /* =========================
     HISTORY BACK / FORWARD
  ========================= */

  useEffect(() => {
    const syncFromUrl =
      () => {
        const params =
          new URLSearchParams(
            window.location.search,
          );

        const requested =
          params
            .get(
              "category",
            )
            ?.trim()
            .toLowerCase() ??
          "all";

        transitionToCategory(
          requested,
          false,
        );
      };

    window.addEventListener(
      "popstate",
      syncFromUrl,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        syncFromUrl,
      );
    };
  }, [
    transitionToCategory,
  ]);


  return (
    <>
      {/* =========================
          FILTER
      ========================= */}

      <div
        className={
          filterStyles.filter
        }
        data-motion-scroll="work-filter"
      >
        <div
          className={
            filterStyles.filterMeta
          }
        >
          <span>
            FILTER
          </span>

          <span
            aria-live="polite"
          >
            {String(
              activeVisibleCount,
            ).padStart(
              2,
              "0",
            )}{" "}
            SHOWN
          </span>
        </div>

        <div
          className={
            filterStyles.trackShell
          }
          data-can-scroll-right={
            canScrollRight
              ? "true"
              : "false"
          }
        >
          <div
            ref={
              trackRef
            }
            className={
              filterStyles.track
            }
            role="group"
            aria-label="Filter projects by category"
          >
            <button
              ref={(
                element,
              ) => {
                buttonRefs.current.all =
                  element;
              }}
              type="button"
              data-filter-slug="all"
              className={
                activeCategory ===
                "all"
                  ? `${filterStyles.filterButton} ${filterStyles.active}`
                  : filterStyles.filterButton
              }
              aria-pressed={
                activeCategory ===
                "all"
              }
              aria-controls="work-project-list"
              onClick={() =>
                transitionToCategory(
                  "all",
                  true,
                )
              }
            >
              <span
                className={
                  filterStyles.signal
                }
                aria-hidden="true"
              />

              <span
                className={
                  filterStyles.filterName
                }
              >
                All
              </span>

              <span
                className={
                  filterStyles.filterCount
                }
              >
                {String(
                  projects.length,
                ).padStart(
                  2,
                  "0",
                )}
              </span>
            </button>

            {categories.map(
              (
                category,
              ) => {
                const active =
                  activeCategory ===
                  category.slug;

                return (
                  <button
                    ref={(
                      element,
                    ) => {
                      buttonRefs.current[
                        category.slug
                      ] =
                        element;
                    }}
                    type="button"
                    key={
                      category.id
                    }
                    data-filter-slug={
                      category.slug
                    }
                    className={
                      active
                        ? `${filterStyles.filterButton} ${filterStyles.active}`
                        : filterStyles.filterButton
                    }
                    aria-pressed={
                      active
                    }
                    aria-controls="work-project-list"
                    onClick={() =>
                      transitionToCategory(
                        category.slug,
                        true,
                      )
                    }
                  >
                    <span
                      className={
                        filterStyles.signal
                      }
                      aria-hidden="true"
                    />

                    <span
                      className={
                        filterStyles.filterName
                      }
                    >
                      {
                        category.name
                      }
                    </span>

                    <span
                      className={
                        filterStyles.filterCount
                      }
                    >
                      {String(
                        categoryCounts[
                          category.slug
                        ] ??
                          0,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* =========================
          PROJECT ARCHIVE
      ========================= */}

      <div
        id="work-project-list"
        className={
          styles.projects
        }
      >
        {projects.map(
          (
            item,
            index,
          ) => {
            const {
              project,
              categorySlugs,
              hasPreview,
            } =
              item;

            const preview =
              previews[
                index
              ];

            const matchesRenderedCategory =
              getProjectMatchesCategory(
                renderedCategory,
                categorySlugs,
              );

            const projectStyle = {
              "--row-accent":
                project.accentColor,
            } as CSSProperties;

            const slotStyle = {
              "--filter-stagger":
                `${Math.min(
                  index,
                  5,
                ) * 34}ms`,
            } as CSSProperties;

            const slotClassName =
              [
                filterStyles.projectSlot,

                phase ===
                  "leaving" &&
                matchesRenderedCategory
                  ? filterStyles.projectLeaving
                  : "",

                phase ===
                  "entering" &&
                matchesRenderedCategory
                  ? filterStyles.projectEntering
                  : "",
              ]
                .filter(
                  Boolean,
                )
                .join(
                  " ",
                );

            return (
              <div
                className={
                  slotClassName
                }
                key={
                  project.id
                }
                hidden={
                  !matchesRenderedCategory
                }
                style={
                  slotStyle
                }
              >
                <Link
                  href={localizePath(`/work/${project.slug}`, locale)}
                  prefetch={
                    false
                  }
                  className={
                    styles.project
                  }
                  data-motion-scroll="work-project"
                  data-route-transition-project-title={
                    project.title
                  }
                  data-route-transition-project-number={
                    project.number
                  }
                  data-project-slug={
                    project.slug
                  }
                  data-preview-variant={
                    getPreviewVariant(
                      index,
                    )
                  }
                  data-has-preview={
  hasPreview
    ? "true"
    : "false"
}
                  data-work-categories={
                    categorySlugs.join(
                      " ",
                    )
                  }
                  style={
                    projectStyle
                  }
                >
                  <span
                    className={
                      styles.projectNumber
                    }
                  >
                    {
                      project.number
                    }
                  </span>

                  <div
                    className={
                      styles.projectMain
                    }
                  >
                    <h2>
                      {
                        project.title
                      }
                    </h2>

                    <div
                      className={
                        styles.categories
                      }
                    >
                      {project.disciplines.map(
                        (
                          discipline,
                        ) => (
                          <span
                            key={
                              discipline
                            }
                          >
                            {
                              discipline
                            }
                          </span>
                        ),
                      )}
                    </div>
                  </div>

{hasPreview &&
preview ? (
  <div
    className={
      styles.previewStage
    }
    data-work-preview-stage="true"
    aria-hidden="true"
  >
    <div
      className={
        styles.previewFrame
      }
    >
      {
        preview
      }
    </div>
  </div>
) : null}

                  <div
                    className={
                      styles.projectMeta
                    }
                  >
                    <span
                      className={
                        styles.projectYear
                      }
                    >
                      {
                        project.year
                      }
                    </span>
                  </div>

                  <span
                    className={
                      styles.projectArrow
                    }
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </Link>
              </div>
            );
          },
        )}

        {renderedVisibleCount ===
        0 ? (
          <div
            className={[
              filterStyles.empty,

              phase ===
              "leaving"
                ? filterStyles.emptyLeaving
                : "",

              phase ===
              "entering"
                ? filterStyles.emptyEntering
                : "",
            ]
              .filter(
                Boolean,
              )
              .join(
                " ",
              )}
          >
            <span>
              00 / EMPTY
            </span>

            <p>
              No published
              projects in this
              category yet
              <strong>
                .
              </strong>
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}