import {
  createHash,
} from "node:crypto";

import {
  copyFile,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";

import {
  dirname,
  join,
} from "node:path";

import {
  spawnSync,
} from "node:child_process";

const vercelOnly =
  process.argv.includes(
    "--vercel",
  );

const prepareOnly =
  process.argv.includes(
    "--prepare-only",
  );

const shouldOptimize =
  !prepareOnly &&
  (
    !vercelOnly ||
    process.env.VERCEL ===
      "1"
  );

const root =
  process.cwd();

const sourceManifest =
  JSON.parse(
    await readFile(
      join(
        root,
        "config",
        "scene-model-sources.json",
      ),
      "utf8",
    ),
  );

if (
  !Array.isArray(
    sourceManifest,
  ) ||
  sourceManifest.length ===
    0
) {
  throw new Error(
    "Scene model source manifest is empty.",
  );
}

const runtimeRoot =
  join(
    root,
    "public",
    "runtime-models",
  );

const workRoot =
  join(
    root,
    ".scene-model-build",
  );

await rm(
  runtimeRoot,
  {
    recursive:
      true,

    force:
      true,
  },
);

await rm(
  workRoot,
  {
    recursive:
      true,

    force:
      true,
  },
);

await mkdir(
  runtimeRoot,
  {
    recursive:
      true,
  },
);

await mkdir(
  workRoot,
  {
    recursive:
      true,
  },
);

const npxCommand =
  process.platform ===
  "win32"
    ? "npx.cmd"
    : "npx";

const safeOptimizeArgs = [
  "--no-compress",
  "--no-instance",
  "--no-palette",
  "--no-simplify",
  "--no-sparse",
  "--no-flatten",
  "--no-join",
  "--no-weld",
  "--no-resample",
  "--texture-compress",
  "webp",
  "--texture-size",
  "2048",
];

const generated =
  {};

let totalBefore =
  0;

let totalAfter =
  0;

function setGeneratedRuntime(
  group,
  name,
  runtime,
) {
  if (
    !generated[
      group
    ]
  ) {
    generated[
      group
    ] =
      {};
  }

  generated[
    group
  ][
    name
  ] = {
    runtime,
  };
}

for (
  const entry of
  sourceManifest
) {
  const source =
    join(
      root,
      entry.source,
    );

  const working =
    join(
      workRoot,
      `${entry.group}-${entry.name}.glb`,
    );

  const optimized =
    join(
      workRoot,
      `${entry.group}-${entry.name}.optimized.glb`,
    );

  const before =
    (
      await stat(
        source,
      )
    ).size;

  totalBefore +=
    before;

  await copyFile(
    source,
    working,
  );

  let finalPath =
    working;

  if (
    shouldOptimize &&
    entry.optimize
  ) {
    console.log(
      `[3D optimize] ${entry.source} — ${(
        before /
        1024 /
        1024
      ).toFixed(
        2,
      )} MB`,
    );

    const result =
      spawnSync(
        npxCommand,
        [
          "--yes",
          "@gltf-transform/cli@4.5.0",
          "optimize",
          working,
          optimized,
          ...safeOptimizeArgs,
        ],
        {
          stdio:
            "inherit",
        },
      );

    if (
      result.status !==
      0
    ) {
      throw new Error(
        `3D optimization failed for ${entry.source}.`,
      );
    }

    const optimizedSize =
      (
        await stat(
          optimized,
        )
      ).size;

    if (
      optimizedSize <
      before
    ) {
      finalPath =
        optimized;

      console.log(
        `[3D optimize] saved ${(
          (
            1 -
            optimizedSize /
              before
          ) *
          100
        ).toFixed(
          1,
        )}% → ${(
          optimizedSize /
          1024 /
          1024
        ).toFixed(
          2,
        )} MB`,
      );
    } else {
      console.log(
        "[3D optimize] optimized output was not smaller; source copy kept.",
      );
    }
  }

  const bytes =
    await readFile(
      finalPath,
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
      )
      .slice(
        0,
        12,
      );

  const runtimeUrl =
    `/runtime-models/${entry.group}/${entry.stem}.${sha256}.glb`;

  const destination =
    join(
      root,
      "public",
      ...runtimeUrl
        .slice(
          1,
        )
        .split(
          "/",
        ),
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

  await copyFile(
    finalPath,
    destination,
  );

  const after =
    (
      await stat(
        destination,
      )
    ).size;

  totalAfter +=
    after;

  setGeneratedRuntime(
    entry.group,
    entry.name,
    runtimeUrl,
  );

  if (
    !shouldOptimize ||
    !entry.optimize
  ) {
    console.log(
      `[3D prepare] ${entry.source} → ${runtimeUrl} (${(
        after /
        1024 /
        1024
      ).toFixed(
        2,
      )} MB)`,
    );
  }
}

const generatedPath =
  join(
    root,
    "src",
    "data",
    "scene-models.json",
  );

await writeFile(
  generatedPath,
  `${JSON.stringify(
    generated,
    null,
    2,
  )}\n`,
  "utf8",
);

await rm(
  workRoot,
  {
    recursive:
      true,

    force:
      true,
  },
);

console.log(
  `[3D prepare] public runtime total: ${(
    totalBefore /
    1024 /
    1024
  ).toFixed(
    2,
  )} MB → ${(
    totalAfter /
    1024 /
    1024
  ).toFixed(
    2,
  )} MB (${(
    (
      1 -
      totalAfter /
        totalBefore
    ) *
      100
  ).toFixed(
    1,
  )}% saved)`,
);

if (
  vercelOnly &&
  process.env.VERCEL !==
    "1"
) {
  console.log(
    "[3D prepare] Local build: runtime models prepared without production recompression.",
  );
}
