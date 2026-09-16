"use client";

import dynamic from "next/dynamic";

import type { PublicProject } from "@/lib/public-projects";
import styles from "./SpallSpillArtwork.module.css";

const SpallPhone3D = dynamic(() => import("./SpallPhone3D"), {
  ssr: false,
});

type SpallSpillArtworkProps = {
  project: PublicProject;
  primaryVisual: string | null;
  secondaryVisual: string | null;
  visualLabel: string;
};

export default function SpallSpillArtwork({
  project,
  secondaryVisual,
  visualLabel,
}: SpallSpillArtworkProps) {
  return (
    <div className={styles.artwork} data-spall-featured="true">
      <div className={styles.greenPage} aria-hidden="true" />
      <div className={styles.pageLight} aria-hidden="true" />

      <div className={styles.identity} aria-hidden="true">
        <span className={styles.wordmark}>
          spall<span>spill.</span>
        </span>

        <span className={styles.identityCaption}>
          A PERSONAL SPACE,
          <br />
          MADE TO BE SHARED.
        </span>
      </div>

      <span className={styles.edition} aria-hidden="true">
        DIGITAL EXPERIENCE / {project.number}
      </span>

      <div className={styles.editorialCopy} aria-hidden="true">
        <span className={styles.eyebrow}>
          YOUR OWN CORNER OF THE INTERNET
        </span>

        <p className={styles.statement}>
          Your space.
          <br />
          Your <em>spill.</em>
        </p>

        <p className={styles.description}>
          A place for who you are
          <br />
          and what you want to share.
        </p>
      </div>

      <div className={styles.phoneShadow} aria-hidden="true" />

      <div className={styles.webglStage}>
        <SpallPhone3D
          screenUrl={secondaryVisual}
          label={`${project.title} — tampilan mobile pada iPhone 17 Pro Max`}
        />
      </div>

      <div className={styles.contents} aria-hidden="true">
        <span className={styles.contentsLabel}>INSIDE YOUR SPACE</span>

        <div className={styles.chapter}>
          <span className={styles.chapterNumber}>01</span>
          <strong>Identity</strong>
          <p>
            Your profile.
            <br />
            Your connections.
          </p>
        </div>

        <div className={styles.chapter}>
          <span className={styles.chapterNumber}>02</span>
          <strong>Spill</strong>
          <p>
            Your finds.
            <br />
            Worth sharing.
          </p>
        </div>

        <span className={styles.endMark}>↗</span>
      </div>

      <div className={styles.colophon} aria-hidden="true">
        <span className={styles.colophonLabel}>DESIGNED FOR THE HAND.</span>
        <span className={styles.disciplines}>{visualLabel}</span>
      </div>

      <span className={styles.pageNumber} aria-hidden="true">
        SPALL SPILL — {project.year}
      </span>
    </div>
  );
}