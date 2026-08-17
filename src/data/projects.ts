export type ProjectTheme = "spall" | "vision" | "stay";

export type Project = {
  slug: string;
  number: string;
  title: string;
  year: string;
  period: string;
  theme: ProjectTheme;

  disciplines: string[];

  summary: string;
  statement: string;

  overview: string[];
  role: string[];
  website?: string;

  visualLabels: {
    cover: string;
    first: string;
    second: string;
    third: string;
  };
};

export const projects: Project[] = [
  {
    slug: "spall-spill",
    number: "01",
    title: "Spall Spill",
    year: "2026",
    period: "2025—2026",
    theme: "spall",

    disciplines: [
      "Product Design",
      "Web Development",
      "Creative Direction",
    ],

    summary:
      "A curated digital product experience built around discovering, organizing, and sharing products through a more considered interface",

    statement:
      "Turning a simple product catalog into a curated digital experience",

    overview: [
      "Spall Spill is an independent digital product where design, development, content structure, and interaction are treated as one connected experience.",
      "The project became an opportunity to explore how a product-focused platform could feel more personal, curated, and visually distinctive without sacrificing clarity or usability",
    ],

    role: [
      "Product Design",
      "UI / UX Design",
      "Frontend Development",
      "Creative Direction",
    ],

    website: "https://natsx.my.id",

    visualLabels: {
      cover: "Digital Product / Experience",
      first: "Interface System",
      second: "Product Discovery",
      third: "Responsive Experience",
    },
  },

  {
    slug: "5am-vision",
    number: "02",
    title: "5AM Vision",
    year: "2026",
    period: "2026",
    theme: "vision",

    disciplines: [
      "Brand Identity",
      "Creative Direction",
    ],

    summary:
      "A visual identity and creative direction system shaped for a multidisciplinary creative brand.",

    statement:
      "Building an identity that can stretch across strategy, design, story, and creative direction.",

    overview: [
      "5AM Vision explores how a creative identity can remain clear and recognizable while operating across different disciplines and types of work.",
      "The direction focuses on creating a flexible visual system rather than a collection of disconnected assets.",
    ],

    role: [
      "Brand Identity",
      "Visual Direction",
      "Creative Direction",
      "Content Direction",
    ],

    visualLabels: {
      cover: "Identity / Creative Direction",
      first: "Identity System",
      second: "Visual Language",
      third: "Brand Applications",
    },
  },

  {
    slug: "indonesia-stay",
    number: "03",
    title: "Indonesia Stay",
    year: "2026",
    period: "2026",
    theme: "stay",

    disciplines: [
      "Product Design",
      "UI / UX Design",
    ],

    summary:
      "A digital accommodation booking concept designed for travelers discovering and planning stays across Indonesia.",

    statement:
      "Making travel discovery feel clear, useful, and distinctly connected to Indonesia.",

    overview: [
      "Indonesia Stay is a product design exploration focused on accommodation discovery and booking for travelers visiting Indonesia.",
      "The work explores information hierarchy, search, browsing, booking flows, and responsive interface systems across a larger digital product.",
    ],

    role: [
      "Product Design",
      "UI / UX Design",
      "Responsive Design",
      "Visual Direction",
    ],

    visualLabels: {
      cover: "Travel / Product Design",
      first: "Discovery Experience",
      second: "Booking Flow",
      third: "Responsive Product",
    },
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const currentIndex = projects.findIndex(
    (project) => project.slug === slug,
  );

  if (currentIndex === -1) {
    return undefined;
  }

  return projects[(currentIndex + 1) % projects.length];
}