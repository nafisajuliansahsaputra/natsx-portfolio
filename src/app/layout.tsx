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
import InnerFooter from "@/components/layout/InnerFooter";
import MotionController from "@/components/motion/MotionController";
import RouteTransitionController from "@/components/motion/RouteTransitionController";
import RouteTransitionHandoff from "@/components/motion/RouteTransitionHandoff";

import {
  site,
} from "@/data/site";

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
        params.get("intro") === "1";

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

      if (shouldShow) {
        sessionStorage.setItem(
          "natsx:portfolio-intro:v5",
          "1"
        );
      }
    } catch {
      root.dataset.intro =
        isAdmin
          ? "done"
          : "pending";
    }
  })();
`;

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
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.dataset.motion = "enabled";
            `,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html:
              introBootstrapScript,
          }}
        />
      </head>

      <body
        className={
          plusJakartaSans.variable
        }
      >
        <PortfolioIntro />

        <MotionController />

        <RouteTransitionController />

        <RouteTransitionHandoff />

        {children}

        <InnerFooter />

        {isVercelDeployment ? (
          <Analytics />
        ) : null}
      </body>
    </html>
  );
}