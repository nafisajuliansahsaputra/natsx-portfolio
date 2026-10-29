# NATSX Portfolio 3D Asset Resilience

## Delivery architecture

- Original six GLB files live under `assets/models/` in GitHub. They are **source files**, not public URLs.
- `scripts/optimize-3d.mjs` generates browser-ready versions under `public/runtime-models/` during Vercel builds.
- Optimized filenames include a 12-character SHA-256 prefix. `next.config.ts` sends `Cache-Control: public, max-age=31536000, immutable` for these URLs.
- Scenes are lazy-mounted using IntersectionObserver after the intro. The browser downloads each GLB from **Vercel CDN**, not Supabase Storage or Cloudinary.
- The user-visible layout, 3D scene geometry, materials, animation, and positioning are not modified by the October 30 resilience work.

## Production reference (2026-10-30 audit)

| Model | Original MiB | Optimized MiB |
| --- | ---: | ---: |
| Attendance iMac | 31.70 | 0.22 |
| Attendance scanner | 4.53 | 2.61 |
| Attendance badge | 0.09 | 0.09 |
| BAST MacBook Pro | 10.11 | 5.41 |
| BAST printer | 0.24 | 0.24 |
| iPhone 17 Pro Max | 3.60 | 2.47 |
| **Total** | **50.26** | **11.03** |

Sizes were collected from a successful Vercel production build. The models are lazy-loaded, so the sum is **not** initial-page download weight.

## Runtime integrity and regressions

`scripts/audit-3d-runtime.mjs --vercel` runs after the optimization step. It checks that:

1. All six source files and generated runtime URLs exist.
2. Each generated GLB has a valid container and a nonempty scene/mesh graph.
3. The SHA-256-based filename matches the actual delivered bytes.
4. A production build fails when a model or total optimized GLB set exceeds the reviewed size ceilings.

This check is deliberately independent of shader rendering: it cannot detect a model that is technically valid but looks wrong. For a new export or optimizer revision, compare visual screenshots and interaction on desktop/mobile before releasing.

## Device/network-aware preloading

`scene-resource-preload.ts` avoids **speculative** runtime-model GLB downloads on constrained devices (e.g. 3G, low memory, or up to four CPU threads). Full-quality models remain available to the actual visible GLTFLoader scene. Non-3D images keep their existing preload behavior, and the static/controller fallback remains unchanged.

## Recovery

The six original files, a per-file SHA-256 manifest, and a ZIP checksum were verified by a one-time GitHub Actions job and preserved in a **draft** GitHub Release named `natsx-3d-source-backup-20261030`.

- The archive must remain **draft**. It is a recovery asset, not a public release.
- To restore a source model, verify it against the SHA-256 manifest, replace the matching file under `assets/models/`, and rebuild the same versioned runtime pipeline.
- Do not push the backup ZIP into the repository; source files are already tracked, and ZIP duplicates unnecessarily increase Git history.
- Do not move the original GLB delivery to Cloudinary unless a verified need outweighs the extra external dependency.
