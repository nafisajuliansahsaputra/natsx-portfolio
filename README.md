# NATSX Portfolio

Developer portfolio of **Nafisa Juliansah Saputra (NATSX)**, a **Full-Stack Developer** focused on reliable web products, application architecture, APIs, data, testing, deployment, and product-facing interfaces.

**Live:** https://natsx.my.id

## Recruiter Snapshot

| Area | Implementation |
| --- | --- |
| Primary role | Full-Stack Developer |
| Frontend | Next.js 16, React 19, TypeScript, CSS Modules, Tailwind CSS |
| Backend / data | Supabase, PostgreSQL, server-side data access, authenticated admin workflows |
| Product architecture | Dynamic project CMS, multilingual routing, reusable case-study sections, public/admin boundaries |
| Reliability | Emergency public data snapshot, media resilience tooling, cache invalidation, production-safe fallbacks |
| Testing | TypeScript, ESLint, production build verification, Playwright E2E |
| Security | Supabase Auth, admin authorization, RLS, security headers, CSP, full-history secret scanning |
| Deployment | Vercel production deployment from `main` |
| Languages | English, Indonesian, German |

## What This Repository Demonstrates

This repository is more than a static portfolio frontend. It is a production web application with a public presentation layer and a private content-management surface.

Engineering work includes:

- server-rendered and localized portfolio routes with Next.js
- Supabase-backed project, translation, category, section, and media data
- protected admin workflows for draft and published content
- reusable project-detail rendering instead of hard-coded case-study pages
- public caching plus invalidation after admin updates
- an emergency data snapshot so public routes can continue rendering when the primary data path is unavailable
- responsive motion with reduced-motion handling
- route-level SEO, canonical URLs, alternate-language metadata, sitemap, and robots rules
- Playwright coverage for public routes, localization, media, CV, contact, responsive behavior, accessibility, and admin boundaries
- repository secret scanning with Gitleaks

## Application Surfaces

### Public portfolio

The public application includes:

- homepage and selected work
- filterable project archive
- dynamic project case studies
- About, Playground, Contact, and CV routes
- English, Indonesian, and German localization
- responsive desktop, tablet, and mobile layouts
- route-aware transitions and scroll choreography
- reduced-motion support
- dynamic Open Graph and Twitter metadata
- canonical and alternate-language metadata
- multilingual sitemap and robots configuration
- Vercel Analytics on Vercel deployments

### Private admin workspace

The admin area supports:

- Supabase Authentication
- server-side session handling
- `admin_users` authorization checks
- project creation and editing
- draft / published state
- featured ordering
- project translations
- reusable case-study sections
- image and gallery management
- category management
- public-cache invalidation after content updates

Admin routes are kept out of public indexing and are not publicly cached.

## Architecture

```text
Browser
  |
  +-- Public routes
  |     |
  |     +-- localized Next.js pages
  |     +-- cached portfolio readers
  |     +-- published project data
  |     +-- emergency public snapshot fallback
  |
  +-- Admin routes
        |
        +-- Supabase Auth session
        +-- admin_users authorization
        +-- project / section / translation writes
        +-- cache invalidation

Primary data store
  |
  +-- Supabase / PostgreSQL
  +-- Row Level Security
  +-- portfolio content + translations + section data
```

The live Supabase-backed data path remains the source of truth for content. The repository also contains a generated, data-only emergency snapshot used by public readers when the primary portfolio API path is temporarily unavailable.

## Current Stack

- **Next.js 16.3.3**
- **React 19.2**
- **TypeScript 5**
- **Tailwind CSS 4**
- **CSS Modules**
- **Three.js**
- **Supabase**
- **Supabase SSR**
- **PostgreSQL**
- **Zod**
- **Playwright**
- **Vercel**
- **Vercel Analytics**

Typography uses **Plus Jakarta Sans** through `next/font`.

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

Localized variants are available under:

```text
/id/...
/de/...
```

English uses the unprefixed route.

Only published projects are exposed through public portfolio readers.

## Project Case-Study System

Project pages are generated from structured portfolio data rather than being authored as isolated hard-coded pages.

Supported editorial section types include:

- overview
- narrative
- statement
- image
- gallery
- metrics
- quote
- finale

Project records can expose role, categories, technology stack, engineering highlights, live URLs, repository URLs, localized content, and publication state.

## Data & Resilience

The primary portfolio content path uses Supabase.

Public resilience is handled through:

- cached public readers
- cache invalidation after admin updates
- a generated emergency project/content snapshot
- media backup and mirror tooling
- media resilience audits during build preparation

Relevant scripts include:

```bash
npm run backup:portfolio
npm run mirror:portfolio
npm run audit:media
```

The emergency snapshot is intentionally read-only. CMS writes continue to target the primary Supabase-backed data model.

## Motion & 3D

The public experience includes a custom motion layer for:

- first-entry portfolio intro
- route-aware page transitions
- homepage section choreography
- project-to-project handoff
- scroll-triggered reveals
- responsive behavior
- reduced-motion fallbacks

Heavier 3D work is isolated from the critical rendering path and loaded only where needed.

## Accessibility

Accessibility work includes:

- semantic main landmarks
- skip-to-content navigation
- visible keyboard focus
- keyboard-accessible navigation
- mobile menu focus management
- Escape-key handling
- reduced-motion support
- accessible locale switching
- responsive text-containment verification

## SEO

The application includes:

- route-level titles and descriptions
- canonical URLs
- alternate-language metadata
- Open Graph metadata
- Twitter metadata
- project-specific social previews
- multilingual `sitemap.xml`
- `robots.txt`
- project `lastModified` values
- admin `noindex` behavior

Canonical production domain:

```text
https://natsx.my.id
```

## Security

Security controls include:

- Supabase Authentication
- explicit `admin_users` authorization
- Row Level Security
- restricted admin and storage operations
- security headers
- Content Security Policy
- HSTS
- `X-Content-Type-Options`
- `X-Frame-Options`
- Referrer Policy
- Permissions Policy
- full-history Gitleaks secret scanning on push, pull request, schedule, and manual dispatch

A valid Supabase session alone is not sufficient for admin access.

## Testing & Verification

Local verification:

```bash
npm run verify
```

This runs:

```text
TypeScript
  ↓
ESLint
  ↓
Production build
  ↓
Playwright E2E
```

The E2E suite covers public route availability, localized routes, project details, responsive behavior, motion/reduced-motion behavior, browser errors, media integrity, CV integrity, contact flow, accessibility-sensitive interactions, security headers, admin route boundaries, robots, and sitemap behavior.

Repository CI currently includes a dedicated **Security** workflow that performs full-history secret scanning with Gitleaks.

## Local Development

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Configure the required Supabase and public-site variables, then run:

```bash
npm run dev
```

Local URL:

```text
http://localhost:3000
```

To force the branded intro:

```text
http://localhost:3000/?intro=1
```

## Core Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright E2E |
| `npm run verify` | Typecheck + lint + build + E2E |
| `npm run optimize:3d` | Optimize 3D assets |
| `npm run backup:portfolio` | Backup portfolio content/media |
| `npm run mirror:portfolio` | Publish portfolio media mirror |
| `npm run audit:media` | Audit public media resilience |

## Repository Structure

```text
.
├── .github/workflows/
│   └── security.yml
├── public/
│   ├── cv/
│   └── images/
├── scripts/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   ├── about/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── contact/
│   │   ├── cv/
│   │   ├── playground/
│   │   └── work/
│   ├── components/
│   ├── data/
│   ├── i18n/
│   └── lib/
├── supabase/
├── tests/
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vercel.json
```

## Deployment

Production is hosted on **Vercel**.

`vercel.json` keeps Git deployment enabled for `main`, so production follows the repository's main branch deployment flow.

Production domain:

**https://natsx.my.id**

## Selected Engineering Work

This portfolio links to the repositories and case studies for:

- **Smart Attendance System**: full-stack attendance platform with RFID, face verification, RBAC, device APIs, PostgreSQL/Supabase, and FastAPI
- **NATSX Controller**: Android-to-Windows gamepad system with Kotlin, C#/.NET, networking, shared protocol, and connection recovery
- **BAST**: Laravel/React document workflow system with RBAC, document lifecycle rules, PDF generation, activity logging, and automated checks
- **Spall Spill**: creator identity and structured discovery platform in active development with authenticated mutations, RLS, publication workflow foundations, URL safety, media sanitization, and CI/security gates

## Author

**Nafisa Juliansah Saputra (NATSX)**  
**Full-Stack Developer**  
Indonesia

GitHub: [@nafisajuliansahsaputra](https://github.com/nafisajuliansahsaputra)

---

© 2026 NATSX
