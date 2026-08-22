import AboutPreview from "@/components/home/AboutPreview";
import Capabilities from "@/components/home/Capabilities";
import ContactFooter from "@/components/home/ContactFooter";
import Hero from "@/components/home/Hero";
import PlaygroundPreview from "@/components/home/PlaygroundPreview";
import SelectedWork from "@/components/home/SelectedWork";

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
      >
        <Hero
          locale={locale}
        />

        <SelectedWork
          locale={locale}
        />

        <Capabilities
          locale={locale}
        />

        <AboutPreview
          locale={locale}
        />

        <PlaygroundPreview
          locale={locale}
        />

        <ContactFooter
          locale={locale}
        />
      </main>
    </>
  );
}