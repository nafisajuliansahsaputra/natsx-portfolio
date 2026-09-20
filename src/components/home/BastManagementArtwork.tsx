import Image from "next/image";

import type {
  PublicProject,
} from "@/lib/public-projects";

import {
  getWebglTextureUrl,
} from "@/lib/webgl-texture-url";

import BastArtworkRuntimeRoot from "./BastArtworkRuntimeRoot";
import BastSceneGate from "./BastSceneGate";

import styles from "./BastManagementArtwork.module.css";

type Props = {
  project:
    PublicProject;

  primaryVisual:
    string | null;

  secondaryVisual:
    string | null;

  visualLabel:
    string;
};

export default function BastManagementArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
}: Props) {
  const optimizedScreenUrl =
    getWebglTextureUrl(
      primaryVisual,
      1440,
    );

  return (
    <BastArtworkRuntimeRoot
      className={
        styles.artwork
      }
    >
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.orbitBubble} aria-hidden="true" />

      <div className={styles.copy} aria-hidden="true">
        <h4 className={styles.headline}>BAST</h4>
        <p className={styles.systemName}>
          BERITA ACARA<br />
          SERAH TERIMA<br />
          MANAGEMENT SYSTEM
        </p>
        <span className={styles.copyRule} />
        <p className={styles.description}>
          From process to proof.<br />
          All in one system.
        </p>
      </div>

      <BastSceneGate
        className={
          styles.scene
        }
        screenUrl={
          optimizedScreenUrl
        }
        label={
          project.title +
          " — " +
          visualLabel
        }
      />

      {secondaryVisual ? (
        <div className={styles.documentStage} aria-hidden="true">
          <div className={styles.documentShadow} />
          <div className={styles.documentSheet}>
            <Image
              src={secondaryVisual}
              alt=""
              fill
              sizes="(max-width: 700px) 30vw, 24vw"
              className={styles.documentImage}
            />
          </div>
        </div>
      ) : null}

      <div className={styles.topNote} aria-hidden="true">
        <i />
        <p>DOKUMEN LEBIH TERATUR,<br />KERJA LEBIH MAJU.</p>
      </div>
    </BastArtworkRuntimeRoot>
  );
}
