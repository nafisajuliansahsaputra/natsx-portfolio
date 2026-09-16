import Image from "next/image";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./AttendanceSystemArtwork.module.css";

type AttendanceSystemArtworkProps = {
  project:
    PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;
};

export default function AttendanceSystemArtwork({
  project,
  primaryVisual,
  secondaryVisual,
}: AttendanceSystemArtworkProps) {
  return (
    <div
      className={
        styles.artwork
      }
      data-attendance-featured="true"
    >
      <div
        className={
          styles.grid
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.ambientGlow
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.backgroundType
        }
        aria-hidden="true"
      >
        IDENTITY
      </div>

      <div
        className={
          styles.topMeta
        }
        aria-hidden="true"
      >
        <span>
          04
        </span>

        <span>
          SMART ATTENDANCE
        </span>

        <span>
          LIVE SYSTEM
        </span>
      </div>

      <div
        className={
          styles.subjectStage
        }
        data-featured-layer="attendance-subject"
      >
        {
          primaryVisual
            ? (
              <Image
                src={
                  primaryVisual
                }
                alt="Smart Attendance System identity verification visual"
                fill
                sizes="(max-width: 700px) 80vw, (max-width: 960px) 60vw, 44vw"
                className={
                  styles.subjectImage
                }
                unoptimized
              />
            )
            : (
              <SubjectFallback />
            )
        }

        <div
          className={
            styles.subjectShade
          }
          aria-hidden="true"
        />

        <span
          className={
            styles.cornerTopLeft
          }
          aria-hidden="true"
        />

        <span
          className={
            styles.cornerTopRight
          }
          aria-hidden="true"
        />

        <span
          className={
            styles.cornerBottomLeft
          }
          aria-hidden="true"
        />

        <span
          className={
            styles.cornerBottomRight
          }
          aria-hidden="true"
        />

        <div
          className={
            styles.subjectMeta
          }
          aria-hidden="true"
        >
          <span>
            EXPECTED IDENTITY
          </span>

          <strong>
            1:1 VERIFY
          </strong>
        </div>
      </div>

      <div
        className={
          styles.verificationPanel
        }
        data-featured-layer="attendance-accent"
        aria-hidden="true"
      >
        <div
          className={
            styles.verifyTop
          }
        >
          <span
            className={
              styles.verifyPulse
            }
          />

          <span>
            LIVE VERIFICATION
          </span>
        </div>

        <strong
          className={
            styles.verifyState
          }
        >
          VERIFIED
        </strong>

        <div
          className={
            styles.verifySession
          }
        >
          <span>
            SCHOOL ARRIVAL
          </span>

          <strong>
            08:12:44
          </strong>
        </div>

        <div
          className={
            styles.verifyRule
          }
        />

        <div
          className={
            styles.verifyMeta
          }
        >
          <span>
            RFID LINKED
          </span>

          <span>
            FACE MATCH
          </span>
        </div>
      </div>

      <div
        className={
          styles.dashboardStage
        }
        data-featured-layer="attendance-dashboard"
      >
        <div
          className={
            styles.dashboardTop
          }
          aria-hidden="true"
        >
          <div
            className={
              styles.dashboardDots
            }
          >
            <span />
            <span />
            <span />
          </div>

          <span
            className={
              styles.dashboardAddress
            }
          >
            ATTENDANCE / OPERATIONS
          </span>

          <span
            className={
              styles.dashboardStatus
            }
          >
            ONLINE
          </span>
        </div>

        <div
          className={
            styles.dashboardViewport
          }
        >
          {
            secondaryVisual
              ? (
                <Image
                  src={
                    secondaryVisual
                  }
                  alt={`${project.title} attendance management dashboard`}
                  fill
                  sizes="(max-width: 700px) 76vw, (max-width: 960px) 64vw, 46vw"
                  className={
                    styles.dashboardImage
                  }
                  unoptimized
                />
              )
              : (
                <DashboardFallback />
              )
          }

          <div
            className={
              styles.dashboardTint
            }
            aria-hidden="true"
          />
        </div>
      </div>

      <div
        className={
          styles.deviceCard
        }
        data-featured-layer="attendance-device"
        aria-hidden="true"
      >
        <div
          className={
            styles.deviceState
          }
        >
          <span />

          DEVICE ONLINE
        </div>

        <div
          className={
            styles.deviceRows
          }
        >
          <div>
            <span>
              RFID
            </span>

            <strong>
              READY
            </strong>
          </div>

          <div>
            <span>
              CAMERA
            </span>

            <strong>
              READY
            </strong>
          </div>

          <div>
            <span>
              SESSION
            </span>

            <strong>
              ACTIVE
            </strong>
          </div>
        </div>
      </div>

      <div
        className={
          styles.flow
        }
        aria-hidden="true"
      >
        <FlowStep
          index="01"
          label="RFID DETECTED"
          state="done"
        />

        <span
          className={
            styles.flowLine
          }
        />

        <FlowStep
          index="02"
          label="FACE VERIFIED"
          state="done"
        />

        <span
          className={
            styles.flowLine
          }
        />

        <FlowStep
          index="03"
          label="SESSION ACTIVE"
          state="done"
        />

        <span
          className={
            styles.flowLine
          }
        />

        <FlowStep
          index="04"
          label="ACCEPTED"
          state="active"
        />
      </div>

      <div
        className={
          styles.sideCopy
        }
        aria-hidden="true"
      >
        <span>
          RFID
        </span>

        <span>
          FACE 1:1
        </span>

        <span>
          SESSION
        </span>

        <span>
          RECORD
        </span>
      </div>

      <span
        className={
          styles.visualLabel
        }
      >
        HARDWARE-READY / ATTENDANCE ENGINE
      </span>
    </div>
  );
}

function FlowStep({
  index,
  label,
  state,
}: {
  index:
    string;

  label:
    string;

  state:
    "done"
    | "active";
}) {
  return (
    <div
      className={
        `${styles.flowStep} ${
          state ===
          "active"
            ? styles.flowStepActive
            : ""
        }`
      }
    >
      <span>
        {
          index
        }
      </span>

      <i />

      <strong>
        {
          label
        }
      </strong>
    </div>
  );
}

function SubjectFallback() {
  return (
    <div
      className={
        styles.subjectFallback
      }
    >
      <span>
        IDENTITY
      </span>

      <strong>
        FACE
      </strong>

      <strong>
        VERIFY
      </strong>

      <small>
        RFID + CAMERA
      </small>
    </div>
  );
}

function DashboardFallback() {
  return (
    <div
      className={
        styles.dashboardFallback
      }
    >
      <aside>
        <span>
          ATT
        </span>

        <i />
        <i />
        <i />
        <i />
      </aside>

      <main>
        <div
          className={
            styles.fallbackHeader
          }
        >
          <strong>
            Dashboard
          </strong>

          <span>
            ONLINE
          </span>
        </div>

        <div
          className={
            styles.fallbackCards
          }
        >
          <span />
          <span />
          <span />
          <span />
        </div>

        <div
          className={
            styles.fallbackChart
          }
        >
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </main>
    </div>
  );
}