import type { Metadata } from "next";
import Link from "next/link";

import InnerFooter from "@/components/layout/InnerFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import StructuredData from "@/components/seo/StructuredData";
import { engineeringNotes } from "@/lib/engineering-notes";
import { getAbsoluteUrl } from "@/lib/site-url";

import styles from "./Engineering.module.css";

const path = "/engineering";
const description =
  "Source-backed engineering notes by Nafisa Juliansah Saputra (NATSX): RFID face verification, Laravel document workflows, and Android-to-Windows controller design.";

export const metadata: Metadata = {
  title: "Engineering Notes | Full-Stack Systems Explained",
  description,
  alternates: { canonical: getAbsoluteUrl(path) },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Engineering Notes | NATSX",
    description,
    siteName: "NATSX",
    url: getAbsoluteUrl(path),
    images: [getAbsoluteUrl("/opengraph-image")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Notes | NATSX",
    description,
    images: [getAbsoluteUrl("/opengraph-image")],
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": getAbsoluteUrl(path + "#collection"),
  name: "Engineering Notes — NATSX",
  description,
  url: getAbsoluteUrl(path),
  inLanguage: "en",
  author: { "@id": getAbsoluteUrl("/#person") },
  hasPart: engineeringNotes.map((note) => ({
    "@type": "Article",
    headline: note.title,
    url: getAbsoluteUrl(path + "/" + note.slug),
  })),
};

export default function EngineeringPage() {
  return (
    <>
      <StructuredData data={collectionSchema} />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero}>
          <div className="site-container">
            <div className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              RESEARCH / ENGINEERING / NATSX
            </div>
            <p className={styles.kicker}>01 / Engineering notes</p>
            <h1 className={styles.heroTitle}>
              Behind the <span>build.</span>
            </h1>
            <p className={styles.lead}>
              Concrete engineering decisions behind real portfolio projects:
              the trust boundaries, failure modes, and implementation tradeoffs
              that do not fit into a project thumbnail.
            </p>
            <p className={styles.author}>By Nafisa Juliansah Saputra · Full-Stack Developer</p>
          </div>
        </section>

        <section className={styles.indexSection} aria-labelledby="engineering-index-title">
          <div className="site-container">
            <div className={styles.sectionHeading}>
              <h2 id="engineering-index-title">Published analyses</h2>
              <span>{String(engineeringNotes.length).padStart(2, "0")} technical notes</span>
            </div>
            <div className={styles.notesGrid}>
              {engineeringNotes.map((note, index) => (
                <article key={note.slug} className={styles.noteCard}>
                  <div className={styles.noteMeta}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{note.category}</span>
                  </div>
                  <h3>
                    <Link href={path + "/" + note.slug}>
                      {note.title}
                    </Link>
                  </h3>
                  <p>{note.summary}</p>
                  <div className={styles.stack} aria-label="Technologies">
                    {note.stack.slice(0, 5).map((tech) => <span key={tech}>{tech}</span>)}
                  </div>
                  <Link href={path + "/" + note.slug} className={styles.textLink}>
                    Read technical analysis <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
            <p className={styles.methodNote}>
              Each note is linked to the public source repository and original project
              case study. The explanations reflect documented implementation scope,
              not invented benchmark figures or claims of universal compatibility.
            </p>
            <Link href="/work" className={styles.backLink}>← All portfolio projects</Link>
          </div>
        </section>
      </main>
      <InnerFooter locale="en" />
    </>
  );
}
