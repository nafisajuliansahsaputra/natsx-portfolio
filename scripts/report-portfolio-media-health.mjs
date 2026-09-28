import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";

import {
  existsSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  createClient,
} from "@supabase/supabase-js";

const MEDIA_BUCKET =
  "portfolio-media";

const PAGE_SIZE =
  1000;

const STILL_IMAGE_LIMIT =
  2 * 1024 * 1024;

const VIDEO_LIMIT =
  12 * 1024 * 1024;

const EXPECTED_CACHE_SECONDS =
  365 * 24 * 60 * 60;

function loadSimpleEnvFile(
  path,
) {
  if (
    !existsSync(
      path,
    )
  ) {
    return Promise.resolve();
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

if (
  !supabaseUrl ||
  !serviceRoleKey
) {
  throw new Error(
    "Media health audit requires NEXT_PUBLIC_SUPABASE_URL and local-only SUPABASE_SERVICE_ROLE_KEY.",
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
  fields,
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

async function listAllStorageObjects(
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
      const path =
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
          ...await listAllStorageObjects(
            path,
          ),
        );

        continue;
      }

      rows.push({
        path,

        size:
          Number(
            item.metadata
              ?.size ??
            0,
          ) ||
          0,

        mimeType:
          typeof item.metadata
            ?.mimetype ===
              "string"
            ? item.metadata
                .mimetype
            : "unknown",

        cacheControl:
          item.metadata
            ?.cacheControl ??
          item.metadata
            ?.cache_control ??
          null,

        createdAt:
          item.created_at ??
          null,

        updatedAt:
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

const references =
  new Map();

function addReference(
  projectId,
  path,
  placement,
) {
  if (
    typeof path !==
      "string" ||
    !path
  ) {
    return;
  }

  const current =
    references.get(
      path,
    ) ?? {
      path,

      projects:
        new Set(),

      placements:
        new Set(),
    };

  if (
    projectId
  ) {
    current.projects.add(
      projectId,
    );
  }

  if (
    placement
  ) {
    current.placements.add(
      placement,
    );
  }

  references.set(
    path,
    current,
  );
}

function visitMediaReferences(
  value,
  projectId,
  placement,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    value.forEach(
      (
        item,
      ) =>
        visitMediaReferences(
          item,
          projectId,
          placement,
        ),
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
      projectId,
      value.path,
      placement,
    );
  }

  Object.values(
    value,
  ).forEach(
    (
      child,
    ) =>
      visitMediaReferences(
        child,
        projectId,
        placement,
      ),
  );
}

console.log(
  "[1/4] Reading live portfolio references...",
);

const [
  projects,
  sections,
  sectionTranslations,
] =
  await Promise.all([
    readAllRows(
      "projects",
      "id,slug,title,status,hero_image_path,card_image_path",
    ),

    readAllRows(
      "project_sections",
      "id,project_id,section_type,content,is_visible",
    ),

    readAllRows(
      "project_section_translations",
      "section_id,locale,content",
    ),
  ]);

const projectById =
  new Map(
    projects.map(
      (
        project,
      ) => [
        project.id,
        project,
      ],
    ),
  );

const sectionById =
  new Map(
    sections.map(
      (
        section,
      ) => [
        section.id,
        section,
      ],
    ),
  );

for (
  const project of
  projects
) {
  addReference(
    project.id,
    project.hero_image_path,
    "hero-cover",
  );

  addReference(
    project.id,
    project.card_image_path,
    "card-cover",
  );
}

for (
  const section of
  sections
) {
  visitMediaReferences(
    section.content,
    section.project_id,
    `section:${section.section_type}`,
  );
}

for (
  const translation of
  sectionTranslations
) {
  const section =
    sectionById.get(
      translation.section_id,
    );

  visitMediaReferences(
    translation.content,
    section?.project_id,
    `section-translation:${section?.section_type ?? "unknown"}:${translation.locale}`,
  );
}

console.log(
  `Referenced media paths: ${references.size}`,
);

console.log(
  "[2/4] Reading Storage inventory...",
);

const storageObjects =
  await listAllStorageObjects();

const storageByPath =
  new Map(
    storageObjects.map(
      (
        object,
      ) => [
        object.path,
        object,
      ],
    ),
  );

console.log(
  `Storage objects: ${storageObjects.length}`,
);

const missingReferences =
  [];

for (
  const reference of
  references.values()
) {
  if (
    !storageByPath.has(
      reference.path,
    )
  ) {
    missingReferences.push({
      path:
        reference.path,

      projectIds:
        Array.from(
          reference.projects,
        ),

      placements:
        Array.from(
          reference.placements,
        ),
    });
  }
}

const orphanObjects =
  storageObjects.filter(
    (
      object,
    ) =>
      !references.has(
        object.path,
      ),
  );

const oversizedObjects =
  storageObjects.filter(
    (
      object,
    ) => {
      const isVideo =
        object.mimeType
          .startsWith(
            "video/",
          );

      const limit =
        isVideo
          ? VIDEO_LIMIT
          : object.mimeType
              .startsWith(
                "image/",
              )
            ? STILL_IMAGE_LIMIT
            : Number.POSITIVE_INFINITY;

      return object.size >
        limit;
    },
  );

function cacheSeconds(
  value,
) {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return 0;
  }

  if (
    typeof value ===
      "number"
  ) {
    return value;
  }

  const text =
    String(
      value,
    );

  const direct =
    Number(
      text,
    );

  if (
    Number.isFinite(
      direct,
    )
  ) {
    return direct;
  }

  const maxAge =
    text.match(
      /max-age\s*=\s*(\d+)/i,
    );

  return maxAge
    ? Number(
        maxAge[1],
      )
    : 0;
}

const weakCacheObjects =
  storageObjects.filter(
    (
      object,
    ) =>
      cacheSeconds(
        object.cacheControl,
      ) <
      EXPECTED_CACHE_SECONDS,
  );

const projectSummary =
  projects
    .map(
      (
        project,
      ) => {
        const paths =
          Array.from(
            references.values(),
          ).filter(
            (
              reference,
            ) =>
              reference.projects.has(
                project.id,
              ),
          );

        const present =
          paths
            .map(
              (
                reference,
              ) =>
                storageByPath.get(
                  reference.path,
                ),
            )
            .filter(
              Boolean,
            );

        const totalBytes =
          present.reduce(
            (
              total,
              object,
            ) =>
              total +
              object.size,
            0,
          );

        const missing =
          paths.filter(
            (
              reference,
            ) =>
              !storageByPath.has(
                reference.path,
              ),
          ).length;

        const oversized =
          present.filter(
            (
              object,
            ) =>
              oversizedObjects.some(
                (
                  oversizedObject,
                ) =>
                  oversizedObject.path ===
                    object.path,
              ),
          ).length;

        return {
          projectId:
            project.id,

          slug:
            project.slug,

          title:
            project.title,

          status:
            project.status,

          referencedAssets:
            paths.length,

          totalBytes,

          missingAssets:
            missing,

          oversizedAssets:
            oversized,
        };
      },
    )
    .sort(
      (
        left,
        right,
      ) =>
        right.totalBytes -
        left.totalBytes,
    );

const totalStorageBytes =
  storageObjects.reduce(
    (
      total,
      object,
    ) =>
      total +
      object.size,
    0,
  );

const orphanBytes =
  orphanObjects.reduce(
    (
      total,
      object,
    ) =>
      total +
      object.size,
    0,
  );

const oversizedBytes =
  oversizedObjects.reduce(
    (
      total,
      object,
    ) =>
      total +
      object.size,
    0,
  );

const report = {
  generatedAt:
    new Date()
      .toISOString(),

  bucket:
    MEDIA_BUCKET,

  totals: {
    referencedPaths:
      references.size,

    storageObjects:
      storageObjects.length,

    totalStorageBytes,

    missingReferences:
      missingReferences.length,

    orphanObjects:
      orphanObjects.length,

    orphanBytes,

    oversizedObjects:
      oversizedObjects.length,

    oversizedBytes,

    weakCacheObjects:
      weakCacheObjects.length,
  },

  projects:
    projectSummary,

  missingReferences,

  orphanObjects,

  oversizedObjects,

  weakCacheObjects,

  largestObjects:
    [
      ...storageObjects,
    ]
      .sort(
        (
          left,
          right,
        ) =>
          right.size -
          left.size,
      )
      .slice(
        0,
        25,
      ),
};

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

const reportsRoot =
  join(
    process.cwd(),
    "reports",
  );

await mkdir(
  reportsRoot,
  {
    recursive:
      true,
  },
);

const reportPath =
  join(
    reportsRoot,
    `portfolio-media-health-${stamp}.json`,
  );

await writeFile(
  reportPath,
  JSON.stringify(
    report,
    null,
    2,
  ),
  "utf8",
);

function mb(
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
  "[3/4] Portfolio media health summary",
);

console.log(
  `Storage: ${storageObjects.length} object(s) / ${mb(
    totalStorageBytes,
  )} MB`,
);

console.log(
  `Missing referenced objects: ${missingReferences.length}`,
);

console.log(
  `Orphans: ${orphanObjects.length} / ${mb(
    orphanBytes,
  )} MB`,
);

console.log(
  `Legacy oversized objects: ${oversizedObjects.length} / ${mb(
    oversizedBytes,
  )} MB`,
);

console.log(
  `Weak cache-control objects: ${weakCacheObjects.length}`,
);

console.log(
  "",
);

console.log(
  "Largest projects by referenced media:",
);

for (
  const project of
  projectSummary.slice(
    0,
    10,
  )
) {
  console.log(
    `  ${mb(
      project.totalBytes,
    ).padStart(
      8,
      " ",
    )} MB  ${project.slug}  (${project.referencedAssets} asset(s), ${project.missingAssets} missing)`,
  );
}

console.log(
  "",
);

console.log(
  `Report: ${reportPath}`,
);

console.log(
  "[4/4] Done.",
);

if (
  missingReferences.length >
  0
) {
  console.error(
    "FAIL: published/project content references Storage objects that are missing.",
  );

  process.exitCode =
    1;
}
