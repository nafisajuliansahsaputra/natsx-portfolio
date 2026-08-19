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

import {
  site,
} from "@/data/site";

import {
  getSiteUrl,
} from "@/lib/site-url";

import "./globals.css";
import "./motion.css";
import "./project-motion.css";
import "./intro-motion.css";

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

    try {
      const isHome =
        window.location.pathname === "/";

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

      root.dataset.intro =
        isHome &&
        (forceIntro || !seen)
          ? "pending"
          : "done";
    } catch {
      root.dataset.intro =
        window.location.pathname === "/"
          ? "pending"
          : "done";
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase:
    new URL(
      getSiteUrl(),
    ),

  applicationName:
    "NATSX Portfolio",

  title: {
    default:
      "Portfolio Nafisa Juliansah Saputra",

    template:
      "%s — NATSX",
  },

  description,

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
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

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

        {children}

        <InnerFooter />

        <Analytics />
      </body>
    </html>
  );
}