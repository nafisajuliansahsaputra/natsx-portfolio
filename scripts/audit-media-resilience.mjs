import {
  createHash,
} from "node:crypto";

import {
  readFile,
  readdir,
  stat,
} from "node:fs/promises";

import {
  existsSync,
} from "node:fs";

import {
  extname,
  join,
  relative,
} from "node:path";

const isCi =
  process.argv.includes(
    "--ci",
  );

const root =
  process.cwd();

const publicRoot =
  join(
    root,
    "public",
  );

const warnings =
  [];

const failures =
  [];

const IMAGE_WARNING_BYTES =
  5 *
  1024 *
  1024;

const IMAGE_FAILURE_BYTES =
  8 *
  1024 *
  1024;

const GLB_WARNING_BYTES =
  30 *
  1024 *
  1024;

const GLB_FAILURE_BYTES =
  40 *
  1024 *
  1024;

function formatBytes(
  bytes,
) {
  if (
    bytes <
    1024 *
      1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(
      0,
    )} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(
    2,
  )} MB`;
}

async function walk(
  directory,
) {
  const output =
    [];

  if (
    !existsSync(
      directory,
    )
  ) {
    return output;
  }

  const entries =
    await readdir(
      directory,
      {
        withFileTypes:
          true,
      },
    );

  for (
    const entry of
    entries
  ) {
    const absolute =
      join(
        directory,
        entry.name,
      );

    if (
      entry.isDirectory()
    ) {
      output.push(
        ...await walk(
          absolute,
        ),
      );

      continue;
    }

    if (
      entry.isFile()
    ) {
      output.push(
        absolute,
      );
    }
  }

  return output;
}

const publicFiles =
  await walk(
    publicRoot,
  );

const sizedFiles =
  [];

for (
  const absolute of
  publicFiles
) {
  const info =
    await stat(
      absolute,
    );

  const path =
    relative(
      root,
      absolute,
    )
      .replaceAll(
        "\\",
        "/",
      );

  const extension =
    extname(
      absolute,
    ).toLowerCase();

  sizedFiles.push({
    path,
    bytes:
      info.size,
    extension,
  });

  if (
    [
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
    ].includes(
      extension,
    )
  ) {
    if (
      info.size >
      IMAGE_FAILURE_BYTES
    ) {
      failures.push(
        `${path} is ${formatBytes(
          info.size,
        )}; local public images must stay below ${formatBytes(
          IMAGE_FAILURE_BYTES,
        )}.`,
      );
    } else if (
      info.size >
      IMAGE_WARNING_BYTES
    ) {
      warnings.push(
        `${path} is ${formatBytes(
          info.size,
        )}; consider recompressing the source asset.`,
      );
    }
  }

  if (
    extension ===
      ".glb"
  ) {
    if (
      info.size >
      GLB_FAILURE_BYTES
    ) {
      failures.push(
        `${path} is ${formatBytes(
          info.size,
        )}; GLB exceeds the ${formatBytes(
          GLB_FAILURE_BYTES,
        )} safety ceiling.`,
      );
    } else if (
      info.size >
      GLB_WARNING_BYTES
    ) {
      warnings.push(
        `${path} is ${formatBytes(
          info.size,
        )}; keep visual-parity GLB optimization on the roadmap.`,
      );
    }
  }
}

const rendererPath =
  join(
    root,
    "src",
    "app",
    "work",
    "[slug]",
    "ProjectSectionRenderer.tsx",
  );

if (
  existsSync(
    rendererPath,
  )
) {
  const renderer =
    await readFile(
      rendererPath,
      "utf8",
    );

  if (
    renderer.includes(
      "fileSize >=",
    ) ||
    renderer.includes(
      "1_500_000",
    )
  ) {
    failures.push(
      "ProjectSectionRenderer contains a file-size based unoptimized escape hatch. Large still images must not bypass Next Image.",
    );
  }
}

const preloaderPath =
  join(
    root,
    "src",
    "components",
    "media",
    "GlobalImagePreloader.tsx",
  );

if (
  existsSync(
    preloaderPath,
  )
) {
  const preloader =
    await readFile(
      preloaderPath,
      "utf8",
    );

  if (
    !preloader.includes(
      "window.location.origin",
    ) ||
    !preloader.includes(
      'item.group !==\n                        "project-cover"',
    )
  ) {
    failures.push(
      "Global image warming no longer appears restricted to same-origin project covers.",
    );
  }
}

const mirrorSourcePath =
  join(
    root,
    "src",
    "data",
    "portfolio-media-mirror.ts",
  );

if (
  existsSync(
    mirrorSourcePath,
  )
) {
  const mirrorSource =
    await readFile(
      mirrorSourcePath,
      "utf8",
    );

  const entryPattern =
    /"([^"]+)"\s*:\s*"([^"]+)"/g;

  for (
    const match of
    mirrorSource.matchAll(
      entryPattern,
    )
  ) {
    const [
      ,
      key,
      value,
    ] =
      match;

    if (
      !value.startsWith(
        "/media/",
      )
    ) {
      failures.push(
        `Static mirror entry ${key} points outside /media/: ${value}`,
      );

      continue;
    }

    const absolute =
      join(
        publicRoot,
        ...value
          .slice(
            1,
          )
          .split(
            "/",
          ),
      );

    if (
      !existsSync(
        absolute,
      )
    ) {
      failures.push(
        `Static mirror entry ${key} points to missing file ${value}.`,
      );
    }
  }
}

const mirrorManifestPath =
  join(
    publicRoot,
    "media",
    "manifest.json",
  );

if (
  existsSync(
    mirrorManifestPath,
  )
) {
  const manifest =
    JSON.parse(
      await readFile(
        mirrorManifestPath,
        "utf8",
      ),
    );

  const assets =
    Array.isArray(
      manifest.assets,
    )
      ? manifest.assets
      : [];

  for (
    const asset of
    assets
  ) {
    if (
      typeof asset?.relativePath !==
        "string" ||
      typeof asset?.sha256 !==
        "string"
    ) {
      failures.push(
        "Static mirror manifest contains an invalid asset record.",
      );

      continue;
    }

    const absolute =
      join(
        publicRoot,
        "media",
        asset.relativePath,
      );

    if (
      !existsSync(
        absolute,
      )
    ) {
      failures.push(
        `Mirror manifest references missing file: ${asset.relativePath}`,
      );

      continue;
    }

    const bytes =
      await readFile(
        absolute,
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

    if (
      sha256 !==
      asset.sha256
    ) {
      failures.push(
        `Mirror checksum mismatch: ${asset.relativePath}`,
      );
    }
  }
}

const totalBytes =
  sizedFiles.reduce(
    (
      total,
      file,
    ) =>
      total +
      file.bytes,
    0,
  );

const topFiles =
  sizedFiles
    .sort(
      (
        left,
        right,
      ) =>
        right.bytes -
        left.bytes,
    )
    .slice(
      0,
      10,
    );

console.log(
  "",
);

console.log(
  "=== Portfolio media audit ===",
);

console.log(
  `Public payload on disk: ${formatBytes(
    totalBytes,
  )} across ${sizedFiles.length} file(s)`,
);

console.log(
  "",
);

console.log(
  "Largest public assets:",
);

for (
  const file of
  topFiles
) {
  console.log(
    `  ${formatBytes(
      file.bytes,
    ).padStart(
      9,
      " ",
    )}  ${file.path}`,
  );
}

if (
  warnings.length >
  0
) {
  console.log(
    "",
  );

  console.log(
    "Warnings:",
  );

  for (
    const warning of
    warnings
  ) {
    console.log(
      `  - ${warning}`,
    );
  }
}

if (
  failures.length >
  0
) {
  console.error(
    "",
  );

  console.error(
    "Media resilience failures:",
  );

  for (
    const failure of
    failures
  ) {
    console.error(
      `  - ${failure}`,
    );
  }

  process.exitCode =
    1;
} else {
  console.log(
    "",
  );

  console.log(
    "Media resilience checks passed.",
  );
}

if (
  isCi &&
  warnings.length >
    0
) {
  console.log(
    "",
  );

  console.log(
    "Warnings do not fail CI; only regression-level media risks do.",
  );
}
