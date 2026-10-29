# Cloudinary URL-only portfolio images

## Goal

**New portfolio images are not uploaded to Supabase Storage.** The CMS still
optimizes images in the browser. An authenticated admin requests a narrowly
scoped signature from Next.js, uploads the optimized file straight to
Cloudinary, and then saves only the delivery URL and media metadata in the
existing Supabase database.

No database schema changes are required:
- `projects.hero_image_path` and `projects.card_image_path` store the
  complete Cloudinary HTTPS URL for new covers.
- Image, gallery and image-finale content JSON keeps the legacy `bucket` and
  logical `path` fields for compatibility, and adds `asset.url` with the
  complete Cloudinary HTTPS URL.
- The image bytes never transit Supabase or the Vercel signing endpoint.
- **Finale video uploads are unchanged** and still use their existing Storage
  handling. This change is only for images.

## Configuration

Set the following in `.env.local` AND Vercel Project Settings → Environment
Variables (Preview and Production as needed):

```dotenv
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

Never prefix the API key or secret with `NEXT_PUBLIC_`, paste them into a
tracked file, or include them in screenshot/support messages.

The signature endpoint checks Supabase Auth and the `admin_users` table,
validates project/section ownership, mime type, media budget, UUID path, and
returns a one-hour Cloudinary signature for that exact `public_id`.

Only media belonging to the configured Cloudinary account is accepted by
the server and public renderer. Cloudinary URLs are versioned and use the
`natsx/portfolio/projects/...` namespace.

## Upload and public display

1. Cover, image section, gallery and finale image editors optimize locally.
2. Browser POSTs metadata to `/api/admin/media/cloudinary-sign`.
3. Browser uploads file directly to the signed Cloudinary image endpoint.
4. CMS saves the resulting `secure_url` to Supabase.
5. Public renderer resolves `asset.url` (or cover URL) first, and retains
   the old Supabase mirror/Storage resolver for legacy assets.

Cloudinary must be configured before new image uploads. If credentials are
absent, the signing endpoint returns 503 with a clear error. It will **not**
quietly upload the image back to Supabase, which could reintroduce egress.

## Legacy media and recovery

**Do not delete existing Supabase Storage objects.** Existing covers,
image-section assets, galleries and finales remain readable through their
legacy paths.

Before migrating old media:
1. ensure public Storage reads actually return HTTP 200;
2. take a complete byte-for-byte backup with checksums;
3. record original storage paths, MIME, sizes and Cloudinary destination URLs;
4. upload and validate new Cloudinary copies;
5. update database links only after verifying the delivery URLs and images;
6. check the public project pages in all locales;
7. retain old Storage originals and external backup until the migration is
   fully verified.

Cloudinary free quotas still exist, so keep the static Vercel mirror plan for
critical content. Changing providers alone never guarantees 100% uptime.

## Safety

- No public unsigned upload presets.
- The Cloudinary API secret is server-only.
- No automated deletion of original Supabase image bytes.
- Never trust arbitrary user-supplied external URLs as media.
- No visual/motion/Three.js/layout changes.

## Verified legacy image migration (opt-in, non-destructive)

The new Cloudinary CMS upload flow does **not** migrate existing Storage media.
Use the resumable CLI only after Supabase media is accessible again.

1. Run `npm run backup:portfolio` from your local machine, with
   `NEXT_PUBLIC_SUPABASE_URL`, the Supabase **service-role key** (local only),
   and the existing app's public key configured in `.env.local`.
2. Inspect `data.json`, `media-manifest.json`, and `failed-media.json`.
   All exported data sources must say `live`, every referenced file must be
   present, and the failure array must be empty. **This backup covers
   referenced media, not necessarily detached/orphaned Storage objects**.
3. With `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in your local environment, run:

```bash
npm run migrate:portfolio -- --from=backups/portfolio/<timestamp>
npm run migrate:portfolio -- --from=backups/portfolio/<timestamp> --upload
```

The default command is a **read-only SHA-256 audit**. Upload validates local
bytes, posts each existing image to its project-owned Cloudinary public ID,
verifies Cloudinary delivery over HTTPS, and checkpoints each successful
mapping into `legacy-cloudinary-map.json`. Failed runs can be retried safely.
It does **not** change the Supabase database or delete old files.

4. Review the Cloudinary URLs and portfolio pages in all supported locales.
   Only when the new copies have been manually checked, apply the mapping:

```bash
npm run migrate:portfolio -- --from=backups/portfolio/<timestamp> --apply
```

Apply requires a local `SUPABASE_SERVICE_ROLE_KEY` and the **exact**
Supabase project URL recorded in the backup. Before updating live rows it
rechecks the Cloudinary URLs, and it uses `updated_at` conflict checks.
It updates existing cover URL fields and section media `asset.url` values
without changing text, layout, original paths, translations, or gallery order.
The operation is idempotent, but interrupted updates can temporarily leave
a mix of legacy and Cloudinary URLs. **No original Storage objects are deleted.**

Only images migrate through this tool. Legacy videos, orphaned assets, and
unreferenced Storage objects are deliberately untouched. Keep an independent
offline copy of the backup before any future Storage cleanup. Do not commit
`.env.local`, service-role credentials, the backup folder, or migration maps.
