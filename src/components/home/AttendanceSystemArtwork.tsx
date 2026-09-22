import type {
  PublicProject,
} from "@/lib/public-projects";

import {
  getWebglTextureUrl,
} from "@/lib/webgl-texture-url";

import AttendanceArtworkRuntimeRoot from "./AttendanceArtworkRuntimeRoot";
import AttendanceSceneGate from "./AttendanceSceneGate";

import styles from "./AttendanceSystemArtwork.module.css";

type AttendanceSystemArtworkProps = {
  project:
    PublicProject;

  primaryVisual:
    string | null;

  secondaryVisual:
    string | null;
};

export default function AttendanceSystemArtwork({
  project,
  primaryVisual,
  secondaryVisual,
}: AttendanceSystemArtworkProps) {
  const dashboardImageUrl =
    getWebglTextureUrl(
      primaryVisual ??
        secondaryVisual ??
        null,
      1200,
    );

  const scannerImageUrl =
    getWebglTextureUrl(
      secondaryVisual ??
        primaryVisual ??
        null,
      1200,
    );

  return (
    <AttendanceArtworkRuntimeRoot
      className={
        styles.artwork
      }
    >
      <div
        className={
          styles.copy
        }
        aria-hidden="true"
      >
        <h4
          className={
            styles.headline
          }
        >
          <span>
            Smart
          </span>

          <strong>
            Attendance
          </strong>

          <span>
            System
          </span>
        </h4>

        <p
          className={
            styles.systemName
          }
        >
          IDENTITY VERIFICATION SYSTEM
        </p>

        <span
          className={
            styles.rule
          }
        />

        <p
          className={
            styles.description
          }
        >
          Check in faster.
          <br />
          Verify smarter.
          <br />
          Track in real time.
        </p>
      </div>

      <AttendanceSceneGate
        className={
          styles.scene
        }
        label={
          `${project.title} — floating attendance hardware`
        }
        dashboardImageUrl={
          dashboardImageUrl
        }
        scannerImageUrl={
          scannerImageUrl
        }
      />
    </AttendanceArtworkRuntimeRoot>
  );
}
