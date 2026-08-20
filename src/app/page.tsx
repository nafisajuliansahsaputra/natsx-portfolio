import AboutPreview from "@/components/home/AboutPreview";
import Capabilities from "@/components/home/Capabilities";
import ContactFooter from "@/components/home/ContactFooter";
import Hero from "@/components/home/Hero";
import PlaygroundPreview from "@/components/home/PlaygroundPreview";
import SelectedWork from "@/components/home/SelectedWork";
import SiteHeader from "@/components/layout/SiteHeader";

export const revalidate =
  3600;

export default function Home() {
  return (
    <>
      <SiteHeader />

<main
  id="main-content"
  tabIndex={-1}
>
        <Hero />

        <SelectedWork />

        <Capabilities />

        <AboutPreview />

        <PlaygroundPreview />

        <ContactFooter />
      </main>
    </>
  );
}