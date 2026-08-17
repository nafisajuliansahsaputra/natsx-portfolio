export type SiteSocial = {
  label: string;
  username: string;
  href: string;
};

export const site = {
  name: "NATSX",

  person: "Nafisa Juliansah Saputra",

  role: "Digital Creator",

  email: "your-email@example.com",

  location: "Indonesia",

  year: 2026,

  availability: {
    scope: "Available Worldwide",

    statusLines: [
      "Open to selected",
      "opportunities",
    ],

    description:
      "For projects with a clear idea, interesting problem, or enough room to create something thoughtful.",
  },

  collaborationTypes: [
    "Digital Products",
    "Web Experiences",
    "UI / UX Design",
    "Brand Identity",
    "Creative Direction",
    "Motion & Visuals",
  ],

  socials: [
    {
      label: "LinkedIn",
      username:
        "Nafisa Juliansah Saputra",
      href: "#",
    },

    {
      label: "Instagram",
      username: "@natsx",
      href: "#",
    },
  ] satisfies SiteSocial[],
};