# NATSX Portfolio

Personal portfolio of **NATSX — Nafisa Juliansah Saputra**, a multidisciplinary digital creator working across design, development, motion, and visual experiences.

**Live:** https://portfolio.natsx.my.id

---

## Overview

NATSX Portfolio is a custom-built portfolio experience for selected work, creative capabilities, experiments, and dynamic project case studies.

The application has two main surfaces:

- a public multilingual portfolio
- a private Supabase-backed admin workspace

The public experience is built around responsive editorial layouts, custom motion, project-driven content, accessibility, and localized routes. The admin workspace manages published and draft portfolio data, project sections, translations, and media.

---

## Current Stack

- **Next.js 16.3.3**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **CSS Modules**
- **Three.js**
- **Supabase**
- **Supabase SSR**
- **Playwright**
- **Vercel**
- **Vercel Analytics**

Typography uses **Plus Jakarta Sans** through `next/font`.

---

## Public Experience

The public portfolio includes:

- responsive desktop, tablet, and mobile layouts
- first-entry branded NATSX intro
- multilingual routing for English, Indonesian, and German
- selected work showcase
- filterable project archive
- dynamic project case studies
- custom project artwork
- lazy-loaded Three.js editorial scene
- route-aware page transitions
- scroll-triggered motion
- reduced-motion support
- About, Playground, Contact, and CV pages
- dynamic Open Graph and Twitter metadata
- canonical and alternate-language metadata
- dynamic sitemap
- robots configuration
- runtime locale synchronization
- Vercel Analytics in Vercel deployments

---

## Supported Locales

The portfolio supports:

```text
en  English     default route
id  Indonesia   /id/...
de  Deutsch     /de/...
```

English uses the unprefixed route.

Examples:

```text
/work
/id/work
/de/work
```

The same routing model is used for public project detail pages.

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

Localized equivalents are available under:

```text
/id/...
/de/...
```

Only projects with:

```text
status = published
```

are exposed through the public portfolio.

---

## Admin Experience

The private admin workspace includes:

- Supabase Authentication
- server-side session refresh
- `admin_users` authorization checks
- project creation and editing
- draft / published project status
- featured project controls
- project ordering
- project translations
- reusable project case-study sections
- image and gallery management
- metrics sections
- quote sections
- finale sections
- portfolio media management
- public-cache invalidation after content updates

Admin routes:

```text
/admin
├── /admin/login
├── /admin/projects/new
├── /admin/projects/[id]
├── /admin/projects/[id]/sections
└── /admin/categories
```

Admin responses are configured to avoid public caching and indexing.

---

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── verify.yml
│
├── public/
│   ├── cv/
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   ├── about/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── contact/
│   │   ├── cv/
│   │   ├── playground/
│   │   ├── work/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── sitemap.ts
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── home/
│   │   ├── i18n/
│   │   ├── intro/
│   │   ├── layout/
│   │   ├── motion/
│   │   └── system/
│   │
│   ├── data/
│   ├── i18n/
│   ├── lib/
│   │   └── supabase/
│   └── proxy.ts
│
├── supabase/
├── tests/
│   └── e2e/
│
├── .env.example
├── next.config.ts
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vercel.json
```

---

## Environment Variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_LINKEDIN_URL=
NEXT_PUBLIC_INSTAGRAM_URL=

OPENROUTER_API_KEY=
NATSX_TRANSLATION_MODEL=openrouter/free
```

Production site URL:

```env
NEXT_PUBLIC_SITE_URL=https://portfolio.natsx.my.id
```

Never commit `.env.local`, private credentials, deploy hooks, or secret keys.

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

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in the required environment variables, then start development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

To force the branded intro during development:

```text
http://localhost:3000/?intro=1
```

---

## Available Scripts

Development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Serve the production build:

```bash
npm run start
```

TypeScript validation:

```bash
npm run typecheck
```

ESLint:

```bash
npm run lint
```

Playwright E2E suite:

```bash
npm run test:e2e
```

Playwright UI:

```bash
npm run test:e2e:ui
```

Complete verification pipeline:

```bash
npm run verify
```

`npm run verify` runs:

```text
TypeScript
   ↓
ESLint
   ↓
Production Build
   ↓
Playwright E2E
```

---

## Automated Quality Checks

The Playwright suite covers more than basic route availability.

Current coverage includes:

- public smoke tests
- English / Indonesian / German routes
- project detail pages
- route-transition behavior
- reduced-motion behavior
- runtime browser errors
- responsive layouts
- localized visual fit
- text containment
- language-switcher accessibility
- CV integrity
- project media integrity
- image delivery
- contact-page integrity
- admin route security
- production security headers
- robots and multilingual sitemap behavior

The production build is completed before Playwright starts the local production server.

---

## Public Data Architecture

Portfolio content is stored in Supabase.

Public readers only query published projects. Admin routes can work with draft and published content.

Public project data uses server-side caching with a shared portfolio cache tag and timed revalidation. Admin content changes invalidate the relevant public cache so published updates do not need to wait for the fallback revalidation window.

The public query layer also avoids unnecessary payload where practical:

- project-detail navigation uses a reduced field set for the next-project sequence
- sitemap generation uses a dedicated `slug` + `updated_at` query instead of loading full project records and translations

---

## Project Case Studies

Project pages are generated from Supabase-backed project data and reusable editorial sections.

Supported content includes:

- overview
- narrative
- statement
- image
- gallery
- metrics
- quote
- finale

Project images and videos are served through the portfolio media layer backed by Supabase Storage.

The next-project sequence preserves localized title/category data while using a lean navigation query.

---

## Motion Architecture

The portfolio uses a custom motion system shared across public routes.

It includes:

- page-specific entrance motion
- homepage section choreography
- scroll-triggered reveals
- route-aware transitions
- project-to-project handoff motion
- responsive desktop and mobile behavior
- reduced-motion fallbacks
- one-time public entry intro

Route-transition metadata is exposed through semantic data attributes instead of depending on visual DOM nesting.

The heavier Spall Three.js scene is dynamically imported and mounted only when its artwork approaches the viewport.

---

## Brand Intro

The NATSX intro is a first-entry experience for supported public routes.

It:

- plays once per browser tab/session
- supports first-entry deep links
- does not replay during normal internal navigation
- excludes admin routes
- can be forced with `?intro=1`
- respects reduced-motion preferences
- transitions into the requested destination

Example:

```text
http://localhost:3000/?intro=1
```

---

## Accessibility

Accessibility work includes:

- semantic main landmarks
- skip-to-main-content navigation
- visible keyboard focus states
- keyboard-accessible navigation
- mobile navigation focus management
- Escape-key handling
- reduced-motion support
- accessible language switching
- responsive text-containment checks

---

## SEO

The portfolio includes:

- route-level title and description metadata
- canonical URLs
- alternate-language metadata
- Open Graph metadata
- Twitter metadata
- project-specific social preview images
- root social preview image
- `robots.txt`
- dynamic multilingual `sitemap.xml`
- project `lastModified` values in the sitemap
- admin `noindex` behavior

Production URLs are based on:

```env
NEXT_PUBLIC_SITE_URL=https://portfolio.natsx.my.id
```

---

## Security

The admin area uses Supabase Authentication and server-side authorization.

A valid Supabase session alone is not enough; authorized users must also exist in:

```text
admin_users
```

Unauthorized visitors are redirected to:

```text
/admin/login
```

Security measures include:

- protected admin routes
- no-store / noindex admin responses
- Supabase Row Level Security
- restricted Storage write access
- current-password verification for password changes
- restricted public database operations
- HTTP security headers
- Content Security Policy
- HSTS
- `X-Content-Type-Options`
- `X-Frame-Options`
- Referrer Policy
- Permissions Policy
- restricted cross-domain policy

The CSP uses a compatibility baseline suitable for the current Next.js application architecture. Development-only eval allowances are not included in the production policy.

Inline script/style execution is still allowed where required by the current bootstrap and framework behavior; a nonce-based strict CSP is intentionally deferred because it would require a request-time rendering architecture for nonce generation.

Public account registration remains disabled because authentication exists only for portfolio administration.

---

## CV

The CV route is available at:

```text
/cv
```

Localized UI routes are also available under `/id/cv` and `/de/cv`.

The viewer supports multiple PDF language variants while keeping the website locale independent from the selected document language.

CV files are served from:

```text
public/cv/
```

---

## Deployment

Production is hosted on Vercel.

Domain:

```text
https://portfolio.natsx.my.id
```

Direct Vercel Git deployment from `main` is disabled in `vercel.json`.

Production deployment follows this gate:

```text
push / pull request to main
          ↓
GitHub Actions — Verify
          ↓
typecheck
          ↓
lint
          ↓
production build
          ↓
Playwright E2E
          ↓
verified push to main only
          ↓
Vercel production deploy hook
```

The deployment job only runs after the verification job succeeds on a push to `main`.

GitHub Actions uses Node.js 24 and installs Playwright Chromium before running the verification command.

---

## Analytics

Vercel Analytics is integrated globally and is rendered only when the application is running as a Vercel deployment.

---

## Author

**Nafisa Juliansah Saputra — NATSX**

Digital Creator  
Indonesia

GitHub: `@nafisajuliansahsaputra`

---

© 2026 NATSX
