import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import InnerFooter from "@/components/layout/InnerFooter";
import MotionController from "@/components/motion/MotionController";

import "./globals.css";
import "./motion.css";

const plusJakartaSans =
  Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta",
    subsets: ["latin"],
    display: "swap",
  });

export const metadata: Metadata = {
  title: {
    default: "NATSX — Digital Creator",
    template: "%s — NATSX",
  },

  description:
    "Portfolio of NATSX, a multidisciplinary digital creator working across design, development, motion, and visual experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
      </head>

      <body
        className={
          plusJakartaSans.variable
        }
      >
        <MotionController />

        {children}

        <InnerFooter />
      </body>
    </html>
  );
}