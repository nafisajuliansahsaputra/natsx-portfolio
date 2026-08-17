import Link from "next/link";

import {
  featuredProjects,
  getProjectYearRange,
  type ProjectHomeVisual,
} from "@/data/projects";

import styles from "./SelectedWork.module.css";

export default function SelectedWork() {
  const yearRange =
    getProjectYearRange(featuredProjects);

  return (
    <section
      className={styles.section}
      id="work"
    >
      <div className="site-container">
        <header
          className={styles.header}
          data-motion-scroll="selected-header"
        >
          <div
            className={styles.headerMeta}
            data-motion-piece="meta"
          >
            <span className={styles.dot} />
            <span>02 / Selected Work</span>
          </div>

          <h2
            className={styles.heading}
            data-motion-piece="title"
          >
            Selected
            <br />
            Work<span>.</span>
          </h2>

          <div
            className={
              styles.headerDescription
            }
            data-motion-piece="description"
          >
            <p>
              A selection of projects across
              design, development, identity,
              and digital experiences.
            </p>

            <span
              className={styles.yearRange}
            >
              {yearRange}
            </span>

            <Link
              href="/work"
              className={styles.projectLink}
            >
              View All Work
              <span>↗</span>
            </Link>
          </div>
        </header>

        <div className={styles.projects}>
          {featuredProjects.map(
            (project) => (
              <article
                className={`${styles.project} ${
                  styles[
                    `layout_${project.home.layout}`
                  ]
                }`}
                key={project.slug}
                data-motion-scroll="project"
              >
                <div
                  className={
                    styles.projectHeader
                  }
                >
                  <span
                    className={
                      styles.projectNumber
                    }
                  >
                    {project.number}
                  </span>

                  <h3
                    className={
                      styles.projectTitle
                    }
                  >
                    {project.title}
                  </h3>

                  <span
                    className={
                      styles.projectYear
                    }
                  >
                    {project.year}
                  </span>
                </div>

                <div
                  className={`${styles.visual} ${
                    styles[
                      `visual_${project.home.visual}`
                    ]
                  }`}
                >
                  <ProjectArtwork
                    variant={
                      project.home.visual
                    }
                  />
                </div>

                <div
                  className={
                    styles.projectFooter
                  }
                >
                  <div
                    className={
                      styles.categories
                    }
                  >
                    {project.disciplines.map(
                      (discipline) => (
                        <span
                          key={discipline}
                        >
                          {discipline}
                        </span>
                      ),
                    )}
                  </div>

                  <Link
                    href={`/work/${project.slug}`}
                    className={
                      styles.projectLink
                    }
                  >
                    View Project
                    <span>↗</span>
                  </Link>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectArtwork({
  variant,
}: {
  variant: ProjectHomeVisual;
}) {
  if (variant === "vision") {
    return (
      <div
        className={styles.visionArtwork}
      >
        <div
          className={styles.visionOrb}
        />

        <div
          className={styles.visionType}
        >
          <span>5AM</span>
          <span>VISION</span>
        </div>

        <span
          className={styles.visualLabel}
        >
          Brand Identity
        </span>
      </div>
    );
  }

  if (variant === "stay") {
    return (
      <div
        className={styles.stayArtwork}
      >
        <div
          className={styles.stayArch}
        />

        <div
          className={styles.stayWindow}
        >
          <div
            className={
              styles.stayWindowTop
            }
          >
            <span />
            <span />
            <span />
          </div>

          <div
            className={
              styles.stayWindowContent
            }
          >
            <p>
              Find your
              <br />
              place in
              <br />
              Indonesia.
            </p>

            <span>
              Explore stays ↗
            </span>
          </div>
        </div>

        <span
          className={styles.visualLabel}
        >
          Product Design / UI UX
        </span>
      </div>
    );
  }

  return (
    <div className={styles.spallArtwork}>
      <div className={styles.spallBrowser}>
        <div
          className={styles.spallBrowserTop}
        >
          <span />
          <span />
          <span />
        </div>

        <div
          className={
            styles.spallBrowserBody
          }
        >
          <span
            className={
              styles.spallMiniLabel
            }
          >
            SPALL SPILL
          </span>

          <strong>
            Curated picks.
            <br />
            Thoughtfully
            <br />
            shared.
          </strong>
        </div>
      </div>

      <div className={styles.spallCard}>
        <span>01</span>

        <strong>SPALL</strong>
        <strong>SPILL</strong>
      </div>

      <span
        className={styles.visualLabel}
      >
        Product / Development
      </span>
    </div>
  );
}