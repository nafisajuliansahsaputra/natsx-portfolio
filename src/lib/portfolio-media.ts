export const PORTFOLIO_MEDIA_BUCKET = "portfolio-media" as const;
export const MAX_PORTFOLIO_MEDIA_FILE_SIZE = 50 * 1024 * 1024;

export const IMAGE_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const VIDEO_MEDIA_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export type PortfolioImageMimeType = (typeof IMAGE_MEDIA_MIME_TYPES)[number];
export type PortfolioVideoMimeType = (typeof VIDEO_MEDIA_MIME_TYPES)[number];
export type PortfolioFinaleMimeType =
  | PortfolioImageMimeType
  | PortfolioVideoMimeType;

export type PortfolioMediaAsset = {
  bucket: typeof PORTFOLIO_MEDIA_BUCKET;
  path: string;
  mimeType: PortfolioImageMimeType;
  size: number;
  originalName: string;
};

export type PortfolioVideoAsset = {
  bucket: typeof PORTFOLIO_MEDIA_BUCKET;
  path: string;
  mimeType: PortfolioVideoMimeType;
  size: number;
  originalName: string;
};

export type PortfolioFinaleMediaAsset =
  | PortfolioMediaAsset
  | PortfolioVideoAsset;

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

export type FinaleMediaKind = "image" | "video";

export type FinaleSectionMedia = {
  kind: FinaleMediaKind;
  asset: PortfolioFinaleMediaAsset;
  alt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isAllowedImageMimeType(
  value: string,
): value is PortfolioImageMimeType {
  return IMAGE_MEDIA_MIME_TYPES.includes(value as PortfolioImageMimeType);
}

export function isAllowedVideoMimeType(
  value: string,
): value is PortfolioVideoMimeType {
  return VIDEO_MEDIA_MIME_TYPES.includes(value as PortfolioVideoMimeType);
}

export function isAllowedFinaleMediaMimeType(
  value: string,
): value is PortfolioFinaleMimeType {
  return isAllowedImageMimeType(value) || isAllowedVideoMimeType(value);
}

export function getFinaleMediaKind(mimeType: string): FinaleMediaKind | null {
  if (isAllowedImageMimeType(mimeType)) return "image";
  if (isAllowedVideoMimeType(mimeType)) return "video";
  return null;
}

function getPortfolioImageAsset(value: unknown): PortfolioMediaAsset | null {
  if (!isRecord(value)) return null;

  if (
    value.bucket !== PORTFOLIO_MEDIA_BUCKET ||
    typeof value.path !== "string" ||
    !value.path ||
    typeof value.mimeType !== "string" ||
    !isAllowedImageMimeType(value.mimeType) ||
    typeof value.size !== "number" ||
    !Number.isFinite(value.size) ||
    typeof value.originalName !== "string"
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

function getPortfolioFinaleMediaAsset(
  value: unknown,
): PortfolioFinaleMediaAsset | null {
  if (!isRecord(value)) return null;

  if (
    value.bucket !== PORTFOLIO_MEDIA_BUCKET ||
    typeof value.path !== "string" ||
    !value.path ||
    typeof value.mimeType !== "string" ||
    !isAllowedFinaleMediaMimeType(value.mimeType) ||
    typeof value.size !== "number" ||
    !Number.isFinite(value.size) ||
    typeof value.originalName !== "string"
  ) {
    return null;
  }

  return {
    bucket: PORTFOLIO_MEDIA_BUCKET,
    path: value.path,
    mimeType: value.mimeType,
    size: value.size,
    originalName: value.originalName,
  } as PortfolioFinaleMediaAsset;
}

export function getImageSectionMedia(content: unknown): ImageSectionMedia | null {
  if (!isRecord(content) || !isRecord(content.image)) return null;

  const image = content.image;
  const asset = getPortfolioImageAsset(image.asset);
  if (!asset) return null;

  return {
    asset,
    alt: typeof image.alt === "string" ? image.alt : "",
    caption: typeof image.caption === "string" ? image.caption : "",
  };
}

export function getGallerySectionMedia(
  content: unknown,
): GallerySectionMedia | null {
  if (
    !isRecord(content) ||
    !isRecord(content.gallery)
  ) {
    return null;
  }

  const gallery: Record<
    string,
    unknown
  > = content.gallery;

  const galleryItems =
    gallery.items;

  if (
    !Array.isArray(
      galleryItems,
    )
  ) {
    return null;
  }

  const copyById: Record<
    string,
    unknown
  > = isRecord(
    gallery.copyById,
  )
    ? gallery.copyById
    : {};

  const items:
    GallerySectionItem[] =
    [];

  for (
    const value of
    galleryItems
  ) {
    if (
      !isRecord(value) ||
      typeof value.id !==
        "string" ||
      !value.id
    ) {
      continue;
    }

    const asset =
      getPortfolioImageAsset(
        value.asset,
      );

    if (!asset) {
      continue;
    }

    const baseAlt =
      typeof value.alt ===
      "string"
        ? value.alt
        : "";

    const baseCaption =
      typeof value.caption ===
      "string"
        ? value.caption
        : "";

    const localizedValue =
      copyById[value.id];

    const localizedCopy:
      | Record<
          string,
          unknown
        >
      | null =
      isRecord(
        localizedValue,
      )
        ? localizedValue
        : null;

    items.push({
      id: value.id,

      asset,

      alt:
        localizedCopy &&
        typeof localizedCopy.alt ===
          "string"
          ? localizedCopy.alt
          : baseAlt,

      caption:
        localizedCopy &&
        typeof localizedCopy.caption ===
          "string"
          ? localizedCopy.caption
          : baseCaption,
    });
  }

  return {
    items,
  };
}

export function getFinaleSectionMedia(
  content: unknown,
): FinaleSectionMedia | null {
  if (
    !isRecord(content) ||
    !isRecord(content.finale) ||
    !isRecord(content.finale.media)
  ) {
    return null;
  }

  const media = content.finale.media;
  const asset = getPortfolioFinaleMediaAsset(media.asset);
  if (!asset) return null;

  const kind = getFinaleMediaKind(asset.mimeType);
  if (!kind) return null;

  return {
    kind,
    asset,
    alt: typeof media.alt === "string" ? media.alt : "",
  };
}

export function getContentRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export function collectPortfolioMediaPaths(content: unknown) {
  const paths = new Set<string>();

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!isRecord(value)) return;

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