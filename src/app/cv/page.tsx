import type {
  Metadata,
} from "next";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  getCvVersion,
} from "@/data/cv";

import {
  site,
} from "@/data/site";

import CvViewer from "./CvViewer";

import styles from "./Cv.module.css";

export const metadata: Metadata = {
  title: "CV",
  description:
    `View and download the curriculum vitae of ${site.person} / ${site.name}.`,
};

type CvPageProps = {
  searchParams: Promise<{
    lang?:
      | string
      | string[];
  }>;
};

export default async function CvPage({
  searchParams,
}: CvPageProps) {
  const params =
    await searchParams;

  const languageParam =
    Array.isArray(params.lang)
      ? params.lang[0]
      : params.lang;

  const initialVersion =
    getCvVersion(
      languageParam,
    );

  return (
    <>
      <SiteHeader />

      <main
        className={
          styles.page
        }
        data-motion-page="cv"
      >
        {/* =========================
            HERO
        ========================= */}

        <section
          className={
            styles.hero
          }
        >
          <div className="site-container">
            <div
              className={
                styles.heroTop
              }
            >
              <div
                className={
                  styles.label
                }
              >
                <span
                  className={
                    styles.dot
                  }
                />

                <span>
                  CV / Resume
                </span>
              </div>

              <span
                className={
                  styles.heroMeta
                }
              >
                {site.person}
                {" / "}
                {site.location}
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
              >
                Curriculum
                <br />
                Vitae
                <span>.</span>
              </h1>

              <div
                className={
                  styles.heroIntro
                }
              >
                <p>
                  A closer look at
                  my experience,
                  background, skills,
                  and selected
                  professional work.
                </p>

                <span>
                  Choose a language
                  <br />
                  View or download
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            VIEWER
        ========================= */}

        <CvViewer
          initialVersion={
            initialVersion
          }
        />
      </main>
    </>
  );
}