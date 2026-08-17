import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import styles from "./Playground.module.css";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "A collection of experiments, visual studies, motion, typography, and creative explorations by NATSX.",
};

const experiments = [
  {
    number: "01",
    title: "Generative Visual",
    category: "AI / Visual Study",
    description:
      "Exploring composition, image systems, and unexpected visual directions through generative tools.",
    visual: "generative",
  },
  {
    number: "02",
    title: "Type in Motion",
    category: "Motion / Typography",
    description:
      "A study in rhythm, scale, timing, and how typography changes when it begins to move.",
    visual: "motion",
  },
  {
    number: "03",
    title: "Form Study",
    category: "3D / Experiment",
    description:
      "Simple forms, proportion, light, and composition explored without the constraints of a final deliverable.",
    visual: "form",
  },
  {
    number: "04",
    title: "Poster System",
    category: "Graphic / Typography",
    description:
      "An evolving graphic system built through type, structure, repetition, and visual tension.",
    visual: "poster",
  },
] as const;

type ExperimentVisualType = (typeof experiments)[number]["visual"];

function ExperimentVisual({
  type,
}: {
  type: ExperimentVisualType;
}) {
  if (type === "generative") {
    return (
      <div className={`${styles.visual} ${styles.generativeVisual}`}>
        <div className={styles.generativeGrid} />
        <div className={styles.generativeCircle} />
        <div className={styles.generativeSquare} />

        <span className={styles.visualIndex}>NATSX / 01</span>
        <span className={styles.visualPlus}>+</span>
      </div>
    );
  }

  if (type === "motion") {
    return (
      <div className={`${styles.visual} ${styles.motionVisual}`}>
        <div className={styles.motionWord}>
          <span>MO</span>
          <span>VE</span>
        </div>

        <span className={styles.motionMeta}>
          TYPE
          <br />
          IN
          <br />
          MOTION
        </span>

        <div className={styles.motionLine} />
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className={`${styles.visual} ${styles.formVisual}`}>
        <div className={styles.formCircleLarge} />
        <div className={styles.formCircleSmall} />
        <div className={styles.formBlock} />

        <span className={styles.formLabel}>
          FORM
          <br />
          STUDY
        </span>
      </div>
    );
  }

  return (
    <div className={`${styles.visual} ${styles.posterVisual}`}>
      <div className={styles.posterTop}>
        <span>NATSX</span>
        <span>04 / PLAY</span>
      </div>

      <div className={styles.posterWords}>
        <span>MAKE</span>
        <span>TRY</span>
        <span>REPEAT</span>
      </div>

      <div className={styles.posterBottom}>
        <span>VISUAL EXPERIMENT</span>
        <span>2026</span>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="site-container">
            <div className={styles.heroTop}>
              <div className={styles.label}>
                <span className={styles.dot} />
                <span>Playground / Experiments</span>
              </div>

              <span className={styles.heroMeta}>
                Curious / Uncommissioned / Ongoing
              </span>
            </div>

            <div className={styles.heroMain}>
              <h1 className={styles.heading}>
                Where ideas
                <br />
                get to wander<span>.</span>
              </h1>

              <div className={styles.heroIntro}>
                <p>
                  A space for experiments, visual studies, motion,
                  typography, and ideas explored outside structured
                  project work.
                </p>

                <span>
                  No fixed outcome.
                  <br />
                  Just something worth trying.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.gallery}>
          <div className="site-container">
            <div className={styles.galleryHeader}>
              <div className={styles.label}>
                <span className={styles.dot} />
                <span>Current Experiments</span>
              </div>

              <span className={styles.galleryCount}>
                04 / Ongoing Collection
              </span>
            </div>

            <div className={styles.galleryGrid}>
              {experiments.map((experiment) => (
                <article
                  className={styles.experiment}
                  key={experiment.number}
                >
                  <div className={styles.visualWrap}>
                    <ExperimentVisual type={experiment.visual} />
                  </div>

                  <div className={styles.experimentInfo}>
                    <div className={styles.experimentHeading}>
                      <span>{experiment.number}</span>

                      <h2>{experiment.title}</h2>
                    </div>

                    <div className={styles.experimentMeta}>
                      <span>{experiment.category}</span>

                      <p>{experiment.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.manifesto}>
          <div className="site-container">
            <div className={styles.manifestoGrid}>
              <div className={styles.manifestoLabel}>
                <span className={styles.darkDot} />
                <span>Why Playground?</span>
              </div>

              <div className={styles.manifestoMain}>
                <h2>
                  Not everything
                  <br />
                  needs a brief to be
                  <br />
                  worth making<span>.</span>
                </h2>

                <div className={styles.manifestoCopy}>
                  <p>
                    Some ideas exist simply because they are interesting
                    enough to explore.
                  </p>

                  <p>
                    The playground is where I can test those ideas,
                    learn something new, break familiar patterns, and
                    occasionally discover something worth carrying into
                    real project work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className="site-container">
            <div className={styles.closingGrid}>
              <div className={styles.closingLabel}>
                <span className={styles.dot} />
                <span>Looking for finished work?</span>
              </div>

              <div className={styles.closingMain}>
                <p>
                  Experiments are one side.
                  <br />
                  Projects are the other<span>.</span>
                </p>

                <Link
                  href="/work"
                  className={styles.closingLink}
                >
                  Explore selected work
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