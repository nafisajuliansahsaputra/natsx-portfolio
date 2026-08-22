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
    >
      <div className="site-container">
        <div
          className={
            styles.layout
          }
        >
          <div
            className={
              styles.introColumn
            }
          >
            <div
              className={
                styles.intro
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
                    <div
                      className={
                        styles.itemTop
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

                      <h3
                        className={
                          styles.title
                        }
                      >
                        {
                          content.title
                        }
                      </h3>
                    </div>

                    <div
                      className={
                        styles.itemContent
                      }
                    >
                      <p
                        className={
                          styles.description
                        }
                      >
                        {
                          content.description
                        }
                      </p>

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
                    </div>
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