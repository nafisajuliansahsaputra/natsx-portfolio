import {
  readFile,
  writeFile,
  mkdir,
} from "node:fs/promises";

import {
  existsSync,
} from "node:fs";

import {
  join,
  resolve,
} from "node:path";

import {
  createClient,
} from "@supabase/supabase-js";

const MEDIA_BUCKET =
  "portfolio-media";

const PAGE_SIZE =
  1000;

const DEFAULT_RETENTION_DAYS =
  30;

const DELETE_CONFIRMATION =
  "DELETE_ORPHANS";

function getArgument(
  name,
) {
  const prefix =
    `--${name}=`;

  const match =
    process.argv.find(
      (
        argument,
      ) =>
        argument.startsWith(
          prefix,
        ),
    );

  return match
    ? match.slice(
        prefix.length,
      )
    : null;
}

function hasFlag(
  name,
) {
  return process.argv.includes(
    `--${name}`,
  );
}

async function loadSimpleEnvFile(
  path,
) {
  if (
    !existsSync(
      path,
    )
  ) {
    return;
  }

  const source =
    await readFile(
      path,
      "utf8",
    );

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

if (
  !supabaseUrl ||
  !serviceRoleKey
) {
  throw new Error(
    "Orphan auditing requires NEXT_PUBLIC_SUPABASE_URL and local-only SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const deleteMode =
  hasFlag(
    "delete",
  );

const retentionDaysRaw =
  getArgument(
    "older-than",
  );

const retentionDays =
  retentionDaysRaw
    ? Number(
        retentionDaysRaw,
      )
    : DEFAULT_RETENTION_DAYS;

if (
  !Number.isFinite(
    retentionDays,
  ) ||
  retentionDays <
    1
) {
  throw new Error(
    "--older-than must be a number of days >= 1.",
  );
}

const backupArgument =
  getArgument(
    "backup",
  );

const confirmation =
  getArgument(
    "confirm-delete",
  );

if (
  deleteMode &&
  confirmation !==
    DELETE_CONFIRMATION
) {
  throw new Error(
    `Deletion requires --confirm-delete=${DELETE_CONFIRMATION}.`,
  );
}

if (
  deleteMode &&
  !backupArgument
) {
  throw new Error(
    "Deletion requires --backup=<verified backup folder>.",
  );
}

const supabase =
  createClient(
    supabaseUrl,
    serviceRoleKey,
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
  fields =
    "*",
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
          fields,
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
        `Failed to read ${table}: ${error.message}`,
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

async function readAllStorageObjects(
  prefix =
    "",
) {
  const rows =
    [];

  for (
    let offset =
      0;
    ;
    offset +=
      PAGE_SIZE
  ) {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from(
          MEDIA_BUCKET,
        )
        .list(
          prefix,
          {
            limit:
              PAGE_SIZE,

            offset,

            sortBy: {
              column:
                "name",

              order:
                "asc",
            },
          },
        );

    if (
      error
    ) {
      throw new Error(
        `Failed to list Storage prefix "${prefix}": ${error.message}`,
      );
    }

    const page =
      data ??
      [];

    for (
      const item of
      page
    ) {
      const fullPath =
        prefix
          ? `${prefix}/${item.name}`
          : item.name;

      const isFolder =
        !item.id &&
        !item.metadata;

      if (
        isFolder
      ) {
        rows.push(
          ...await readAllStorageObjects(
            fullPath,
          ),
        );

        continue;
      }

      rows.push({
        name:
          fullPath,

        metadata:
          item.metadata ??
          {},

        created_at:
          item.created_at ??
          null,

        updated_at:
          item.updated_at ??
          null,
      });
    }

    if (
      page.length <
      PAGE_SIZE
    ) {
      break;
    }
  }

  return rows;
}

const referenced =
  new Set();

function addReference(
  bucket,
  path,
) {
  if (
    bucket !==
      MEDIA_BUCKET ||
    typeof path !==
      "string" ||
    !path
  ) {
    return;
  }

  referenced.add(
    path,
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
    addReference(
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

console.log(
  "[1/5] Reading project references...",
);

const [
  projects,
  sections,
  sectionTranslations,
] =
  await Promise.all([
    readAllRows(
      "projects",
      "hero_image_path,card_image_path",
    ),

    readAllRows(
      "project_sections",
      "content",
    ),

    readAllRows(
      "project_section_translations",
      "content",
    ),
  ]);

for (
  const project of
  projects
) {
  addReference(
    MEDIA_BUCKET,
    project.hero_image_path,
  );

  addReference(
    MEDIA_BUCKET,
    project.card_image_path,
  );
}

for (
  const section of
  sections
) {
  visit(
    section.content,
  );
}

for (
  const translation of
  sectionTranslations
) {
  visit(
    translation.content,
  );
}

console.log(
  `Referenced paths: ${referenced.size}`,
);

console.log(
  "[2/5] Reading Storage inventory...",
);

const storageObjects =
  await readAllStorageObjects();

console.log(
  `Storage objects: ${storageObjects.length}`,
);

const now =
  Date.now();

const retentionMs =
  retentionDays *
  24 *
  60 *
  60 *
  1000;

const orphaned =
  storageObjects
    .filter(
      (
        object,
      ) =>
        typeof object.name ===
          "string" &&
        !referenced.has(
          object.name,
        ),
    )
    .map(
      (
        object,
      ) => {
        const timestamp =
          object.updated_at ??
          object.created_at;

        const updatedAt =
          timestamp
            ? Date.parse(
                timestamp,
              )
            : Number.NaN;

        const ageMs =
          Number.isFinite(
            updatedAt,
          )
            ? Math.max(
                0,
                now -
                  updatedAt,
              )
            : 0;

        const size =
          Number(
            object.metadata
              ?.size ??
            0,
          );

        return {
          path:
            object.name,

          sizeBytes:
            Number.isFinite(
              size,
            )
              ? size
              : 0,

          createdAt:
            object.created_at ??
            null,

          updatedAt:
            object.updated_at ??
            null,

          ageDays:
            Math.floor(
              ageMs /
              (
                24 *
                60 *
                60 *
                1000
              ),
            ),

          eligibleByAge:
            ageMs >=
            retentionMs,
        };
      },
    )
    .sort(
      (
        left,
        right,
      ) =>
        right.sizeBytes -
        left.sizeBytes,
    );

const eligible =
  orphaned.filter(
    (
      object,
    ) =>
      object.eligibleByAge,
  );

const orphanBytes =
  orphaned.reduce(
    (
      total,
      object,
    ) =>
      total +
      object.sizeBytes,
    0,
  );

const eligibleBytes =
  eligible.reduce(
    (
      total,
      object,
    ) =>
      total +
      object.sizeBytes,
    0,
  );

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

const reportRoot =
  join(
    process.cwd(),
    "reports",
  );

await mkdir(
  reportRoot,
  {
    recursive:
      true,
  },
);

const reportPath =
  join(
    reportRoot,
    `portfolio-media-orphans-${stamp}.json`,
  );

const report = {
  generatedAt:
    new Date()
      .toISOString(),

  bucket:
    MEDIA_BUCKET,

  retentionDays,

  referencedCount:
    referenced.size,

  storageObjectCount:
    storageObjects.length,

  orphanCount:
    orphaned.length,

  orphanBytes,

  eligibleCount:
    eligible.length,

  eligibleBytes,

  orphaned,
};

await writeFile(
  reportPath,
  JSON.stringify(
    report,
    null,
    2,
  ),
  "utf8",
);

console.log(
  "[3/5] Orphan report written:",
  reportPath,
);

function formatMb(
  bytes,
) {
  return (
    bytes /
    1024 /
    1024
  ).toFixed(
    2,
  );
}

console.log(
  `Orphans: ${orphaned.length} / ${formatMb(
    orphanBytes,
  )} MB`,
);

console.log(
  `Eligible after ${retentionDays}d: ${eligible.length} / ${formatMb(
    eligibleBytes,
  )} MB`,
);

if (
  !deleteMode
) {
  console.log(
    "[4/5] Dry run only. Nothing deleted.",
  );

  console.log(
    "[5/5] Done.",
  );

  process.exit(
    0,
  );
}

console.log(
  "[4/5] Verifying backup coverage...",
);

const backupRoot =
  resolve(
    backupArgument,
  );

const dataPath =
  join(
    backupRoot,
    "data.json",
  );

const failedPath =
  join(
    backupRoot,
    "failed-media.json",
  );

const manifestPath =
  join(
    backupRoot,
    "media-manifest.json",
  );

if (
  !existsSync(
    dataPath,
  ) ||
  !existsSync(
    failedPath,
  ) ||
  !existsSync(
    manifestPath,
  )
) {
  throw new Error(
    "Backup folder must contain data.json, failed-media.json, and media-manifest.json.",
  );
}

const backupData =
  JSON.parse(
    await readFile(
      dataPath,
      "utf8",
    ),
  );

if (
  backupData
    ?.includeOrphans !==
    true
) {
  throw new Error(
    "Deletion requires a full Storage backup created with npm run backup:portfolio:full.",
  );
}

const backupFailures =
  JSON.parse(
    await readFile(
      failedPath,
      "utf8",
    ),
  );

if (
  !Array.isArray(
    backupFailures,
  ) ||
  backupFailures.length >
    0
) {
  throw new Error(
    "Backup is incomplete. Refusing orphan deletion.",
  );
}

const backupManifest =
  JSON.parse(
    await readFile(
      manifestPath,
      "utf8",
    ),
  );

if (
  !Array.isArray(
    backupManifest,
  )
) {
  throw new Error(
    "Backup media manifest is invalid.",
  );
}

const backedUpPaths =
  new Set(
    backupManifest
      .filter(
        (
          item,
        ) =>
          item?.bucket ===
            MEDIA_BUCKET &&
          typeof item?.path ===
            "string" &&
          typeof item?.sha256 ===
            "string" &&
          item.sha256.length ===
            64,
      )
      .map(
        (
          item,
        ) =>
          item.path,
      ),
  );

const notBackedUp =
  eligible.filter(
    (
      object,
    ) =>
      !backedUpPaths.has(
        object.path,
      ),
  );

if (
  notBackedUp.length >
  0
) {
  throw new Error(
    `Refusing deletion: ${notBackedUp.length} eligible orphan(s) are not present in the verified backup manifest.`,
  );
}

if (
  eligible.length ===
    0
) {
  console.log(
    "No eligible orphans to delete.",
  );

  console.log(
    "[5/5] Done.",
  );

  process.exit(
    0,
  );
}

console.log(
  `Deleting ${eligible.length} verified orphan(s)...`,
);

const DELETE_BATCH_SIZE =
  100;

for (
  let index =
    0;
  index <
  eligible.length;
  index +=
    DELETE_BATCH_SIZE
) {
  const batch =
    eligible
      .slice(
        index,
        index +
          DELETE_BATCH_SIZE,
      )
      .map(
        (
          object,
        ) =>
          object.path,
      );

  const {
    error,
  } =
    await supabase.storage
      .from(
        MEDIA_BUCKET,
      )
      .remove(
        batch,
      );

  if (
    error
  ) {
    throw new Error(
      `Deletion failed: ${error.message}`,
    );
  }

  console.log(
    `Deleted ${Math.min(
      index +
        batch.length,
      eligible.length,
    )}/${eligible.length}`,
  );
}

console.log(
  "[5/5] Done.",
);

console.log(
  `Freed approximately ${formatMb(
    eligibleBytes,
  )} MB.`,
);
