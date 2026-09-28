# Portfolio media resilience

This document describes the media architecture used to keep the public portfolio
online even when a database/storage provider is rate-limited or unavailable.

## Goals

- Preserve the current UI, motion, Three.js scenes, crop behavior, and artwork.
- Keep Supabase useful as the CMS/database without making it a single point of
  failure for public media delivery.
- Prevent multi-megabyte image uploads from silently becoming public bandwidth
  liabilities.
- Keep replaced/deleted CMS media recoverable until a deliberate cleanup.
- Make a full local backup possible with one command.

## Delivery order

Public media resolution now follows this order:

1. **Checked-in static mirror** from
   `src/data/portfolio-media-mirror.ts`.
2. **Optional mirrored CDN** configured through
   `NEXT_PUBLIC_PORTFOLIO_MEDIA_CDN_PREFIX`.
3. **Supabase Storage** as the legacy/source fallback.

The database continues to store stable `bucket + path` identities. It does not
need to be rewritten when the delivery provider changes.

A CDN mirror must preserve the same key shape:

```text
<prefix>/<bucket>/<path>
```

For example:

```text
/media/portfolio-media/projects/<project-id>/...
```

or, after uploading the same public IDs to Cloudinary:

```text
https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/portfolio-media/projects/<project-id>/...
```

Do not enable a remote prefix until every referenced asset has been mirrored
and verified.

## CMS image budgets

The browser optimizer still preserves animated GIF/WebP media, while still
images are resized and encoded before upload.

A second hard-output guard now blocks unexpectedly large outputs:

- cover: 1.25 MB
- image section: 1.75 MB
- gallery: 1.5 MB
- finale image: 2 MB
- animated image: 8 MB

This guard runs after optimization, so large source artwork may still be
selected as long as the optimized public result fits the budget.

Large PNG gallery items are no longer intentionally served directly. Static
gallery images use Next Image optimization/cache instead. Animated GIFs remain
original to preserve motion.

## Recovery-first deletion

CMS replacement/removal now detaches old media from the project without
deleting the previous Storage object.

A Storage object is deleted automatically only when a newly uploaded file must
be rolled back because its matching database write failed.

This intentionally trades a small amount of storage for recoverability. Orphan
cleanup should only happen after:

1. a verified backup exists;
2. the object has been detached for the chosen retention period;
3. the current project contains no references to it.

## Full backup

Run:

```bash
npm run backup:portfolio
```

The script reads `.env.local` automatically.

For a complete backup, provide a local-only `SUPABASE_SERVICE_ROLE_KEY`.
If it is absent, the script falls back to
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and can only export rows allowed by
RLS.

The command exports:

```text
backups/portfolio/<timestamp>/
  data.json
  media-manifest.json
  failed-media.json
  media/
    portfolio-media/
      projects/...
```

Every downloaded media object gets a SHA-256 checksum. Any HTTP failure leaves
an entry in `failed-media.json` and the command exits non-zero.

Do not treat a backup as complete unless:

```text
Media recovered: N/N
```

and `failed-media.json` is empty.

## Publish a same-origin Vercel mirror

After a complete backup:

```bash
npm run mirror:portfolio
```

or choose a specific backup:

```bash
npm run mirror:portfolio -- --from=backups/portfolio/<timestamp>
```

The publisher refuses to use an incomplete backup. It copies verified media to:

```text
public/media/<bucket>/<path>
```

and generates:

```text
src/data/portfolio-media-mirror.ts
```

Public pages then prefer the same-origin mirror automatically. No database
migration is required.

The `/media/*` route is served with a one-year immutable browser cache. The
storage path already contains UUID/versioned filenames, so replacements create
new URLs rather than mutating cached bytes.

## Optional Cloudinary mirror

Cloudinary is useful as a transformation/CDN layer, but it should not be the
only recoverable copy.

Recommended setup:

1. keep the checked-in/static backup for portfolio-critical assets;
2. upload assets with public IDs that preserve
   `portfolio-media/<storage path>`;
3. verify every media URL;
4. configure:
   `NEXT_PUBLIC_PORTFOLIO_MEDIA_CDN_PREFIX`;
5. redeploy;
6. keep the static mirror as an independent recovery source.

If a Cloudinary account or quota becomes unavailable, removing the CDN prefix
returns delivery to the checked-in mirror/Supabase fallback without changing
project content.

## Cache strategy

- Next Image optimized variants: minimum 30-day cache.
- Static `/media/*` mirror: one year + immutable.
- Existing Three.js screen textures continue to use `/_next/image` and keep
  their current visual resolution.
- Three.js scene gates, hover motion, RAF behavior, and layout are not changed
  by this resilience work.

## Current incident recovery

While Supabase Storage is returning HTTP 402, do not delete or overwrite the
existing Storage objects.

When access is restored:

1. run `npm run backup:portfolio`;
2. confirm all referenced media were recovered;
3. run `npm run mirror:portfolio`;
4. run `npm run verify`;
5. visually compare Home, Work, 5AM, BAST, Attendance, and Spall;
6. deploy the mirror;
7. only then plan old orphan cleanup.

This sequence makes the portfolio independent of a future Supabase Storage
restriction without changing its visual design or motion system.


## Regression guardrails

Run:

```bash
npm run audit:media
```

The production build now runs the same audit automatically before the normal
Three.js optimization step.

The audit blocks deployment when it detects regression-level media risks such
as:

- large still gallery images bypassing Next Image because of file size;
- global image warming no longer being restricted to same-origin covers;
- a checked-in static mirror entry pointing to a missing file;
- a mirrored file no longer matching its SHA-256 manifest;
- a local public image above 8 MB;
- a GLB above 40 MB.

Large-but-currently-accepted assets produce warnings rather than changing the
artwork automatically. This keeps visual parity under human control while
preventing the high-risk delivery patterns that caused the previous egress
incident.

CMS image sizes are also checked twice: first in the browser after optimization
and again by the server action before project content is accepted. This makes
the bandwidth guard harder to bypass accidentally.


## Three.js runtime model delivery

Source GLB files live under `assets/models/`, outside the public web root. They
are not directly downloadable by visitors.

Before `next dev` and `next build`, the scene preparation script creates a
runtime-only copy under `public/runtime-models/`:

```text
assets/models/attendance/imac.glb
        ↓ safe texture optimization
        ↓ SHA-256 of final bytes
public/runtime-models/attendance/imac.<12-char-hash>.glb
```

The generated `src/data/scene-models.json` points all scene loaders and
speculative warmers to those content-addressed URLs.

Benefits:

- source and runtime GLBs are no longer both publicly served;
- changed model bytes automatically produce a new URL;
- runtime GLBs can use a one-year immutable cache safely;
- the existing model hierarchy, materials, geometry, scene composition, and
  motion code are not changed;
- production still uses the conservative GLTF Transform settings that avoid
  simplify/join/weld/flatten operations.

Scene resource warming is also abortable. Navigating away before a large model
finishes warming stops the speculative request instead of continuing to spend
bandwidth in the background. Hidden tabs do not start new scene warming.

On constrained devices (3G, <=4 GB reported device memory, or <=4 logical CPU
cores), only the *distance* of speculative resource warming is reduced. The
actual scene mount threshold, artwork, interaction, and animation remain the
same.

The continuously floating Attendance scene now stops its animation loop and
releases its drawing buffer while the browser tab is hidden, then restores the
same scene when the tab becomes visible again.
