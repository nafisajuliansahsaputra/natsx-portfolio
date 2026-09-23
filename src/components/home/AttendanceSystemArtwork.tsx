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

  const badgeImageUrl =
    getWebglTextureUrl(
      "/images/projects/attendance/student-card-modern.png",
      1200,
    ) ??
    "/images/projects/attendance/student-card-modern.png";

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
        data-attendance-part="copy"
        aria-hidden="true"
      >
        <h4
          className={
            styles.headline
          }
          data-attendance-part="headline"
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
          data-attendance-part="system-name"
        >
          IDENTITY VERIFICATION SYSTEM
        </p>

        <span
          className={
            styles.rule
          }
          data-attendance-part="rule"
        />

        <p
          className={
            styles.description
          }
          data-attendance-part="description"
        >
          Check in faster.
          <br />
          Verify smarter.
          <br />
          Track in real time.
        </p>
      </div>

      <div data-attendance-part="scene">
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
          badgeImageUrl={
            badgeImageUrl
          }
        />
      </div>
    </AttendanceArtworkRuntimeRoot>
  );
}
