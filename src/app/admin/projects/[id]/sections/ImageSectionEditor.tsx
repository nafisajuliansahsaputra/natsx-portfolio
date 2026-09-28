"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  Locale,
} from "@/i18n/config";

import {
  IMAGE_MEDIA_MIME_TYPES,
  MAX_PORTFOLIO_MEDIA_FILE_SIZE,
  PORTFOLIO_MEDIA_BUCKET,
  getImageSectionMedia,
  isAllowedImageMimeType,
  type ImageSectionMedia,
  type PortfolioImageMimeType,
} from "@/lib/portfolio-media";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  getOptimizationSavings,
  getPortfolioImageBudgetIssue,
  optimizePortfolioImage,
} from "@/lib/client-image-optimizer";

import {
  removeImageSectionMedia,
  saveImageSectionMedia,
  type SectionActionState,
} from "./actions";

import {
  saveImageSectionLocalizedCopy,
  type SpecializedTranslationState,
} from "./specialized-translation-actions";

import styles from "./sections.module.css";

const initialMediaState:
  SectionActionState =
  {
    status:
      "idle",

    message:
      "",
  };

const initialTranslationState:
  SpecializedTranslationState =
  {
    status:
      "idle",

    message:
      "",
  };

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value,
    )
  );
}

function getLocalizedImageCopy(
  content: Record<
    string,
    unknown
  >,
) {
  if (
    !isRecord(
      content.image,
    )
  ) {
    return {
      alt:
        "",

      caption:
        "",
    };
  }

  const image =
    content.image;

  return {
    alt:
      typeof image.alt ===
      "string"
        ? image.alt
        : "",

    caption:
      typeof image.caption ===
      "string"
        ? image.caption
        : "",
  };
}

function formatFileSize(
  bytes: number,
) {
  if (
    bytes <
    1024 * 1024
  ) {
    return `${Math.max(
      1,
      Math.round(
        bytes /
          1024,
      ),
    )} KB`;
  }

  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(
    1,
  )} MB`;
}

function getImageExtension(
  mimeType: PortfolioImageMimeType,
) {
  switch (
    mimeType
  ) {
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

type ImageSectionEditorProps = {
  projectId: string;

  section: {
    id: string;

    content: Record<
      string,
      unknown
    >;
  };

  locale: Locale;

  translationContent: Record<
    string,
    unknown
  >;
};

export default function ImageSectionEditor({
  projectId,
  section,
  locale,
  translationContent,
}: ImageSectionEditorProps) {
  const router =
    useRouter();

  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const previewUrlRef =
    useRef<string | null>(
      null,
    );

  const supabase =
    useMemo(
      () =>
        createClient(),
      [],
    );

  const initialMedia =
    getImageSectionMedia(
      section.content,
    );

  const localizedInitialCopy =
    locale ===
      "en"
      ? {
          alt:
            initialMedia
              ?.alt ??
            "",

          caption:
            initialMedia
              ?.caption ??
            "",
        }
      : getLocalizedImageCopy(
          translationContent,
        );

  const [
    currentMedia,
    setCurrentMedia,
  ] =
    useState<ImageSectionMedia | null>(
      initialMedia,
    );

  const [
    pendingFile,
    setPendingFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    pendingPreviewUrl,
    setPendingPreviewUrl,
  ] =
    useState<string | null>(
      null,
    );

  const [
    alt,
    setAlt,
  ] =
    useState(
      localizedInitialCopy.alt,
    );

  const [
    caption,
    setCaption,
  ] =
    useState(
      localizedInitialCopy.caption,
    );

  const [
    isMediaPending,
    setIsMediaPending,
  ] =
    useState(
      false,
    );

  const [
    isCopyPending,
    setIsCopyPending,
  ] =
    useState(
      false,
    );

  const [
    mediaStatus,
    setMediaStatus,
  ] =
    useState<SectionActionState>(
      initialMediaState,
    );

  const [
    copyStatus,
    setCopyStatus,
  ] =
    useState<SpecializedTranslationState>(
      initialTranslationState,
    );

  useEffect(() => {
    return () => {
      if (
        previewUrlRef.current
      ) {
        URL.revokeObjectURL(
          previewUrlRef.current,
        );
      }
    };
  }, []);

  const currentPublicUrl =
    currentMedia
      ? supabase.storage
          .from(
            currentMedia
              .asset.bucket,
          )
          .getPublicUrl(
            currentMedia
              .asset.path,
          ).data.publicUrl
      : null;

  const previewUrl =
    pendingPreviewUrl ??
    currentPublicUrl;

  const previewLabel =
    pendingFile
      ? "NEW IMAGE / NOT SAVED"
      : currentMedia
        ? "SHARED IMAGE"
        : "NO IMAGE";

  function clearPendingPreview() {
    if (
      previewUrlRef.current
    ) {
      URL.revokeObjectURL(
        previewUrlRef.current,
      );

      previewUrlRef.current =
        null;
    }

    setPendingPreviewUrl(
      null,
    );
  }

  function resetFileInput() {
    setPendingFile(
      null,
    );

    clearPendingPreview();

    if (
      inputRef.current
    ) {
      inputRef.current.value =
        "";
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files
        ?.[0];

    if (
      !file
    ) {
      return;
    }

    const mimeType =
      file.type;

    if (
      !isAllowedImageMimeType(
        mimeType,
      )
    ) {
      setMediaStatus({
        status:
          "error",

        message:
          "Format gambar tidak didukung. Gunakan JPEG, PNG, WebP, AVIF, atau GIF.",
      });

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_PORTFOLIO_MEDIA_FILE_SIZE
    ) {
      setMediaStatus({
        status:
          "error",

        message:
          "Ukuran gambar maksimal 50 MB.",
      });

      event.target.value =
        "";

      return;
    }

    setMediaStatus({
      status:
        "success",

      message:
        "Optimizing image before upload...",
    });

    const optimizedFile =
      await optimizePortfolioImage(
        file,
        "section",
      );

    const budgetIssue =
      await getPortfolioImageBudgetIssue(
        optimizedFile,
        "section",
      );

    if (
      budgetIssue
    ) {
      setMediaStatus({
        status:
          "error",

        message:
          budgetIssue,
      });

      event.target.value =
        "";

      return;
    }

    clearPendingPreview();

    const preview =
      URL.createObjectURL(
        optimizedFile,
      );

    previewUrlRef.current =
      preview;

    setPendingPreviewUrl(
      preview,
    );

    setPendingFile(
      optimizedFile,
    );

    const savings =
      getOptimizationSavings(
        file,
        optimizedFile,
      );

    setMediaStatus({
      status:
        "success",

      message:
        savings
          ? `Optimized automatically: ${formatFileSize(file.size)} → ${formatFileSize(optimizedFile.size)} (-${savings}%).`
          : "Image is already efficient or animated; original quality is preserved.",
    });
  }

  async function handleSaveSharedMedia() {
    if (
      !pendingFile
    ) {
      setMediaStatus({
        status:
          "error",

        message:
          "Pilih gambar baru terlebih dahulu.",
      });

      return;
    }

    setIsMediaPending(
      true,
    );

    setMediaStatus(
      initialMediaState,
    );

    const mimeType =
      pendingFile.type;

    if (
      !isAllowedImageMimeType(
        mimeType,
      )
    ) {
      setMediaStatus({
        status:
          "error",

        message:
          "Format gambar tidak didukung.",
      });

      setIsMediaPending(
        false,
      );

      return;
    }

    if (
      pendingFile.size >
      MAX_PORTFOLIO_MEDIA_FILE_SIZE
    ) {
      setMediaStatus({
        status:
          "error",

        message:
          "Ukuran gambar maksimal 50 MB.",
      });

      setIsMediaPending(
        false,
      );

      return;
    }

    const extension =
      getImageExtension(
        mimeType,
      );

    const fileId =
      globalThis.crypto
        .randomUUID();

    const path =
      `projects/${projectId}` +
      `/sections/${section.id}` +
      `/${fileId}.${extension}`;

    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(
          PORTFOLIO_MEDIA_BUCKET,
        )
        .upload(
          path,
          pendingFile,
          {
            cacheControl:
              "31536000",

            contentType:
              mimeType,

            upsert:
              false,
          },
        );

    if (
      uploadError
    ) {
      setMediaStatus({
        status:
          "error",

        message:
          `Upload gagal: ${uploadError.message}`,
      });

      setIsMediaPending(
        false,
      );

      return;
    }

    /*
     * Asset adalah shared.
     *
     * English metadata lama
     * dipertahankan ketika image
     * diganti.
     */
    const nextMedia:
      ImageSectionMedia =
      {
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

        alt:
          currentMedia
            ?.alt ??
          "",

        caption:
          currentMedia
            ?.caption ??
          "",
      };

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
        await supabase.storage
          .from(
            PORTFOLIO_MEDIA_BUCKET,
          )
          .remove([
            path,
          ]);

        setMediaStatus(
          result,
        );

        return;
      }

      setCurrentMedia(
        nextMedia,
      );

      resetFileInput();

      setMediaStatus(
        result,
      );

      router.refresh();
    } catch {
      setMediaStatus({
        status:
          "error",

        message:
          "Status penyimpanan belum dapat dipastikan. Refresh halaman sebelum mencoba lagi.",
      });
    } finally {
      setIsMediaPending(
        false,
      );
    }
  }

  async function handleRemoveMedia() {
    if (
      !currentMedia
    ) {
      resetFileInput();

      return;
    }

    const confirmed =
      window.confirm(
        "Hapus shared image ini dari semua bahasa dan Storage?",
      );

    if (
      !confirmed
    ) {
      return;
    }

    setIsMediaPending(
      true,
    );

    setMediaStatus(
      initialMediaState,
    );

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
        setCurrentMedia(
          null,
        );

        resetFileInput();

        router.refresh();
      }

      setMediaStatus(
        result,
      );
    } catch {
      setMediaStatus({
        status:
          "error",

        message:
          "Gagal menghapus media. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setIsMediaPending(
        false,
      );
    }
  }

  async function handleSaveLocalizedCopy() {
    if (
      !currentMedia
    ) {
      setCopyStatus({
        status:
          "error",

        message:
          "Upload shared image terlebih dahulu.",
      });

      return;
    }

    if (
      pendingFile
    ) {
      setCopyStatus({
        status:
          "error",

        message:
          "Simpan atau batalkan replacement image terlebih dahulu.",
      });

      return;
    }

    setIsCopyPending(
      true,
    );

    setCopyStatus(
      initialTranslationState,
    );

    try {
      const result =
        await saveImageSectionLocalizedCopy(
          projectId,
          section.id,
          locale,
          alt,
          caption,
        );

      setCopyStatus(
        result,
      );

      if (
        result.status ===
        "success"
      ) {
        /*
         * English action juga
         * menyinkronkan base image
         * metadata.
         */
        if (
          locale ===
          "en"
        ) {
          setCurrentMedia(
            {
              ...currentMedia,

              alt:
                alt.trim(),

              caption:
                caption.trim(),
            },
          );
        }

        router.refresh();
      }
    } catch {
      setCopyStatus({
        status:
          "error",

        message:
          "Gagal menyimpan localized image copy. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setIsCopyPending(
        false,
      );
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
          SHARED IMAGE MEDIA
        </span>

        <p>
          File gambar digunakan
          oleh English, Indonesia,
          dan Deutsch. Mengganti
          gambar di sini akan
          menggantinya untuk semua
          bahasa.
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
                locale ===
                "en"
                  ? alt.trim() ||
                    "Project image preview"
                  : currentMedia
                      ?.alt ||
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
                {
                  previewLabel
                }
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
                Choose one shared
                image for this
                section.
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
              ref={
                inputRef
              }
              type="file"
              accept={
                IMAGE_MEDIA_MIME_TYPES.join(
                  ",",
                )
              }
              onChange={
                handleFileChange
              }
              disabled={
                isMediaPending
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

                    setMediaStatus(
                      initialMediaState,
                    );
                  }}
                  disabled={
                    isMediaPending
                  }
                >
                  Discard selected
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
                    isMediaPending
                  }
                >
                  Remove shared image
                </button>
              ) : null}
            </div>

            <button
              className={
                styles.mediaPrimaryButton
              }
              type="button"
              onClick={
                handleSaveSharedMedia
              }
              disabled={
                isMediaPending ||
                !pendingFile
              }
            >
              {isMediaPending
                ? "Saving media..."
                : currentMedia
                  ? "Replace shared image ↗"
                  : "Save shared image ↗"}
            </button>
          </div>

          {mediaStatus.message ? (
            <div
              className={
                styles.mediaStatus
              }
              data-type={
                mediaStatus.status
              }
              role="status"
              aria-live="polite"
            >
              <span />

              <p>
                {
                  mediaStatus.message
                }
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={
          styles.sharedSectionSettings
        }
      >
        <div
          className={
            styles.imageEditorHeader
          }
        >
          <span>
            {locale.toUpperCase()} IMAGE COPY
          </span>

          <p>
            Alt text dan caption
            mengikuti bahasa aktif.
            Field kosong pada ID/DE
            akan fallback ke English.
          </p>
        </div>

        {locale !==
        "en" ? (
          <p
            className={
              styles.sectionLanguageHint
            }
          >
            English reference — Alt:{" "}
            <strong>
              {currentMedia
                ?.alt ||
                "—"}
            </strong>
            {" · "}
            Caption:{" "}
            <strong>
              {currentMedia
                ?.caption ||
                "—"}
            </strong>
          </p>
        ) : null}

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
              value={
                alt
              }
              onChange={(
                event,
              ) => {
                setAlt(
                  event.target
                    .value,
                );

                setCopyStatus(
                  initialTranslationState,
                );
              }}
              placeholder={
                locale ===
                "en"
                  ? "Describe the image for accessibility"
                  : "Leave empty to use English"
              }
              maxLength={
                500
              }
              disabled={
                isCopyPending ||
                !currentMedia
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
              ) => {
                setCaption(
                  event.target
                    .value,
                );

                setCopyStatus(
                  initialTranslationState,
                );
              }}
              placeholder={
                locale ===
                "en"
                  ? "Optional visual caption"
                  : "Leave empty to use English"
              }
              rows={
                4
              }
              maxLength={
                1000
              }
              disabled={
                isCopyPending ||
                !currentMedia
              }
            />
          </label>
        </div>

        {copyStatus.message ? (
          <div
            className={
              styles.mediaStatus
            }
            data-type={
              copyStatus.status
            }
            role="status"
            aria-live="polite"
          >
            <span />

            <p>
              {
                copyStatus.message
              }
            </p>
          </div>
        ) : null}

        <div
          className={
            styles.mediaActions
          }
        >
          <p
            className={
              styles.sectionSaveHint
            }
          >
            {locale ===
            "en"
              ? "English menjadi fallback untuk alt dan caption bahasa lain."
              : `Hanya ${locale.toUpperCase()} image copy yang akan berubah.`}
          </p>

          <button
            className={
              styles.mediaPrimaryButton
            }
            type="button"
            onClick={
              handleSaveLocalizedCopy
            }
            disabled={
              isCopyPending ||
              !currentMedia ||
              Boolean(
                pendingFile,
              )
            }
          >
            {isCopyPending
              ? "Saving copy..."
              : `Save ${locale.toUpperCase()} image copy ↗`}
          </button>
        </div>
      </div>
    </section>
  );
}