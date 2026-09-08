"use server";

import {
  revalidatePath,
  updateTag,
} from "next/cache";

import {
  PUBLIC_PORTFOLIO_CACHE_TAG,
} from "@/lib/portfolio-cache";

import {
  getContentRecord,
  getGallerySectionMedia,
  isGalleryItemSize,
  isGalleryLayout,
  type GallerySectionMedia,
} from "@/lib/portfolio-media";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  saveGallerySectionMedia,
  type SectionActionState,
} from "./actions";

function revalidateGalleryPages(
  projectId: string,
) {
  updateTag(
    PUBLIC_PORTFOLIO_CACHE_TAG,
  );

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    `/admin/projects/${projectId}`,
  );

  revalidatePath(
    `/admin/projects/${projectId}/sections`,
  );
}

export async function saveGallerySectionWithPresentation(
  projectId: string,
  sectionId: string,
  gallery:
    GallerySectionMedia,
): Promise<SectionActionState> {
  if (
    !isGalleryLayout(
      gallery.layout,
    )
  ) {
    return {
      status:
        "error",

      message:
        "Gallery layout tidak valid.",
    };
  }

  for (
    const item of
    gallery.items
  ) {
    if (
      !isGalleryItemSize(
        item.size,
      )
    ) {
      return {
        status:
          "error",

        message:
          "Ukuran Bento gallery tidak valid.",
      };
    }
  }

  /*
   * Media lifecycle tetap ditangani
   * action lama:
   *
   * - validation
   * - upload references
   * - deleted file cleanup
   * - path validation
   *
   * Jadi fitur Bento tidak menduplikasi
   * media handling yang sudah stabil.
   */
  const mediaResult =
    await saveGallerySectionMedia(
      projectId,
      sectionId,
      {
        items:
          gallery.items.map(
            (
              item,
            ) => ({
              id:
                item.id,

              asset:
                item.asset,

              alt:
                item.alt,

              caption:
                item.caption,
            }),
          ),
      },
    );

  if (
    mediaResult.status ===
    "error"
  ) {
    return mediaResult;
  }

  const supabase =
    await createClient();

  const {
    data:
      section,

    error:
      sectionError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .select(
        "id, section_type, content",
      )
      .eq(
        "id",
        sectionId,
      )
      .eq(
        "project_id",
        projectId,
      )
      .maybeSingle();

  if (
    sectionError
  ) {
    return {
      status:
        "error",

      message:
        `Gallery media tersimpan, tetapi layout gagal dibaca: ${sectionError.message}`,
    };
  }

  if (
    !section
  ) {
    return {
      status:
        "error",

      message:
        "Gallery media tersimpan, tetapi section tidak ditemukan.",
    };
  }

  if (
    section.section_type !==
    "gallery"
  ) {
    return {
      status:
        "error",

      message:
        "Section ini bukan Gallery.",
    };
  }

  const currentGallery =
    getGallerySectionMedia(
      section.content,
    );

  if (
    !currentGallery
  ) {
    return {
      status:
        "error",

      message:
        "Gallery media tersimpan, tetapi struktur gallery tidak dapat dibaca.",
    };
  }

  const sizeById =
    new Map(
      gallery.items.map(
        (
          item,
        ) => [
          item.id,
          item.size,
        ] as const,
      ),
    );

  /*
   * Pastikan presentation data hanya
   * diberikan kepada item yang benar-
   * benar masih ada setelah media save.
   */
  for (
    const item of
    currentGallery.items
  ) {
    if (
      !sizeById.has(
        item.id,
      )
    ) {
      return {
        status:
          "error",

        message:
          "Gallery media tersimpan, tetapi struktur Bento tidak sinkron. Refresh halaman lalu coba lagi.",
      };
    }
  }

  const nextGallery = {
    layout:
      gallery.layout,

    items:
      currentGallery.items.map(
        (
          item,
        ) => ({
          id:
            item.id,

          asset:
            item.asset,

          alt:
            item.alt,

          caption:
            item.caption,

          size:
            sizeById.get(
              item.id,
            ) ??
            "small",
        }),
      ),
  };

  const nextContent = {
    ...getContentRecord(
      section.content,
    ),

    gallery:
      nextGallery,
  };

  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "project_sections",
      )
      .update({
        content:
          nextContent,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        sectionId,
      )
      .eq(
        "project_id",
        projectId,
      );

  if (
    updateError
  ) {
    return {
      status:
        "error",

      message:
        `Gallery media tersimpan, tetapi Bento layout gagal disimpan: ${updateError.message}`,
    };
  }

  revalidateGalleryPages(
    projectId,
  );

  return {
    status:
      "success",

    message:
      gallery.layout ===
      "bento"
        ? "Shared gallery dan Bento layout berhasil disimpan."
        : "Shared gallery dan Grid layout berhasil disimpan.",
  };
}