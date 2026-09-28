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

const serviceRoleKey =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY
    ?.trim();

const supabaseKey =
  serviceRoleKey ||
  process.env
    .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?.trim();

const includeOrphans =
  process.argv.includes(
    "--include-orphans",
  );

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

if (
  includeOrphans &&
  !serviceRoleKey
) {
  throw new Error(
    "--include-orphans requires local-only SUPABASE_SERVICE_ROLE_KEY so the full Storage inventory can be exported safely.",
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

      includeOrphans,

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

function addMedia(
  bucket,
  path,
) {
  if (
    typeof bucket !==
      "string" ||
    typeof path !==
      "string" ||
    !bucket ||
    !path
  ) {
    return;
  }

  const key =
    `${bucket}/${path}`;

  referencedMedia.set(
    key,
    {
      bucket,
      path,
    },
  );
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

const referencedCount =
  referencedMedia.size;

if (
  includeOrphans
) {
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
    throw new Error(
      "--include-orphans requires a fully live database export. Refusing a full Storage backup while table reads are using the checked-in fallback.",
    );
  }

  console.log(
    "[media] Reading full Storage inventory...",
  );

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
        .schema(
          "storage",
        )
        .from(
          "objects",
        )
        .select(
          "name,bucket_id",
        )
        .eq(
          "bucket_id",
          MEDIA_BUCKET,
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
        `Failed to read full Storage inventory: ${error.message}`,
      );
    }

    const page =
      data ??
      [];

    for (
      const object of
      page
    ) {
      if (
        typeof object.name ===
          "string" &&
        object.name
      ) {
        addMedia(
          MEDIA_BUCKET,
          object.name,
        );
      }
    }

    if (
      page.length <
      PAGE_SIZE
    ) {
      break;
    }
  }
}

const entries =
  Array.from(
    referencedMedia
      .values(),
  );

console.log(
  includeOrphans
    ? `[media] ${entries.length} total object(s) (${referencedCount} referenced)`
    : `[media] ${entries.length} referenced object(s)`,
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
        storageRestricted
      ) {
        throw new Error(
          storageRestrictionMessage ||
          "HTTP 402 - Supabase Storage restricted; request skipped",
        );
      }

      const response =
        await fetch(
          url,
          {
            headers: {
              apikey:
                supabaseKey,

              Authorization:
                `Bearer ${supabaseKey}`,
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
