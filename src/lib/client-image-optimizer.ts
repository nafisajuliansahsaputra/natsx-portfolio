"use client";

export type PortfolioImagePreset =
  | "cover"
  | "section"
  | "gallery"
  | "finale";

type Preset = {
  maxDimension: number;
  quality: number;
  targetBytes: number;
};

const PRESETS:
  Record<
    PortfolioImagePreset,
    Preset
  > = {
    cover: {
      maxDimension:
        1800,

      quality:
        0.86,

      targetBytes:
        550 *
        1024,
    },

    section: {
      maxDimension:
        2400,

      quality:
        0.86,

      targetBytes:
        950 *
        1024,
    },

    gallery: {
      maxDimension:
        2200,

      quality:
        0.84,

      targetBytes:
        850 *
        1024,
    },

    finale: {
      maxDimension:
        2400,

      quality:
        0.86,

      targetBytes:
        1000 *
        1024,
    },
  };

const MIN_QUALITY =
  0.7;

const QUALITY_STEP =
  0.05;

const MIN_DIMENSION =
  960;

function replaceExtension(
  name: string,
  extension: string,
) {
  const dotIndex =
    name.lastIndexOf(
      ".",
    );

  const base =
    dotIndex >
      0
      ? name.slice(
          0,
          dotIndex,
        )
      : name;

  return `${base}.${extension}`;
}

async function isAnimatedWebp(
  file: File,
) {
  if (
    file.type !==
    "image/webp"
  ) {
    return false;
  }

  const bytes =
    new Uint8Array(
      await file
        .slice(
          0,
          Math.min(
            file.size,
            64 *
              1024,
          ),
        )
        .arrayBuffer(),
    );

  const needle = [
    0x41,
    0x4e,
    0x49,
    0x4d,
  ];

  for (
    let index =
      0;
    index <=
    bytes.length -
      needle.length;
    index +=
      1
  ) {
    if (
      needle.every(
        (
          value,
          offset,
        ) =>
          bytes[
            index +
              offset
          ] ===
          value,
      )
    ) {
      return true;
    }
  }

  return false;
}

function canvasToBlob(
  canvas:
    HTMLCanvasElement,
  quality:
    number,
) {
  return new Promise<
    Blob | null
  >(
    (
      resolve,
    ) => {
      canvas.toBlob(
        resolve,
        "image/webp",
        quality,
      );
    },
  );
}

function getScaledDimensions(
  width: number,
  height: number,
  maxDimension: number,
) {
  const longest =
    Math.max(
      width,
      height,
    );

  if (
    longest <=
    maxDimension
  ) {
    return {
      width,
      height,
    };
  }

  const ratio =
    maxDimension /
    longest;

  return {
    width:
      Math.max(
        1,
        Math.round(
          width *
            ratio,
        ),
      ),

    height:
      Math.max(
        1,
        Math.round(
          height *
            ratio,
        ),
      ),
  };
}

async function encodeWebp(
  bitmap:
    ImageBitmap,
  width: number,
  height: number,
  quality:
    number,
) {
  const canvas =
    document
      .createElement(
        "canvas",
      );

  canvas.width =
    width;

  canvas.height =
    height;

  const context =
    canvas.getContext(
      "2d",
      {
        alpha:
          true,
      },
    );

  if (
    !context
  ) {
    return null;
  }

  context.imageSmoothingEnabled =
    true;

  context.imageSmoothingQuality =
    "high";

  context.drawImage(
    bitmap,
    0,
    0,
    width,
    height,
  );

  return canvasToBlob(
    canvas,
    quality,
  );
}

export async function optimizePortfolioImage(
  file: File,
  presetName:
    PortfolioImagePreset,
): Promise<File> {
  /*
   * Animated image formats must never be flattened:
   * preserving motion is more important than compression.
   */
  if (
    file.type ===
      "image/gif" ||
    await isAnimatedWebp(
      file,
    )
  ) {
    return file;
  }

  const preset =
    PRESETS[
      presetName
    ];

  let bitmap:
    ImageBitmap;

  try {
    bitmap =
      await createImageBitmap(
        file,
        {
          imageOrientation:
            "from-image",
        },
      );
  } catch {
    /*
     * Unsupported browser decode path: keep the source
     * rather than blocking an admin upload.
     */
    return file;
  }

  try {
    let {
      width,
      height,
    } =
      getScaledDimensions(
        bitmap.width,
        bitmap.height,
        preset
          .maxDimension,
      );

    let quality =
      preset.quality;

    let blob =
      await encodeWebp(
        bitmap,
        width,
        height,
        quality,
      );

    if (
      !blob
    ) {
      return file;
    }

    while (
      blob.size >
        preset
          .targetBytes &&
      quality >
        MIN_QUALITY
    ) {
      quality =
        Math.max(
          MIN_QUALITY,
          Number(
            (
              quality -
              QUALITY_STEP
            ).toFixed(
              2,
            ),
          ),
        );

      const nextBlob =
        await encodeWebp(
          bitmap,
          width,
          height,
          quality,
        );

      if (
        !nextBlob
      ) {
        break;
      }

      blob =
        nextBlob;
    }

    while (
      blob.size >
        preset
          .targetBytes &&
      Math.max(
        width,
        height,
      ) >
        MIN_DIMENSION
    ) {
      width =
        Math.max(
          1,
          Math.round(
            width *
              0.86,
          ),
        );

      height =
        Math.max(
          1,
          Math.round(
            height *
              0.86,
          ),
        );

      const nextBlob =
        await encodeWebp(
          bitmap,
          width,
          height,
          quality,
        );

      if (
        !nextBlob
      ) {
        break;
      }

      blob =
        nextBlob;
    }

    /*
     * Avoid recompressing an already-efficient source when
     * WebP would not materially reduce transfer size.
     */
    if (
      blob.size >=
        file.size *
          0.96 &&
      Math.max(
        bitmap.width,
        bitmap.height,
      ) <=
        preset
          .maxDimension
    ) {
      return file;
    }

    return new File(
      [
        blob,
      ],
      replaceExtension(
        file.name,
        "webp",
      ),
      {
        type:
          "image/webp",

        lastModified:
          file.lastModified,
      },
    );
  } finally {
    bitmap.close();
  }
}

const HARD_OUTPUT_LIMITS:
  Record<
    PortfolioImagePreset,
    number
  > = {
    cover:
      1250 *
      1024,

    section:
      1750 *
      1024,

    gallery:
      1500 *
      1024,

    finale:
      2 *
      1024 *
      1024,
  };

const MAX_ANIMATED_IMAGE_BYTES =
  8 *
  1024 *
  1024;

function formatBudgetSize(
  bytes: number,
) {
  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(
    1,
  )} MB`;
}

export async function getPortfolioImageBudgetIssue(
  file: File,
  presetName:
    PortfolioImagePreset,
) {
  const animated =
    file.type ===
      "image/gif" ||
    await isAnimatedWebp(
      file,
    );

  const hardLimit =
    animated
      ? MAX_ANIMATED_IMAGE_BYTES
      : HARD_OUTPUT_LIMITS[
          presetName
        ];

  if (
    file.size <=
    hardLimit
  ) {
    return null;
  }

  if (
    animated
  ) {
    return (
      "Animated image terlalu besar setelah validasi. " +
      `Maksimal ${formatBudgetSize(
        hardLimit,
      )} agar bandwidth portfolio tetap aman.`
    );
  }

  return (
    "Image masih terlalu besar setelah optimasi otomatis. " +
    `Maksimal ${formatBudgetSize(
      hardLimit,
    )} untuk preset ${presetName}. ` +
    "Export ulang image dengan dimensi/kompresi yang lebih efisien."
  );
}

export function getOptimizationSavings(
  original: File,
  optimized: File,
) {
  if (
    optimized ===
      original ||
    optimized.size >=
      original.size
  ) {
    return null;
  }

  const percent =
    Math.round(
      (
        1 -
        optimized.size /
          original.size
      ) *
        100,
    );

  return Math.max(
    1,
    percent,
  );
}
