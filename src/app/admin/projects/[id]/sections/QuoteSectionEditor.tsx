"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import type {
  Locale,
} from "@/i18n/config";

import {
  getQuoteSectionContent,
  type QuoteAlignment,
} from "@/lib/project-section-content";

import {
  saveQuoteSectionLocalizedCopy,
  saveQuoteSectionSharedAlignment,
  type QuoteTranslationState,
} from "./quote-translation-actions";

import styles from "./sections.module.css";

type QuoteSectionEditorProps = {
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

type LocalizedQuoteCopy = {
  text: string;
  source: string;
  context: string;
};

const initialState:
  QuoteTranslationState = {
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

function getLocalizedQuoteCopy(
  content: Record<
    string,
    unknown
  >,
): LocalizedQuoteCopy {
  if (
    !isRecord(
      content.quote,
    )
  ) {
    return {
      text:
        "",

      source:
        "",

      context:
        "",
    };
  }

  const quote =
    content.quote;

  return {
    text:
      typeof quote.text ===
      "string"
        ? quote.text
        : "",

    source:
      typeof quote.source ===
      "string"
        ? quote.source
        : "",

    context:
      typeof quote.context ===
      "string"
        ? quote.context
        : "",
  };
}

export default function QuoteSectionEditor({
  projectId,
  section,
  locale,
  translationContent,
}: QuoteSectionEditorProps) {
  const router =
    useRouter();

  const baseQuote =
    getQuoteSectionContent(
      section.content,
    );

  const localizedCopy =
    getLocalizedQuoteCopy(
      translationContent,
    );

  const [
    text,
    setText,
  ] =
    useState(
      locale === "en"
        ? baseQuote.text
        : localizedCopy.text,
    );

  const [
    source,
    setSource,
  ] =
    useState(
      locale === "en"
        ? baseQuote.source
        : localizedCopy.source,
    );

  const [
    context,
    setContext,
  ] =
    useState(
      locale === "en"
        ? baseQuote.context
        : localizedCopy.context,
    );

  const [
    alignment,
    setAlignment,
  ] =
    useState<QuoteAlignment>(
      baseQuote.alignment,
    );

  const [
    savedAlignment,
    setSavedAlignment,
  ] =
    useState<QuoteAlignment>(
      baseQuote.alignment,
    );

  const [
    isAlignmentPending,
    setIsAlignmentPending,
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
    alignmentStatus,
    setAlignmentStatus,
  ] =
    useState<
      QuoteTranslationState
    >(
      initialState,
    );

  const [
    copyStatus,
    setCopyStatus,
  ] =
    useState<
      QuoteTranslationState
    >(
      initialState,
    );

  const hasAlignmentChange =
    alignment !==
    savedAlignment;

  const previewText =
    text.trim() ||
    (locale !== "en"
      ? baseQuote.text
      : "") ||
    "A strong statement can become a visual pause in the case study.";

  const previewSource =
    source.trim() ||
    (locale !== "en"
      ? baseQuote.source
      : "");

  const previewContext =
    context.trim() ||
    (locale !== "en"
      ? baseQuote.context
      : "");

  async function handleSaveAlignment() {
    setIsAlignmentPending(
      true,
    );

    setAlignmentStatus(
      initialState,
    );

    try {
      const result =
        await saveQuoteSectionSharedAlignment(
          projectId,
          section.id,
          alignment,
        );

      setAlignmentStatus(
        result,
      );

      if (
        result.status ===
        "success"
      ) {
        setSavedAlignment(
          alignment,
        );

        router.refresh();
      }
    } catch {
      setAlignmentStatus({
        status:
          "error",

        message:
          "Gagal menyimpan shared quote alignment. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setIsAlignmentPending(
        false,
      );
    }
  }

  async function handleSaveCopy() {
    setIsCopyPending(
      true,
    );

    setCopyStatus(
      initialState,
    );

    try {
      const result =
        await saveQuoteSectionLocalizedCopy(
          projectId,
          section.id,
          locale,
          text,
          source,
          context,
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
          setText(
            text.trim(),
          );

          setSource(
            source.trim(),
          );

          setContext(
            context.trim(),
          );
        }

        router.refresh();
      }
    } catch {
      setCopyStatus({
        status:
          "error",

        message:
          "Gagal menyimpan localized quote copy. Refresh halaman lalu coba lagi.",
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
        styles.quoteEditor
      }
    >
      <div
        className={
          styles.quoteEditorHeader
        }
      >
        <span>
          {locale.toUpperCase()}{" "}
          QUOTE COPY
        </span>

        <p>
          Quote text, source, dan
          context mengikuti bahasa
          aktif. Alignment berlaku
          ke semua bahasa.
        </p>
      </div>

      <div
        className={
          styles.quoteWorkspace
        }
      >
        <div
          className={
            styles.quotePreview
          }
          data-alignment={
            alignment
          }
        >
          <span
            className={
              styles.quoteMark
            }
            aria-hidden="true"
          >
            “
          </span>

          <blockquote>
            {
              previewText
            }
          </blockquote>

          {(previewSource ||
            previewContext) && (
            <div
              className={
                styles.quoteAttribution
              }
            >
              {previewSource ? (
                <strong>
                  {
                    previewSource
                  }
                </strong>
              ) : null}

              {previewContext ? (
                <span>
                  {
                    previewContext
                  }
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div
          className={
            styles.quoteControls
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
              Quote:{" "}
              <strong>
                {baseQuote.text ||
                  "—"}
              </strong>
              {" · "}
              Source:{" "}
              <strong>
                {baseQuote.source ||
                  "—"}
              </strong>
              {" · "}
              Context:{" "}
              <strong>
                {baseQuote.context ||
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
              quote text
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
                text
              }
              onChange={(
                event,
              ) => {
                setText(
                  event.target
                    .value,
                );

                setCopyStatus(
                  initialState,
                );
              }}
              placeholder={
                locale ===
                "en"
                  ? "Write the quote or main statement"
                  : "Leave empty to use English"
              }
              rows={
                7
              }
              maxLength={
                2000
              }
              disabled={
                isCopyPending
              }
            />
          </label>

          <div
            className={
              styles.quoteFieldGrid
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                {locale.toUpperCase()}{" "}
                source / name
              </span>

              <input
                className={
                  styles.input
                }
                type="text"
                value={
                  source
                }
                onChange={(
                  event,
                ) => {
                  setSource(
                    event.target
                      .value,
                  );

                  setCopyStatus(
                    initialState,
                  );
                }}
                placeholder={
                  locale ===
                  "en"
                    ? "NATSX"
                    : "Leave empty to use English"
                }
                maxLength={
                  160
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
                role / context
              </span>

              <input
                className={
                  styles.input
                }
                type="text"
                value={
                  context
                }
                onChange={(
                  event,
                ) => {
                  setContext(
                    event.target
                      .value,
                  );

                  setCopyStatus(
                    initialState,
                  );
                }}
                placeholder={
                  locale ===
                  "en"
                    ? "Creative Direction"
                    : "Leave empty to use English"
                }
                maxLength={
                  200
                }
                disabled={
                  isCopyPending
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
              styles.quoteFooter
            }
          >
            <p>
              {locale ===
              "en"
                ? "English quote text adalah canonical fallback."
                : "Field kosong akan fallback ke English secara individual."}
            </p>

            <button
              className={
                styles.mediaPrimaryButton
              }
              type="button"
              onClick={
                handleSaveCopy
              }
              disabled={
                isCopyPending
              }
            >
              {isCopyPending
                ? `Saving ${locale.toUpperCase()} quote...`
                : `Save ${locale.toUpperCase()} quote copy ↗`}
            </button>
          </div>
        </div>
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
            SHARED QUOTE LAYOUT
          </span>

          <p>
            Alignment digunakan
            bersama oleh English,
            Indonesia, dan Deutsch.
          </p>
        </div>

        <label
          className={
            styles.field
          }
        >
          <span>
            Alignment
          </span>

          <select
            className={
              styles.input
            }
            value={
              alignment
            }
            onChange={(
              event,
            ) => {
              const value =
                event.target
                  .value;

              if (
                value ===
                  "left" ||
                value ===
                  "center"
              ) {
                setAlignment(
                  value,
                );

                setAlignmentStatus(
                  initialState,
                );
              }
            }}
            disabled={
              isAlignmentPending
            }
          >
            <option value="left">
              Left
            </option>

            <option value="center">
              Center
            </option>
          </select>
        </label>

        {alignmentStatus.message ? (
          <div
            className={
              styles.mediaStatus
            }
            data-type={
              alignmentStatus.status
            }
            role="status"
            aria-live="polite"
          >
            <span />

            <p>
              {
                alignmentStatus.message
              }
            </p>
          </div>
        ) : null}

        <div
          className={
            styles.quoteFooter
          }
        >
          <p>
            Perubahan alignment
            langsung berlaku ke
            seluruh locale.
          </p>

          <button
            className={
              styles.mediaPrimaryButton
            }
            type="button"
            onClick={
              handleSaveAlignment
            }
            disabled={
              isAlignmentPending ||
              !hasAlignmentChange
            }
          >
            {isAlignmentPending
              ? "Saving alignment..."
              : "Save shared alignment ↗"}
          </button>
        </div>
      </div>
    </section>
  );
}