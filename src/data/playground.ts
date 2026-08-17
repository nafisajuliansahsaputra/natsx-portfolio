export type PlaygroundPreviewLayout =
  | "large"
  | "portrait"
  | "square"
  | "wide";

export type PlaygroundPreviewVisual =
  | "generative"
  | "type"
  | "form"
  | "poster";

export type PlaygroundVisual =
  | "generative"
  | "motion"
  | "form"
  | "poster";

export type PlaygroundItem = {
  slug: string;
  number: string;
  title: string;
  year: string;

  category: string;
  description: string;

  featured: boolean;
  featuredOrder: number;

  preview: {
    layout: PlaygroundPreviewLayout;
    visual: PlaygroundPreviewVisual;
  };

  visual: PlaygroundVisual;
};

export const playgroundItems: PlaygroundItem[] = [
  {
    slug: "generative-visual",
    number: "01",
    title: "Generative Visual",
    year: "2026",

    category: "AI / Visual Study",

    description:
      "Exploring composition, image systems, and unexpected visual directions through generative tools.",

    featured: true,
    featuredOrder: 1,

    preview: {
      layout: "large",
      visual: "generative",
    },

    visual: "generative",
  },

  {
    slug: "type-in-motion",
    number: "02",
    title: "Type in Motion",
    year: "2026",

    category: "Motion / Typography",

    description:
      "A study in rhythm, scale, timing, and how typography changes when it begins to move.",

    featured: true,
    featuredOrder: 2,

    preview: {
      layout: "portrait",
      visual: "type",
    },

    visual: "motion",
  },

  {
    slug: "form-study",
    number: "03",
    title: "Form Study",
    year: "2026",

    category: "3D / Experiment",

    description:
      "Simple forms, proportion, light, and composition explored without the constraints of a final deliverable.",

    featured: true,
    featuredOrder: 3,

    preview: {
      layout: "square",
      visual: "form",
    },

    visual: "form",
  },

  {
    slug: "poster-system",
    number: "04",
    title: "Poster System",
    year: "2026",

    category: "Graphic / Typography",

    description:
      "An evolving graphic system built through type, structure, repetition, and visual tension.",

    featured: true,
    featuredOrder: 4,

    preview: {
      layout: "wide",
      visual: "poster",
    },

    visual: "poster",
  },
];

export const featuredPlaygroundItems =
  playgroundItems
    .filter((item) => item.featured)
    .sort(
      (a, b) =>
        a.featuredOrder - b.featuredOrder,
    );