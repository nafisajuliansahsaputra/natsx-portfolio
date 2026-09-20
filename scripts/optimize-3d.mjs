import {
  copyFile,
  rm,
  stat,
} from "node:fs/promises";

import {
  spawnSync,
} from "node:child_process";

const vercelOnly =
  process.argv.includes(
    "--vercel",
  );

if (
  vercelOnly &&
  process.env.VERCEL !==
    "1"
) {
  console.log(
    "[3D optimize] Local build detected; source GLBs left untouched.",
  );

  process.exit(
    0,
  );
}

const models = [
  "public/models/iphone-17-pro-max.glb",
  "public/models/attendance/imac.glb",
  "public/models/attendance/scanner.glb",
  "public/models/bast/macbook-pro.glb",
];

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
  "--no-prune",
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

let totalBefore =
  0;

let totalAfter =
  0;

for (
  const model of
  models
) {
  const temporary =
    model.replace(
      /\.glb$/i,
      ".optimized.glb",
    );

  const before =
    (
      await stat(
        model,
      )
    ).size;

  totalBefore +=
    before;

  console.log(
    `[3D optimize] ${model} — ${(
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
        model,
        temporary,
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
    await rm(
      temporary,
      {
        force:
          true,
      },
    );

    throw new Error(
      `3D optimization failed for ${model}.`,
    );
  }

  const after =
    (
      await stat(
        temporary,
      )
    ).size;

  if (
    after <
    before
  ) {
    await copyFile(
      temporary,
      model,
    );

    totalAfter +=
      after;

    console.log(
      `[3D optimize] saved ${(
        (
          1 -
          after /
            before
        ) *
        100
      ).toFixed(
        1,
      )}% → ${(
        after /
        1024 /
        1024
      ).toFixed(
        2,
      )} MB`,
    );
  } else {
    totalAfter +=
      before;

    console.log(
      "[3D optimize] optimized output was not smaller; original kept.",
    );
  }

  await rm(
    temporary,
    {
      force:
        true,
    },
  );
}

console.log(
  `[3D optimize] total: ${(
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
