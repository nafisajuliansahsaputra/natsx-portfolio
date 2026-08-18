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
  getImageSectionMedia,
  isAllowedImageMimeType,
  type ImageSectionMedia,
  type PortfolioImageMimeType,
} from "@/lib/portfolio-media";

import { createClient } from "@/lib/supabase/client";

import {
  removeImageSectionMedia,
  saveImageSectionMedia,
  type SectionActionState,
} from "./actions";

import styles from "./sections.module.css";

const initialState: SectionActionState = {
  status: "idle",
  message: "",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export default function ImageSectionEditor({
  projectId,
  section,
}: {
  projectId: string;

  section: {
    id: string;
    content: Record<string, unknown>;
  };
}) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const previewUrlRef =
    useRef<string | null>(null);

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const initialMedia =
    getImageSectionMedia(section.content);

  const [currentMedia, setCurrentMedia] =
    useState<ImageSectionMedia | null>(
      initialMedia,
    );

  const [pendingFile, setPendingFile] =
    useState<File | null>(null);

  const [
    pendingPreviewUrl,
    setPendingPreviewUrl,
  ] = useState<string | null>(null);

  const [alt, setAlt] = useState(
    initialMedia?.alt ?? "",
  );

  const [caption, setCaption] =
    useState(initialMedia?.caption ?? "");

  const [isPending, setIsPending] =
    useState(false);

  const [status, setStatus] =
    useState<SectionActionState>(
      initialState,
    );

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current,
        );
      }
    };
  }, []);

  const currentPublicUrl =
    currentMedia
      ? supabase.storage
          .from(currentMedia.asset.bucket)
          .getPublicUrl(
            currentMedia.asset.path,
          ).data.publicUrl
      : null;

  const previewUrl =
    pendingPreviewUrl ??
    currentPublicUrl;

  const previewLabel = pendingFile
    ? "NEW IMAGE / NOT SAVED"
    : currentMedia
      ? "CURRENT IMAGE"
      : "NO IMAGE";

  function clearPendingPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current,
      );

      previewUrlRef.current = null;
    }

    setPendingPreviewUrl(null);
  }

  function resetFileInput() {
    setPendingFile(null);

    clearPendingPreview();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const mimeType = file.type;

    if (
      !isAllowedImageMimeType(
        mimeType,
      )
    ) {
      setStatus({
        status: "error",
        message:
          "Format gambar tidak didukung. Gunakan JPEG, PNG, WebP, AVIF, atau GIF.",
      });

      event.target.value = "";
      return;
    }

    if (
      file.size >
      MAX_PORTFOLIO_MEDIA_FILE_SIZE
    ) {
      setStatus({
        status: "error",
        message:
          "Ukuran gambar maksimal 50 MB.",
      });

      event.target.value = "";
      return;
    }

    clearPendingPreview();

    const previewUrl =
      URL.createObjectURL(file);

    previewUrlRef.current =
      previewUrl;

    setPendingPreviewUrl(
      previewUrl,
    );

    setPendingFile(file);

    setStatus(initialState);
  }

  async function handleSaveMedia() {
    if (
      !pendingFile &&
      !currentMedia
    ) {
      setStatus({
        status: "error",
        message:
          "Pilih gambar terlebih dahulu.",
      });

      return;
    }

    setIsPending(true);
    setStatus(initialState);

    let nextMedia =
      currentMedia;

    let uploadedPath:
      | string
      | null = null;

    if (pendingFile) {
      const mimeType =
        pendingFile.type;

      if (
        !isAllowedImageMimeType(
          mimeType,
        )
      ) {
        setStatus({
          status: "error",
          message:
            "Format gambar tidak didukung.",
        });

        setIsPending(false);
        return;
      }

      if (
        pendingFile.size >
        MAX_PORTFOLIO_MEDIA_FILE_SIZE
      ) {
        setStatus({
          status: "error",
          message:
            "Ukuran gambar maksimal 50 MB.",
        });

        setIsPending(false);
        return;
      }

      const extension =
        getImageExtension(
          mimeType,
        );

      const fileId =
        globalThis.crypto.randomUUID();

      const path =
        `projects/${projectId}` +
        `/sections/${section.id}` +
        `/${fileId}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(
          PORTFOLIO_MEDIA_BUCKET,
        )
        .upload(
          path,
          pendingFile,
          {
            cacheControl: "3600",

            contentType:
              mimeType,

            upsert: false,
          },
        );

      if (uploadError) {
        setStatus({
          status: "error",

          message:
            `Upload gagal: ${uploadError.message}`,
        });

        setIsPending(false);
        return;
      }

      uploadedPath = path;

      nextMedia = {
        asset: {
          bucket:
            PORTFOLIO_MEDIA_BUCKET,

          path,

          mimeType,

          size:
            pendingFile.size,

          originalName:
            pendingFile.name,
        },

        alt: alt.trim(),

        caption:
          caption.trim(),
      };
    } else if (currentMedia) {
      nextMedia = {
        ...currentMedia,

        alt: alt.trim(),

        caption:
          caption.trim(),
      };
    }

    if (!nextMedia) {
      setStatus({
        status: "error",
        message:
          "Media gambar tidak valid.",
      });

      setIsPending(false);
      return;
    }

    try {
      const result =
        await saveImageSectionMedia(
          projectId,
          section.id,
          nextMedia,
        );

      if (
        result.status ===
        "error"
      ) {
        if (uploadedPath) {
          await supabase.storage
            .from(
              PORTFOLIO_MEDIA_BUCKET,
            )
            .remove([
              uploadedPath,
            ]);
        }

        setStatus(result);

        setIsPending(false);

        return;
      }

      setCurrentMedia(
        nextMedia,
      );

      setAlt(nextMedia.alt);

      setCaption(
        nextMedia.caption,
      );

      resetFileInput();

      setStatus(result);

      router.refresh();
    } catch {
      setStatus({
        status: "error",

        message:
          "Status penyimpanan belum dapat dipastikan. Refresh halaman sebelum mencoba lagi.",
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleRemoveMedia() {
    if (!currentMedia) {
      resetFileInput();

      setStatus({
        status: "success",
        message:
          "Pilihan gambar dibatalkan.",
      });

      return;
    }

    const confirmed =
      window.confirm(
        "Hapus gambar ini dari section dan Storage?",
      );

    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setStatus(initialState);

    try {
      const result =
        await removeImageSectionMedia(
          projectId,
          section.id,
        );

      if (
        result.status ===
        "success"
      ) {
        setCurrentMedia(null);

        setAlt("");
        setCaption("");

        resetFileInput();

        router.refresh();
      }

      setStatus(result);
    } catch {
      setStatus({
        status: "error",

        message:
          "Gagal menghapus media. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section
      className={
        styles.imageEditor
      }
    >
      <div
        className={
          styles.imageEditorHeader
        }
      >
        <span>
          IMAGE CONTENT
        </span>

        <p>
          Upload gambar ke
          portfolio-media, lalu
          simpan metadata visual
          untuk section ini.
        </p>
      </div>

      <div
        className={
          styles.mediaWorkspace
        }
      >
        <div
          className={
            styles.mediaPreview
          }
        >
          {previewUrl ? (
            <div
              className={
                styles.mediaPreviewImage
              }
              role="img"
              aria-label={
                alt.trim() ||
                "Project image preview"
              }
              style={{
                backgroundImage:
                  `url(${JSON.stringify(
                    previewUrl,
                  )})`,
              }}
            >
              <span>
                {previewLabel}
              </span>
            </div>
          ) : (
            <div
              className={
                styles.mediaPreviewEmpty
              }
            >
              <span>
                NO MEDIA YET
              </span>

              <p>
                Choose an image
                for this section.
              </p>
            </div>
          )}

          {pendingFile ? (
            <div
              className={
                styles.mediaFileMeta
              }
            >
              <span>
                {
                  pendingFile.name
                }
              </span>

              <span>
                {formatFileSize(
                  pendingFile.size,
                )}
              </span>
            </div>
          ) : currentMedia ? (
            <div
              className={
                styles.mediaFileMeta
              }
            >
              <span>
                {
                  currentMedia
                    .asset
                    .originalName
                }
              </span>

              <span>
                {formatFileSize(
                  currentMedia
                    .asset.size,
                )}
              </span>
            </div>
          ) : null}
        </div>

        <div
          className={
            styles.mediaControls
          }
        >
          <label
            className={
              styles.uploadControl
            }
          >
            <input
              ref={inputRef}
              type="file"

              accept={IMAGE_MEDIA_MIME_TYPES.join(
                ",",
              )}

              onChange={
                handleFileChange
              }

              disabled={
                isPending
              }
            />

            <span>
              {currentMedia ||
              pendingFile
                ? "Choose replacement"
                : "Choose image"}
            </span>

            <small>
              JPEG, PNG, WebP,
              AVIF, GIF · max
              50 MB
            </small>
          </label>

          <div
            className={
              styles.mediaFields
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

                value={alt}

                onChange={(
                  event,
                ) =>
                  setAlt(
                    event.target
                      .value,
                  )
                }

                placeholder="Describe the image for accessibility"

                maxLength={
                  500
                }

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
                Caption / label
              </span>

              <textarea
                className={
                  styles.textarea
                }

                value={
                  caption
                }

                onChange={(
                  event,
                ) =>
                  setCaption(
                    event.target
                      .value,
                  )
                }

                placeholder="Optional visual caption"

                rows={4}

                maxLength={
                  1000
                }

                disabled={
                  isPending
                }
              />
            </label>
          </div>

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
                {
                  status.message
                }
              </p>
            </div>
          ) : null}

          <div
            className={
              styles.mediaActions
            }
          >
            <div>
              {pendingFile ? (
                <button
                  className={
                    styles.mediaSecondaryButton
                  }

                  type="button"

                  onClick={() => {
                    resetFileInput();

                    setStatus(
                      initialState,
                    );
                  }}

                  disabled={
                    isPending
                  }
                >
                  Discard
                  selected
                </button>
              ) : null}

              {currentMedia ? (
                <button
                  className={
                    styles.mediaDangerButton
                  }

                  type="button"

                  onClick={
                    handleRemoveMedia
                  }

                  disabled={
                    isPending
                  }
                >
                  Remove image
                </button>
              ) : null}
            </div>

            <button
              className={
                styles.mediaPrimaryButton
              }

              type="button"

              onClick={
                handleSaveMedia
              }

              disabled={
                isPending ||
                (!pendingFile &&
                  !currentMedia)
              }
            >
              {isPending
                ? "Saving media..."
                : pendingFile
                  ? currentMedia
                    ? "Replace & save ↗"
                    : "Upload & save ↗"
                  : "Save media details ↗"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}