import {
  createHash,
} from "node:crypto";

import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";

import {
  existsSync,
} from "node:fs";

import {
  dirname,
  join,
  resolve,
} from "node:path";

import {
  pathToFileURL,
} from "node:url";

import {
  createClient,
} from "@supabase/supabase-js";

const MEDIA_BUCKET =
  "portfolio-media";

const PAGE_SIZE =
  1000;

const DOWNLOAD_CONCURRENCY =
  3;

function loadSimpleEnvFile(
  path,
) {
  if (
    !existsSync(
      path,
    )
  ) {
    return;
  }

  return readFile(
    path,
    "utf8",
  ).then(
    (
      source,
    ) => {
      for (
        const line of
        source.split(
          /\r?\n/,
        )
      ) {
        const trimmed =
          line.trim();

        if (
          !trimmed ||
          trimmed.startsWith(
            "#",
          )
        ) {
          continue;
        }

        const equals =
          trimmed.indexOf(
            "=",
          );

        if (
          equals <=
          0
        ) {
          continue;
        }

        const key =
          trimmed
            .slice(
              0,
              equals,
            )
            .trim();

        if (
          !key ||
          process.env[
            key
          ]
        ) {
          continue;
        }

        let value =
          trimmed
            .slice(
              equals +
                1,
            )
            .trim();

        if (
          (
            value.startsWith(
              '"',
            ) &&
            value.endsWith(
              '"',
            )
          ) ||
          (
            value.startsWith(
              "'",
            ) &&
            value.endsWith(
              "'",
            )
          )
        ) {
          value =
            value.slice(
              1,
              -1,
            );
        }

        process.env[
          key
        ] =
          value;
      }
    },
  );
}

await loadSimpleEnvFile(
  ".env.local",
);

await loadSimpleEnvFile(
  ".env",
);

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL
    ?.trim();

const supabaseKey =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY
    ?.trim() ||
  process.env
    .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?.trim();

if (
  !supabaseUrl ||
  !supabaseKey
) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase key. " +
      "Use SUPABASE_SERVICE_ROLE_KEY locally for a complete backup, " +
      "or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for public-readable data.",
  );
}

const stamp =
  new Date()
    .toISOString()
    .replace(
      /[-:]/g,
      "",
    )
    .replace(
      /\.\d{3}Z$/,
      "Z",
    );

const outputRoot =
  join(
    process.cwd(),
    "backups",
    "portfolio",
    stamp,
  );

const mediaRoot =
  join(
    outputRoot,
    "media",
  );

await mkdir(
  mediaRoot,
  {
    recursive:
      true,
  },
);

const supabase =
  createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,
      },
    },
  );

async function readAllRows(
  table,
) {
  const rows =
    [];

  for (
    let from =
      0;
    ;
    from +=
      PAGE_SIZE
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          table,
        )
        .select(
          "*",
        )
        .range(
          from,
          from +
            PAGE_SIZE -
            1,
        );

    if (
      error
    ) {
      throw new Error(
        `Failed to export ${table}: ${error.message}`,
      );
    }

    const page =
      data ??
      [];

    rows.push(
      ...page,
    );

    if (
      page.length <
      PAGE_SIZE
    ) {
      break;
    }
  }

  return rows;
}

const tableNames = [
  "projects",
  "project_translations",
  "project_sections",
  "project_section_translations",
  "work_categories",
  "project_work_categories",
];

async function loadCheckedInFallbackDatabase() {
  const fallbackModuleUrl =
    pathToFileURL(
      resolve(
        process.cwd(),
        "src",
        "lib",
        "public-portfolio-fallback-data.ts",
      ),
    ).href;

  const fallback =
    await import(
      fallbackModuleUrl
    );

  return {
    projects:
      fallback
        .FALLBACK_PROJECT_ROWS ??
      [],

    project_translations:
      fallback
        .FALLBACK_PROJECT_TRANSLATION_ROWS ??
      [],

    project_sections:
      fallback
        .FALLBACK_SECTION_ROWS ??
      [],

    project_section_translations:
      fallback
        .FALLBACK_SECTION_TRANSLATION_ROWS ??
      [],

    work_categories:
      fallback
        .FALLBACK_WORK_CATEGORY_ROWS ??
      [],

    project_work_categories:
      fallback
        .FALLBACK_PROJECT_CATEGORY_ROWS ??
      [],
  };
}

let fallbackDatabase =
  null;

async function getFallbackRows(
  table,
) {
  if (
    !fallbackDatabase
  ) {
    fallbackDatabase =
      await loadCheckedInFallbackDatabase();
  }

  return fallbackDatabase[
    table
  ] ??
  [];
}

const database =
  {};

const dataSources =
  {};

for (
  const table of
  tableNames
) {
  process.stdout.write(
    `[data] ${table} ... `,
  );

  try {
    database[
      table
    ] =
      await readAllRows(
        table,
      );

    dataSources[
      table
    ] =
      "live";

    console.log(
      `${database[
        table
      ].length} (live)`,
    );
  } catch (
    error
  ) {
    const message =
      error instanceof
      Error
        ? error.message
        : String(
            error,
          );

    database[
      table
    ] =
      await getFallbackRows(
        table,
      );

    dataSources[
      table
    ] =
      "checked-in-fallback";

    console.log(
      `${database[
        table
      ].length} (checked-in fallback; live API unavailable)`,
    );

    console.warn(
      `       ${message}`,
    );
  }
}

await writeFile(
  join(
    outputRoot,
    "data.json",
  ),
  JSON.stringify(
    {
      exportedAt:
        new Date()
          .toISOString(),

      projectUrl:
        supabaseUrl,

      dataSources,

      tables:
        database,
    },
    null,
    2,
  ),
  "utf8",
);

const referencedMedia =
  new Map();

/**
 * The public database now stores Cloudinary URLs for covers and asset.url
 * for sections. Normalize those URLs back to the logical bucket/path identity
 * so the backup can survive the old Supabase Storage objects being retired.
 */
function cloudinaryOriginal(value) {
  if (typeof value !== "string") return null;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloud || !/^[a-zA-Z0-9_-]+$/.test(cloud)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
        url.port || url.username || url.password || url.search || url.hash) {
      return null;
    }
    const prefix = `/${cloud}/image/upload/`;
    if (!url.pathname.startsWith(prefix)) return null;
    const tail = url.pathname.slice(prefix.length);
    const match = /^v\d+\/natsx\/portfolio\/(projects\/[a-f0-9-]+\/(?:covers|sections)\/[a-z0-9_./-]+\.(?:png|jpe?g|webp|avif|gif))$/i.exec(tail);
    if (!match || match[1].includes("..") || match[1].includes("%")) return null;
    return { path: match[1], url: value };
  } catch {
    return null;
  }
}

function addMedia(bucket, path, cloudinaryUrl) {
  if (typeof bucket !== "string" || typeof path !== "string" ||
      !bucket || !path) return;

  let logicalPath = path;
  let sourceUrl = null;
  if (/^https?:\/\//i.test(path)) {
    const original = cloudinaryOriginal(path);
    if (!original) {
      throw new Error("External cover URL cannot be backed up safely: " + path);
    }
    logicalPath = original.path;
    sourceUrl = original.url;
  }

  if (typeof cloudinaryUrl === "string" && cloudinaryUrl) {
    const original = cloudinaryOriginal(cloudinaryUrl);
    if (!original || original.path !== logicalPath) {
      throw new Error("Untrusted or mismatched Cloudinary media URL: " + logicalPath);
    }
    sourceUrl = original.url;
  }

  const key = `${bucket}/${logicalPath}`;
  const previous = referencedMedia.get(key);
  referencedMedia.set(key, {
    bucket,
    path: logicalPath,
    ...(sourceUrl || previous?.sourceUrl
      ? { sourceUrl: sourceUrl || previous.sourceUrl }
      : {}),
  });
}

function visit(
  value,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    value.forEach(
      visit,
    );

    return;
  }

  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return;
  }

  if (
    value.bucket ===
      MEDIA_BUCKET &&
    typeof value.path ===
      "string"
  ) {
    addMedia(
      value.bucket,
      value.path,
      value.url,
    );
  }

  Object.values(
    value,
  ).forEach(
    visit,
  );
}

for (
  const project of
  database.projects ??
  []
) {
  addMedia(
    MEDIA_BUCKET,
    project
      .hero_image_path,
  );

  addMedia(
    MEDIA_BUCKET,
    project
      .card_image_path,
  );
}

for (
  const section of
  database
    .project_sections ??
  []
) {
  visit(
    section.content,
  );
}

for (
  const translation of
  database
    .project_section_translations ??
  []
) {
  visit(
    translation.content,
  );
}

/*
 * A referenced-only backup is not a full Storage recovery copy: removed
 * images can still exist in the bucket. Include detached objects when the
 * local service-role key is available. Never attempt this with an anon key,
 * because RLS could silently hide files and yield a partial inventory.
 */
if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
  const visited = new Set();
  async function listStorageFolder(prefix = "") {
    if (visited.has(prefix)) return;
    visited.add(prefix);
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data: items, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .list(prefix, {
          limit: PAGE_SIZE,
          offset,
          sortBy: { column: "name", order: "asc" },
        });
      if (error) {
        throw new Error(`Cannot list complete Storage inventory at "${prefix}": ${error.message}`);
      }
      for (const item of items ?? []) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (!item.id) {
          await listStorageFolder(path);
        } else {
          addMedia(MEDIA_BUCKET, path);
        }
      }
      if (!items || items.length < PAGE_SIZE) break;
    }
  }
  await listStorageFolder();
  console.log(`[media] Full bucket inventory included; ${referencedMedia.size} object(s) to back up.`);
} else {
  console.warn("[media] No local service-role key: backup is referenced-only and CANNOT be used to delete orphaned Storage objects.");
}

const entries =
  Array.from(
    referencedMedia
      .values(),
  );

console.log(
  `[media] ${entries.length} referenced object(s)`,
);

function encodePath(
  value,
) {
  return value
    .split("/")
    .map(
      (
        segment,
      ) =>
        encodeURIComponent(
          segment,
        ),
    )
    .join("/");
}

function publicStorageUrl(
  bucket,
  path,
) {
  return (
    `${supabaseUrl}/storage/v1/object/public/` +
    `${encodeURIComponent(
      bucket,
    )}/` +
    encodePath(
      path,
    )
  );
}

const manifest =
  [];

const failures =
  [];

let cursor =
  0;

let storageRestricted =
  false;

let storageRestrictionMessage =
  "";

function isStorageRestriction(
  status,
  message,
) {
  return (
    status ===
      402 ||
    /exceed_cached_egress_quota|service.*restricted|cached egress/i.test(
      message,
    )
  );
}

async function downloadWorker() {
  while (
    cursor <
    entries.length
  ) {
    const index =
      cursor;

    cursor +=
      1;

    const entry =
      entries[
        index
      ];

    const url =
      entry.sourceUrl ||
      publicStorageUrl(
        entry.bucket,
        entry.path,
      );

    /*
     * Persist manifest paths with forward slashes so a backup created on
     * Windows can be verified/published on Linux (Vercel) and vice versa.
     */
    const relativePath =
      [
        entry.bucket,
        ...entry.path
          .split("/"),
      ].join("/");

    const destination =
      join(
        mediaRoot,
        ...relativePath
          .split("/"),
      );

    process.stdout.write(
      `[media ${index + 1}/${entries.length}] ${entry.path} ... `,
    );

    try {
      if (
        storageRestricted &&
        !entry.sourceUrl
      ) {
        throw new Error(
          storageRestrictionMessage ||
          "HTTP 402 - Supabase Storage restricted; request skipped",
        );
      }

      const response =
        await fetch(
          url,
          entry.sourceUrl
            ? {}
            : {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
              },
        );

      if (
        !response.ok
      ) {
        let responseMessage =
          "";

        try {
          responseMessage =
            await response
              .text();
        } catch {
          responseMessage =
            "";
        }

        const failureMessage =
          responseMessage
            ? `HTTP ${response.status}: ${responseMessage}`
            : `HTTP ${response.status}`;

        if (
          !entry.sourceUrl &&
          isStorageRestriction(
            response.status,
            failureMessage,
          )
        ) {
          storageRestricted =
            true;

          storageRestrictionMessage =
            "HTTP 402 - Supabase Storage restricted by cached egress quota; remaining media requests skipped";
        }

        throw new Error(
          failureMessage,
        );
      }

      const bytes =
        Buffer.from(
          await response
            .arrayBuffer(),
        );

      await mkdir(
        dirname(
          destination,
        ),
        {
          recursive:
            true,
        },
      );

      await writeFile(
        destination,
        bytes,
      );

      const sha256 =
        createHash(
          "sha256",
        )
          .update(
            bytes,
          )
          .digest(
            "hex",
          );

      manifest.push({
        ...entry,

        bytes:
          bytes.length,

        sha256,

        contentType:
          response.headers
            .get(
              "content-type",
            ),

        relativePath,
      });

      console.log(
        `${(
          bytes.length /
          1024 /
          1024
        ).toFixed(
          2,
        )} MB`,
      );
    } catch (
      error
    ) {
      const message =
        error instanceof
        Error
          ? error.message
          : String(
              error,
            );

      failures.push({
        ...entry,
        error:
          message,
      });

      console.log(
        `FAILED (${message})`,
      );
    }
  }
}

await Promise.all(
  Array.from(
    {
      length:
        Math.min(
          DOWNLOAD_CONCURRENCY,
          entries.length ||
            1,
        ),
    },
    () =>
      downloadWorker(),
  ),
);

manifest.sort(
  (
    left,
    right,
  ) =>
    left.path.localeCompare(
      right.path,
    ),
);

failures.sort(
  (
    left,
    right,
  ) =>
    left.path.localeCompare(
      right.path,
    ),
);

await writeFile(
  join(
    outputRoot,
    "media-manifest.json",
  ),
  JSON.stringify(
    manifest,
    null,
    2,
  ),
  "utf8",
);

await writeFile(
  join(
    outputRoot,
    "failed-media.json",
  ),
  JSON.stringify(
    failures,
    null,
    2,
  ),
  "utf8",
);

await writeFile(
  join(outputRoot, "backup-scope.json"),
  JSON.stringify({
    mediaCoverage: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      ? "full-bucket" : "referenced-only",
    bucket: MEDIA_BUCKET,
    objectCount: entries.length,
    recoveredCount: manifest.length,
    failureCount: failures.length,
  }, null, 2) + "\n",
  "utf8",
);

console.log(
  "",
);

console.log(
  `Backup written to: ${outputRoot}`,
);

console.log(
  `Media recovered: ${manifest.length}/${entries.length}`,
);

if (
  Object.values(
    dataSources,
  ).some(
    (
      source,
    ) =>
      source !==
      "live",
  )
) {
  console.warn(
    "Database export used the checked-in emergency snapshot for one or more tables because the live Supabase API is restricted.",
  );
}

if (
  failures.length >
  0
) {
  console.error(
    "Backup is incomplete. Database/snapshot metadata was saved, but media must be retried after Supabase Storage access is restored.",
  );

  if (
    storageRestricted
  ) {
    console.error(
      "Supabase Storage is still HTTP 402. This is expected during the cached-egress restriction; no repeated Storage hammering was performed.",
    );
  }

  process.exitCode =
    2;
}
