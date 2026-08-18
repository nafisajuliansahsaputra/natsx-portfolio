"use client";

import {
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  getMetricsSectionContent,
  type MetricsColumnCount,
  type MetricsSectionContent,
  type MetricsSectionItem,
} from "@/lib/project-section-content";

import {
  saveMetricsSectionContent,
  type SectionActionState,
} from "./actions";

import styles from "./sections.module.css";

const initialState: SectionActionState = {
  status: "idle",
  message: "",
};

export default function MetricsSectionEditor({
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

  const initialMetrics =
    getMetricsSectionContent(
      section.content,
    );

  const [columns, setColumns] =
    useState<MetricsColumnCount>(
      initialMetrics.columns,
    );

  const [items, setItems] =
    useState<MetricsSectionItem[]>(
      initialMetrics.items,
    );

  const [isPending, setIsPending] =
    useState(false);

  const [status, setStatus] =
    useState<SectionActionState>(
      initialState,
    );

  function addMetric() {
    if (items.length >= 12) {
      setStatus({
        status: "error",
        message:
          "Maksimal 12 metrics dalam satu section.",
      });

      return;
    }

    setItems((current) => [
      ...current,

      {
        id:
          globalThis.crypto.randomUUID(),

        value: "",
        label: "",
        detail: "",
      },
    ]);

    setStatus(initialState);
  }

  function updateMetric(
    itemId: string,
    field:
      | "value"
      | "label"
      | "detail",
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

    setStatus(initialState);
  }

  function removeMetric(
    itemId: string,
  ) {
    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== itemId,
      ),
    );

    setStatus({
      status: "idle",
      message:
        "Metric removed from draft. Save metrics to apply the change.",
    });
  }

  function moveMetric(
    itemId: string,
    direction: "up" | "down",
  ) {
    setItems((current) => {
      const currentIndex =
        current.findIndex(
          (item) =>
            item.id === itemId,
        );

      if (currentIndex === -1) {
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

      const next = [...current];

      [
        next[currentIndex],
        next[destinationIndex],
      ] = [
        next[destinationIndex],
        next[currentIndex],
      ];

      return next;
    });

    setStatus(initialState);
  }

  async function handleSave() {
    setIsPending(true);
    setStatus(initialState);

    const payload: MetricsSectionContent =
      {
        columns,

        items: items.map(
          (item) => ({
            id: item.id,
            value: item.value.trim(),
            label: item.label.trim(),
            detail:
              item.detail.trim(),
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

      setStatus(result);

      if (
        result.status ===
        "success"
      ) {
        setItems(payload.items);

        router.refresh();
      }
    } catch {
      setStatus({
        status: "error",
        message:
          "Gagal menyimpan metrics. Refresh halaman lalu coba lagi.",
      });
    } finally {
      setIsPending(false);
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
            METRICS CONTENT
          </span>

          <strong>
            {String(
              items.length,
            ).padStart(2, "0")}{" "}
            METRICS
          </strong>
        </div>

        <p>
          Tampilkan hasil,
          pencapaian, angka, atau
          highlight penting dari
          project dalam format
          statistik.
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
            value={columns}
            disabled={
              isPending
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

                setStatus(
                  initialState,
                );
              }
            }}
          >
            <option value={2}>
              2 columns
            </option>

            <option value={3}>
              3 columns
            </option>

            <option value={4}>
              4 columns
            </option>
          </select>
        </label>

        <button
          className={
            styles.metricsAddButton
          }
          type="button"
          onClick={addMetric}
          disabled={
            isPending ||
            items.length >= 12
          }
        >
          + Add metric
        </button>
      </div>

      {items.length === 0 ? (
        <div
          className={
            styles.metricsEmpty
          }
        >
          <span>
            NO METRICS YET
          </span>

          <p>
            Tambahkan angka atau
            hasil penting untuk
            section ini.
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
            ) => (
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
                      index + 1,
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
                        isPending ||
                        index === 0
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
                        isPending ||
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
                    {item.value ||
                      "—"}
                  </strong>

                  <span>
                    {item.label ||
                      "Metric label"}
                  </span>
                </div>

                <div
                  className={
                    styles.metricFields
                  }
                >
                  <label
                    className={
                      styles.field
                    }
                  >
                    <span>
                      Value *
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
                      placeholder="48%"
                      maxLength={
                        40
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
                      Label *
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
                      placeholder="Conversion increase"
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
                      placeholder="Optional context"
                      rows={3}
                      maxLength={
                        300
                      }
                      disabled={
                        isPending
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
                      isPending
                    }
                  >
                    Remove
                  </button>
                </footer>
              </article>
            ),
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
          styles.metricsFooter
        }
      >
        <p>
          Value mendukung format
          bebas seperti 48%, 2.4x,
          100+, 03, atau teks
          pendek lainnya.
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
            ? "Saving metrics..."
            : "Save metrics ↗"}
        </button>
      </div>
    </section>
  );
}