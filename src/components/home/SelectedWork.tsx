import styles from "./SelectedWork.module.css";

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
    layout: "wide",
    visual: "spall",
  },
  {
    number: "02",
    title: "5AM Vision",
    year: "2026",
    categories: ["Brand Identity", "Creative Direction"],
    slug: "5am-vision",
    layout: "right",
    visual: "vision",
  },
  {
    number: "03",
    title: "Indonesia Stay",
    year: "2026",
    categories: ["Product Design", "UI/UX Design"],
    slug: "indonesia-stay",
    layout: "left",
    visual: "stay",
  },
];

export default function SelectedWork() {
  return (
    <section className={styles.section} id="work">
      <div className="site-container">
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.dot} />
            <span>02 / Selected Work</span>
          </div>

          <h2 className={styles.heading}>
            Selected
            <br />
            Work<span>.</span>
          </h2>

          <div className={styles.headerDescription}>
            <p>
              A selection of projects across design, development, identity,
              and digital experiences.
            </p>

            <span className={styles.yearRange}>2024—2026</span>
          </div>
        </header>

        <div className={styles.projects}>
          {projects.map((project) => (
            <article
              className={`${styles.project} ${
                styles[`layout_${project.layout}`]
              }`}
              key={project.slug}
            >
              <div className={styles.projectHeader}>
                <span className={styles.projectNumber}>
                  {project.number}
                </span>

                <h3 className={styles.projectTitle}>
                  {project.title}
                </h3>

                <span className={styles.projectYear}>
                  {project.year}
                </span>
              </div>

              <div
                className={`${styles.visual} ${
                  styles[`visual_${project.visual}`]
                }`}
              >
                <ProjectArtwork variant={project.visual} />
              </div>

              <div className={styles.projectFooter}>
                <div className={styles.categories}>
                  {project.categories.map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>

                <a
                  href={`/work/${project.slug}`}
                  className={styles.projectLink}
                >
                  View Project
                  <span>↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectArtwork({ variant }: { variant: string }) {
  if (variant === "vision") {
    return (
      <div className={styles.visionArtwork}>
        <div className={styles.visionOrb} />

        <div className={styles.visionType}>
          <span>5AM</span>
          <span>VISION</span>
        </div>

        <span className={styles.visualLabel}>
          Brand Identity
        </span>
      </div>
    );
  }

  if (variant === "stay") {
    return (
      <div className={styles.stayArtwork}>
        <div className={styles.stayArch} />

        <div className={styles.stayWindow}>
          <div className={styles.stayWindowTop}>
            <span />
            <span />
            <span />
          </div>

          <div className={styles.stayWindowContent}>
            <p>
              Find your
              <br />
              place in
              <br />
              Indonesia.
            </p>

            <span>Explore stays ↗</span>
          </div>
        </div>

        <span className={styles.visualLabel}>
          Product Design / UI UX
        </span>
      </div>
    );
  }

  return (
    <div className={styles.spallArtwork}>
      <div className={styles.spallBrowser}>
        <div className={styles.spallBrowserTop}>
          <span />
          <span />
          <span />
        </div>

        <div className={styles.spallBrowserBody}>
          <span className={styles.spallMiniLabel}>
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

      <span className={styles.visualLabel}>
        Product / Development
      </span>
    </div>
  );
}