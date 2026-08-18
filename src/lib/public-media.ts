import {
  getFinaleSectionMedia,
  getGallerySectionMedia,
  getImageSectionMedia,
} from "@/lib/portfolio-media";

import type {
  PublicProjectSection,
} from "@/lib/public-projects";

import {
  createPublicClient,
} from "@/lib/supabase/public";

let publicClient:
  | ReturnType<
      typeof createPublicClient
    >
  | null = null;

function getPublicClient() {
  if (!publicClient) {
    publicClient =
      createPublicClient();
  }

  return publicClient;
}

export function getPortfolioMediaPublicUrl(
  bucket: string,
  path: string,
) {
  return getPublicClient()
    .storage
    .from(bucket)
    .getPublicUrl(path)
    .data.publicUrl;
}

export function getProjectPreviewImage(
  sections: PublicProjectSection[],
) {
  for (
    const section of sections
  ) {
    const image =
      getImageSectionMedia(
        section.content,
      );

    if (image) {
      return getPortfolioMediaPublicUrl(
        image.asset.bucket,
        image.asset.path,
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
      );
    }
  }

  return null;
}