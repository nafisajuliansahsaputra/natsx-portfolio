import type {
  Metadata,
} from "next";

import {
  Plus_Jakarta_Sans,
} from "next/font/google";

import {
  Analytics,
} from "@vercel/analytics/next";

import PortfolioIntro from "@/components/intro/PortfolioIntro";
import GlobalImagePreloader from "@/components/media/GlobalImagePreloader";
import MotionController from "@/components/motion/MotionController";
import RouteTransitionController from "@/components/motion/RouteTransitionController";

import {
  site,
} from "@/data/site";

import {
  defaultLocale,
  localizedLocales,
} from "@/i18n/config";

import {
  getSiteUrl,
} from "@/lib/site-url";

/*
 * =========================================================
 * GLOBAL / APP-WIDE STYLES
 * =========================================================
 *
 * Hanya stylesheet yang benar-benar
 * berlaku lintas seluruh aplikasi
 * yang tersisa di root.
 */

import "./globals.css";
import "./motion.css";

import "./route-transition-sync.css";
import "./route-transition-title-consistency.css";

import "./intro-motion.css";

/*
 * =========================================================
 * ROUTE / SCOPE-SPECIFIC CSS
 * =========================================================
 *
 * home-motion.css
 * home-motion-fit.css
 * → components/home/HomePage.tsx
 *
 * work-motion.css
 * → app/work/page.tsx
 *
 * about-motion.css
 * → app/about/page.tsx
 *
 * playground-motion.css
 * → app/playground/page.tsx
 *
 * cv-motion.css
 * → app/cv/page.tsx
 *
 * contact-motion.css
 * contact-email-fit.css
 * → app/contact/page.tsx
 *
 * project-motion.css
 * project-media-motion.css
 * project-fit.css
 * → app/work/[slug]/page.tsx
 *
 * localized-fit.css
 * → app/[locale]/layout.tsx
 */

const plusJakartaSans =
  Plus_Jakarta_Sans({
    variable:
      "--font-plus-jakarta",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });

const description =
  "Portfolio of NATSX, a multidisciplinary digital creator working across design, development, motion, and visual experiences.";

/*
 * =========================================================
 * PRE-PAINT BOOTSTRAP
 * =========================================================
 *
 * IMPORTANT:
 *
 * These scripts intentionally live
 * directly inside <head>.
 *
 * They must execute while the browser
 * is still parsing the document,
 * BEFORE body / public-page content can
 * receive its first paint.
 *
 * This prevents:
 *
 * homepage hero
 *      ↓
 * one-frame flash
 *      ↓
 * Portfolio Intro
 *
 * It also resolves the document locale
 * before body content is exposed.
 */

const documentBootstrapScript = `
  (() => {
    const root =
      document.documentElement;

    root.dataset.motion =
      "enabled";

    const segment =
      window.location.pathname
        .split("/")
        .filter(Boolean)[0];

    const localizedLocales =
      ${JSON.stringify(localizedLocales)};

    const locale =
      localizedLocales.includes(
        segment
      )
        ? segment
        : ${JSON.stringify(defaultLocale)};

    root.lang =
      locale;

    root.dataset.locale =
      locale;
  })();
`;

const introBootstrapScript = `
  (() => {
    const root =
      document.documentElement;

    const pathname =
      window.location.pathname;

    const isAdmin =
      pathname === "/admin" ||
      pathname.startsWith(
        "/admin/"
      );

    try {
      const params =
        new URLSearchParams(
          window.location.search
        );

      const forceIntro =
        params.get(
          "intro"
        ) === "1";

      const seen =
        sessionStorage.getItem(
          "natsx:portfolio-intro:v5"
        ) === "1";

      const shouldShow =
        !isAdmin &&
        (
          forceIntro ||
          !seen
        );

      root.dataset.intro =
        shouldShow
          ? "pending"
          : "done";

      /*
       * Mark the public-entry session
       * immediately.
       *
       * The intro is therefore a
       * first-entry experience, not a
       * refresh experience.
       */
      if (
        shouldShow
      ) {
        sessionStorage.setItem(
          "natsx:portfolio-intro:v5",
          "1"
        );
      }
    } catch {
      /*
       * Safe public fallback:
       *
       * if sessionStorage cannot be read,
       * allow the intro instead of exposing
       * the destination page underneath.
       */
      root.dataset.intro =
        isAdmin
          ? "done"
          : "pending";
    }
  })();
`;

const publicMediaOrigin =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL
    ?.trim()
    .replace(
      /\/$/,
      "",
    ) ??
  null;

const isVercelDeployment =
  process.env.VERCEL ===
  "1";

export const metadata: Metadata = {
  metadataBase:
    new URL(
      getSiteUrl(),
    ),

  applicationName:
    "NATSX Portfolio",

  title: {
    default:
      "NATSX — Digital Creator",

    template:
      "%s — NATSX",
  },

  description,

  alternates: {
    canonical:
      getSiteUrl(),
  },

  creator:
    site.person,

  publisher:
    site.name,

  category:
    "Portfolio",

  keywords: [
    "NATSX",
    "Digital Creator",
    "UI UX Designer",
    "Web Developer",
    "Creative Direction",
    "Motion Design",
    "Portfolio",
  ],

  openGraph: {
    type:
      "website",

    title:
      "NATSX — Digital Creator",

    description,

    siteName:
      site.name,

    url:
      getSiteUrl(),

    locale:
      "en_US",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "NATSX — Digital Creator",

    description,
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang={
        defaultLocale
      }
      data-locale={
        defaultLocale
      }
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/*
         * ===============================================
         * MUST RUN BEFORE BODY FIRST PAINT
         * ===============================================
         *
         * Do not move these scripts back to
         * next/script in the body.
         */}

        <script
          dangerouslySetInnerHTML={{
            __html:
              documentBootstrapScript,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html:
              introBootstrapScript,
          }}
        />

        {publicMediaOrigin ? (
          <>
            <link
              rel="preconnect"
              href={
                publicMediaOrigin
              }
              crossOrigin="anonymous"
            />

            <link
              rel="dns-prefetch"
              href={
                publicMediaOrigin
              }
            />
          </>
        ) : null}
      </head>

      <body
        className={
          plusJakartaSans.variable
        }
      >
        <PortfolioIntro />

        <GlobalImagePreloader />

        <MotionController />

        <RouteTransitionController />

        {children}

        {isVercelDeployment ? (
          <Analytics />
        ) : null}
      </body>
    </html>
  );
}