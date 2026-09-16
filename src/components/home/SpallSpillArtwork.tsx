"use client";

import dynamic from "next/dynamic";
import type { PublicProject } from "@/lib/public-projects";
import styles from "./SpallSpillArtwork.module.css";

const SpallEditorialScene = dynamic(
  () => import("./SpallEditorialScene"),
  { ssr: false },
);

type Props = {
  project: PublicProject;
  primaryVisual: string | null;
  secondaryVisual: string | null;
  visualLabel: string;
};

export default function SpallSpillArtwork({
  project,
  secondaryVisual,
}: Props) {
  return (
    <div className={styles.artwork} data-spall-featured="true">
      <div className={styles.light} aria-hidden="true" />

      <div className={styles.copy} aria-hidden="true">
        <p className={styles.headline}>
          <span>YOUR</span>
          <span>SPACE.</span>
        </p>

        <p className={styles.subline}>your spill.</p>

        <p className={styles.description}>
          ONE IDENTITY.
          <br />
          MANY THINGS
          <br />
          TO DISCOVER.
        </p>

        <span className={styles.rule} />
        <span className={styles.wordmark}>spall spill.</span>
      </div>

      <div className={styles.scene}>
        <SpallEditorialScene
          screenUrl={secondaryVisual}
          label={`${project.title} — iPhone, identitas, berbagi, dan discovery dalam satu komposisi 3D`}
        />
      </div>

      <span className={styles.topNote} aria-hidden="true">
        A MORE
        <br />
        CONNECTED
        <br />
        YOU
      </span>

      <div className={styles.footer} aria-hidden="true">
        <span>IDENTITY / SPILL / PRODUCT / RESOURCE</span>
        <span>{project.number} — {project.year}</span>
      </div>
    </div>
  );
}