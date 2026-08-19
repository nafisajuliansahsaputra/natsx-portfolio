# NATSX Portfolio

Personal portfolio of **NATSX — Nafisa Juliansah Saputra**, a multidisciplinary digital creator working across design, development, motion, and visual experiences.

**Live:** https://portfolio.natsx.my.id

---

## Overview

NATSX Portfolio is a custom-built portfolio experience focused on presenting selected work, creative capabilities, experiments, and project case studies through a responsive and motion-driven interface.

The project includes both a public portfolio and a private content management area for managing portfolio projects and case-study sections.

### Public Experience

- Branded entry sequence on the homepage
- Responsive desktop, tablet, and mobile layouts
- Selected work showcase
- Project archive
- Dynamic project case studies
- About page
- Playground / visual experiments
- Contact page
- Custom motion system
- Open Graph and Twitter sharing metadata
- Sitemap and robots configuration

### Admin Experience

- Supabase authentication
- Authorized admin-user validation
- Project creation and editing
- Draft / published project status
- Featured project control
- Project ordering
- Dynamic case-study sections
- Project media and content management

---

## Tech Stack

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **CSS Modules**
- **Supabase**
- **Supabase SSR**
- **Vercel**

Typography uses **Plus Jakarta Sans** through `next/font`.

---

## Routes

### Public

```text
/
├── /work
├── /work/[slug]
├── /about
├── /playground
└── /contact
```

### Admin

```text
/admin
├── /admin/login
├── /admin/projects/new
├── /admin/projects/[id]
└── /admin/projects/[id]/sections
```

Only projects with `status = published` are exposed through the public project experience.

---

## Project Structure

```text
src/
├── app/
│   ├── about/
│   ├── admin/
│   ├── contact/
│   ├── playground/
│   ├── work/
│   ├── layout.tsx
│   ├── globals.css
│   ├── motion.css
│   ├── project-motion.css
│   └── intro-motion.css
│
├── components/
│   ├── home/
│   ├── intro/
│   ├── layout/
│   ├── motion/
│   └── system/
│
├── data/
│   ├── playground.ts
│   └── site.ts
│
└── lib/
    ├── supabase/
    ├── portfolio-media.ts
    ├── project-section-content.ts
    ├── public-media.ts
    ├── public-projects.ts
    └── site-url.ts
```

---

## Environment Variables

Create a `.env.local` file based on `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_LINKEDIN_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
```

For production:

```env
NEXT_PUBLIC_SITE_URL=https://portfolio.natsx.my.id
```

Do not commit `.env.local` or private credentials to the repository.

---

## Local Development

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in the required environment variables, then start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

To force the branded homepage intro during development:

```text
http://localhost:3000/?intro=1
```

---

## Quality Checks

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Run the production server locally:

```bash
npm run start
```

A checkpoint should pass both lint and production build before deployment.

---

## Portfolio Content

Public project data is loaded from Supabase.

The public portfolio only exposes published projects, while the admin workspace can manage both draft and published content.

Project case studies are composed from dynamic project sections, allowing different projects to have different content structures while sharing the same public rendering system.

---

## Admin Access

The admin area uses Supabase authentication.

Authenticated users must also exist in the `admin_users` table before they are allowed to access the portfolio dashboard.

Unauthorized users are redirected back to:

```text
/admin/login
```

---

## Deployment

The production application is deployed with **Vercel** and connected to the GitHub repository.

Production domain:

```text
https://portfolio.natsx.my.id
```

Updates pushed to the production branch are deployed through the connected Vercel project.

Production environment variables are configured in the Vercel project settings.

---

## Brand Intro

The homepage includes a custom NATSX entry sequence built specifically for this portfolio.

The intro:

- plays once per browser tab/session
- does not replay during normal internal navigation
- supports forced replay with `?intro=1`
- supports reduced-motion preferences
- transitions directly into the homepage entrance motion
- is responsive across desktop, tablet, and mobile

---

## Author

**Nafisa Juliansah Saputra — NATSX**

Digital Creator  
Indonesia

GitHub: [@nafisajuliansahsaputra](https://github.com/nafisajuliansahsaputra)

---

© 2026 NATSX