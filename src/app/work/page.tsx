import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import styles from "./Work.module.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects by NATSX across product design, development, identity, and creative direction.",
};

const projects = [
  {
    number: "01",
    title: "Spall Spill",
    year: "2026",
    categories: [
      "Product Design",
      "Web Development",
      "Creative Direction",
    ],
    slug: "spall-spill",
  },
  {
    number: "02",
    title: "5AM Vision",
    year: "2026",
    categories: ["Brand Identity", "Creative Direction"],
    slug: "5am-vision",
  },
  {
    number: "03",
    title: "Indonesia Stay",
    year: "2026",
    categories: ["Product Design", "UI/UX Design"],
    slug: "indonesia-stay",
  },
];

export default function WorkPage() {
  const projectCount = String(projects.length).padStart(2, "0");

  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="site-container">
            <div className={styles.heroTop}>
              <div className={styles.label}>
                <span className={styles.dot} />
                <span>Work / Archive</span>
              </div>

              <span className={styles.heroIndex}>
                Selected projects / NATSX
              </span>
            </div>

            <div className={styles.heroMain}>
              <h1 className={styles.heading}>
                Work<span>.</span>
              </h1>

              <div className={styles.intro}>
                <p>
                  A growing archive of projects across design, development,
                  identity, and digital experiences.
                </p>

                <div className={styles.introMeta}>
                  <div>
                    <span className={styles.metaLabel}>Projects</span>
                    <span>{projectCount}</span>
                  </div>

                  <div>
                    <span className={styles.metaLabel}>Period</span>
                    <span>2024—2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.archive}>
          <div className="site-container">
            <div className={styles.archiveHeader}>
              <span>All Projects</span>

              <span className={styles.archiveCount}>
                {projectCount} / Current Archive
              </span>
            </div>

            <div className={styles.projects}>
              {projects.map((project) => (
                <Link
                  href={`/work/${project.slug}`}
                  className={styles.project}
                  key={project.slug}
                >
                  <span className={styles.projectNumber}>
                    {project.number}
                  </span>

                  <div className={styles.projectMain}>
                    <h2>{project.title}</h2>

                    <div className={styles.categories}>
                      {project.categories.map((category) => (
                        <span key={category}>{category}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.projectMeta}>
                    <span className={styles.projectYear}>
                      {project.year}
                    </span>
                  </div>

                  <span
                    className={styles.projectArrow}
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </Link>
              ))}
            </div>

            <div className={styles.closing}>
              <div className={styles.closingLabel}>
                <span className={styles.dot} />
                <span>ONGOING ARCHIVE</span>
              </div>

              <div className={styles.closingMain}>
                <p>
                  The archive keeps growing as new ideas become
                  real projects.
                </p>

                <Link
                  href="/#contact"
                  className={styles.contactLink}
                >
                  Start a conversation
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}