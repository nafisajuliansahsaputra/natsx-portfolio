import Image from "next/image";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./BastManagementArtwork.module.css";

type BastManagementArtworkProps = {
  project: PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  visualLabel: string;
};

export default function BastManagementArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
}: BastManagementArtworkProps) {
  const disciplines =
    project.disciplines
      .slice(
        0,
        3,
      );

  return (
    <div
      className={
        styles.artwork
      }
      data-bast-featured="true"
    >
      <div
        className={
          styles.grid
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.blueprint
        }
        aria-hidden="true"
      >
        <span>
          {
            project.number
          }
        </span>
        <strong>
          BAST
        </strong>
        <small>
          SYSTEM / WORKFLOW
        </small>
      </div>

      <div
        className={
          styles.systemTag
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.systemTagDot
          }
        />
        <span>
          DOCUMENT FLOW
        </span>
      </div>

      <div
        className={
          styles.controlRail
        }
        aria-hidden="true"
      >
        <span>
          VERIFIED
        </span>
        <span>
          TRACKED
        </span>
        <span>
          ACTIVE
        </span>
      </div>

      <div
        className={
          styles.dashboardShell
        }
        data-featured-layer="bast-dashboard"
      >
        <div
          className={
            styles.dashboardTop
          }
          aria-hidden="true"
        >
          <div
            className={
              styles.windowDots
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
            BAST / MANAGEMENT SYSTEM
          </span>

          <span
            className={
              styles.dashboardMode
            }
          >
            LIVE PANEL
          </span>
        </div>

        <div
          className={
            styles.dashboardViewport
          }
        >
          {primaryVisual ? (
            <Image
              src={
                primaryVisual
              }
              alt={`${project.title} dashboard interface`}
              fill
              sizes="(max-width: 700px) 83vw, (max-width: 960px) 74vw, 62vw"
              className={
                styles.dashboardImage
              }
              unoptimized
            />
          ) : (
            <DashboardFallback
              title={
                project.title
              }
            />
          )}

          <div
            className={
              styles.dashboardOverlay
            }
            aria-hidden="true"
          />
        </div>
      </div>

      <div
        className={
          styles.metricsCard
        }
        data-featured-layer="bast-metrics"
        aria-hidden="true"
      >
        <span
          className={
            styles.metricsLabel
          }
        >
          SYSTEM STATUS
        </span>

        <div
          className={
            styles.metricsRows
          }
        >
          <div>
            <small>
              DOCS
            </small>
            <strong>
              128
            </strong>
          </div>

          <div>
            <small>
              FLOW
            </small>
            <strong>
              OK
            </strong>
          </div>

          <div>
            <small>
              QUEUE
            </small>
            <strong>
              03
            </strong>
          </div>
        </div>

        <div
          className={
            styles.metricsBars
          }
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div
        className={
          styles.documentStage
        }
        data-featured-layer="bast-document"
      >
        <div
          className={
            styles.documentBadge
          }
          aria-hidden="true"
        >
          <span
            className={
              styles.documentBadgeDot
            }
          />
          <span>
            APPROVED
          </span>
        </div>

        <div
          className={
            styles.documentSheet
          }
        >
          {secondaryVisual ? (
            <Image
              src={
                secondaryVisual
              }
              alt={`${project.title} document output`}
              fill
              sizes="(max-width: 700px) 30vw, (max-width: 960px) 28vw, 24vw"
              className={
                styles.documentImage
              }
              unoptimized
            />
          ) : (
            <DocumentFallback />
          )}
        </div>
      </div>

      <div
        className={
          styles.auditStrip
        }
        aria-hidden="true"
      >
        <span>
          DOCUMENT CODE
        </span>
        <strong>
          BAST-2026-014
        </strong>
        <span>
          VERIFIED OUTPUT
        </span>
      </div>

      <div
        className={
          styles.footerMeta
        }
        aria-hidden="true"
      >
        {disciplines.map(
          (
            discipline,
            index,
          ) => (
            <span
              key={
                discipline
              }
            >
              <small>
                0{
                  index + 1
                }
              </small>
              {
                discipline
              }
            </span>
          ),
        )}
      </div>

      <span
        className={
          styles.visualLabel
        }
      >
        {
          visualLabel
        }
      </span>
    </div>
  );
}

function DashboardFallback({
  title,
}: {
  title: string;
}) {
  return (
    <div
      className={
        styles.dashboardFallback
      }
    >
      <aside
        className={
          styles.dashboardAside
        }
      >
        <span>
          BAST
        </span>
        <i />
        <i />
        <i />
        <i />
      </aside>

      <div
        className={
          styles.dashboardMain
        }
      >
        <header
          className={
            styles.dashboardFallbackHeader
          }
        >
          <strong>
            {title}
          </strong>
          <span>
            ACTIVE
          </span>
        </header>

        <div
          className={
            styles.dashboardStats
          }
        >
          <span />
          <span />
          <span />
          <span />
        </div>

        <div
          className={
            styles.dashboardChart
          }
        >
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div
          className={
            styles.dashboardTable
          }
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function DocumentFallback() {
  return (
    <div
      className={
        styles.documentFallback
      }
    >
      <span>
        BERITA ACARA
      </span>

      <div />
      <div />
      <div />
      <div />

      <strong>
        VERIFIED
      </strong>
    </div>
  );
}