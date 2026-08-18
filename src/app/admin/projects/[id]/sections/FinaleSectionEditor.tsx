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
  type FinaleSectionContent,
} from "@/lib/project-section-content";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  saveFinaleSectionContent,
  type SectionActionState,
} from "./actions";

import styles from "./sections.module.css";

const initialState: SectionActionState = {
  status: "idle",
  message: "",
};

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
  mimeType: PortfolioFinaleMimeType,
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

    case "video/mp4":
      return "mp4";

    case "video/webm":
      return "webm";
  }
}

export default function FinaleSectionEditor({
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

  const initialFinale =
    getFinaleSectionContent(
      section.content,
    );

  const [
    title,
    setTitle,
  ] = useState(
    initialFinale.title,
  );

  const [
    body,
    setBody,
  ] = useState(
    initialFinale.body,
  );

  const [
    ctaLabel,
    setCtaLabel,
  ] = useState(
    initialFinale.ctaLabel,
  );

  const [
    ctaUrl,
    setCtaUrl,
  ] = useState(
    initialFinale.ctaUrl,
  );

  const [
    currentMedia,
    setCurrentMedia,
  ] =
    useState<FinaleSectionMedia | null>(
      initialFinale.media,
    );

  const [
    mediaAlt,
    setMediaAlt,
  ] = useState(
    initialFinale.media?.alt ??
      "",
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
    isPending,
    setIsPending,
  ] = useState(false);

  const [
    status,
    setStatus,
  ] =
    useState<SectionActionState>(
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
    currentMedia?.asset.size ??
    0;

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
    setPendingFile(null);

    clearPendingPreview();

    if (
      inputRef.current
    ) {
      inputRef.current.value =
        "";
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

    if (
      !isAllowedFinaleMediaMimeType(
        file.type,
      )
    ) {
      setStatus({
        status: "error",

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
      setStatus({
        status: "error",

        message:
          "Ukuran media maksimal 50 MB.",
      });

      event.target.value =
        "";

      return;
    }

    clearPendingPreview();

    const previewUrl =
      URL.createObjectURL(
        file,
      );

    previewUrlRef.current =
      previewUrl;

    setPendingPreviewUrl(
      previewUrl,
    );

    setPendingFile(
      file,
    );

    setStatus(
      initialState,
    );
  }

  function handleRemoveMedia() {
    resetPendingFile();

    setCurrentMedia(
      null,
    );

    setMediaAlt("");

    setStatus({
      status: "idle",

      message:
        "Media removed from draft. Save finale to apply the change.",
    });
  }

  async function handleSave() {
    const normalizedTitle =
      title.trim();

    const normalizedCtaLabel =
      ctaLabel.trim();

    const normalizedCtaUrl =
      ctaUrl.trim();

    if (
      !normalizedTitle
    ) {
      setStatus({
        status: "error",
        message:
          "Finale title wajib diisi.",
      });

      return;
    }

    if (
      Boolean(
        normalizedCtaLabel,
      ) !==
      Boolean(
        normalizedCtaUrl,
      )
    ) {
      setStatus({
        status: "error",

        message:
          "CTA label dan CTA URL harus diisi bersamaan.",
      });

      return;
    }

    setIsPending(true);

    setStatus(
      initialState,
    );

    let nextMedia =
      currentMedia;

    let uploadedPath:
      | string
      | null = null;

    if (pendingFile) {
      const mimeType =
        pendingFile.type;

      if (
        !isAllowedFinaleMediaMimeType(
          mimeType,
        )
      ) {
        setStatus({
          status: "error",

          message:
            "Format media tidak didukung.",
        });

        setIsPending(
          false,
        );

        return;
      }

      if (
        pendingFile.size >
        MAX_PORTFOLIO_MEDIA_FILE_SIZE
      ) {
        setStatus({
          status: "error",

          message:
            "Ukuran media maksimal 50 MB.",
        });

        setIsPending(
          false,
        );

        return;
      }

      const kind =
        getFinaleMediaKind(
          mimeType,
        );

      if (!kind) {
        setStatus({
          status: "error",

          message:
            "Jenis media tidak valid.",
        });

        setIsPending(
          false,
        );

        return;
      }

      const extension =
        getMediaExtension(
          mimeType,
        );

      const fileId =
        globalThis.crypto.randomUUID();

      const path =
        `projects/${projectId}` +
        `/sections/${section.id}` +
        `/finale/${fileId}.${extension}`;

      const {
        error: uploadError,
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

      if (uploadError) {
        setStatus({
          status: "error",

          message:
            `Upload gagal: ${uploadError.message}`,
        });

        setIsPending(
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

        alt:
          mediaAlt.trim(),
      };
    } else if (
      currentMedia
    ) {
      nextMedia = {
        ...currentMedia,

        alt:
          mediaAlt.trim(),
      };
    }

    const payload: FinaleSectionContent =
      {
        title:
          normalizedTitle,

        body:
          body.trim(),

        ctaLabel:
          normalizedCtaLabel,

        ctaUrl:
          normalizedCtaUrl,

        media:
          nextMedia,
      };

    try {
      const result =
        await saveFinaleSectionContent(
          projectId,
          section.id,
          payload,
        );

      if (
        result.status ===
        "error"
      ) {
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

        setStatus(
          result,
        );

        return;
      }

      setTitle(
        payload.title,
      );

      setBody(
        payload.body,
      );

      setCtaLabel(
        payload.ctaLabel,
      );

      setCtaUrl(
        payload.ctaUrl,
      );

      setCurrentMedia(
        nextMedia,
      );

      setMediaAlt(
        nextMedia?.alt ??
          "",
      );

      resetPendingFile();

      setStatus(
        result,
      );

      router.refresh();
    } catch {
      setStatus({
        status: "error",

        message:
          "Status penyimpanan belum dapat dipastikan. Refresh halaman sebelum mencoba lagi.",
      });
    } finally {
      setIsPending(
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
          FINALE CONTENT
        </span>

        <p>
          Bangun closing
          showcase sebagai
          penutup case study:
          statement akhir, CTA,
          dan optional image atau
          video.
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
            {title ||
              "Close the story with impact."}
          </h3>

          {body ? (
            <p>
              {body}
            </p>
          ) : null}

          {ctaLabel ? (
            <div
              className={
                styles.finalePreviewCta
              }
            >
              {ctaLabel} ↗
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
                mediaAlt.trim() ||
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
          <label
            className={
              styles.field
            }
          >
            <span>
              Finale title *
            </span>

            <textarea
              className={
                styles.textarea
              }
              value={title}
              onChange={(
                event,
              ) => {
                setTitle(
                  event.target
                    .value,
                );

                setStatus(
                  initialState,
                );
              }}
              placeholder="Built to be remembered."
              rows={3}
              maxLength={
                300
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
              Description
            </span>

            <textarea
              className={
                styles.textarea
              }
              value={body}
              onChange={(
                event,
              ) => {
                setBody(
                  event.target
                    .value,
                );

                setStatus(
                  initialState,
                );
              }}
              placeholder="Optional closing context"
              rows={5}
              maxLength={
                2000
              }
              disabled={
                isPending
              }
            />
          </label>

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

                  setStatus(
                    initialState,
                  );
                }}
                placeholder="Visit project"
                maxLength={
                  120
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
                CTA URL
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

                  setStatus(
                    initialState,
                  );
                }}
                placeholder="https://example.com or /contact"
                maxLength={
                  2000
                }
                disabled={
                  isPending
                }
              />
            </label>
          </div>
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
              ref={inputRef}
              type="file"
              accept={[
                ...IMAGE_MEDIA_MIME_TYPES,
                ...VIDEO_MEDIA_MIME_TYPES,
              ].join(",")}
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
                : "+ Add media"}
            </span>

            <small>
              Image / MP4 /
              WebM · max 50 MB
            </small>
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Alt / media description
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

                setStatus(
                  initialState,
                );
              }}
              placeholder="Describe the showcase media"
              maxLength={
                500
              }
              disabled={
                isPending
              }
            />
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

                  setStatus(
                    initialState,
                  );
                }}
                disabled={
                  isPending
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
                  isPending
                }
              >
                Remove media
              </button>
            ) : null}
          </div>
        </div>
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
            {status.message}
          </p>
        </div>
      ) : null}

      <div
        className={
          styles.finaleFooter
        }
      >
        <p>
          Media dan CTA
          bersifat opsional.
          Jika memakai CTA,
          label dan URL harus
          diisi bersamaan.
        </p>

        <button
          className={
            styles.mediaPrimaryButton
          }
          type="button"
          onClick={
            handleSave
          }
          disabled={
            isPending
          }
        >
          {isPending
            ? "Saving finale..."
            : "Save finale ↗"}
        </button>
      </div>
    </section>
  );
}