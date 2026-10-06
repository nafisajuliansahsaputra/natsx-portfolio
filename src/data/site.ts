export type SiteSocial = {
  label: string;
  username: string;
  href: string;
};

const contactEmail =
  process.env
    .NEXT_PUBLIC_CONTACT_EMAIL
    ?.trim() ?? "";

const linkedInUrl =
  process.env
    .NEXT_PUBLIC_LINKEDIN_URL
    ?.trim() ?? "";

const instagramUrl =
  process.env
    .NEXT_PUBLIC_INSTAGRAM_URL
    ?.trim() ?? "";

const socials:
  SiteSocial[] = [];

if (linkedInUrl) {
  socials.push({
    label:
      "LinkedIn",

    username:
      "Nafisa Juliansah Saputra",

    href:
      linkedInUrl,
  });
}

if (instagramUrl) {
  socials.push({
    label:
      "Instagram",

    username:
      "@natsx______",

    href:
      instagramUrl,
  });
}

socials.push({
  label:
    "GitHub",

  username:
    "@nafisajuliansahsaputra",

  href:
    "https://github.com/nafisajuliansahsaputra",
});

export const site = {
  name:
    "NATSX",

  person:
    "Nafisa Juliansah Saputra",

  firstName:
    "Julian",

  role:
    "Full-Stack Developer",

  email:
    contactEmail,

  location:
    "Indonesia",

  year:
    2026,

  availability: {
    scope:
      "Available Worldwide",

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

  socials,
};