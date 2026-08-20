# NATSX Portfolio

Personal portfolio of **NATSX — Nafisa Juliansah Saputra**, a multidisciplinary digital creator working across design, development, motion, and visual experiences.

**Live:** https://portfolio.natsx.my.id

---

## Overview

NATSX Portfolio is a custom-built portfolio experience focused on presenting selected work, creative capabilities, experiments, and project case studies through a responsive, motion-driven interface.

The project consists of two main experiences:

- a public portfolio for showcasing work and creative identity
- a private content management area for managing projects, case studies, and portfolio media

The portfolio is built as a full-stack Next.js application with Supabase as the data and authentication layer, while Vercel handles production deployment and analytics.

### Public Experience

- Branded NATSX entry sequence
- Responsive desktop, tablet, and mobile layouts
- Selected work showcase
- Dynamic project archive
- Dynamic project case studies
- About page
- Playground / visual experiments
- Contact page
- Multilingual CV viewer
- Custom motion system
- Smart responsive navigation
- Accessibility-focused keyboard navigation
- Open Graph and Twitter sharing metadata
- Canonical metadata
- Dynamic sitemap
- Robots configuration
- Cached public project data

### Admin Experience

- Supabase authentication
- Authorized admin-user validation
- Private admin dashboard
- Project creation and editing
- Draft / published project status
- Featured project control
- Project ordering
- Dynamic case-study sections
- Image and gallery management
- Metrics sections
- Quote sections
- Finale sections
- Project media management
- Automatic public-cache invalidation after content updates

---

## Tech Stack

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **CSS Modules**
- **Supabase**
- **Supabase SSR**
- **Playwright**
- **Vercel**
- **Vercel Analytics**

Typography uses **Plus Jakarta Sans** through `next/font`.

---

## Public Routes

```text
/
├── /work
├── /work/[slug]
├── /about
├── /playground
├── /contact
└── /cv
```

Only projects with:

```text
status = published
```

are exposed through the public project experience.

---

## Admin Routes

```text
/admin
├── /admin/login
├── /admin/projects/new
├── /admin/projects/[id]
└── /admin/projects/[id]/sections
```

The admin workspace is private and requires both a valid Supabase session and membership in the `admin_users` table.

---

## Project Structure

```text
.
├── public/
│   ├── cv/
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── about/
│   │   ├── admin/
│   │   ├── contact/
│   │   ├── cv/
│   │   ├── playground/
│   │   ├── work/
│   │   ├── globals.css
│   │   ├── intro-motion.css
│   │   ├── layout.tsx
│   │   ├── motion.css
│   │   └── project-motion.css
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── home/
│   │   ├── intro/
│   │   ├── layout/
│   │   ├── motion/
│   │   └── system/
│   │
│   ├── data/
│   │   ├── playground.ts
│   │   └── site.ts
│   │
│   └── lib/
│       ├── supabase/
│       ├── page-metadata.ts
│       ├── portfolio-cache.ts
│       ├── portfolio-media.ts
│       ├── project-section-content.ts
│       ├── public-media.ts
│       ├── public-projects.ts
│       └── site-url.ts
│
├── tests/
│   └── e2e/
│       └── public-smoke.spec.ts
│
├── supabase/
├── playwright.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
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

To force the branded NATSX intro during development:

```text
http://localhost:3000/?intro=1
```

---

## Available Scripts

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run the production server locally:

```bash
npm run start
```

Run ESLint:

```bash
npm run lint
```

Run Playwright end-to-end smoke tests:

```bash
npm run test:e2e
```

Open Playwright interactive UI:

```bash
npm run test:e2e:ui
```

Run the complete verification pipeline:

```bash
npm run verify
```

---

## Quality Checks

The project uses a single verification command before deployment:

```bash
npm run verify
```

The verification pipeline runs:

```text
ESLint
   ↓
Production Build
   ↓
Playwright E2E Smoke Tests
```

The smoke-test suite verifies:

- homepage availability
- Work archive availability
- About page
- Playground page
- Contact page
- CV page
- published project detail pages
- custom 404 handling
- unauthenticated admin protection
- `robots.txt`
- `sitemap.xml`

The production build must complete successfully before the Playwright server is started.

---

## Public Data Architecture

Portfolio project data is stored in Supabase.

The public website only queries published projects, while the admin workspace can manage both draft and published content.

Public portfolio queries use Next.js server-side caching to avoid unnecessary database requests on every visitor request.

Public cache entries use a shared portfolio cache tag and a periodic revalidation fallback.

When project or case-study content is updated through the admin workspace, the relevant public cache is invalidated immediately so newly saved content can become available without waiting for the periodic revalidation window.

---

## Project Case Studies

Project pages are generated dynamically from project data stored in Supabase.

Case studies are composed from reusable section types, allowing each project to have its own editorial structure while sharing the same rendering system.

Supported case-study content includes:

- overview sections
- narrative sections
- statement sections
- image sections
- galleries
- metrics
- quotes
- finale sections

Media is stored through the portfolio media system and served from Supabase Storage.

---

## Motion System

The portfolio includes a custom motion architecture shared across public pages.

Motion behavior supports:

- page-specific entrance motion
- scroll-triggered sections
- reduced-motion preferences
- route-aware transitions
- responsive desktop and mobile behavior
- one-time visibility state for scroll content

Motion is intentionally used to reinforce hierarchy and navigation rather than as decorative animation on every element.

---

## Brand Intro

The public portfolio includes a custom NATSX entry sequence shown on the first supported public entry during a browser session.

The intro:

- plays once per browser tab/session
- supports first-entry deep links
- does not replay during normal internal navigation
- excludes the admin experience
- supports forced replay using `?intro=1`
- supports reduced-motion preferences
- transitions directly into the destination page
- is responsive across desktop, tablet, and mobile

Example:

```text
http://localhost:3000/?intro=1
```

---

## Accessibility

The public portfolio includes accessibility improvements for keyboard and assistive-technology users.

These include:

- visible keyboard focus states
- skip-to-main-content navigation
- semantic main content landmarks
- keyboard-accessible navigation
- mobile menu focus management
- focus trapping inside the mobile navigation dialog
- Escape-key menu closing
- reduced-motion support

---

## SEO

The portfolio includes page-level SEO metadata for the main public routes.

Implemented SEO features include:

- title and description metadata
- canonical URLs
- Open Graph metadata
- Twitter metadata
- project-specific metadata
- project social preview images
- root social preview image
- `robots.txt`
- dynamic `sitemap.xml`
- admin `noindex` metadata

Production URLs are generated using the configured site URL:

```env
NEXT_PUBLIC_SITE_URL=https://portfolio.natsx.my.id
```

---

## Security

The admin area uses Supabase Authentication.

Authenticated users must also exist in:

```text
admin_users
```

before being allowed to access the portfolio dashboard.

Unauthorized users are redirected to:

```text
/admin/login
```

Public project and media access is controlled using Supabase Row Level Security policies and Storage policies.

Public account registration is disabled because the authentication system exists exclusively for portfolio administration.

Additional application security measures include:

- secure password requirements
- secure password changes
- current-password verification for password updates
- protected admin routes
- security-related HTTP response headers
- restricted public database operations
- restricted Storage write access

Leaked-password protection is not enabled because it requires a higher Supabase plan.

---

## CV

The portfolio includes a dedicated CV route:

```text
/cv
```

The CV experience supports multiple document variants and displays static PDF files from:

```text
public/cv/
```

The main navigation remains focused on portfolio exploration, while CV access is exposed through secondary portfolio links.

---

## Deployment

The production application is deployed with **Vercel** and connected to the GitHub repository.

Production domain:

```text
https://portfolio.natsx.my.id
```

Updates pushed to the production branch are automatically deployed through the connected Vercel project.

Production environment variables are configured through the Vercel project settings.

---

## Analytics

The portfolio uses **Vercel Analytics** to collect lightweight production usage analytics.

Analytics integration is loaded globally through the application layout.

---

## Author

**Nafisa Juliansah Saputra — NATSX**

Digital Creator  
Indonesia

GitHub: [@nafisajuliansahsaputra](https://github.com/nafisajuliansahsaputra)

---

© 2026 NATSX