/*
 * =========================================================
 * HOMEPAGE-SCOPED GLOBAL MOTION
 * =========================================================
 *
 * Ditaruh di entry component homepage
 * supaya route lain tidak perlu meminta
 * stylesheet homepage saat initial load.
 */

import "@/app/home-motion.css";
import "@/app/home-motion-fit.css";

import AboutPreview from "@/components/home/AboutPreview";
import Capabilities from "@/components/home/Capabilities";
import ContactFooter from "@/components/home/ContactFooter";
import Hero from "@/components/home/Hero";
import HomeSectionChoreography from "@/components/home/HomeSectionChoreography";
import PlaygroundPreview from "@/components/home/PlaygroundPreview";
import SelectedWork from "@/components/home/SelectedWork";
import SelectedWorkImmersive from "@/components/home/SelectedWorkImmersive";

import SiteHeader from "@/components/layout/SiteHeader";

import type {
  Locale,
} from "@/i18n/config";

type HomePageProps = {
  locale: Locale;
};

export default function HomePage({
  locale,
}: HomePageProps) {
  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        data-motion-page="home"
      >
        <Hero
          locale={
            locale
          }
        />

        <SelectedWork
          locale={
            locale
          }
        />

        <SelectedWorkImmersive />

        <Capabilities
          locale={
            locale
          }
        />

        <AboutPreview
          locale={
            locale
          }
        />

        <PlaygroundPreview
          locale={
            locale
          }
        />

        <ContactFooter
          locale={
            locale
          }
        />

        <HomeSectionChoreography />
      </main>
    </>
  );
}