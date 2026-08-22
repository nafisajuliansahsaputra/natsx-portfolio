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
  VIDEO_MEDIA_MIME_TYPES,
  getFinaleMediaKind,
  isAllowedFinaleMediaMimeType,
  type FinaleSectionMedia,
  type PortfolioFinaleMimeType,
} from "@/lib/portfolio-media";

import {
  getFinaleSectionContent,
} from "@/lib/project-section-content";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  saveFinaleSectionLocalizedCopy,
  saveFinaleSectionSharedData,
  type FinaleTranslationState,
} from "./finale-translation-actions";

import styles from "./sections.module.css";

type FinaleSectionEditorProps = {
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

type LocalizedFinaleCopy = {
  title: string;
  body: string;
  ctaLabel: string;
  mediaAlt: string;
};

const initialState:
  FinaleTranslationState = {
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

function getLocalizedFinaleCopy(
  content: Record<
    string,
    unknown
  >,
): LocalizedFinaleCopy {
  if (
    !isRecord(
      content.finale,
    )
  ) {
    return {
      title:
        "",

      body:
        "",

      ctaLabel:
        "",

      mediaAlt:
        "",
    };
  }

  const finale =
    content.finale;

  const media =
    isRecord(
      finale.media,
    )
      ? finale.media
      : null;

  return {
    title:
      typeof finale.title ===
      "string"
        ? finale.title
        : "",

    body:
      typeof finale.body ===
      "string"
        ? finale.body
        : "",

    ctaLabel:
      typeof finale.ctaLabel ===
      "string"
        ? finale.ctaLabel
        : "",

    mediaAlt:
      media &&
      typeof media.alt ===
        "string"
        ? media.alt
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
        bytes / 1024,
      ),
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getMediaExtension(
  mimeType:
    PortfolioFinaleMimeType,
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

    case "video/mp4":
      return "mp4";

    case "video/webm":
      return "webm";
  }
}

export default function FinaleSectionEditor({
  projectId,
  section,
  locale,
  translationContent,
}: FinaleSectionEditorProps) {
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

  const baseFinale =
    getFinaleSectionContent(
      section.content,
    );

  const localizedCopy =
    getLocalizedFinaleCopy(
      translationContent,
    );

  const [
    title,
    setTitle,
  ] =
    useState(
      locale === "en"
        ? baseFinale.title
        : localizedCopy.title,
    );

  const [
    body,
    setBody,
  ] =
    useState(
      locale === "en"
        ? baseFinale.body
        : localizedCopy.body,
    );

  const [
    ctaLabel,
    setCtaLabel,
  ] =
    useState(
      locale === "en"
        ? baseFinale.ctaLabel
        : localizedCopy.ctaLabel,
    );

  const [
    mediaAlt,
    setMediaAlt,
  ] =
    useState(
      baseFinale.media
        ? locale === "en"
          ? baseFinale.media.alt
          : localizedCopy.mediaAlt
        : "",
    );

  const [
    ctaUrl,
    setCtaUrl,
  ] =
    useState(
      baseFinale.ctaUrl,
    );

  const [
    savedCtaUrl,
    setSavedCtaUrl,
  ] =
    useState(
      baseFinale.ctaUrl,
    );

  const [
    currentMedia,
    setCurrentMedia,
  ] =
    useState<
      FinaleSectionMedia | null
    >(
      baseFinale.media,
    );

  const [
    savedMediaPath,
    setSavedMediaPath,
  ] =
    useState<
      string | null
    >(
      baseFinale.media
        ?.asset.path ??
        null,
    );

  const [
    pendingFile,
    setPendingFile,
  ] =
    useState<
      File | null
    >(
      null,
    );

  const [
    pendingPreviewUrl,
    setPendingPreviewUrl,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    isSharedPending,
    setIsSharedPending,
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
    sharedStatus,
    setSharedStatus,
  ] =
    useState<
      FinaleTranslationState
    >(
      initialState,
    );

  const [
    copyStatus,
    setCopyStatus,
  ] =
    useState<
      FinaleTranslationState
    >(
      initialState,
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
            currentMedia.asset
              .bucket,
          )
          .getPublicUrl(
            currentMedia.asset
              .path,
          ).data.publicUrl
      : null;

  const previewUrl =
    pendingPreviewUrl ??
    currentPublicUrl;

  const pendingKind =
    pendingFile
      ? getFinaleMediaKind(
          pendingFile.type,
        )
      : null;

  const previewKind =
    pendingKind ??
    currentMedia?.kind ??
    null;

  const currentFileName =
    pendingFile?.name ??
    currentMedia?.asset
      .originalName ??
    "";

  const currentFileSize =
    pendingFile?.size ??
    currentMedia?.asset
      .size ??
    0;

  const mediaDraftChanged =
    Boolean(
      pendingFile,
    ) ||
    (
      currentMedia
        ?.asset.path ??
      null
    ) !==
      savedMediaPath;

  const hasSharedDraftChanges =
    ctaUrl.trim() !==
      savedCtaUrl ||
    mediaDraftChanged;

  const previewTitle =
    title.trim() ||
    (locale !== "en"
      ? baseFinale.title
      : "") ||
    "Close the story with impact.";

  const previewBody =
    body.trim() ||
    (locale !== "en"
      ? baseFinale.body
      : "");

  const previewCtaLabel =
    ctaLabel.trim() ||
    (locale !== "en"
      ? baseFinale.ctaLabel
      : "");

  const previewMediaAlt =
    mediaAlt.trim() ||
    (locale !== "en"
      ? baseFinale.media
          ?.alt ??
        ""
      : "");

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

  function resetPendingFile() {
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

  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target
        .files?.[0];

    if (
      !file
    ) {
      return;
    }

    if (
      !isAllowedFinaleMediaMimeType(
        file.type,
      )
    ) {
      setSharedStatus({
        status:
          "error",

        message:
          "Format media tidak didukung. Gunakan JPEG, PNG, WebP, AVIF, GIF, MP4, atau WebM.",
      });

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_PORTFOLIO_MEDIA_FILE_SIZE
    ) {
      setSharedStatus({
        status:
          "error",

        message:
          "Ukuran media maksimal 50 MB.",
      });

      event.target.value =
        "";

      return;
    }

    clearPendingPreview();

    const objectUrl =
      URL.createObjectURL(
        file,
      );

    previewUrlRef.current =
      objectUrl;

    setPendingPreviewUrl(
      objectUrl,
    );

    setPendingFile(
      file,
    );

    setSharedStatus(
      initialState,
    );
  }

  function handleRemoveMedia() {
    resetPendingFile();

    setCurrentMedia(
      null,
    );

    setMediaAlt(
      "",
    );

    setSharedStatus({
      status:
        "idle",

      message:
        "Media removed from shared draft. Save shared finale data to apply the change.",
    });

    setCopyStatus(
      initialState,
    );
  }

  async function handleSaveSharedData() {
    setIsSharedPending(
      true,
    );

    setSharedStatus(
      initialState,
    );

    let nextMedia =
      currentMedia;

    let uploadedPath:
      | string
      | null =
      null;

    if (
      pendingFile
    ) {
      const mimeType =
        pendingFile.type;

      if (
        !isAllowedFinaleMediaMimeType(
          mimeType,
        )
      ) {
        setSharedStatus({
          status:
            "error",

          message:
            "Format media tidak didukung.",
        });

        setIsSharedPending(
          false,
        );

        return;
      }

      if (
        pendingFile.size >
        MAX_PORTFOLIO_MEDIA_FILE_SIZE
      ) {
        setSharedStatus({
          status:
            "error",

          message:
            "Ukuran media maksimal 50 MB.",
        });

        setIsSharedPending(
          false,
        );

        return;
      }

      const kind =
        getFinaleMediaKind(
          mimeType,
        );

      if (
        !kind
      ) {
        setSharedStatus({
          status:
            "error",

          message:
            "Jenis media tidak valid.",
        });

        setIsSharedPending(
          false,
        );

        return;
      }

      const extension =
        getMediaExtension(
          mimeType,
        );

      const fileId =
        globalThis.crypto
          .randomUUID();

      const path =
        `projects/${projectId}` +
        `/sections/${section.id}` +
        `/finale/${fileId}.${extension}`;

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
                "3600",

              contentType:
                mimeType,

              upsert:
                false,
            },
          );

      if (
        uploadError
      ) {
        setSharedStatus({
          status:
            "error",

          message:
            `Upload gagal: ${uploadError.message}`,
        });

        setIsSharedPending(
          false,
        );

        return;
      }

      uploadedPath =
        path;

      nextMedia = {
        kind,

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

        /*
         * Localized alt disimpan
         * lewat copy editor.
         */
        alt:
          baseFinale.media
            ?.alt ??
          "",
      };
    }

    try {
      const result =
        await saveFinaleSectionSharedData(
          projectId,
          section.id,
          ctaUrl,
          nextMedia,
        );

      if (
        result.status ===
        "error"
      ) {
        /*
         * Server juga melakukan
         * rollback untuk DB error.
         * Remove di sini menutup
         * kasus validation error
         * setelah upload client.
         */
        if (
          uploadedPath
        ) {
          await supabase.storage
            .from(
              PORTFOLIO_MEDIA_BUCKET,
            )
            .remove([
              uploadedPath,
            ]);
        }

        setSharedStatus(
          result,
        );

        return;
      }

      setCurrentMedia(
        nextMedia,
      );

      setSavedMediaPath(
        nextMedia
          ?.asset.path ??
          null,
      );

      setSavedCtaUrl(
        ctaUrl.trim(),
      );

      setCtaUrl(
        ctaUrl.trim(),
      );

      resetPendingFile();

      setSharedStatus(
        result,
      );

      router.refresh();
    } catch {
      setSharedStatus({
        status:
          "error",

        message:
          "Status shared finale belum dapat dipastikan. Refresh halaman sebelum mencoba lagi.",
      });
    } finally {
      setIsSharedPending(
        false,
      );
    }
  }

  async function handleSaveLocalizedCopy() {
    if (
      hasSharedDraftChanges
    ) {
      setCopyStatus({
        status:
          "error",

        message:
          "Simpan shared CTA URL atau media terlebih dahulu sebelum menyimpan translation.",
      });

      return;
    }

    setIsCopyPending(
      true,
    );

    setCopyStatus(
      initialState,
    );

    try {
      const result =
        await saveFinaleSectionLocalizedCopy(
          projectId,
          section.id,
          locale,
          title,
          body,
          ctaLabel,
          mediaAlt,
        );

      setCopyStatus(
        result,
      );

      if (
        result.status ===
        "success"
      ) {
        if (
          locale ===
          "en"
        ) {
          setTitle(
            title.trim(),
          );

          setBody(
            body.trim(),
          );

          setCtaLabel(
            ctaLabel.trim(),
          );

          setMediaAlt(
            currentMedia
              ? mediaAlt.trim()
              : "",
          );

          if (
            currentMedia
          ) {
            setCurrentMedia(
              {
                ...currentMedia,

                alt:
                  mediaAlt.trim(),
              },
            );
          }
        }

        router.refresh();
      }
    } catch {
      setCopyStatus({
        status:
          "error",

        message:
          "Gagal menyimpan localized finale copy. Refresh halaman lalu coba lagi.",
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
        styles.finaleEditor
      }
    >
      <div
        className={
          styles.finaleEditorHeader
        }
      >
        <span>
          {locale.toUpperCase()}{" "}
          FINALE COPY
        </span>

        <p>
          Title, description, CTA
          label, dan media alt
          mengikuti bahasa aktif.
          CTA URL serta file media
          digunakan bersama oleh
          semua bahasa.
        </p>
      </div>

      <div
        className={
          styles.finalePreview
        }
      >
        <div
          className={
            styles.finalePreviewCopy
          }
        >
          <span>
            FINAL SHOWCASE
          </span>

          <h3>
            {
              previewTitle
            }
          </h3>

          {previewBody ? (
            <p>
              {
                previewBody
              }
            </p>
          ) : null}

          {previewCtaLabel &&
          savedCtaUrl ? (
            <div
              className={
                styles.finalePreviewCta
              }
            >
              {
                previewCtaLabel
              }{" "}
              ↗
            </div>
          ) : null}
        </div>

        <div
          className={
            styles.finaleMediaPreview
          }
        >
          {previewUrl &&
          previewKind ===
            "image" ? (
            <div
              className={
                styles.finalePreviewImage
              }
              role="img"
              aria-label={
                previewMediaAlt ||
                previewTitle ||
                "Final showcase image"
              }
              style={{
                backgroundImage:
                  `url(${JSON.stringify(
                    previewUrl,
                  )})`,
              }}
            >
              {pendingFile ? (
                <span>
                  UNSAVED
                </span>
              ) : null}
            </div>
          ) : previewUrl &&
            previewKind ===
              "video" ? (
            <div
              className={
                styles.finalePreviewVideo
              }
            >
              <video
                src={
                  previewUrl
                }
                muted
                autoPlay
                loop
                playsInline
                controls
              />

              {pendingFile ? (
                <span>
                  UNSAVED
                </span>
              ) : null}
            </div>
          ) : (
            <div
              className={
                styles.finalePreviewEmpty
              }
            >
              <span>
                OPTIONAL MEDIA
              </span>

              <p>
                Image or video
                showcase.
              </p>
            </div>
          )}

          {currentFileName ? (
            <div
              className={
                styles.finaleFileMeta
              }
            >
              <span>
                {
                  currentFileName
                }
              </span>

              <span>
                {formatFileSize(
                  currentFileSize,
                )}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={
          styles.finaleControls
        }
      >
        <div
          className={
            styles.finaleFields
          }
        >
          {locale !==
          "en" ? (
            <p
              className={
                styles.sectionLanguageHint
              }
            >
              English reference —
              Title:{" "}
              <strong>
                {baseFinale.title ||
                  "—"}
              </strong>
              {" · "}
              CTA:{" "}
              <strong>
                {baseFinale.ctaLabel ||
                  "—"}
              </strong>
            </p>
          ) : null}

          <label
            className={
              styles.field
            }
          >
            <span>
              {locale.toUpperCase()}{" "}
              finale title
              {locale ===
              "en"
                ? " *"
                : ""}
            </span>

            <textarea
              className={
                styles.textarea
              }
              value={
                title
              }
              onChange={(
                event,
              ) => {
                setTitle(
                  event.target
                    .value,
                );

                setCopyStatus(
                  initialState,
                );
              }}
              placeholder={
                locale === "en"
                  ? "Built to be remembered."
                  : "Leave empty to use English"
              }
              rows={
                3
              }
              maxLength={
                300
              }
              disabled={
                isCopyPending
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              {locale.toUpperCase()}{" "}
              description
            </span>

            <textarea
              className={
                styles.textarea
              }
              value={
                body
              }
              onChange={(
                event,
              ) => {
                setBody(
                  event.target
                    .value,
                );

                setCopyStatus(
                  initialState,
                );
              }}
              placeholder={
                locale === "en"
                  ? "Optional closing context"
                  : "Leave empty to use English"
              }
              rows={
                5
              }
              maxLength={
                2000
              }
              disabled={
                isCopyPending
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              {locale.toUpperCase()}{" "}
              CTA label
            </span>

            <input
              className={
                styles.input
              }
              type="text"
              value={
                ctaLabel
              }
              onChange={(
                event,
              ) => {
                setCtaLabel(
                  event.target
                    .value,
                );

                setCopyStatus(
                  initialState,
                );
              }}
              placeholder={
                locale === "en"
                  ? "Visit project"
                  : "Leave empty to use English"
              }
              maxLength={
                120
              }
              disabled={
                isCopyPending
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              {locale.toUpperCase()}{" "}
              media alt /
              description
            </span>

            <input
              className={
                styles.input
              }
              type="text"
              value={
                mediaAlt
              }
              onChange={(
                event,
              ) => {
                setMediaAlt(
                  event.target
                    .value,
                );

                setCopyStatus(
                  initialState,
                );
              }}
              placeholder={
                locale === "en"
                  ? "Describe the showcase media"
                  : "Leave empty to use English"
              }
              maxLength={
                500
              }
              disabled={
                isCopyPending ||
                (!currentMedia &&
                  !pendingFile)
              }
            />
          </label>
        </div>
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
          styles.finaleFooter
        }
      >
        <p>
          {locale === "en"
            ? "English adalah canonical fallback untuk finale copy."
            : "Field kosong akan fallback ke English secara individual."}
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
            hasSharedDraftChanges
          }
        >
          {isCopyPending
            ? `Saving ${locale.toUpperCase()} finale...`
            : `Save ${locale.toUpperCase()} finale copy ↗`}
        </button>
      </div>

      <div
        className={
          styles.sharedSectionSettings
        }
      >
        <div
          className={
            styles.sharedSectionHeading
          }
        >
          <span>
            SHARED FINALE DATA
          </span>

          <p>
            CTA URL dan file media
            berlaku untuk English,
            Indonesia, dan Deutsch.
          </p>
        </div>

        <div
          className={
            styles.finaleCtaGrid
          }
        >
          <label
            className={
              styles.field
            }
          >
            <span>
              Shared CTA URL
            </span>

            <input
              className={
                styles.input
              }
              type="text"
              value={
                ctaUrl
              }
              onChange={(
                event,
              ) => {
                setCtaUrl(
                  event.target
                    .value,
                );

                setSharedStatus(
                  initialState,
                );
              }}
              placeholder="https://example.com or /contact"
              maxLength={
                2000
              }
              disabled={
                isSharedPending
              }
            />

            <small>
              Internal path seperti
              /contact otomatis
              mengikuti locale
              halaman aktif.
            </small>
          </label>
        </div>

        <div
          className={
            styles.finaleMediaControls
          }
        >
          <label
            className={
              styles.galleryUploadControl
            }
          >
            <input
              ref={
                inputRef
              }
              type="file"
              accept={[
                ...IMAGE_MEDIA_MIME_TYPES,
                ...VIDEO_MEDIA_MIME_TYPES,
              ].join(
                ",",
              )}
              onChange={
                handleFileChange
              }
              disabled={
                isSharedPending
              }
            />

            <span>
              {currentMedia ||
              pendingFile
                ? "Choose replacement"
                : "+ Add shared media"}
            </span>

            <small>
              Image / MP4 /
              WebM · max 50 MB
            </small>
          </label>

          <div
            className={
              styles.finaleMediaActions
            }
          >
            {pendingFile ? (
              <button
                className={
                  styles.mediaSecondaryButton
                }
                type="button"
                onClick={() => {
                  resetPendingFile();

                  setSharedStatus(
                    initialState,
                  );
                }}
                disabled={
                  isSharedPending
                }
              >
                Discard selected
              </button>
            ) : null}

            {currentMedia ||
            pendingFile ? (
              <button
                className={
                  styles.mediaDangerButton
                }
                type="button"
                onClick={
                  handleRemoveMedia
                }
                disabled={
                  isSharedPending
                }
              >
                Remove shared media
              </button>
            ) : null}
          </div>
        </div>

        {sharedStatus.message ? (
          <div
            className={
              styles.mediaStatus
            }
            data-type={
              sharedStatus.status
            }
            role="status"
            aria-live="polite"
          >
            <span />

            <p>
              {
                sharedStatus.message
              }
            </p>
          </div>
        ) : null}

        <div
          className={
            styles.finaleFooter
          }
        >
          <p>
            Mengganti atau
            menghapus media
            berlaku ke semua
            bahasa.
          </p>

          <button
            className={
              styles.mediaPrimaryButton
            }
            type="button"
            onClick={
              handleSaveSharedData
            }
            disabled={
              isSharedPending ||
              !hasSharedDraftChanges
            }
          >
            {isSharedPending
              ? "Saving shared finale..."
              : "Save shared finale data ↗"}
          </button>
        </div>
      </div>
    </section>
  );
}