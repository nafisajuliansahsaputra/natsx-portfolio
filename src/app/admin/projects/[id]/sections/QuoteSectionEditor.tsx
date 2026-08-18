"use client";

import {
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  getQuoteSectionContent,
  type QuoteAlignment,
  type QuoteSectionContent,
} from "@/lib/project-section-content";

import {
  saveQuoteSectionContent,
  type SectionActionState,
} from "./actions";

import styles from "./sections.module.css";

const initialState: SectionActionState = {
  status: "idle",
  message: "",
};

export default function QuoteSectionEditor({
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

  const initialQuote =
    getQuoteSectionContent(
      section.content,
    );

  const [text, setText] =
    useState(
      initialQuote.text,
    );

  const [source, setSource] =
    useState(
      initialQuote.source,
    );

  const [context, setContext] =
    useState(
      initialQuote.context,
    );

  const [
    alignment,
    setAlignment,
  ] = useState<QuoteAlignment>(
    initialQuote.alignment,
  );

  const [
    isPending,
    setIsPending,
  ] = useState(false);

  const [status, setStatus] =
    useState<SectionActionState>(
      initialState,
    );

  async function handleSave() {
    setIsPending(true);
    setStatus(initialState);

    const payload: QuoteSectionContent =
      {
        text: text.trim(),
        source:
          source.trim(),
        context:
          context.trim(),
        alignment,
      };

    try {
      const result =
        await saveQuoteSectionContent(
          projectId,
          section.id,
          payload,
        );

      setStatus(result);

      if (
        result.status ===
        "success"
      ) {
        setText(
          payload.text,
        );

        setSource(
          payload.source,
        );

        setContext(
          payload.context,
        );

        router.refresh();
      }
    } catch {
      setStatus({
        status: "error",

        message:
          "Gagal menyimpan quote. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setIsPending(false);
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
          QUOTE CONTENT
        </span>

        <p>
          Gunakan quote sebagai
          statement besar,
          testimonial, insight,
          atau kalimat utama yang
          memperkuat cerita project.
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
            {text ||
              "A strong statement can become a visual pause in the case study."}
          </blockquote>

          {(source ||
            context) && (
            <div
              className={
                styles.quoteAttribution
              }
            >
              {source ? (
                <strong>
                  {source}
                </strong>
              ) : null}

              {context ? (
                <span>
                  {context}
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
          <label
            className={
              styles.field
            }
          >
            <span>
              Quote text *
            </span>

            <textarea
              className={
                styles.textarea
              }
              value={text}
              onChange={(
                event,
              ) => {
                setText(
                  event.target
                    .value,
                );

                setStatus(
                  initialState,
                );
              }}
              placeholder="Write the quote or main statement"
              rows={7}
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
              styles.quoteFieldGrid
            }
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                Source / name
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

                  setStatus(
                    initialState,
                  );
                }}
                placeholder="NATSX"
                maxLength={
                  160
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
                Role / context
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

                  setStatus(
                    initialState,
                  );
                }}
                placeholder="Creative Direction"
                maxLength={
                  200
                }
                disabled={
                  isPending
                }
              />
            </label>
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

                  setStatus(
                    initialState,
                  );
                }
              }}
              disabled={
                isPending
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
          styles.quoteFooter
        }
      >
        <p>
          Quote wajib memiliki
          teks. Source dan context
          bersifat opsional.
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
            ? "Saving quote..."
            : "Save quote ↗"}
        </button>
      </div>
    </section>
  );
}