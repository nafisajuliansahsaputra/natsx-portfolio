/**
 * One-way, resumable migration of previously backed-up portfolio IMAGES.
 * No files are deleted. A verified byte-for-byte backup is mandatory.
 *
 * node --env-file=.env.local scripts/migrate-legacy-portfolio-media.mjs --from=backups/portfolio/TIMESTAMP
 * node --env-file=.env.local scripts/migrate-legacy-portfolio-media.mjs --from=... --upload
 * node --env-file=.env.local scripts/migrate-legacy-portfolio-media.mjs --from=... --apply
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';

const args = process.argv.slice(2);
const from = args.find(arg => arg.startsWith('--from='))?.slice(7);
const upload = args.includes('--upload');
const apply = args.includes('--apply');
if (!from || (upload && apply)) {
  throw Error('Use --from=<complete-backup> and at most one of --upload / --apply. Default: audit only.');
}
const root = resolve(from);
const load = async filename => JSON.parse(await readFile(join(root, filename), 'utf8'));
const data = await load('data.json');
const manifest = await load('media-manifest.json');
const failures = await load('failed-media.json');
const backupScope = await load('backup-scope.json');
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const pattern = new RegExp(`^projects/${uuid}/(?:covers/(?:hero|card)/${uuid}|sections/${uuid}/(?:(?:gallery|finale)/)?${uuid})\\.(png|jpe?g|webp|avif|gif)$`, 'i');
const validHash = /^[a-f0-9]{64}$/i;
const isLegacyImage = path => typeof path === 'string' && pattern.test(path);
const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
const key = process.env.CLOUDINARY_API_KEY?.trim();
const secret = process.env.CLOUDINARY_API_SECRET?.trim();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const mapFile = join(root, 'legacy-cloudinary-map.json');
let uploaded = {};
try { uploaded = JSON.parse(await readFile(mapFile, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
if (backupScope?.mediaCoverage !== 'full-bucket' || backupScope?.objectCount !== manifest.length ||
    !Array.isArray(failures) || failures.length || !Array.isArray(manifest) || !manifest.length ||
    !data?.tables || !['projects', 'project_sections', 'project_section_translations', 'project_translations', 'work_categories', 'project_work_categories'].every(name => data.dataSources?.[name] === 'live') ||
    !['projects', 'project_sections', 'project_section_translations'].every(name => Array.isArray(data.tables[name]))) {
  throw Error('Incomplete backup: missing live database tables or failed/missing media. No migration is allowed.');
}
if (manifest.length !== new Set(manifest.map(m => `${m.bucket}/${m.path}`)).size) {
  throw Error('Duplicate objects in backup manifest.');
}
const images = manifest.filter(m => isLegacyImage(m.path) && m.bucket === 'portfolio-media');
for (const entry of manifest) {
  if (entry.bucket !== 'portfolio-media' || !entry.relativePath || !entry.relativePath.startsWith('portfolio-media/') ||
      entry.relativePath !== `${entry.bucket}/${entry.path}` || entry.relativePath.split('/').some(s => !s || s === '.' || s === '..') ||
      !validHash.test(entry.sha256) || !Number.isSafeInteger(entry.bytes) || entry.bytes < 1) {
    throw Error(`Invalid backup manifest entry: ${entry.path}`);
  }
  const file = resolve(root, 'media', ...entry.relativePath.split('/'));
  if (!file.startsWith(resolve(root, 'media') + sep)) throw Error(`Unsafe path: ${entry.path}`);
  const bytes = await readFile(file);
  if (bytes.length !== entry.bytes || createHash('sha256').update(bytes).digest('hex') !== entry.sha256) {
    throw Error(`Checksum mismatch: ${entry.path}`);
  }
}
if (!images.length) throw Error('Backup has no legacy images to migrate.');
if (data.projectUrl && supabaseUrl && new URL(data.projectUrl).origin !== new URL(supabaseUrl).origin) {
  throw Error('Supabase URL differs from the backup origin.');
}
const expectedUrl = (entry, url) => {
  if (!cloud || !/^[a-z0-9_-]+$/i.test(cloud) || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    const publicId = `natsx/portfolio/${entry.path.replace(/\.[^.]+$/, '')}`;
    return parsed.protocol === 'https:' && parsed.hostname === 'res.cloudinary.com' &&
      !parsed.search && !parsed.hash && !parsed.username && !parsed.password && !parsed.port &&
      new RegExp(`^/${cloud}/image/upload/v\\d+/${publicId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.(?:png|jpe?g|webp|avif|gif)$`, 'i').test(parsed.pathname);
  } catch { return false; }
};
const saveMap = async () => writeFile(mapFile, JSON.stringify(uploaded, null, 2) + '\n', 'utf8');
async function verifyDelivery(url) {
  const response = await fetch(url, { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
    throw Error(`Cloudinary image failed HEAD verification: HTTP ${response.status}`);
  }
}
console.log(`Backup: ${root}`);
console.log(`Verified SHA-256 for all ${manifest.length} backed-up objects; ${images.length} eligible legacy images.`);
if (!upload && !apply) {
  console.log(`Cloudinary mapping: ${images.filter(e => expectedUrl(e, uploaded[e.path]?.url) && uploaded[e.path]?.sha256 === e.sha256).length}/${images.length}`);
  console.log('Read-only audit complete. --upload copies images; --apply rewrites DB references after verification.');
  process.exit(0);
}
if (!cloud || !key || !secret) throw Error('Cloudinary environment configuration is required.');
if (upload) {
  for (const [index, entry] of images.entries()) {
    const existing = uploaded[entry.path];
    if (existing?.sha256 === entry.sha256 && expectedUrl(entry, existing.url)) {
      await verifyDelivery(existing.url);
      console.log(`[${index + 1}/${images.length}] verified: ${entry.path}`);
      continue;
    }
    const bytes = await readFile(join(root, 'media', ...entry.relativePath.split('/')));
    const publicId = `natsx/portfolio/${entry.path.replace(/\.[^.]+$/, '')}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash('sha1').update(`public_id=${publicId}&timestamp=${timestamp}${secret}`).digest('hex');
    const form = new FormData();
    form.append('file', new Blob([bytes], { type: entry.contentType || 'application/octet-stream' }), entry.path.split('/').at(-1));
    form.append('api_key', key);
    form.append('timestamp', String(timestamp));
    form.append('public_id', publicId);
    form.append('signature', signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, {
      method: 'POST', body: form, signal: AbortSignal.timeout(90000),
    });
    const body = await response.json();
    if (!response.ok || body.resource_type !== 'image' || body.public_id !== publicId || !expectedUrl(entry, body.secure_url)) {
      throw Error(`Cloudinary upload rejected ${entry.path}: ${body.error?.message ?? response.status}`);
    }
    await verifyDelivery(body.secure_url);
    uploaded[entry.path] = { url: body.secure_url, sha256: entry.sha256, bytes: entry.bytes };
    await saveMap(); // checkpoint after every verified file
    console.log(`[${index + 1}/${images.length}] uploaded + verified: ${entry.path}`);
  }
  console.log('Cloudinary copies finished. Supabase database and Storage remain unchanged.');
  process.exit(0);
}
if (!supabaseUrl || !serviceKey || data.projectUrl !== supabaseUrl) {
  throw Error('Applying database changes requires the local service-role key and exact matching backup Supabase URL.');
}
const links = new Map();
for (const entry of images) {
  const item = uploaded[entry.path];
  if (item?.sha256 !== entry.sha256 || !expectedUrl(entry, item.url)) {
    throw Error(`Missing verified Cloudinary mapping for ${entry.path}. Run --upload first.`);
  }
  await verifyDelivery(item.url);
  links.set(entry.path, item.url);
}
const { createClient } = await import('@supabase/supabase-js');
const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
function rewrite(value) {
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map(item => { const [result, modified] = rewrite(item); changed ||= modified; return result; });
    return [changed ? next : value, changed];
  }
  if (!value || typeof value !== 'object') return [value, false];
  let changed = false;
  const next = {};
  for (const [k, v] of Object.entries(value)) {
    const [result, modified] = rewrite(v);
    next[k] = result;
    changed ||= modified;
  }
  if (value.bucket === 'portfolio-media' && typeof value.path === 'string' && links.has(value.path) && !value.url) {
    next.url = links.get(value.path);
    changed = true;
  }
  return [changed ? next : value, changed];
}
async function patch(table, selector, patcher) {
  const { data: rows, error } = await db.from(table).select('*').match(selector);
  if (error || rows?.length !== 1) throw Error(`Could not resolve unique row in ${table}: ${error?.message ?? rows?.length}`);
  const current = rows[0];
  const values = patcher(current);
  if (!values || !Object.keys(values).length) return false;
  const { data: updated, error: updateError } = await db.from(table).update(values)
    .match(selector).eq('updated_at', current.updated_at).select('updated_at');
  if (updateError || updated?.length !== 1) throw Error(`Conflict updating ${table}; rerun after reviewing live changes: ${updateError?.message ?? 'stale row'}`);
  return true;
}
let changed = 0;
for (const project of data.tables.projects) {
  if (await patch('projects', { id: project.id }, current => {
    const fields = {};
    for (const field of ['hero_image_path', 'card_image_path']) {
      if (links.has(current[field])) fields[field] = links.get(current[field]);
    }
    return fields;
  })) changed++;
}
for (const table of ['project_sections', 'project_section_translations']) {
  for (const row of data.tables[table]) {
    const selector = table === 'project_sections' ? { id: row.id } : { section_id: row.section_id, locale: row.locale };
    if (await patch(table, selector, current => {
      const [content, modified] = rewrite(current.content);
      return modified ? { content } : {};
    })) changed++;
  }
}
console.log(`Updated ${changed} database rows. Supabase Storage originals were NOT deleted. Keep the backup.`);
