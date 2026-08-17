import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import InnerFooter from "@/components/layout/InnerFooter";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
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
    <html lang="en">
      <body className={plusJakartaSans.variable}>
        {children}

        <InnerFooter />
      </body>
    </html>
  );
}