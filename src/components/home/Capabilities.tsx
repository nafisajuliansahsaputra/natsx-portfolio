import styles from "./Capabilities.module.css";

const capabilities = [
  {
    number: "01",
    title: "Design",
    description:
      "Creating clear and considered visual experiences across digital products, interfaces, and brand systems.",
    skills: ["UI/UX Design", "Web Design", "Graphic Design", "Visual Identity"],
  },
  {
    number: "02",
    title: "Development",
    description:
      "Turning visual concepts into responsive and functional digital experiences with modern web technologies.",
    skills: [
      "Frontend Development",
      "Next.js",
      "React",
      "Creative Development",
    ],
  },
  {
    number: "03",
    title: "Motion",
    description:
      "Adding movement with purpose through motion graphics, interaction, editing, and visual storytelling.",
    skills: ["Motion Design", "UI Motion", "Video Editing", "Interaction"],
  },
  {
    number: "04",
    title: "Creative",
    description:
      "Shaping ideas beyond individual deliverables through direction, experimentation, and visual exploration.",
    skills: [
      "Creative Direction",
      "Art Direction",
      "AI Creative",
      "Visual Exploration",
    ],
  },
];

export default function Capabilities() {
  return (
    <section className={styles.section} id="capabilities">
      <div className="site-container">
        <div className={styles.layout}>
          <div className={styles.introColumn}>
            <div className={styles.intro}>
              <div className={styles.sectionLabel}>
                <span className={styles.dot} />
                <span>03 / Capabilities</span>
              </div>

              <h2 className={styles.heading}>
                Ideas across
                <br />
                disciplines<span>.</span>
              </h2>

              <p className={styles.introText}>
                I work across design, development, motion, and creative
                direction—connecting different disciplines to build complete
                digital experiences.
              </p>
            </div>
          </div>

          <div className={styles.list}>
            {capabilities.map((capability) => (
              <article className={styles.item} key={capability.number}>
                <div className={styles.itemTop}>
                  <span className={styles.number}>
                    {capability.number}
                  </span>

                  <h3 className={styles.title}>
                    {capability.title}
                  </h3>
                </div>

                <div className={styles.itemContent}>
                  <p className={styles.description}>
                    {capability.description}
                  </p>

                  <div
                    className={styles.skills}
                    aria-label={`${capability.title} skills`}
                  >
                    {capability.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}