import styles from "./PlaygroundPreview.module.css";

const experiments = [
  {
    number: "01",
    title: "Generative Visual",
    category: "AI / Visual Study",
    layout: "large",
    visual: "generative",
  },
  {
    number: "02",
    title: "Type in Motion",
    category: "Motion / Typography",
    layout: "portrait",
    visual: "type",
  },
  {
    number: "03",
    title: "Form Study",
    category: "3D / Experiment",
    layout: "square",
    visual: "form",
  },
  {
    number: "04",
    title: "Poster System",
    category: "Graphic / Typography",
    layout: "wide",
    visual: "poster",
  },
];

export default function PlaygroundPreview() {
  return (
    <section className={styles.section} id="playground">
      <div className="site-container">
        <header className={styles.header}>
          <div className={styles.label}>
            <span className={styles.dot} />
            <span>05 / Playground</span>
          </div>

          <div className={styles.headerMain}>
            <h2 className={styles.heading}>
              Built from
              <br />
              curiosity<span>.</span>
            </h2>

            <div className={styles.headerRight}>
              <p>
                A space for experiments, visual studies, motion, and ideas
                explored outside structured project work.
              </p>

              <a href="/playground" className={styles.allLink}>
                Explore Playground <span>↗</span>
              </a>
            </div>
          </div>
        </header>

        <div className={styles.gallery}>
          {experiments.map((experiment) => (
            <article
              className={`${styles.item} ${
                styles[`layout_${experiment.layout}`]
              }`}
              key={experiment.number}
            >
              <a
                href="/playground"
                className={styles.visualLink}
                aria-label={`View ${experiment.title}`}
              >
                <div
                  className={`${styles.visual} ${
                    styles[`visual_${experiment.visual}`]
                  }`}
                >
                  <ExperimentArtwork variant={experiment.visual} />

                  <span className={styles.hoverLabel}>
                    View Experiment ↗
                  </span>
                </div>
              </a>

              <div className={styles.meta}>
                <div>
                  <span className={styles.number}>
                    {experiment.number}
                  </span>

                  <h3>{experiment.title}</h3>
                </div>

                <span className={styles.category}>
                  {experiment.category}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperimentArtwork({ variant }: { variant: string }) {
  if (variant === "generative") {
    return (
      <div className={styles.generativeArtwork}>
        <div className={styles.generativeCircle} />
        <div className={styles.generativeGrid} />

        <span className={styles.artLabel}>
          GENERATIVE / 001
        </span>
      </div>
    );
  }

  if (variant === "type") {
    return (
      <div className={styles.typeArtwork}>
        <span>N</span>
        <span>A</span>
        <span>T</span>
        <span>S</span>
        <span>X</span>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={styles.formArtwork}>
        <div className={styles.formShape} />
        <span>FORM / STUDY</span>
      </div>
    );
  }

  return (
    <div className={styles.posterArtwork}>
      <span className={styles.posterSmall}>KEEP</span>

      <strong>
        MAKING
        <br />
        THINGS.
      </strong>

      <span className={styles.posterIndex}>
        04 / NATSX
      </span>
    </div>
  );
}