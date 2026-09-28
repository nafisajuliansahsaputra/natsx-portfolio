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
} from "node:path";

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

const database =
  {};

for (
  const table of
  tableNames
) {
  process.stdout.write(
    `[data] ${table} ... `,
  );

  database[
    table
  ] =
    await readAllRows(
      table,
    );

  console.log(
    database[
      table
    ].length,
  );
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

    const relativePath =
      join(
        entry.bucket,
        ...entry.path
          .split("/"),
      );

    const destination =
      join(
        mediaRoot,
        relativePath,
      );

    process.stdout.write(
      `[media ${index + 1}/${entries.length}] ${entry.path} ... `,
    );

    try {
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
        throw new Error(
          `HTTP ${response.status}`,
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
  failures.length >
  0
) {
  console.error(
    "Backup is incomplete. Keep the generated files for diagnosis and retry after Storage access is restored.",
  );

  process.exitCode =
    2;
}
