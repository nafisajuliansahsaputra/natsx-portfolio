import { portfolioLegacyCloudinaryUrls } from "@/data/portfolio-legacy-cloudinary-map";
import { isTrustedCloudinaryUrl } from "@/lib/cloudinary-media";

import {
  PORTFOLIO_MEDIA_BUCKET,
  getFinaleSectionMedia,
  getGallerySectionMedia,
  getImageSectionMedia,
} from "@/lib/portfolio-media";

import type {
  PublicProject,
  PublicProjectSection,
} from "@/lib/public-projects";

import {
  getPortfolioMediaMirrorUrl,
} from "@/lib/media-delivery";

import {
  createPublicClient,
} from "@/lib/supabase/public";

let publicClient:
  | ReturnType<
      typeof createPublicClient
    >
  | null = null;

function getPublicClient() {
  if (
    !publicClient
  ) {
    publicClient =
      createPublicClient();
  }

  return publicClient;
}

export function getPortfolioMediaPublicUrl(
  bucket: string,
  path: string,
  cloudinaryUrl?: string,
) {
  if (cloudinaryUrl && isTrustedCloudinaryUrl(cloudinaryUrl, path)) {
    return cloudinaryUrl;
  }

  // Cover URLs are stored directly in the existing text columns.
  if (isTrustedCloudinaryUrl(path)) {
    return path;
  }

  /*
   * Prefer a mirrored delivery origin when configured.
   *
   * Supabase remains the source-of-truth fallback so existing deployments
   * and the admin CMS keep working until the mirror has been populated.
   */
  const mirrorUrl =
    getPortfolioMediaMirrorUrl(
      bucket,
      path,
    );

  if (
    mirrorUrl
  ) {
    return mirrorUrl;
  }

  // The checked-in emergency portfolio snapshot still uses old Storage paths.
  // Resolve its known, verified image assets from Cloudinary before falling
  // back to Storage so deleting retired objects cannot break public pages.
  const legacyCloudinaryUrl =
    bucket === PORTFOLIO_MEDIA_BUCKET
      ? portfolioLegacyCloudinaryUrls[path]
      : undefined;

  if (
    legacyCloudinaryUrl &&
    isTrustedCloudinaryUrl(legacyCloudinaryUrl, path)
  ) {
    return legacyCloudinaryUrl;
  }

  return getPublicClient()
    .storage
    .from(
      bucket,
    )
    .getPublicUrl(
      path,
    )
    .data.publicUrl;
}

export function getProjectPrimaryVisualUrl(
  project: PublicProject,
) {
  if (
    !project.heroImagePath
  ) {
    return null;
  }

  return getPortfolioMediaPublicUrl(
    PORTFOLIO_MEDIA_BUCKET,
    project.heroImagePath,
  );
}

export function getProjectSecondaryVisualUrl(
  project: PublicProject,
) {
  if (
    !project.cardImagePath
  ) {
    return null;
  }

  return getPortfolioMediaPublicUrl(
    PORTFOLIO_MEDIA_BUCKET,
    project.cardImagePath,
  );
}

export function getProjectPreviewImage(
  sections:
    PublicProjectSection[],

  project?:
    PublicProject,
) {
  if (
    project
  ) {
    const showcaseVisual =
      getProjectPrimaryVisualUrl(
        project,
      ) ??
      getProjectSecondaryVisualUrl(
        project,
      );

    if (
      showcaseVisual
    ) {
      return showcaseVisual;
    }
  }

  for (
    const section of
    sections
  ) {
    const image =
      getImageSectionMedia(
        section.content,
      );

    if (
      image
    ) {
      return getPortfolioMediaPublicUrl(
        image.asset.bucket,
        image.asset.path,
        image.asset.url,
      );
    }

    const gallery =
      getGallerySectionMedia(
        section.content,
      );

    const firstGalleryImage =
      gallery?.items[0];

    if (
      firstGalleryImage
    ) {
      return getPortfolioMediaPublicUrl(
        firstGalleryImage
          .asset.bucket,

        firstGalleryImage
          .asset.path,
        firstGalleryImage.asset.url,
      );
    }

    const finale =
      getFinaleSectionMedia(
        section.content,
      );

    if (
      finale &&
      finale.kind ===
        "image"
    ) {
      return getPortfolioMediaPublicUrl(
        finale.asset.bucket,
        finale.asset.path,
        finale.asset.url,
      );
    }
  }

  return null;
}