import {
  existsSync,
} from "node:fs";

import {
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";

import {
  join,
  resolve,
} from "node:path";

const MEDIA_BUCKET =
  "portfolio-media";

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

async function findLatestBackup() {
  const root =
    join(
      process.cwd(),
      "backups",
      "portfolio",
    );

  if (
    !existsSync(
      root,
    )
  ) {
    return null;
  }

  const directories =
    (
      await readdir(
        root,
        {
          withFileTypes:
            true,
        },
      )
    )
      .filter(
        (
          entry,
        ) =>
          entry.isDirectory(),
      )
      .map(
        (
          entry,
        ) =>
          entry.name,
      )
      .sort()
      .reverse();

  return directories[0]
    ? join(
        root,
        directories[0],
      )
    : null;
}

const from =
  getArgument(
    "from",
  );

const backupRoot =
  from
    ? resolve(
        from,
      )
    : await findLatestBackup();

if (
  !backupRoot
) {
  throw new Error(
    "No portfolio backup found. Run npm run backup:portfolio first, or pass --from=<backup-folder>.",
  );
}

const dataPath =
  join(
    backupRoot,
    "data.json",
  );

const failedMediaPath =
  join(
    backupRoot,
    "failed-media.json",
  );

const mediaManifestPath =
  join(
    backupRoot,
    "media-manifest.json",
  );

for (
  const path of
  [
    dataPath,
    failedMediaPath,
    mediaManifestPath,
  ]
) {
  if (
    !existsSync(
      path,
    )
  ) {
    throw new Error(
      `Backup is missing required file: ${path}`,
    );
  }
}

const backupData =
  JSON.parse(
    await readFile(
      dataPath,
      "utf8",
    ),
  );

const failedMedia =
  JSON.parse(
    await readFile(
      failedMediaPath,
      "utf8",
    ),
  );

const mediaManifest =
  JSON.parse(
    await readFile(
      mediaManifestPath,
      "utf8",
    ),
  );

if (
  !backupData ||
  typeof backupData !==
    "object" ||
  !backupData.tables
) {
  throw new Error(
    "Backup data.json is invalid.",
  );
}

if (
  Object.values(
    backupData.dataSources ??
      {},
  ).some(
    (
      source,
    ) =>
      source !==
      "live",
  )
) {
  throw new Error(
    "Snapshot refresh requires a fully live database export. One or more backup tables came from the emergency fallback.",
  );
}

if (
  !Array.isArray(
    failedMedia,
  ) ||
  failedMedia.length >
    0
) {
  throw new Error(
    "Snapshot refresh requires a complete media backup with empty failed-media.json.",
  );
}

if (
  !Array.isArray(
    mediaManifest,
  )
) {
  throw new Error(
    "Backup media-manifest.json is invalid.",
  );
}

const tables =
  backupData.tables;

const projects =
  Array.isArray(
    tables.projects,
  )
    ? tables.projects
    : [];

const publishedProjects =
  projects
    .filter(
      (
        project,
      ) =>
        project?.status ===
          "published",
    )
    .sort(
      (
        left,
        right,
      ) =>
        Number(
          left?.sort_order ??
          0,
        ) -
        Number(
          right?.sort_order ??
          0,
        ),
    );

if (
  publishedProjects.length ===
    0
) {
  throw new Error(
    "Refusing to generate an empty public portfolio snapshot.",
  );
}

const projectIds =
  new Set(
    publishedProjects.map(
      (
        project,
      ) =>
        project.id,
    ),
  );

const projectTranslations =
  (
    Array.isArray(
      tables.project_translations,
    )
      ? tables.project_translations
      : []
  )
    .filter(
      (
        row,
      ) =>
        projectIds.has(
          row?.project_id,
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        String(
          left?.project_id ??
          "",
        ).localeCompare(
          String(
            right?.project_id ??
            "",
          ),
        ) ||
        String(
          left?.locale ??
          "",
        ).localeCompare(
          String(
            right?.locale ??
            "",
          ),
        ),
    );

const sections =
  (
    Array.isArray(
      tables.project_sections,
    )
      ? tables.project_sections
      : []
  )
    .filter(
      (
        section,
      ) =>
        projectIds.has(
          section?.project_id,
        ) &&
        section?.is_visible ===
          true,
    )
    .sort(
      (
        left,
        right,
      ) =>
        String(
          left?.project_id ??
          "",
        ).localeCompare(
          String(
            right?.project_id ??
            "",
          ),
        ) ||
        Number(
          left?.sort_order ??
          0,
        ) -
        Number(
          right?.sort_order ??
          0,
        ),
    );

const sectionIds =
  new Set(
    sections.map(
      (
        section,
      ) =>
        section.id,
    ),
  );

const sectionTranslations =
  (
    Array.isArray(
      tables.project_section_translations,
    )
      ? tables.project_section_translations
      : []
  )
    .filter(
      (
        row,
      ) =>
        sectionIds.has(
          row?.section_id,
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        String(
          left?.section_id ??
          "",
        ).localeCompare(
          String(
            right?.section_id ??
            "",
          ),
        ) ||
        String(
          left?.locale ??
          "",
        ).localeCompare(
          String(
            right?.locale ??
            "",
          ),
        ),
    );

const workCategories =
  (
    Array.isArray(
      tables.work_categories,
    )
      ? tables.work_categories
      : []
  )
    .filter(
      (
        row,
      ) =>
        row?.is_visible ===
          true,
    )
    .sort(
      (
        left,
        right,
      ) =>
        Number(
          left?.sort_order ??
          0,
        ) -
        Number(
          right?.sort_order ??
          0,
        ),
    );

const visibleCategoryIds =
  new Set(
    workCategories.map(
      (
        row,
      ) =>
        row.id,
    ),
  );

const projectCategories =
  (
    Array.isArray(
      tables.project_work_categories,
    )
      ? tables.project_work_categories
      : []
  )
    .filter(
      (
        row,
      ) =>
        projectIds.has(
          row?.project_id,
        ) &&
        visibleCategoryIds.has(
          row?.category_id,
        ),
    )
    .sort(
      (
        left,
        right,
      ) =>
        String(
          left?.project_id ??
          "",
        ).localeCompare(
          String(
            right?.project_id ??
            "",
          ),
        ) ||
        String(
          left?.category_id ??
          "",
        ).localeCompare(
          String(
            right?.category_id ??
            "",
          ),
        ),
    );

const referencedMedia =
  new Set();

function addMedia(
  bucket,
  path,
) {
  if (
    bucket ===
      MEDIA_BUCKET &&
    typeof path ===
      "string" &&
    path
  ) {
    referencedMedia.add(
      path,
    );
  }
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
  publishedProjects
) {
  addMedia(
    MEDIA_BUCKET,
    project.hero_image_path,
  );

  addMedia(
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

const backedUpPaths =
  new Set(
    mediaManifest
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

const missingBackupMedia =
  Array.from(
    referencedMedia,
  ).filter(
    (
      path,
    ) =>
      !backedUpPaths.has(
        path,
      ),
  );

if (
  missingBackupMedia.length >
    0
) {
  throw new Error(
    `Snapshot references ${missingBackupMedia.length} media object(s) that are missing from the verified backup manifest.`,
  );
}

const missingMirrorMedia =
  Array.from(
    referencedMedia,
  ).filter(
    (
      path,
    ) =>
      !existsSync(
        join(
          process.cwd(),
          "public",
          "media",
          MEDIA_BUCKET,
          ...path.split(
            "/",
          ),
        ),
      ),
  );

if (
  missingMirrorMedia.length >
    0
) {
  throw new Error(
    `Static mirror is incomplete for the new snapshot (${missingMirrorMedia.length} missing media object(s)). Run npm run mirror:portfolio first.`,
  );
}

function stripProject(
  project,
) {
  const {
    status,
    ...publicProject
  } =
    project;

  void status;

  return publicProject;
}

const generatedAt =
  new Date()
    .toISOString();

const source =
  `/*
 * Emergency public snapshot.
 *
 * Generated from a verified live portfolio backup at ${generatedAt}.
 * Every media reference in this snapshot was verified to exist in the
 * checked-in /public/media mirror before generation.
 *
 * Do not hand-edit this file. Refresh it with:
 *   npm run snapshot:portfolio
 */

export const FALLBACK_PROJECT_ROWS = ${JSON.stringify(
    publishedProjects.map(
      stripProject,
    ),
    null,
    2,
  )};

export const FALLBACK_PROJECT_TRANSLATION_ROWS = ${JSON.stringify(
    projectTranslations,
    null,
    2,
  )};

export const FALLBACK_SECTION_ROWS = ${JSON.stringify(
    sections,
    null,
    2,
  )};

export const FALLBACK_SECTION_TRANSLATION_ROWS = ${JSON.stringify(
    sectionTranslations,
    null,
    2,
  )};

export const FALLBACK_WORK_CATEGORY_ROWS = ${JSON.stringify(
    workCategories,
    null,
    2,
  )};

export const FALLBACK_PROJECT_CATEGORY_ROWS = ${JSON.stringify(
    projectCategories,
    null,
    2,
  )};
`;

const destination =
  join(
    process.cwd(),
    "src",
    "lib",
    "public-portfolio-fallback-data.ts",
  );

await writeFile(
  destination,
  source,
  "utf8",
);

console.log(
  "",
);

console.log(
  "Portfolio fallback snapshot refreshed.",
);

console.log(
  `Projects: ${publishedProjects.length}`,
);

console.log(
  `Visible sections: ${sections.length}`,
);

console.log(
  `Referenced mirrored media: ${referencedMedia.size}`,
);

console.log(
  `Source backup: ${backupRoot}`,
);
