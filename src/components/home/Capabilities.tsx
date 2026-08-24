import type {
  Locale,
} from "@/i18n/config";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import styles from "./Capabilities.module.css";

const capabilities = [
  {
    number:
      "01",

    key:
      "design",

    skills: [
      "UI/UX Design",
      "Web Design",
      "Graphic Design",
      "Visual Identity",
    ],
  },

  {
    number:
      "02",

    key:
      "development",

    skills: [
      "Frontend Development",
      "Next.js",
      "React",
      "Creative Development",
    ],
  },

  {
    number:
      "03",

    key:
      "motion",

    skills: [
      "Motion Design",
      "UI Motion",
      "Video Editing",
      "Interaction",
    ],
  },

  {
    number:
      "04",

    key:
      "creative",

    skills: [
      "Creative Direction",
      "Art Direction",
      "AI Creative",
      "Visual Exploration",
    ],
  },
] as const;

type CapabilitiesProps = {
  locale: Locale;
};

export default function Capabilities({
  locale,
}: CapabilitiesProps) {
  const copy =
    getHomeMessages(
      locale,
    ).capabilities;

  return (
    <section
      className={
        styles.section
      }
      id="capabilities"
      data-motion-scroll="capabilities"
    >
      <div className="site-container">
        <div
          className={
            styles.top
          }
        >
          <div
            className={
              styles.sectionLabel
            }
          >
            <span
              className={
                styles.dot
              }
            />

            <span>
              {
                copy.sectionLabel
              }
            </span>
          </div>

          <span
            className={
              styles.index
            }
          >
            04 / DISCIPLINES
          </span>
        </div>

        <div
          className={
            styles.layout
          }
        >
          <div
            className={
              styles.intro
            }
          >
            <h2
              className={
                styles.heading
              }
            >
              {
                copy.headingLine1
              }

              <br />

              {
                copy.headingLine2
              }

              <span>
                .
              </span>
            </h2>

            <p
              className={
                styles.introText
              }
            >
              {
                copy.intro
              }
            </p>
          </div>

          <div
            className={
              styles.list
            }
          >
            {capabilities.map(
              (
                capability,
              ) => {
                const content =
                  copy.items[
                    capability.key
                  ];

                return (
                  <article
                    className={
                      styles.item
                    }
                    key={
                      capability.number
                    }
                  >
                    <span
                      className={
                        styles.number
                      }
                    >
                      {
                        capability.number
                      }
                    </span>

                    <div
                      className={
                        styles.identity
                      }
                    >
                      <h3
                        className={
                          styles.title
                        }
                      >
                        {
                          content.title
                        }
                      </h3>

                      <p
                        className={
                          styles.description
                        }
                      >
                        {
                          content.description
                        }
                      </p>
                    </div>

                    <div
                      className={
                        styles.skills
                      }
                      aria-label={`${content.title} ${copy.skillsLabel}`}
                    >
                      {capability.skills.map(
                        (
                          skill,
                        ) => (
                          <span
                            key={
                              skill
                            }
                          >
                            {
                              skill
                            }
                          </span>
                        ),
                      )}
                    </div>

                    <span
                      className={
                        styles.marker
                      }
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}