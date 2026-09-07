import "@/app/cv-motion.css";
import "@/app/cv-motion-fit.css";

import SiteHeader from "@/components/layout/SiteHeader";

import {
  getCvVersion,
} from "@/data/cv";

import {
  site,
} from "@/data/site";

import type {
  Locale,
} from "@/i18n/config";

import {
  getCvMessages,
} from "@/i18n/cv-messages";

import {
  createPageMetadata,
} from "@/lib/page-metadata";

import CvViewer from "./CvViewer";

import styles from "./Cv.module.css";

const description =
  `View and download the curriculum vitae of ${site.person} / ${site.name}.`;

export const metadata =
  createPageMetadata({
    title:
      "CV",

    description,

    path:
      "/cv",
  });

type CvSearchParams = Promise<{
  lang?:
    | string
    | string[];
}>;

type CvPageContentProps = {
  locale: Locale;

  searchParams:
    CvSearchParams;
};

export async function CvPageContent({
  locale,
  searchParams,
}: CvPageContentProps) {
  const copy =
    getCvMessages(
      locale,
    );

  const params =
    await searchParams;

  const languageParam =
    Array.isArray(
      params.lang,
    )
      ? params.lang[0]
      : params.lang;

  /*
   * Website locale menjadi
   * fallback CV language.
   *
   * /cv
   * -> English
   *
   * /id/cv
   * -> Bahasa Indonesia
   *
   * /de/cv
   * -> Deutsch
   *
   * Invalid query juga kembali
   * ke locale website:
   *
   * /de/cv?lang=invalid
   * -> Deutsch
   */
  const initialVersion =
    getCvVersion(
      languageParam,
      locale,
    );

  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className={
          styles.page
        }
        data-motion-page="cv"
      >
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
              data-motion-cv-hero-piece="top"
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
                  {
                    copy.hero
                      .label
                  }
                </span>
              </div>

              <span
                className={
                  styles.heroMeta
                }
              >
                {
                  site.person
                }
                {" / "}
                {
                  site.location
                }
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
                data-motion-cv-hero-piece="title"
              >
                {
                  copy.hero
                    .headingLine1
                }

                <br />

                {
                  copy.hero
                    .headingLine2
                }

                <span>
                  .
                </span>
              </h1>

              <div
                className={
                  styles.heroIntro
                }
                data-motion-cv-hero-piece="intro"
              >
                <p>
                  {
                    copy.hero
                      .description
                  }
                </p>

                <span>
                  {
                    copy.hero
                      .noteLine1
                  }

                  <br />

                  {
                    copy.hero
                      .noteLine2
                  }
                </span>
              </div>
            </div>
          </div>
        </section>

        <CvViewer
          initialVersion={
            initialVersion
          }
          locale={
            locale
          }
        />
      </main>
    </>
  );
}

type CvPageProps = {
  searchParams:
    CvSearchParams;
};

export default function CvPage({
  searchParams,
}: CvPageProps) {
  return (
    <CvPageContent
      locale="en"
      searchParams={
        searchParams
      }
    />
  );
}