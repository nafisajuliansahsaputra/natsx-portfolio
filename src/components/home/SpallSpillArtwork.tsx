import Image from "next/image";

import type {
  PublicProject,
} from "@/lib/public-projects";

import styles from "./SpallSpillArtwork.module.css";

type SpallSpillArtworkProps = {
  project: PublicProject;

  primaryVisual:
    | string
    | null;

  secondaryVisual:
    | string
    | null;

  visualLabel: string;
};

export default function SpallSpillArtwork({
  project,
  primaryVisual,
  secondaryVisual,
  visualLabel,
}: SpallSpillArtworkProps) {
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
      data-spall-featured="true"
    >
      <div
        className={
          styles.atmosphere
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.indexMark
          }
        >
          {project.number}
        </span>

        <span
          className={
            styles.backgroundWord
          }
        >
          SPALL
        </span>

        <span
          className={
            styles.coordinate
          }
        >
          CURATED / DIGITAL / DISCOVERY
        </span>

        <div
          className={
            styles.grid
          }
        />
      </div>

      <div
        className={
          styles.browser
        }
        data-featured-layer="spall-browser"
      >
        <div
          className={
            styles.browserTop
          }
          aria-hidden="true"
        >
          <div
            className={
              styles.browserDots
            }
          >
            <span />
            <span />
            <span />
          </div>

          <span
            className={
              styles.browserAddress
            }
          >
            NATSX / SPALL SPILL
          </span>

          <span
            className={
              styles.browserState
            }
          >
            LIVE INDEX
          </span>
        </div>

        <div
          className={
            styles.browserViewport
          }
        >
          {primaryVisual ? (
            <Image
              src={
                primaryVisual
              }
              alt={`${project.title} desktop interface`}
              fill
              sizes="(max-width: 700px) 84vw, (max-width: 960px) 74vw, 62vw"
              className={
                styles.browserImage
              }
              unoptimized
            />
          ) : (
            <div
              className={
                styles.desktopFallback
              }
            >
              <span>
                PRODUCT DISCOVERY
              </span>

              <strong>
                {
                  project.title
                }
              </strong>

              <small>
                CURATE / DISCOVER / SHARE
              </small>
            </div>
          )}

          <div
            className={
              styles.browserWash
            }
            aria-hidden="true"
          />
        </div>

        <div
          className={
            styles.browserFoot
          }
          aria-hidden="true"
        >
          <span>
            PRODUCT INDEX
          </span>

          <span>
            WEB EXPERIENCE
          </span>

          <span>
            2026
          </span>
        </div>
      </div>

      <div
        className={
          styles.discoveryCard
        }
        data-featured-layer="spall-accent"
        aria-hidden="true"
      >
        <span
          className={
            styles.discoveryEyebrow
          }
        >
          DISCOVERY SYSTEM
        </span>

        <strong>
          CURATE.
        </strong>

        <strong>
          DISCOVER.
        </strong>

        <div
          className={
            styles.discoveryRule
          }
        />

        <div
          className={
            styles.discoveryMeta
          }
        >
          <span>
            WEB
          </span>

          <span>
            MOBILE
          </span>

          <span>
            SOCIAL
          </span>
        </div>
      </div>

      <div
        className={
          styles.phoneStage
        }
        data-featured-layer="spall-phone"
      >
        <div
          className={
            styles.phoneShadow
          }
          aria-hidden="true"
        />

        <div
          className={
            styles.phone
          }
        >
          <div
            className={
              styles.phoneScreen
            }
          >
            {secondaryVisual ? (
              <Image
                src={
                  secondaryVisual
                }
                alt={`${project.title} mobile interface`}
                fill
                sizes="(max-width: 700px) 28vw, (max-width: 960px) 22vw, 18vw"
                className={
                  styles.phoneImage
                }
                unoptimized
              />
            ) : (
              <div
                className={
                  styles.phoneFallback
                }
              >
                <span>
                  NATSX
                </span>

                <strong>
                  SPALL
                </strong>

                <strong>
                  SPILL
                </strong>
              </div>
            )}
          </div>

          <div
            className={
              styles.phoneHardware
            }
            aria-hidden="true"
          >
            <span
              className={
                styles.phoneSpeaker
              }
            />

            <span
              className={
                styles.phoneCamera
              }
            />
          </div>
        </div>
      </div>

      <div
        className={
          styles.categoryRail
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.categoryRailLabel
          }
        >
          CURATED FIELDS
        </span>

        <div
          className={
            styles.categoryItems
          }
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
                    index +
                    1
                  }
                </small>

                {
                  discipline
                }
              </span>
            ),
          )}
        </div>
      </div>

      <div
        className={
          styles.signal
        }
        aria-hidden="true"
      >
        <span
          className={
            styles.signalDot
          }
        />

        <span>
          ACTIVE COLLECTION
        </span>

        <i />
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