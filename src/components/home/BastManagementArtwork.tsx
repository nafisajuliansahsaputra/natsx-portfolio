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

  mode?:
    | "home"
    | "archive";
};

export default function BastManagementArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
  mode = "home",
}: Props) {
  const optimizedScreenUrl =
    getWebglTextureUrl(
      primaryVisual,
      1200,
    );

  return (
    <BastArtworkRuntimeRoot
      className={
        styles.artwork
      }
    >
      <div className={styles.orbit} data-bast-part="orbit" aria-hidden="true" />
      <div className={styles.orbitBubble} data-bast-part="orbit-bubble" aria-hidden="true" />

      <div className={styles.copy} data-bast-part="copy" aria-hidden="true">
        <h4 className={styles.headline} data-bast-part="headline">BAST</h4>
        <p className={styles.systemName} data-bast-part="system-name">
          BERITA ACARA<br />
          SERAH TERIMA<br />
          MANAGEMENT SYSTEM
        </p>
        <span className={styles.copyRule} data-bast-part="copy-rule" />
        <p className={styles.description} data-bast-part="description">
          From process to proof.<br />
          All in one system.
        </p>
      </div>

      <div data-bast-part="scene">
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
          loadStrategy={
            mode ===
              "archive"
              ? "archive"
              : "viewport"
          }
        />
      </div>

      {secondaryVisual ? (
        <div className={styles.documentStage} data-bast-part="document" aria-hidden="true">
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

      <div className={styles.topNote} data-bast-part="top-note" aria-hidden="true">
        <i />
        <p>DOKUMEN LEBIH TERATUR,<br />KERJA LEBIH MAJU.</p>
      </div>
    </BastArtworkRuntimeRoot>
  );
}
