"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { site } from "@/data/site";

import styles from "./Hero.module.css";

export default function Hero() {
  const [portraitLoaded, setPortraitLoaded] =
    useState(false);

  return (
    <section className={styles.hero}>
      <div
        className={`site-container ${styles.inner}`}
      >
        <div className={styles.content}>
          <div
            className={
              styles.contentInner
            }
          >
            <p
              className={styles.eyebrow}
              data-motion-hero-piece="eyebrow"
            >
              <span
                className={
                  styles.eyebrowDot
                }
              />

              {site.person} | {site.role}
            </p>

            <h1
              className={styles.title}
              data-motion-hero-piece="title"
            >
              <span
                className={
                  styles.titleLine
                }
              >
                <strong>Designing</strong>{" "}
                <span
                  className={
                    styles.titleLight
                  }
                >
                  Ideas
                </span>
              </span>

              <span
                className={
                  styles.titleLine
                }
              >
                <span
                  className={
                    styles.titleLight
                  }
                >
                  Into
                </span>{" "}
                <strong>
                  Experience
                  <span
                    className={
                      styles.titleAccent
                    }
                  >
                    .
                  </span>
                </strong>
              </span>
            </h1>

            <div
              className={styles.intro}
              data-motion-hero-piece="intro"
            >
              <p
                className={
                  styles.description
                }
              >
                Multidisciplinary digital
                creator working across
                design, development, motion,
                and visual experiences.
              </p>

              <div
                className={styles.actions}
              >
                <a
                  href="#work"
                  className={
                    styles.primaryLink
                  }
                >
                  <span>
                    Selected Work
                  </span>

                  <span
                    className={
                      styles.arrow
                    }
                  >
                    ↘
                  </span>
                </a>

                <Link
                  href="/about"
                  className={
                    styles.secondaryLink
                  }
                >
                  <span>About Me</span>

                  <span
                    className={
                      styles.arrow
                    }
                  >
                    ↗
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className={styles.visual}
          data-motion-hero-piece="visual"
        >
          <div
            className={styles.accentPlus}
            aria-hidden="true"
          >
            <span />
            <span />
          </div>

          <div
            className={`${styles.shape} ${styles.shapeCircle}`}
            aria-hidden="true"
          />

          <div
            className={`${styles.shape} ${styles.shapeArch}`}
            aria-hidden="true"
          />

          <div
            className={styles.portrait}
            data-motion-portrait={
              portraitLoaded
                ? "loaded"
                : "loading"
            }
          >
            <Image
              src="/images/natsx-portrait-hero.png"
              alt="Portrait of Nafisa Juliansah Saputra"
              fill
              priority
              sizes="(max-width: 960px) 100vw, 42vw"
              className={
                styles.portraitImage
              }
              onLoad={() =>
                setPortraitLoaded(true)
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}