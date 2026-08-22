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
  getMetricsSectionContent,
  type MetricsColumnCount,
  type MetricsSectionContent,
} from "@/lib/project-section-content";

import {
  saveMetricsSectionContent,
  type SectionActionState,
} from "./actions";

import {
  saveMetricsSectionLocalizedCopy,
  type MetricsLocalizedCopyInput,
  type SpecializedTranslationState,
} from "./specialized-translation-actions";

import styles from "./sections.module.css";

type MetricDraftItem = {
  id: string;

  baseValue: string;
  baseLabel: string;
  baseDetail: string;

  value: string;
  label: string;
  detail: string;

  isNew: boolean;
};

type MetricsSectionEditorProps = {
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

type MetricLocalizedCopy = {
  value: string;
  label: string;
  detail: string;
};

const initialMediaState:
  SectionActionState = {
  status:
    "idle",

  message:
    "",
};

const initialTranslationState:
  SpecializedTranslationState = {
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

function getLocalizedMetricsCopy(
  content: Record<
    string,
    unknown
  >,
) {
  const result =
    new Map<
      string,
      MetricLocalizedCopy
    >();

  if (
    !isRecord(
      content.metrics,
    ) ||
    !isRecord(
      content.metrics
        .copyById,
    )
  ) {
    return result;
  }

  for (
    const [
      itemId,
      value,
    ] of Object.entries(
      content.metrics
        .copyById,
    )
  ) {
    if (
      !isRecord(
        value,
      )
    ) {
      continue;
    }

    result.set(
      itemId,
      {
        value:
          typeof value.value ===
          "string"
            ? value.value
            : "",

        label:
          typeof value.label ===
          "string"
            ? value.label
            : "",

        detail:
          typeof value.detail ===
          "string"
            ? value.detail
            : "",
      },
    );
  }

  return result;
}

function getStructureKey(
  columns:
    MetricsColumnCount,

  items: Array<{
    id: string;
  }>,
) {
  return (
    `${columns}:` +
    items
      .map(
        (
          item,
        ) =>
          item.id,
      )
      .join(
        "|",
      )
  );
}

export default function MetricsSectionEditor({
  projectId,
  section,
  locale,
  translationContent,
}: MetricsSectionEditorProps) {
  const router =
    useRouter();

  const initialMetrics =
    getMetricsSectionContent(
      section.content,
    );

  const localizedCopy =
    getLocalizedMetricsCopy(
      translationContent,
    );

  const [
    columns,
    setColumns,
  ] =
    useState<
      MetricsColumnCount
    >(
      initialMetrics.columns,
    );

  const [
    items,
    setItems,
  ] =
    useState<
      MetricDraftItem[]
    >(
      () =>
        initialMetrics.items.map(
          (
            item,
          ) => {
            const copy =
              localizedCopy.get(
                item.id,
              );

            return {
              id:
                item.id,

              baseValue:
                item.value,

              baseLabel:
                item.label,

              baseDetail:
                item.detail,

              value:
                locale ===
                "en"
                  ? item.value
                  : copy?.value ??
                    "",

              label:
                locale ===
                "en"
                  ? item.label
                  : copy?.label ??
                    "",

              detail:
                locale ===
                "en"
                  ? item.detail
                  : copy?.detail ??
                    "",

              isNew:
                false,
            };
          },
        ),
    );

  const [
    savedStructureKey,
    setSavedStructureKey,
  ] =
    useState(
      getStructureKey(
        initialMetrics.columns,
        initialMetrics.items,
      ),
    );

  const [
    isStructurePending,
    setIsStructurePending,
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
    structureStatus,
    setStructureStatus,
  ] =
    useState<
      SectionActionState
    >(
      initialMediaState,
    );

  const [
    copyStatus,
    setCopyStatus,
  ] =
    useState<
      SpecializedTranslationState
    >(
      initialTranslationState,
    );

  const hasSharedDraftChanges =
    getStructureKey(
      columns,
      items,
    ) !==
    savedStructureKey;

  function addMetric() {
    if (
      locale !== "en"
    ) {
      setStructureStatus({
        status:
          "error",

        message:
          "Metric baru harus dibuat dari tab English agar canonical value dan label dapat diisi.",
      });

      return;
    }

    if (
      items.length >=
      12
    ) {
      setStructureStatus({
        status:
          "error",

        message:
          "Maksimal 12 metrics dalam satu section.",
      });

      return;
    }

    setItems(
      (
        current,
      ) => [
        ...current,

        {
          id:
            globalThis.crypto.randomUUID(),

          baseValue:
            "",

          baseLabel:
            "",

          baseDetail:
            "",

          value:
            "",

          label:
            "",

          detail:
            "",

          isNew:
            true,
        },
      ],
    );

    setStructureStatus(
      initialMediaState,
    );

    setCopyStatus(
      initialTranslationState,
    );
  }

  function updateMetric(
    itemId: string,

    field:
      | "value"
      | "label"
      | "detail",

    value: string,
  ) {
    setItems(
      (
        current,
      ) =>
        current.map(
          (
            item,
          ) =>
            item.id ===
            itemId
              ? {
                  ...item,

                  [field]:
                    value,
                }
              : item,
        ),
    );

    setCopyStatus(
      initialTranslationState,
    );
  }

  function removeMetric(
    itemId: string,
  ) {
    setItems(
      (
        current,
      ) =>
        current.filter(
          (
            item,
          ) =>
            item.id !==
            itemId,
        ),
    );

    setStructureStatus({
      status:
        "idle",

      message:
        "Metric removed from shared draft. Save shared metrics structure to apply the change.",
    });
  }

  function moveMetric(
    itemId: string,

    direction:
      | "up"
      | "down",
  ) {
    setItems(
      (
        current,
      ) => {
        const currentIndex =
          current.findIndex(
            (
              item,
            ) =>
              item.id ===
              itemId,
          );

        if (
          currentIndex ===
          -1
        ) {
          return current;
        }

        const destinationIndex =
          direction ===
          "up"
            ? currentIndex -
              1
            : currentIndex +
              1;

        if (
          destinationIndex <
            0 ||
          destinationIndex >=
            current.length
        ) {
          return current;
        }

        const next = [
          ...current,
        ];

        [
          next[
            currentIndex
          ],

          next[
            destinationIndex
          ],
        ] = [
          next[
            destinationIndex
          ],

          next[
            currentIndex
          ],
        ];

        return next;
      },
    );

    setStructureStatus(
      initialMediaState,
    );
  }

  async function handleSaveSharedStructure() {
    setIsStructurePending(
      true,
    );

    setStructureStatus(
      initialMediaState,
    );

    const newItemWithoutEnglishCopy =
      items.find(
        (
          item,
        ) =>
          item.isNew &&
          (!item.value.trim() ||
            !item.label.trim()),
      );

    if (
      newItemWithoutEnglishCopy
    ) {
      setStructureStatus({
        status:
          "error",

        message:
          "Metric baru wajib memiliki English value dan label sebelum shared structure disimpan.",
      });

      setIsStructurePending(
        false,
      );

      return;
    }

    const payload:
      MetricsSectionContent = {
      columns,

      items:
        items.map(
          (
            item,
          ) => ({
            id:
              item.id,

            value:
              (
                item.isNew
                  ? item.value
                  : item.baseValue
              ).trim(),

            label:
              (
                item.isNew
                  ? item.label
                  : item.baseLabel
              ).trim(),

            detail:
              (
                item.isNew
                  ? item.detail
                  : item.baseDetail
              ).trim(),
          }),
        ),
    };

    try {
      const result =
        await saveMetricsSectionContent(
          projectId,
          section.id,
          payload,
        );

      setStructureStatus(
        result,
      );

      if (
        result.status ===
        "success"
      ) {
        const savedById =
          new Map(
            payload.items.map(
              (
                item,
              ) =>
                [
                  item.id,
                  item,
                ] as const,
            ),
          );

        setItems(
          (
            current,
          ) =>
            current.map(
              (
                item,
              ) => {
                const saved =
                  savedById.get(
                    item.id,
                  );

                if (
                  !saved
                ) {
                  return item;
                }

                return {
                  ...item,

                  baseValue:
                    saved.value,

                  baseLabel:
                    saved.label,

                  baseDetail:
                    saved.detail,

                  value:
                    item.isNew &&
                    locale ===
                      "en"
                      ? saved.value
                      : item.value,

                  label:
                    item.isNew &&
                    locale ===
                      "en"
                      ? saved.label
                      : item.label,

                  detail:
                    item.isNew &&
                    locale ===
                      "en"
                      ? saved.detail
                      : item.detail,

                  isNew:
                    false,
                };
              },
            ),
        );

        setSavedStructureKey(
          getStructureKey(
            payload.columns,
            payload.items,
          ),
        );

        router.refresh();
      }
    } catch {
      setStructureStatus({
        status:
          "error",

        message:
          "Gagal menyimpan shared metrics structure. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setIsStructurePending(
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
          "Simpan shared metrics structure terlebih dahulu sebelum menyimpan translation.",
      });

      return;
    }

    const payload:
      MetricsLocalizedCopyInput[] =
      items.map(
        (
          item,
        ) => ({
          id:
            item.id,

          value:
            item.value,

          label:
            item.label,

          detail:
            item.detail,
        }),
      );

    setIsCopyPending(
      true,
    );

    setCopyStatus(
      initialTranslationState,
    );

    try {
      const result =
        await saveMetricsSectionLocalizedCopy(
          projectId,
          section.id,
          locale,
          payload,
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
          setItems(
            (
              current,
            ) =>
              current.map(
                (
                  item,
                ) => ({
                  ...item,

                  baseValue:
                    item.value.trim(),

                  baseLabel:
                    item.label.trim(),

                  baseDetail:
                    item.detail.trim(),

                  value:
                    item.value.trim(),

                  label:
                    item.label.trim(),

                  detail:
                    item.detail.trim(),
                }),
              ),
          );
        }

        router.refresh();
      }
    } catch {
      setCopyStatus({
        status:
          "error",

        message:
          "Gagal menyimpan localized metrics copy. Refresh halaman lalu coba lagi.",
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
        styles.metricsEditor
      }
    >
      <div
        className={
          styles.metricsEditorHeader
        }
      >
        <div>
          <span>
            SHARED METRICS STRUCTURE
          </span>

          <strong>
            {String(
              items.length,
            ).padStart(
              2,
              "0",
            )}{" "}
            METRICS
          </strong>
        </div>

        <p>
          Columns, jumlah metric,
          urutan, add, dan remove
          adalah shared untuk semua
          bahasa. Value, label, dan
          detail mengikuti bahasa
          aktif.
        </p>
      </div>

      <div
        className={
          styles.metricsToolbar
        }
      >
        <label
          className={
            styles.metricsColumns
          }
        >
          <span>
            Desktop columns
          </span>

          <select
            className={
              styles.input
            }
            value={
              columns
            }
            disabled={
              isStructurePending
            }
            onChange={(
              event,
            ) => {
              const value =
                Number(
                  event.target
                    .value,
                );

              if (
                value === 2 ||
                value === 3 ||
                value === 4
              ) {
                setColumns(
                  value,
                );

                setStructureStatus(
                  initialMediaState,
                );
              }
            }}
          >
            <option
              value={2}
            >
              2 columns
            </option>

            <option
              value={3}
            >
              3 columns
            </option>

            <option
              value={4}
            >
              4 columns
            </option>
          </select>
        </label>

        <button
          className={
            styles.metricsAddButton
          }
          type="button"
          onClick={
            addMetric
          }
          title={
            locale ===
            "en"
              ? undefined
              : "Switch to English to add a new metric"
          }
          disabled={
            isStructurePending ||
            items.length >=
              12 ||
            locale !==
              "en"
          }
        >
          + Add metric
        </button>
      </div>

      {locale !==
      "en" ? (
        <p
          className={
            styles.sectionLanguageHint
          }
        >
          Metric baru hanya dapat
          dibuat dari tab{" "}
          <strong>
            English
          </strong>{" "}
          karena value dan label
          canonical wajib tersedia.
          Reorder, remove, dan
          columns tetap shared.
        </p>
      ) : null}

      {items.length ===
      0 ? (
        <div
          className={
            styles.metricsEmpty
          }
        >
          <span>
            NO METRICS YET
          </span>

          <p>
            Tambahkan metric dari
            tab English untuk mulai
            membangun section ini.
          </p>
        </div>
      ) : (
        <div
          className={
            styles.metricsGrid
          }
          data-columns={
            columns
          }
        >
          {items.map(
            (
              item,
              index,
            ) => {
              const previewValue =
                item.value.trim() ||
                (locale !==
                "en"
                  ? item.baseValue
                  : "") ||
                "—";

              const previewLabel =
                item.label.trim() ||
                (locale !==
                "en"
                  ? item.baseLabel
                  : "") ||
                "Metric label";

              return (
                <article
                  className={
                    styles.metricCard
                  }
                  key={
                    item.id
                  }
                >
                  <header
                    className={
                      styles.metricCardHeader
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
                        className={
                          styles.metricsOrderButton
                        }
                        type="button"
                        onClick={() =>
                          moveMetric(
                            item.id,
                            "up",
                          )
                        }
                        disabled={
                          isStructurePending ||
                          index ===
                            0
                        }
                      >
                        ↑
                      </button>

                      <button
                        className={
                          styles.metricsOrderButton
                        }
                        type="button"
                        onClick={() =>
                          moveMetric(
                            item.id,
                            "down",
                          )
                        }
                        disabled={
                          isStructurePending ||
                          index ===
                            items.length -
                              1
                        }
                      >
                        ↓
                      </button>
                    </div>
                  </header>

                  <div
                    className={
                      styles.metricPreview
                    }
                  >
                    <strong>
                      {
                        previewValue
                      }
                    </strong>

                    <span>
                      {
                        previewLabel
                      }
                    </span>
                  </div>

                  <div
                    className={
                      styles.metricFields
                    }
                  >
                    {locale !==
                    "en" ? (
                      <p
                        className={
                          styles.sectionLanguageHint
                        }
                      >
                        English
                        reference —
                        Value:{" "}
                        <strong>
                          {item.baseValue ||
                            "—"}
                        </strong>
                        {" · "}
                        Label:{" "}
                        <strong>
                          {item.baseLabel ||
                            "—"}
                        </strong>
                        {" · "}
                        Detail:{" "}
                        <strong>
                          {item.baseDetail ||
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
                        Value
                        {locale ===
                        "en"
                          ? " *"
                          : ""}
                      </span>

                      <input
                        className={
                          styles.input
                        }
                        type="text"
                        value={
                          item.value
                        }
                        onChange={(
                          event,
                        ) =>
                          updateMetric(
                            item.id,
                            "value",
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder={
                          locale ===
                          "en"
                            ? "48%"
                            : "Leave empty to use English"
                        }
                        maxLength={
                          40
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
                        Label
                        {locale ===
                        "en"
                          ? " *"
                          : ""}
                      </span>

                      <input
                        className={
                          styles.input
                        }
                        type="text"
                        value={
                          item.label
                        }
                        onChange={(
                          event,
                        ) =>
                          updateMetric(
                            item.id,
                            "label",
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder={
                          locale ===
                          "en"
                            ? "Conversion increase"
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
                        Detail
                      </span>

                      <textarea
                        className={
                          styles.textarea
                        }
                        value={
                          item.detail
                        }
                        onChange={(
                          event,
                        ) =>
                          updateMetric(
                            item.id,
                            "detail",
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder={
                          locale ===
                          "en"
                            ? "Optional context"
                            : "Leave empty to use English"
                        }
                        rows={3}
                        maxLength={
                          300
                        }
                        disabled={
                          isCopyPending
                        }
                      />
                    </label>
                  </div>

                  <footer
                    className={
                      styles.metricCardFooter
                    }
                  >
                    <button
                      className={
                        styles.mediaDangerButton
                      }
                      type="button"
                      onClick={() =>
                        removeMetric(
                          item.id,
                        )
                      }
                      disabled={
                        isStructurePending
                      }
                    >
                      Remove
                    </button>
                  </footer>
                </article>
              );
            },
          )}
        </div>
      )}

      {structureStatus.message ? (
        <div
          className={
            styles.mediaStatus
          }
          data-type={
            structureStatus.status
          }
          role="status"
          aria-live="polite"
        >
          <span />

          <p>
            {
              structureStatus.message
            }
          </p>
        </div>
      ) : null}

      <div
        className={
          styles.metricsFooter
        }
      >
        <p>
          Columns, item count,
          order dan remove berlaku
          ke semua bahasa.
        </p>

        <button
          className={
            styles.mediaPrimaryButton
          }
          type="button"
          onClick={
            handleSaveSharedStructure
          }
          disabled={
            isStructurePending ||
            !hasSharedDraftChanges
          }
        >
          {isStructurePending
            ? "Saving shared metrics..."
            : "Save shared metrics ↗"}
        </button>
      </div>

      <div
        className={
          styles.sharedSectionSettings
        }
      >
        <div
          className={
            styles.metricsEditorHeader
          }
        >
          <div>
            <span>
              {locale.toUpperCase()}{" "}
              METRICS COPY
            </span>

            <strong>
              {String(
                items.length,
              ).padStart(
                2,
                "0",
              )}{" "}
              ITEMS
            </strong>
          </div>

          <p>
            Value, label dan detail
            mengikuti bahasa aktif.
            Field kosong pada ID/DE
            akan fallback ke English.
          </p>
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
            styles.metricsFooter
          }
        >
          <p>
            {locale ===
            "en"
              ? "English adalah canonical fallback untuk seluruh metrics copy."
              : "Kosongkan field yang ingin memakai value, label, atau detail English."}
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
              ? `Saving ${locale.toUpperCase()} copy...`
              : `Save ${locale.toUpperCase()} metrics copy ↗`}
          </button>
        </div>
      </div>
    </section>
  );
}