import HomePage from "@/components/home/HomePage";

import {
  getHomeMessages,
} from "@/i18n/home-messages";

import {
  createPageMetadata,
} from "@/lib/page-metadata";

export const revalidate =
  3600;

const copy =
  getHomeMessages(
    "en",
  );

export const metadata =
  createPageMetadata({
    title:
      "NATSX — Digital Creator",

    description:
      copy.hero.description,

    path:
      "/",

    absoluteTitle:
      true,
  });

export default function Home() {
  return (
    <HomePage
      locale="en"
    />
  );
}