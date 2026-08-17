import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import SiteHeader from "@/components/layout/SiteHeader";

import styles from "./About.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Nafisa Juliansah Saputra — a multidisciplinary digital creator working across design, development, motion, and visual experiences.",
};

const disciplines = [
  {
    number: "01",
    title: "Design",
    description:
      "Visual systems, interfaces, identities, and digital experiences shaped with clarity and intention.",
    items: [
      "UI/UX Design",
      "Web Design",
      "Graphic Design",
      "Visual Identity",
    ],
  },
  {
    number: "02",
    title: "Development",
    description:
      "Turning ideas and visual concepts into responsive, functional, and considered digital products.",
    items: [
      "Frontend",
      "Next.js",
      "React",
      "Creative Development",
    ],
  },
  {
    number: "03",
    title: "Motion",
    description:
      "Using movement, interaction, and editing to bring rhythm, character, and storytelling into digital work.",
    items: [
      "Motion Design",
      "UI Motion",
      "Video Editing",
      "Interaction",
    ],
  },
  {
    number: "04",
    title: "Creative Direction",
    description:
      "Connecting different disciplines into one coherent direction instead of treating each output as a separate piece.",
    items: [
      "Creative Direction",
      "Art Direction",
      "AI-Assisted Creative",
      "Visual Exploration",
    ],
  },
];

const principles = [
  {
    number: "01",
    title:
      "Think beyond the deliverable.",
    description:
      "I try to understand the larger idea first—what something needs to communicate, how it should feel, and where every piece fits.",
  },
  {
    number: "02",
    title:
      "Move across disciplines.",
    description:
      "Design, code, motion, and visual storytelling are different tools for the same goal. I use whichever combination makes the idea stronger.",
  },
  {
    number: "03",
    title:
      "Make every detail intentional.",
    description:
      "From typography and spacing to interaction and movement, small decisions shape how the final experience is perceived.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main
        className={styles.page}
        data-motion-page="about"
      >
        {/* =========================
            HERO
        ========================= */}

        <section className={styles.hero}>
          <div className="site-container">
            <div
              className={styles.heroTop}
              data-motion-about-hero-piece="top"
            >
              <div
                className={styles.label}
              >
                <span
                  className={styles.dot}
                />

                <span>
                  About / NATSX
                </span>
              </div>

              <span
                className={
                  styles.heroMeta
                }
              >
                Nafisa Juliansah Saputra
                / Indonesia
              </span>
            </div>

            <div
              className={
                styles.heroMain
              }
            >
              <h1
                className={
                  styles.heading
                }
                data-motion-about-hero-piece="title"
              >
                Different
                <br />
                disciplines
                <span>.</span>
              </h1>

              <div
                className={
                  styles.heroStatement
                }
                data-motion-about-hero-piece="statement"
              >
                <p>
                  One point of view.
                </p>

                <span>
                  Digital Creator /
                  Designer / Developer
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            PROFILE
        ========================= */}

        <section
          className={styles.profile}
        >
          <div className="site-container">
            <div
              className={
                styles.profileGrid
              }
            >
              <div
                className={
                  styles.portraitColumn
                }
                data-motion-scroll="about-portrait"
              >
                <div
                  className={
                    styles.portraitFrame
                  }
                >
                  <div
                    className={
                      styles.portraitCircle
                    }
                  />

                  <div
                    className={
                      styles
                        .portraitLineHorizontal
                    }
                  />

                  <div
                    className={
                      styles
                        .portraitLineVertical
                    }
                  />

                  <Image
                    src="/images/natsx-portrait-hero.png"
                    alt="Nafisa Juliansah Saputra"
                    fill
                    sizes="(max-width: 700px) 100vw, 45vw"
                    className={
                      styles.portrait
                    }
                  />

                  <span
                    className={
                      styles.signaturePlus
                    }
                    aria-hidden="true"
                  >
                    +
                  </span>
                </div>

                <div
                  className={
                    styles.profileMeta
                  }
                >
                  <div>
                    <span
                      className={
                        styles.metaLabel
                      }
                    >
                      Name
                    </span>

                    <span>
                      Nafisa Juliansah
                      Saputra
                    </span>
                  </div>

                  <div>
                    <span
                      className={
                        styles.metaLabel
                      }
                    >
                      Identity
                    </span>

                    <span>
                      NATSX
                    </span>
                  </div>

                  <div>
                    <span
                      className={
                        styles.metaLabel
                      }
                    >
                      Based in
                    </span>

                    <span>
                      Indonesia
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={styles.story}
                data-motion-scroll="about-story"
              >
                <div
                  className={
                    styles.storyLabel
                  }
                  data-motion-piece="label"
                >
                  <span
                    className={
                      styles.dot
                    }
                  />

                  <span>
                    The person behind
                    the work
                  </span>
                </div>

                <h2 data-motion-piece="title">
                  I like turning
                  <br />
                  abstract ideas into
                  <br />
                  things people can
                  <br />
                  actually{" "}
                  <em>
                    experience.
                  </em>
                </h2>

                <div
                  className={
                    styles.storyCopy
                  }
                  data-motion-piece="copy"
                >
                  <p>
                    I&apos;m Nafisa, a
                    multidisciplinary
                    digital creator
                    working under the
                    creative identity
                    NATSX.
                  </p>

                  <p>
                    My work moves between
                    design, development,
                    motion, branding, and
                    visual storytelling.
                    Rather than treating
                    those as isolated
                    skills, I like
                    connecting them to
                    create work that feels
                    complete from idea to
                    execution.
                  </p>

                  <p>
                    I&apos;m especially
                    interested in digital
                    experiences where
                    visual identity,
                    interaction,
                    technology, and
                    storytelling can work
                    together instead of
                    competing for
                    attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            APPROACH
        ========================= */}

        <section
          className={styles.approach}
        >
          <div className="site-container">
            <div
              className={
                styles.approachHeader
              }
              data-motion-scroll="about-approach-header"
            >
              <div
                className={
                  styles.approachLabel
                }
                data-motion-piece="label"
              >
                <span
                  className={
                    styles.darkDot
                  }
                />

                <span>
                  How I Work
                </span>
              </div>

              <h2 data-motion-piece="title">
                Ideas first.
                <br />
                Disciplines second
                <span>.</span>
              </h2>
            </div>

            <div
              className={
                styles.principles
              }
            >
              {principles.map(
                (principle) => (
                  <article
                    className={
                      styles.principle
                    }
                    key={
                      principle.number
                    }
                    data-motion-scroll="about-principle"
                  >
                    <span
                      className={
                        styles
                          .principleNumber
                      }
                    >
                      {
                        principle.number
                      }
                    </span>

                    <h3>
                      {principle.title}
                    </h3>

                    <p>
                      {
                        principle.description
                      }
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =========================
            DISCIPLINES
        ========================= */}

        <section
          className={
            styles.disciplines
          }
        >
          <div className="site-container">
            <div
              className={
                styles
                  .disciplinesHeader
              }
              data-motion-scroll="about-disciplines-header"
            >
              <div
                className={styles.label}
                data-motion-piece="label"
              >
                <span
                  className={
                    styles.dot
                  }
                />

                <span>
                  Across disciplines
                </span>
              </div>

              <p data-motion-piece="title">
                Different tools,
                <br />
                connected by one
                direction.
              </p>
            </div>

            <div
              className={
                styles.disciplineList
              }
            >
              {disciplines.map(
                (discipline) => (
                  <article
                    className={
                      styles.discipline
                    }
                    key={
                      discipline.number
                    }
                    data-motion-scroll="about-discipline"
                  >
                    <span
                      className={
                        styles
                          .disciplineNumber
                      }
                    >
                      {
                        discipline.number
                      }
                    </span>

                    <div
                      className={
                        styles
                          .disciplineMain
                      }
                    >
                      <h2>
                        {
                          discipline.title
                        }
                      </h2>

                      <p>
                        {
                          discipline.description
                        }
                      </p>
                    </div>

                    <div
                      className={
                        styles
                          .disciplineItems
                      }
                    >
                      {discipline.items.map(
                        (item) => (
                          <span
                            key={item}
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =========================
            CLOSING
        ========================= */}

        <section
          className={styles.closing}
        >
          <div className="site-container">
            <div
              className={
                styles.closingGrid
              }
              data-motion-scroll="about-closing"
            >
              <div
                className={
                  styles.closingLabel
                }
                data-motion-piece="label"
              >
                <span
                  className={
                    styles.dot
                  }
                />

                <span>Next</span>
              </div>

              <div
                className={
                  styles.closingMain
                }
                data-motion-piece="main"
              >
                <p>
                  The work says more
                  <br />
                  than a bio ever could
                  <span>.</span>
                </p>

                <Link
                  href="/work"
                  className={
                    styles.closingLink
                  }
                >
                  Explore the work

                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}