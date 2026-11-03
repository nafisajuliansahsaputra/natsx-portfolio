import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import InnerFooter from "@/components/layout/InnerFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import StructuredData from "@/components/seo/StructuredData";
import { site } from "@/data/site";
import {
  engineeringNotes,
  engineeringNotesPublishedOn,
  getEngineeringNote,
} from "@/lib/engineering-notes";
import { getAbsoluteUrl } from "@/lib/site-url";

import styles from "../Engineering.module.css";

type EngineeringDetailProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return engineeringNotes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: EngineeringDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getEngineeringNote(slug);
  if (!note) {
    return { robots: { index: false, follow: false } };
  }
  const url = getAbsoluteUrl("/engineering/" + note.slug);
  return {
    title: note.seoTitle,
    description: note.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: note.seoTitle + " | NATSX",
      description: note.description,
      siteName: "NATSX",
      url,
      publishedTime: engineeringNotesPublishedOn,
      images: [getAbsoluteUrl("/opengraph-image")],
    },
    twitter: {
      card: "summary_large_image",
      title: note.seoTitle + " | NATSX",
      description: note.description,
      images: [getAbsoluteUrl("/opengraph-image")],
    },
  };
}

export default async function EngineeringDetailPage({ params }: EngineeringDetailProps) {
  const { slug } = await params;
  const note = getEngineeringNote(slug);
  if (!note) notFound();

  const url = getAbsoluteUrl("/engineering/" + note.slug);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url + "#article",
    headline: note.title,
    description: note.description,
    mainEntityOfPage: url,
    url,
    inLanguage: "en",
    datePublished: engineeringNotesPublishedOn,
    dateModified: engineeringNotesPublishedOn,
    author: { "@type": "Person", "@id": getAbsoluteUrl("/#person"), name: site.person, url: getAbsoluteUrl("/about") },
    publisher: { "@type": "Person", "@id": getAbsoluteUrl("/#person"), name: site.person, url: getAbsoluteUrl("/about") },
    isPartOf: { "@id": getAbsoluteUrl("/#website") },
    keywords: note.topics.join(", "),
    citation: note.sourceUrl,
    about: { "@type": "CreativeWork", "@id": getAbsoluteUrl("/work/" + note.projectSlug + "#project") },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getAbsoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Engineering Notes", item: getAbsoluteUrl("/engineering") },
      { "@type": "ListItem", position: 3, name: note.title, item: url },
    ],
  };

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <article>
          <header className={styles.hero}>
            <div className="site-container">
              <Link href="/engineering" className={styles.backLink}>← All engineering notes</Link>
              <div className={styles.eyebrow}>
                <span className={styles.dot} aria-hidden="true" />
                ENGINEERING / TECHNICAL DEEP DIVE
              </div>
              <p className={styles.kicker}>{note.category}</p>
              <h1 className={styles.articleTitle}>{note.title}</h1>
              <p className={styles.lead}>{note.summary}</p>
              <div className={styles.articleByline}>
                <span>By <Link href="/about">Nafisa Juliansah Saputra</Link></span>
                <span>Published <time dateTime={engineeringNotesPublishedOn}>4 Nov 2026</time></span>
                <span>Source-backed case study · English</span>
              </div>
              <div className={styles.stack} aria-label="Technologies discussed">
                {note.stack.map((tech) => <span key={tech}>{tech}</span>)}
              </div>
            </div>
          </header>

          <div className={styles.articleLayout}>
            <div className="site-container">
              <div className={styles.articleGrid}>
                <aside className={styles.articleAside} aria-label="In this article">
                  <p className={styles.asideHeading}>On this page</p>
                  <ol>
                    {note.sections.map((section, i) => (
                      <li key={section.heading}>
                        <a href={"#section-" + (i + 1)}>{section.heading}</a>
                      </li>
                    ))}
                  </ol>
                </aside>
                <div className={styles.prose}>
                  {note.sections.map((section, i) => (
                    <section key={section.heading} aria-labelledby={"section-" + (i + 1)}>
                      <h2 id={"section-" + (i + 1)}>{section.heading}</h2>
                      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      {section.points?.length ? (
                        <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>
                      ) : null}
                    </section>
                  ))}
                  <div className={styles.evidence}>
                    <h2>Explore the implementation</h2>
                    <p>
                      This analysis describes the documented engineering decisions.
                      The case study provides project context; the public repository
                      is the source for implementation details and verification scope.
                    </p>
                    <div className={styles.evidenceLinks}>
                      <Link href={"/work/" + note.projectSlug}>
                        View the portfolio case study <span aria-hidden="true">↗</span>
                      </Link>
                      <a href={note.sourceUrl} target="_blank" rel="noopener noreferrer">
                        Read source code and documentation <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                  <Link href="/engineering" className={styles.backLink}>← More engineering notes</Link>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <InnerFooter locale="en" />
    </>
  );
}
