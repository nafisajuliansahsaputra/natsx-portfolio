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
  PORTFOLIO_MEDIA_BUCKET,
  isAllowedImageMimeType,
  type PortfolioImageMimeType,
} from "@/lib/portfolio-media";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  removeProjectCover,
  saveProjectCover,
  type ProjectCoverActionState,
  type ProjectCoverSlot,
} from "./cover-actions";

import styles from "./ProjectCoverEditor.module.css";

const MAX_PROJECT_VISUAL_FILE_SIZE =
  12 *
  1024 *
  1024;

const initialState:
  ProjectCoverActionState = {
  status:
    "success",

  message:
    "",
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
    (
      1024 *
      1024
    )
  ).toFixed(
    1,
  )} MB`;
}

function getImageExtension(
  mimeType:
    PortfolioImageMimeType,
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

function isAllowedVisualMimeType(
  mimeType: string,
): mimeType is PortfolioImageMimeType {
  return (
    isAllowedImageMimeType(
      mimeType,
    ) &&
    mimeType !==
      "image/gif"
  );
}

type ShowcaseSlotProps = {
  projectId: string;
  projectTitle: string;

  slot:
    ProjectCoverSlot;

  initialPath:
    | string
    | null;

  title: string;

  description: string;

  recommendation: string;

  usage: string;
};

function ShowcaseSlot({
  projectId,
  projectTitle,
  slot,
  initialPath,
  title,
  description,
  recommendation,
  usage,
}: ShowcaseSlotProps) {
  const router =
    useRouter();

  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const objectUrlRef =
    useRef<string | null>(
      null,
    );

  const supabase =
    useMemo(
      () =>
        createClient(),
      [],
    );

  const [
    currentPath,
    setCurrentPath,
  ] =
    useState<
      string | null
    >(
      initialPath,
    );

  const [
    pendingFile,
    setPendingFile,
  ] =
    useState<File | null>(
      null,
    );

  const [
    pendingPreview,
    setPendingPreview,
  ] =
    useState<string | null>(
      null,
    );

  const [
    pending,
    setPending,
  ] =
    useState(
      false,
    );

  const [
    confirmRemove,
    setConfirmRemove,
  ] =
    useState(
      false,
    );

  const [
    state,
    setState,
  ] =
    useState<ProjectCoverActionState>(
      initialState,
    );

  useEffect(() => {
    return () => {
      if (
        objectUrlRef.current
      ) {
        URL.revokeObjectURL(
          objectUrlRef.current,
        );
      }
    };
  }, []);

  const currentPublicUrl =
    currentPath
      ? supabase.storage
          .from(
            PORTFOLIO_MEDIA_BUCKET,
          )
          .getPublicUrl(
            currentPath,
          ).data.publicUrl
      : null;

  const previewUrl =
    pendingPreview ??
    currentPublicUrl;

  const previewState =
    pendingFile
      ? "NEW / NOT SAVED"
      : currentPath
        ? "CURRENT VISUAL"
        : "NO VISUAL";

  function clearObjectUrl() {
    if (
      objectUrlRef.current
    ) {
      URL.revokeObjectURL(
        objectUrlRef.current,
      );

      objectUrlRef.current =
        null;
    }

    setPendingPreview(
      null,
    );
  }

  function clearPendingFile() {
    clearObjectUrl();

    setPendingFile(
      null,
    );

    setConfirmRemove(
      false,
    );

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
      event.target.files?.[0];

    if (
      !file
    ) {
      return;
    }

    if (
      !isAllowedVisualMimeType(
        file.type,
      )
    ) {
      setState({
        status:
          "error",

        message:
          "Visual harus berupa JPEG, PNG, WebP, atau AVIF. GIF tidak digunakan untuk showcase visual.",
      });

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_PROJECT_VISUAL_FILE_SIZE
    ) {
      setState({
        status:
          "error",

        message:
          "Ukuran showcase visual maksimal 12 MB.",
      });

      event.target.value =
        "";

      return;
    }

    clearObjectUrl();

    const objectUrl =
      URL.createObjectURL(
        file,
      );

    objectUrlRef.current =
      objectUrl;

    setPendingPreview(
      objectUrl,
    );

    setPendingFile(
      file,
    );

    setConfirmRemove(
      false,
    );

    setState(
      initialState,
    );
  }

  async function handleSave() {
    if (
      !pendingFile
    ) {
      setState({
        status:
          "error",

        message:
          "Pilih visual baru terlebih dahulu.",
      });

      return;
    }

    if (
      !isAllowedVisualMimeType(
        pendingFile.type,
      )
    ) {
      setState({
        status:
          "error",

        message:
          "Format showcase visual tidak valid.",
      });

      return;
    }

    setPending(
      true,
    );

    setConfirmRemove(
      false,
    );

    setState(
      initialState,
    );

    const extension =
      getImageExtension(
        pendingFile.type,
      );

    const fileId =
      globalThis.crypto
        .randomUUID();

    const path =
      `projects/${projectId}` +
      `/covers/${slot}` +
      `/${fileId}.${extension}`;

    try {
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
                pendingFile.type,

              upsert:
                false,
            },
          );

      if (
        uploadError
      ) {
        setState({
          status:
            "error",

          message:
            `Upload gagal: ${uploadError.message}`,
        });

        return;
      }

      const result =
        await saveProjectCover(
          projectId,
          slot,
          path,
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

        setState(
          result,
        );

        return;
      }

      setCurrentPath(
        path,
      );

      clearPendingFile();

      setState({
        ...result,

        message:
          slot ===
            "hero"
            ? "Primary showcase visual berhasil disimpan."
            : "Secondary showcase visual berhasil disimpan.",
      });

      router.refresh();
    } catch {
      setState({
        status:
          "error",

        message:
          "Status penyimpanan belum dapat dipastikan. Refresh halaman sebelum mencoba lagi.",
      });
    } finally {
      setPending(
        false,
      );
    }
  }

  async function handleRemove() {
    if (
      !currentPath
    ) {
      clearPendingFile();

      return;
    }

    if (
      !confirmRemove
    ) {
      setConfirmRemove(
        true,
      );

      setState({
        status:
          "success",

        message:
          "Klik sekali lagi untuk mengonfirmasi penghapusan visual.",
      });

      return;
    }

    setPending(
      true,
    );

    setState(
      initialState,
    );

    try {
      const result =
        await removeProjectCover(
          projectId,
          slot,
        );

      if (
        result.status ===
        "success"
      ) {
        setCurrentPath(
          null,
        );

        clearPendingFile();

        setState({
          ...result,

          message:
            slot ===
              "hero"
              ? "Primary showcase visual berhasil dihapus."
              : "Secondary showcase visual berhasil dihapus.",
        });

        router.refresh();

        return;
      }

      setState(
        result,
      );
    } catch {
      setState({
        status:
          "error",

        message:
          "Gagal menghapus visual. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setPending(
        false,
      );
    }
  }

  return (
    <article
      className={
        styles.card
      }
    >
      <header
        className={
          styles.cardHeader
        }
      >
        <div>
          <strong>
            {title}
          </strong>

          <p>
            {description}
          </p>
        </div>

        <span
          className={
            styles.slotLabel
          }
        >
          {recommendation}
        </span>
      </header>

      <div
        className={
          styles.preview
        }
        data-slot={
          slot
        }
      >
        {previewUrl ? (
          <div
            className={
              styles.previewImage
            }
            role="img"
            aria-label={`${projectTitle} ${title} preview`}
            style={{
              backgroundImage:
                `url(${JSON.stringify(
                  previewUrl,
                )})`,
            }}
          >
            <span
              className={
                styles.previewState
              }
            >
              {
                previewState
              }
            </span>
          </div>
        ) : (
          <div
            className={
              styles.emptyPreview
            }
          >
            <span
              className={
                styles.emptyMark
              }
              aria-hidden="true"
            >
              +
            </span>

            <strong>
              NO VISUAL YET
            </strong>

            <p>
              Upload actual
              project material.
              Screenshot, artwork,
              interface, document,
              atau visual lain
              yang benar-benar
              berasal dari
              project.
            </p>
          </div>
        )}
      </div>

      <div
        className={
          styles.fileMeta
        }
      >
        <span>
          {pendingFile
            ? pendingFile.name
            : currentPath
              ? currentPath
                  .split("/")
                  .at(-1)
              : "No visual selected"}
        </span>

        <span>
          {pendingFile
            ? formatFileSize(
                pendingFile.size,
              )
            : usage}
        </span>
      </div>

      <div
        className={
          styles.controls
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
              IMAGE_MEDIA_MIME_TYPES
                .filter(
                  (
                    type,
                  ) =>
                    type !==
                    "image/gif",
                )
                .join(
                  ",",
                )
            }
            onChange={
              handleFileChange
            }
            disabled={
              pending
            }
          />

          <span
            className={
              styles.uploadCopy
            }
          >
            <strong>
              {currentPath ||
              pendingFile
                ? "Choose replacement"
                : "Choose visual"}
            </strong>

            <small>
              JPEG, PNG,
              WebP, AVIF ·
              max 12 MB
            </small>
          </span>

          <span
            className={
              styles.uploadArrow
            }
            aria-hidden="true"
          >
            ↗
          </span>
        </label>

        <div
          className={
            styles.actions
          }
        >
          <div
            className={
              styles.actionsLeft
            }
          >
            {pendingFile ? (
              <>
                <button
                  className={
                    styles.primaryButton
                  }
                  type="button"
                  onClick={
                    handleSave
                  }
                  disabled={
                    pending
                  }
                >
                  {pending
                    ? "Saving..."
                    : "Save visual"}
                </button>

                <button
                  className={
                    styles.secondaryButton
                  }
                  type="button"
                  onClick={
                    clearPendingFile
                  }
                  disabled={
                    pending
                  }
                >
                  Cancel
                </button>
              </>
            ) : null}
          </div>

          {currentPath &&
          !pendingFile ? (
            <button
              className={
                styles.removeButton
              }
              type="button"
              onClick={
                handleRemove
              }
              disabled={
                pending
              }
              data-confirm={
                confirmRemove
              }
            >
              {pending
                ? "Removing..."
                : confirmRemove
                  ? "Confirm remove"
                  : "Remove visual"}
            </button>
          ) : null}
        </div>

        {state.message ? (
          <div
            className={
              styles.notice
            }
            data-status={
              state.status
            }
            role="status"
            aria-live="polite"
          >
            {
              state.message
            }
          </div>
        ) : null}
      </div>
    </article>
  );
}

type ProjectCoverEditorProps = {
  projectId: string;
  projectTitle: string;

  cardImagePath:
    | string
    | null;

  heroImagePath:
    | string
    | null;
};

export default function ProjectCoverEditor({
  projectId,
  projectTitle,
  cardImagePath,
  heroImagePath,
}: ProjectCoverEditorProps) {
  return (
    <div
      className={
        styles.editor
      }
    >
      <div
        className={
          styles.introduction
        }
      >
        <span>
          Showcase
          materials
        </span>

        <p>
          These are not flattened
          portfolio covers. They
          are source visuals used
          inside NATSX&apos;s
          editorial compositions.
          Layout, layering,
          typography, crop,
          framing, and motion are
          controlled separately
          by the portfolio.
        </p>
      </div>

      <div
        className={
          styles.grid
        }
      >
        <ShowcaseSlot
          projectId={
            projectId
          }
          projectTitle={
            projectTitle
          }
          slot="hero"
          initialPath={
            heroImagePath
          }
          title="Primary Showcase Visual"
          description="Main actual project material. Usually the dominant desktop screen, identity artwork, dashboard, or key project visual."
          recommendation="PRIMARY"
          usage="MAIN LAYER"
        />

        <ShowcaseSlot
          projectId={
            projectId
          }
          projectTitle={
            projectTitle
          }
          slot="card"
          initialPath={
            cardImagePath
          }
          title="Secondary Showcase Visual"
          description="Supporting actual project material. Useful for mobile viewport, poster, document, alternate screen, or secondary composition layer."
          recommendation="SECONDARY"
          usage="SUPPORT LAYER"
        />
      </div>
    </div>
  );
}