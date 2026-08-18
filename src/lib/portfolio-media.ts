export const PORTFOLIO_MEDIA_BUCKET =
  "portfolio-media" as const;

export const MAX_PORTFOLIO_MEDIA_FILE_SIZE =
  50 * 1024 * 1024;

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

export type GallerySectionItem = {
  id: string;
  asset: PortfolioMediaAsset;
  alt: string;
  caption: string;
};

export type GallerySectionMedia = {
  items: GallerySectionItem[];
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

function getPortfolioMediaAsset(
  value: unknown,
): PortfolioMediaAsset | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    value.bucket !==
      PORTFOLIO_MEDIA_BUCKET ||
    typeof value.path !== "string" ||
    !value.path ||
    typeof value.mimeType !== "string" ||
    !isAllowedImageMimeType(
      value.mimeType,
    ) ||
    typeof value.size !== "number" ||
    !Number.isFinite(value.size) ||
    typeof value.originalName !==
      "string"
  ) {
    return null;
  }

  return {
    bucket: PORTFOLIO_MEDIA_BUCKET,
    path: value.path,
    mimeType: value.mimeType,
    size: value.size,
    originalName: value.originalName,
  };
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

  const asset =
    getPortfolioMediaAsset(
      image.asset,
    );

  if (!asset) {
    return null;
  }

  return {
    asset,

    alt:
      typeof image.alt === "string"
        ? image.alt
        : "",

    caption:
      typeof image.caption ===
      "string"
        ? image.caption
        : "",
  };
}

export function getGallerySectionMedia(
  content: unknown,
): GallerySectionMedia | null {
  if (
    !isRecord(content) ||
    !isRecord(content.gallery) ||
    !Array.isArray(
      content.gallery.items,
    )
  ) {
    return null;
  }

  const items: GallerySectionItem[] =
    [];

  for (const value of content.gallery
    .items) {
    if (!isRecord(value)) {
      continue;
    }

    if (
      typeof value.id !== "string" ||
      !value.id
    ) {
      continue;
    }

    const asset =
      getPortfolioMediaAsset(
        value.asset,
      );

    if (!asset) {
      continue;
    }

    items.push({
      id: value.id,

      asset,

      alt:
        typeof value.alt === "string"
          ? value.alt
          : "",

      caption:
        typeof value.caption ===
        "string"
          ? value.caption
          : "",
    });
  }

  return {
    items,
  };
}

export function getContentRecord(
  value: unknown,
): Record<string, unknown> {
  return isRecord(value)
    ? value
    : {};
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
      value.bucket ===
        PORTFOLIO_MEDIA_BUCKET &&
      typeof value.path ===
        "string" &&
      value.path
    ) {
      paths.add(value.path);
    }

    Object.values(value).forEach(
      visit,
    );
  }

  visit(content);

  return Array.from(paths);
}