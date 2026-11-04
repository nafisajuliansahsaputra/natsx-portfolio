import type { Metadata } from "next";
import Link from "next/link";

import InnerFooter from "@/components/layout/InnerFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import StructuredData from "@/components/seo/StructuredData";
import { site } from "@/data/site";
import { localizePath, type Locale } from "@/i18n/config";
import { getAbsoluteUrl } from "@/lib/site-url";
import styles from "./SmartCafe.module.css";

const SOURCE = "https://github.com/nafisajuliansahsaputra/smart-cafe-system";
const CANDIDATE = SOURCE + "/tree/integration/m6-v30-release-candidate";
const DOCUMENTATION = SOURCE + "/blob/integration/m6-v30-release-candidate/docs/PORTFOLIO-CASE-STUDY.md";
const ROUTE = "/work/smart-cafe-system";

type LanguageCopy = {
  label: string;
  subtitle: string;
  status: string;
  scope: string;
  role: string;
  flowTitle: string;
  flowIntro: string;
  steps: { label: string; detail: string }[];
  engineeringTitle: string;
  engineeringDescription: string;
  architecture: { title: string; detail: string }[];
  verificationTitle: string;
  verification: string[];
  limitsTitle: string;
  limitsText: string;
  limits: string[];
  code: string;
  docs: string;
  back: string;
  footer: string;
};

const messages: Record<Locale, LanguageCopy> = {
  en: {
    label: "01 / Independent full-stack system",
    subtitle: "One order. Four operating roles. One database-backed source of truth.",
    status: "Functional MVP · Cash ordering · Not production deployed",
    scope: "Full-stack platform",
    role: "Product design & engineering",
    flowTitle: "The whole cafe in one connected workflow.",
    flowIntro: "From a temporary table visit to an immutable paid receipt, the application links real role-protected screens. Unlike the separate /showcase tour, this workflow is verified against a disposable backend and PostgreSQL database.",
    steps: [
      { label: "Guest", detail: "QR/NFC table join, no account, menu, variants, cart and cash checkout." },
      { label: "Cashier / OCC", detail: "Reviews and admits the order. Kitchen approval never means the cash is paid." },
      { label: "Kitchen / KDS", detail: "Prepares and marks tickets ready without financial permissions." },
      { label: "Waiter", detail: "Serves food, handles games and records physical cash with confirmation." },
      { label: "Receipt", detail: "Issued only after the payment state is confirmed by the server." },
    ],
    engineeringTitle: "Designed for the messy middle of operations.",
    engineeringDescription: "The challenging part is not the order form. It is maintaining correct state when screens disconnect, staff retry, stock runs low and money changes hands.",
    architecture: [
      { title: "Next.js + React", detail: "Mobile guest journey and authenticated cashier, kitchen, waiter and manager screens." },
      { title: "Java + Spring Boot", detail: "Permission-scoped REST actions, financial state machines and live event delivery." },
      { title: "PostgreSQL + Flyway", detail: "Transactional invariants, stock reservations, audit history and repeatable migrations." },
      { title: "Docker + Playwright", detail: "Isolated database integration tests, HTTP/HTTPS browser flows and security checks." },
    ],
    verificationTitle: "Evidence over polished claims.",
    verification: [
      "Separate guest and staff identities with scoped, revocable sessions.",
      "End-to-end cash lifecycle: order, approval, preparation, delivery, tender and receipt.",
      "Role-denial tests, duplicate-operation protections and recovery across disconnects.",
      "Large synthetic queues tested for cashier, waiter and kitchen without silent truncation.",
    ],
    limitsTitle: "What this project does not pretend to be.",
    limitsText: "This is working full-stack code and a portfolio-grade MVP, not an active merchant service. The public-facing /showcase route, when hosted, is an intentionally non-persistent illustration.",
    limits: [
      "QRIS and virtual-account flows use explicitly fake sandbox attempts, not a bank or a merchant account.",
      "There is no live WhatsApp/SMS receipt sender, customer data collection, or public POS deployment.",
      "Production use still requires provider contracts, secure staging, operator checks and release approval.",
    ],
    code: "Explore source and current candidate",
    docs: "Read the technical case study",
    back: "Back to all work",
    footer: "Self-initiated engineering project · 2026",
  },
  id: {
    label: "01 / Sistem full-stack independen",
    subtitle: "Satu pesanan. Empat peran operasional. Satu sumber data yang terverifikasi.",
    status: "MVP fungsional · Pemesanan tunai · Belum deployment produksi",
    scope: "Platform full-stack",
    role: "Desain produk & pengembangan",
    flowTitle: "Seluruh operasional kafe dalam satu alur.",
    flowIntro: "Dari kunjungan meja sementara hingga struk pembayaran, aplikasi menghubungkan dashboard tiap peran. Berbeda dari tur /showcase, alur ini diuji menggunakan backend dan PostgreSQL terisolasi.",
    steps: [
      { label: "Pelanggan", detail: "Masuk lewat QR/NFC meja tanpa akun, memilih menu, varian, keranjang dan checkout tunai." },
      { label: "Kasir / OCC", detail: "Memeriksa dan menyetujui pesanan. Persetujuan dapur tidak berarti uang sudah diterima." },
      { label: "Dapur / KDS", detail: "Menyiapkan dan menyelesaikan tiket tanpa izin mengubah status pembayaran." },
      { label: "Waiter", detail: "Mengantar pesanan, mengelola permainan fisik dan mencatat uang tunai." },
      { label: "Struk", detail: "Diterbitkan setelah pembayaran benar-benar dikonfirmasi backend." },
    ],
    engineeringTitle: "Dirancang untuk situasi operasional yang nyata.",
    engineeringDescription: "Bagian tersulit bukan formulir pesanan, melainkan konsistensi status saat koneksi terputus, staf mengulang aksi, stok menipis, dan uang diterima.",
    architecture: [
      { title: "Next.js + React", detail: "Pengalaman pelanggan mobile dan dashboard kasir, dapur, waiter serta manajer." },
      { title: "Java + Spring Boot", detail: "REST berdasarkan hak akses, aturan transaksi dan pembaruan langsung." },
      { title: "PostgreSQL + Flyway", detail: "Transaksi, reservasi stok, audit serta migrasi skema yang dapat diuji ulang." },
      { title: "Docker + Playwright", detail: "Pengujian database, browser HTTP/HTTPS dan keamanan pada lingkungan terpisah." },
    ],
    verificationTitle: "Bukti pengujian, bukan sekadar tampilan.",
    verification: [
      "Identitas tamu dan staf terpisah dengan sesi yang dapat dicabut.",
      "Alur tunai end-to-end: checkout, persetujuan, dapur, pengantaran, penerimaan dan struk.",
      "Tes batasan role, duplikasi aksi dan pemulihan koneksi.",
      "Antrean sintetis besar untuk kasir, waiter dan dapur tanpa pemotongan diam-diam.",
    ],
    limitsTitle: "Batasan yang dijelaskan secara terbuka.",
    limitsText: "Ini adalah kode full-stack fungsional dalam tahap MVP portfolio, bukan layanan merchant aktif. Halaman /showcase, jika dihosting, hanya simulasi UI tanpa penyimpanan pesanan.",
    limits: [
      "QRIS dan Virtual Account masih sandbox palsu, bukan pembayaran bank atau merchant sungguhan.",
      "Belum ada pengiriman struk WhatsApp/SMS maupun penerapan POS publik.",
      "Penggunaan produksi masih memerlukan kontrak provider, staging aman, uji operator dan persetujuan rilis.",
    ],
    code: "Lihat kode dan kandidat terbaru",
    docs: "Baca studi kasus teknis",
    back: "Kembali ke daftar proyek",
    footer: "Proyek pengembangan independen · 2026",
  },
  de: {
    label: "01 / Eigenständiges Full-Stack-System",
    subtitle: "Eine Bestellung. Vier betriebliche Rollen. Eine verlässliche Datenbasis.",
    status: "Funktionaler MVP · Barzahlung · Noch nicht produktiv eingesetzt",
    scope: "Full-Stack-Plattform",
    role: "Produktdesign & Entwicklung",
    flowTitle: "Der Cafébetrieb als durchgängiger Ablauf.",
    flowIntro: "Vom temporären Tischbesuch bis zum bestätigten Zahlungsbeleg verbindet die Anwendung rollengeschützte Oberflächen. Anders als die separate /showcase-Demo wird dieser Ablauf gegen ein isoliertes Backend mit PostgreSQL getestet.",
    steps: [
      { label: "Gast", detail: "QR/NFC am Tisch, ohne Konto, Menü, Optionen, Warenkorb und Barbestellung." },
      { label: "Kasse / OCC", detail: "Prüft und gibt Bestellungen frei. Die Küchenfreigabe bestätigt keinen Zahlungseingang." },
      { label: "Küche / KDS", detail: "Bereitet Bestellungen vor, ohne finanzielle Berechtigungen." },
      { label: "Service", detail: "Liefert Speisen, verwaltet Brettspiele und bestätigt Bargeldannahmen." },
      { label: "Beleg", detail: "Erst nach serverseitiger Zahlungsbestätigung verfügbar." },
    ],
    engineeringTitle: "Entwickelt für echte Betriebsabläufe.",
    engineeringDescription: "Die Herausforderung liegt nicht im Bestellformular, sondern in konsistenten Zuständen bei Verbindungsabbruch, Wiederholungen, knappen Beständen und Bargeldübergaben.",
    architecture: [
      { title: "Next.js + React", detail: "Mobile Gästeseiten und geschützte Kassen-, Küchen-, Service- und Verwaltungsoberflächen." },
      { title: "Java + Spring Boot", detail: "Rollenbasierte REST-Aktionen, Finanzzustände und Live-Benachrichtigungen." },
      { title: "PostgreSQL + Flyway", detail: "Transaktionen, Bestandsreservierung, Audit-Protokolle und reproduzierbare Migrationen." },
      { title: "Docker + Playwright", detail: "Isolierte Datenbank-, HTTP/HTTPS-Browser- und Sicherheitstests." },
    ],
    verificationTitle: "Nachweise statt unüberprüfbarer Versprechen.",
    verification: [
      "Getrennte Gast- und Mitarbeitersitzungen mit widerrufbaren Berechtigungen.",
      "Durchgängiger Bargeldprozess von Bestellung bis Zahlungsbeleg.",
      "Tests für Rollengrenzen, doppelte Aktionen und Verbindungswiederherstellung.",
      "Große synthetische Kassen-, Service- und Küchenwarteschlangen ohne stilles Abschneiden.",
    ],
    limitsTitle: "Klar benannte Grenzen.",
    limitsText: "Dies ist funktionierender Full-Stack-MVP-Code für das Portfolio, aber kein aktiver Händlerdienst. Die optionale /showcase-Seite bleibt eine nicht persistente UI-Demonstration.",
    limits: [
      "QRIS und virtuelle Konten verwenden ausschließlich künstliche Sandbox-Abläufe.",
      "Kein produktiver WhatsApp-/SMS-Belegversand und kein öffentliches Kassensystem.",
      "Produktive Nutzung erfordert Anbieterzugänge, sicheres Staging, Gerätetests und Freigabe.",
    ],
    code: "Quellcode und aktuellen Kandidaten ansehen",
    docs: "Technische Fallstudie lesen",
    back: "Zurück zu allen Projekten",
    footer: "Eigenständiges Entwicklungsprojekt · 2026",
  },
};

export function smartCafeMetadata(locale: Locale): Metadata {
  const title = locale === "id" ? "Smart Cafe System | Studi Kasus Full-Stack" :
    locale === "de" ? "Smart Cafe System | Full-Stack-Fallstudie" :
    "Smart Cafe System | Full-Stack Engineering Case Study";
  const description = locale === "id"
    ? "Smart Cafe System oleh Nafisa Juliansah Saputra: aplikasi pemesanan kafe QR/NFC, kasir OCC, dapur KDS, waiter dan pembayaran tunai berbasis Next.js, Spring Boot dan PostgreSQL."
    : locale === "de"
    ? "Smart Cafe System von Nafisa Juliansah Saputra: QR/NFC-Bestellungen, Kasse, Küche, Service und Bargeldabläufe mit Next.js, Spring Boot und PostgreSQL."
    : "Smart Cafe System by Nafisa Juliansah Saputra: QR/NFC guest orders, cashier OCC, kitchen KDS, waiter, and verified cash workflows built with Next.js, Spring Boot and PostgreSQL.";
  const canonical = getAbsoluteUrl(localizePath(ROUTE, locale));
  return {
    title, description, robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        en: getAbsoluteUrl(ROUTE),
        id: getAbsoluteUrl("/id" + ROUTE),
        de: getAbsoluteUrl("/de" + ROUTE),
        "x-default": getAbsoluteUrl(ROUTE),
      },
    },
    openGraph: { type: "article", title, description, url: canonical, siteName: "NATSX" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const metadata = smartCafeMetadata("en");

export function SmartCafeCaseStudy({ locale }: { locale: Locale }) {
  const copy = messages[locale];
  const path = getAbsoluteUrl(localizePath(ROUTE, locale));
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": path + "#project",
    name: "Smart Cafe System",
    description: copy.subtitle,
    url: path,
    inLanguage: locale,
    creator: { "@type": "Person", name: site.person, url: getAbsoluteUrl("/about") },
    codeRepository: SOURCE,
    programmingLanguage: ["TypeScript", "Java"],
    keywords: ["QR NFC", "Cafe Ordering", "Next.js", "Spring Boot", "PostgreSQL"],
    isAccessibleForFree: true,
  };
  return (
    <>
      <StructuredData data={schema} />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero}>
          <div className="site-container">
            <nav className={styles.nav} aria-label="Breadcrumb">
              <Link href={localizePath("/work", locale)}>{copy.back}</Link>
              <span aria-hidden="true">/</span>
              <span>Smart Cafe System</span>
            </nav>
            <p className={styles.eyebrow}>{copy.label}</p>
            <h1 className={styles.title}>Smart<br/><em>Cafe</em> System<span>.</span></h1>
            <p className={styles.subtitle}>{copy.subtitle}</p>
            <div className={styles.status}>{copy.status}</div>
            <div className={styles.heroMeta}>
              <span><strong>2026</strong> / {copy.scope}</span>
              <span><strong>NATSX</strong> / {copy.role}</span>
            </div>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="flow-heading">
          <div className="site-container">
            <div className={styles.sectionTop}><span>01 / Workflow</span><span>QR/NFC → Paid receipt</span></div>
            <h2 id="flow-heading">{copy.flowTitle}</h2>
            <p className={styles.intro}>{copy.flowIntro}</p>
            <ol className={styles.flow}>
              {copy.steps.map((step, index) => (
                <li key={step.label}>
                  <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="architecture-heading">
          <div className="site-container">
            <div className={styles.sectionTop}><span>02 / Engineering</span><span>Full-stack / One cafe</span></div>
            <h2 id="architecture-heading">{copy.engineeringTitle}</h2>
            <p className={styles.intro}>{copy.engineeringDescription}</p>
            <div className={styles.techGrid}>
              {copy.architecture.map((item) => (
                <article key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></article>
              ))}
            </div>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="verification-heading">
          <div className="site-container">
            <div className={styles.sectionTop}><span>03 / Verification</span><span>CI / Synthetic data</span></div>
            <h2 id="verification-heading">{copy.verificationTitle}</h2>
            <ul className={styles.evidence}>
              {copy.verification.map((item, index) => (
                <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="limits-heading">
          <div className="site-container">
            <div className={styles.sectionTop}><span>04 / Scope</span><span>Honest boundaries</span></div>
            <h2 id="limits-heading">{copy.limitsTitle}</h2>
            <p className={styles.intro}>{copy.limitsText}</p>
            <ul className={styles.limits}>{copy.limits.map((item) => <li key={item}>{item}</li>)}</ul>
            <div className={styles.links}>
              <a href={CANDIDATE} target="_blank" rel="noopener noreferrer">{copy.code} <span aria-hidden="true">↗</span></a>
              <a href={DOCUMENTATION} target="_blank" rel="noopener noreferrer">{copy.docs} <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
        <div className={styles.end}><div className="site-container">
          <span>{copy.footer}</span>
          <Link href={localizePath("/work", locale)}>{copy.back} <span aria-hidden="true">↗</span></Link>
        </div></div>
      </main>
      <InnerFooter locale={locale} />
    </>
  );
}

export default function SmartCafePage() {
  return <SmartCafeCaseStudy locale="en" />;
}
