import type {
  PublicProject,
} from "@/lib/public-projects";

import {
  getWebglTextureUrl,
} from "@/lib/webgl-texture-url";

import SpallArtworkRuntimeRoot from "./SpallArtworkRuntimeRoot";
import SpallSceneGate from "./SpallSceneGate";

import styles from "./SpallSpillArtwork.module.css";

type Props = {
  project:
    PublicProject;

  secondaryVisual:
    | string
    | null;

  visualLabel:
    string;
};

export default function SpallSpillArtwork({
  project,
  secondaryVisual,
  visualLabel,
}: Props) {
  const optimizedScreenUrl =
    getWebglTextureUrl(
      secondaryVisual,
      1200,
    );

  return (
    <SpallArtworkRuntimeRoot
      className={
        styles.artwork
      }
    >
      <div
        className={
          styles.light
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.copy
        }
        aria-hidden="true"
      >
        <p
          className={
            styles.headline
          }
        >
          <span>
            YOUR
          </span>

          <span>
            SPACE.
          </span>
        </p>

        <p
          className={
            styles.subline
          }
        >
          your spill.
        </p>

        <p
          className={
            styles.description
          }
        >
          ONE IDENTITY.
          <br />

          MANY THINGS
          <br />

          TO DISCOVER.
        </p>

        <span
          className={
            styles.rule
          }
        />

        <span
          className={
            styles.wordmark
          }
        >
          spall spill.
        </span>
      </div>

      <SpallSceneGate
        className={
          styles.scene
        }
        screenUrl={
          optimizedScreenUrl
        }
        label={
          `${project.title} — ${visualLabel}`
        }
      />

      <span
        className={
          styles.topNote
        }
        aria-hidden="true"
      >
        A MORE
        <br />

        CONNECTED
        <br />

        YOU
      </span>

      <div
        className={
          styles.footer
        }
        aria-hidden="true"
      >
        <span>
          IDENTITY / SPILL / PRODUCT / RESOURCE
        </span>

        <span>
          {
            project.number
          }
          {" — "}
          {
            project.year
          }
        </span>
      </div>
    </SpallArtworkRuntimeRoot>
  );
}
