"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  IMAGE_MEDIA_MIME_TYPES,
  MAX_PORTFOLIO_MEDIA_FILE_SIZE,
  PORTFOLIO_MEDIA_BUCKET,
  getGallerySectionMedia,
  isAllowedImageMimeType,
  type GallerySectionItem,
  type PortfolioImageMimeType,
  type PortfolioMediaAsset,
} from "@/lib/portfolio-media";

import { createClient } from "@/lib/supabase/client";

import {
  saveGallerySectionMedia,
  type SectionActionState,
} from "./actions";

import styles from "./sections.module.css";

type GalleryDraftItem = {
  id: string;

  asset:
    | PortfolioMediaAsset
    | null;

  alt: string;
  caption: string;

  pendingFile:
    | File
    | null;

  pendingPreviewUrl:
    | string
    | null;
};

const initialState: SectionActionState =
  {
    status: "idle",
    message: "",
  };

function formatFileSize(
  bytes: number,
) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(
      1,
      Math.round(bytes / 1024),
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getImageExtension(
  mimeType: PortfolioImageMimeType,
) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/avif":
      return "avif";

    case "image/gif":
      return "gif";
  }
}

function validateFile(
  file: File,
) {
  if (
    !isAllowedImageMimeType(
      file.type,
    )
  ) {
    return (
      `Format "${file.name}" tidak didukung. ` +
      "Gunakan JPEG, PNG, WebP, AVIF, atau GIF."
    );
  }

  if (
    file.size >
    MAX_PORTFOLIO_MEDIA_FILE_SIZE
  ) {
    return (
      `"${file.name}" melebihi ` +
      "batas 50 MB."
    );
  }

  return null;
}

export default function GallerySectionEditor({
  projectId,
  section,
}: {
  projectId: string;

  section: {
    id: string;
    content: Record<
      string,
      unknown
    >;
  };
}) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const inputRef =
    useRef<HTMLInputElement>(null);

  const objectUrlsRef =
    useRef<Set<string>>(
      new Set(),
    );

  const initialGallery =
    getGallerySectionMedia(
      section.content,
    );

  const [items, setItems] =
    useState<GalleryDraftItem[]>(
      () =>
        (
          initialGallery?.items ??
          []
        ).map((item) => ({
          ...item,

          pendingFile: null,
          pendingPreviewUrl:
            null,
        })),
    );

  const [
    isPending,
    setIsPending,
  ] = useState(false);

  const [status, setStatus] =
    useState<SectionActionState>(
      initialState,
    );

  useEffect(() => {
    const objectUrls =
      objectUrlsRef.current;

    return () => {
      objectUrls.forEach(
        (url) => {
          URL.revokeObjectURL(
            url,
          );
        },
      );

      objectUrls.clear();
    };
  }, []);

  function createPreviewUrl(
    file: File,
  ) {
    const url =
      URL.createObjectURL(file);

    objectUrlsRef.current.add(
      url,
    );

    return url;
  }

  function revokePreviewUrl(
    url: string | null,
  ) {
    if (!url) {
      return;
    }

    URL.revokeObjectURL(url);

    objectUrlsRef.current.delete(
      url,
    );
  }

  function getPublicUrl(
    asset:
      | PortfolioMediaAsset
      | null,
  ) {
    if (!asset) {
      return null;
    }

    return supabase.storage
      .from(asset.bucket)
      .getPublicUrl(asset.path)
      .data.publicUrl;
  }

  function handleAddFiles(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ?? [],
      );

    event.target.value = "";

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    for (const file of selectedFiles) {
      const error =
        validateFile(file);

      if (error) {
        setStatus({
          status: "error",
          message: error,
        });

        return;
      }
    }

    const nextItems =
      selectedFiles.map(
        (
          file,
        ): GalleryDraftItem => ({
          id:
            globalThis.crypto.randomUUID(),

          asset: null,

          alt: "",
          caption: "",

          pendingFile: file,

          pendingPreviewUrl:
            createPreviewUrl(file),
        }),
      );

    setItems((current) => [
      ...current,
      ...nextItems,
    ]);

    setStatus(initialState);
  }

  function handleReplaceFile(
    itemId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const error =
      validateFile(file);

    if (error) {
      setStatus({
        status: "error",
        message: error,
      });

      return;
    }

    setItems((current) =>
      current.map((item) => {
        if (
          item.id !== itemId
        ) {
          return item;
        }

        revokePreviewUrl(
          item.pendingPreviewUrl,
        );

        return {
          ...item,

          pendingFile: file,

          pendingPreviewUrl:
            createPreviewUrl(
              file,
            ),
        };
      }),
    );

    setStatus(initialState);
  }

  function updateItem(
    itemId: string,
    field:
      | "alt"
      | "caption",
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function removeItem(
    itemId: string,
  ) {
    setItems((current) => {
      const target =
        current.find(
          (item) =>
            item.id === itemId,
        );

      revokePreviewUrl(
        target
          ?.pendingPreviewUrl ??
          null,
      );

      return current.filter(
        (item) =>
          item.id !== itemId,
      );
    });

    setStatus({
      status: "idle",
      message:
        "Image removed from draft. Save gallery to apply the change.",
    });
  }

  function moveItem(
    itemId: string,
    direction:
      | "up"
      | "down",
  ) {
    setItems((current) => {
      const currentIndex =
        current.findIndex(
          (item) =>
            item.id === itemId,
        );

      if (
        currentIndex === -1
      ) {
        return current;
      }

      const destinationIndex =
        direction === "up"
          ? currentIndex - 1
          : currentIndex + 1;

      if (
        destinationIndex < 0 ||
        destinationIndex >=
          current.length
      ) {
        return current;
      }

      const next =
        [...current];

      [
        next[currentIndex],
        next[destinationIndex],
      ] = [
        next[
          destinationIndex
        ],
        next[currentIndex],
      ];

      return next;
    });

    setStatus(initialState);
  }

  async function uploadDraftItem(
    item: GalleryDraftItem,
  ): Promise<GallerySectionItem> {
    if (!item.pendingFile) {
      if (!item.asset) {
        throw new Error(
          "Gallery item tidak memiliki file.",
        );
      }

      return {
        id: item.id,

        asset: item.asset,

        alt:
          item.alt.trim(),

        caption:
          item.caption.trim(),
      };
    }

    const file =
      item.pendingFile;

    const mimeType =
      file.type;

    if (
      !isAllowedImageMimeType(
        mimeType,
      )
    ) {
      throw new Error(
        `Format "${file.name}" tidak didukung.`,
      );
    }

    if (
      file.size >
      MAX_PORTFOLIO_MEDIA_FILE_SIZE
    ) {
      throw new Error(
        `"${file.name}" melebihi 50 MB.`,
      );
    }

    const extension =
      getImageExtension(
        mimeType,
      );

    const storageId =
      globalThis.crypto.randomUUID();

    const path =
      `projects/${projectId}` +
      `/sections/${section.id}` +
      `/gallery/${storageId}.${extension}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from(
        PORTFOLIO_MEDIA_BUCKET,
      )
      .upload(
        path,
        file,
        {
          cacheControl:
            "3600",

          contentType:
            mimeType,

          upsert: false,
        },
      );

    if (uploadError) {
      throw new Error(
        `Upload "${file.name}" gagal: ${uploadError.message}`,
      );
    }

    return {
      id: item.id,

      asset: {
        bucket:
          PORTFOLIO_MEDIA_BUCKET,

        path,

        mimeType,

        size: file.size,

        originalName:
          file.name,
      },

      alt:
        item.alt.trim(),

      caption:
        item.caption.trim(),
    };
  }

  async function handleSave() {
    setIsPending(true);

    setStatus(initialState);

    try {
      const nextItems: GallerySectionItem[] =
        [];

      for (const item of items) {
        const uploaded =
          await uploadDraftItem(
            item,
          );

        nextItems.push(
          uploaded,
        );
      }

      const result =
        await saveGallerySectionMedia(
          projectId,
          section.id,
          {
            items:
              nextItems,
          },
        );

      if (
        result.status ===
        "error"
      ) {
        setStatus(result);

        setIsPending(false);

        return;
      }

      items.forEach(
        (item) => {
          revokePreviewUrl(
            item.pendingPreviewUrl,
          );
        },
      );

      setItems(
        nextItems.map(
          (item) => ({
            ...item,

            pendingFile:
              null,

            pendingPreviewUrl:
              null,
          }),
        ),
      );

      setStatus(result);

      router.refresh();
    } catch (error) {
      setStatus({
        status: "error",

        message:
          error instanceof
          Error
            ? error.message
            : "Gallery gagal disimpan.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section
      className={
        styles.galleryEditor
      }
    >
      <div
        className={
          styles.galleryEditorHeader
        }
      >
        <div>
          <span>
            GALLERY CONTENT
          </span>

          <strong>
            {String(
              items.length,
            ).padStart(
              2,
              "0",
            )}{" "}
            IMAGES
          </strong>
        </div>

        <p>
          Tambahkan beberapa
          visual, atur urutan,
          caption, alt text, dan
          replacement setiap
          gambar secara terpisah.
        </p>
      </div>

      <label
        className={
          styles.galleryUploadControl
        }
      >
        <input
          ref={inputRef}
          type="file"
          multiple

          accept={IMAGE_MEDIA_MIME_TYPES.join(
            ",",
          )}

          onChange={
            handleAddFiles
          }

          disabled={
            isPending
          }
        />

        <span>
          + Add images
        </span>

        <small>
          JPEG, PNG, WebP, AVIF,
          GIF · max 50 MB each
        </small>
      </label>

      {items.length === 0 ? (
        <div
          className={
            styles.galleryEmpty
          }
        >
          <span>
            EMPTY GALLERY
          </span>

          <p>
            Add images to start
            building this visual
            sequence.
          </p>
        </div>
      ) : (
        <div
          className={
            styles.galleryGrid
          }
        >
          {items.map(
            (
              item,
              index,
            ) => {
              const previewUrl =
                item.pendingPreviewUrl ??
                getPublicUrl(
                  item.asset,
                );

              const fileName =
                item.pendingFile
                  ?.name ??
                item.asset
                  ?.originalName ??
                "Image";

              const fileSize =
                item.pendingFile
                  ?.size ??
                item.asset
                  ?.size ??
                0;

              return (
                <article
                  className={
                    styles.galleryCard
                  }
                  key={
                    item.id
                  }
                >
                  <div
                    className={
                      styles.galleryCardHeader
                    }
                  >
                    <span>
                      {String(
                        index +
                          1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <div>
                      <button
                        type="button"

                        className={
                          styles.galleryOrderButton
                        }

                        onClick={() =>
                          moveItem(
                            item.id,
                            "up",
                          )
                        }

                        disabled={
                          isPending ||
                          index ===
                            0
                        }
                      >
                        ↑
                      </button>

                      <button
                        type="button"

                        className={
                          styles.galleryOrderButton
                        }

                        onClick={() =>
                          moveItem(
                            item.id,
                            "down",
                          )
                        }

                        disabled={
                          isPending ||
                          index ===
                            items.length -
                              1
                        }
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  {previewUrl ? (
                    <div
                      className={
                        styles.galleryPreviewImage
                      }

                      role="img"

                      aria-label={
                        item.alt.trim() ||
                        "Gallery image preview"
                      }

                      style={{
                        backgroundImage:
                          `url(${JSON.stringify(
                            previewUrl,
                          )})`,
                      }}
                    >
                      {item.pendingFile ? (
                        <span>
                          UNSAVED
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      className={
                        styles.galleryPreviewEmpty
                      }
                    >
                      NO PREVIEW
                    </div>
                  )}

                  <div
                    className={
                      styles.galleryFileMeta
                    }
                  >
                    <span>
                      {fileName}
                    </span>

                    <span>
                      {formatFileSize(
                        fileSize,
                      )}
                    </span>
                  </div>

                  <div
                    className={
                      styles.galleryItemFields
                    }
                  >
                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        Alt text
                      </span>

                      <input
                        className={
                          styles.input
                        }

                        type="text"

                        value={
                          item.alt
                        }

                        onChange={(
                          event,
                        ) =>
                          updateItem(
                            item.id,
                            "alt",
                            event
                              .target
                              .value,
                          )
                        }

                        maxLength={
                          500
                        }

                        placeholder="Describe this image"

                        disabled={
                          isPending
                        }
                      />
                    </label>

                    <label
                      className={
                        styles.field
                      }
                    >
                      <span>
                        Caption
                      </span>

                      <textarea
                        className={
                          styles.textarea
                        }

                        value={
                          item.caption
                        }

                        onChange={(
                          event,
                        ) =>
                          updateItem(
                            item.id,
                            "caption",
                            event
                              .target
                              .value,
                          )
                        }

                        rows={3}

                        maxLength={
                          1000
                        }

                        placeholder="Optional visual caption"

                        disabled={
                          isPending
                        }
                      />
                    </label>
                  </div>

                  <div
                    className={
                      styles.galleryCardActions
                    }
                  >
                    <label
                      className={
                        styles.galleryReplaceButton
                      }
                    >
                      <input
                        type="file"

                        accept={IMAGE_MEDIA_MIME_TYPES.join(
                          ",",
                        )}

                        onChange={(
                          event,
                        ) =>
                          handleReplaceFile(
                            item.id,
                            event,
                          )
                        }

                        disabled={
                          isPending
                        }
                      />

                      Replace
                    </label>

                    <button
                      className={
                        styles.mediaDangerButton
                      }

                      type="button"

                      onClick={() =>
                        removeItem(
                          item.id,
                        )
                      }

                      disabled={
                        isPending
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      {status.message ? (
        <div
          className={
            styles.mediaStatus
          }

          data-type={
            status.status
          }

          role="status"

          aria-live="polite"
        >
          <span />

          <p>
            {status.message}
          </p>
        </div>
      ) : null}

      <div
        className={
          styles.galleryFooter
        }
      >
        <p>
          Perubahan urutan,
          caption, replace, dan
          remove baru permanen
          setelah Save Gallery.
        </p>

        <button
          type="button"

          className={
            styles.mediaPrimaryButton
          }

          onClick={
            handleSave
          }

          disabled={
            isPending
          }
        >
          {isPending
            ? "Saving gallery..."
            : "Save gallery ↗"}
        </button>
      </div>
    </section>
  );
}