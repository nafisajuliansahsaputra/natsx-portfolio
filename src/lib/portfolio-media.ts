export const PORTFOLIO_MEDIA_BUCKET = "portfolio-media" as const;

export const MAX_PORTFOLIO_MEDIA_FILE_SIZE = 50 * 1024 * 1024;

export const IMAGE_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export type PortfolioImageMimeType =
  (typeof IMAGE_MEDIA_MIME_TYPES)[number];

export type PortfolioMediaAsset = {
  bucket: typeof PORTFOLIO_MEDIA_BUCKET;
  path: string;
  mimeType: PortfolioImageMimeType;
  size: number;
  originalName: string;
};

export type ImageSectionMedia = {
  asset: PortfolioMediaAsset;
  alt: string;
  caption: string;
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function isAllowedImageMimeType(
  value: string,
): value is PortfolioImageMimeType {
  return IMAGE_MEDIA_MIME_TYPES.includes(
    value as PortfolioImageMimeType,
  );
}

export function getImageSectionMedia(
  content: unknown,
): ImageSectionMedia | null {
  if (
    !isRecord(content) ||
    !isRecord(content.image)
  ) {
    return null;
  }

  const image = content.image;

  if (!isRecord(image.asset)) {
    return null;
  }

  const asset = image.asset;

  if (
    asset.bucket !== PORTFOLIO_MEDIA_BUCKET ||
    typeof asset.path !== "string" ||
    !asset.path ||
    typeof asset.mimeType !== "string" ||
    !isAllowedImageMimeType(asset.mimeType) ||
    typeof asset.size !== "number" ||
    !Number.isFinite(asset.size) ||
    typeof asset.originalName !== "string"
  ) {
    return null;
  }

  return {
    asset: {
      bucket: PORTFOLIO_MEDIA_BUCKET,
      path: asset.path,
      mimeType: asset.mimeType,
      size: asset.size,
      originalName: asset.originalName,
    },

    alt:
      typeof image.alt === "string"
        ? image.alt
        : "",

    caption:
      typeof image.caption === "string"
        ? image.caption
        : "",
  };
}

export function getContentRecord(
  value: unknown,
): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function collectPortfolioMediaPaths(
  content: unknown,
) {
  const paths = new Set<string>();

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    if (
      value.bucket === PORTFOLIO_MEDIA_BUCKET &&
      typeof value.path === "string" &&
      value.path
    ) {
      paths.add(value.path);
    }

    Object.values(value).forEach(visit);
  }

  visit(content);

  return Array.from(paths);
}