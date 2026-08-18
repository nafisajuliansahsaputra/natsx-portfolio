export type MetricsColumnCount = 2 | 3 | 4;

export type MetricsSectionItem = {
  id: string;
  value: string;
  label: string;
  detail: string;
};

export type MetricsSectionContent = {
  columns: MetricsColumnCount;
  items: MetricsSectionItem[];
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function isMetricsColumnCount(
  value: unknown,
): value is MetricsColumnCount {
  return (
    value === 2 ||
    value === 3 ||
    value === 4
  );
}

export function getMetricsSectionContent(
  content: unknown,
): MetricsSectionContent {
  if (
    !isRecord(content) ||
    !isRecord(content.metrics)
  ) {
    return {
      columns: 3,
      items: [],
    };
  }

  const metrics = content.metrics;

  const columns =
    isMetricsColumnCount(
      metrics.columns,
    )
      ? metrics.columns
      : 3;

  if (!Array.isArray(metrics.items)) {
    return {
      columns,
      items: [],
    };
  }

  const items: MetricsSectionItem[] =
    [];

  for (const value of metrics.items) {
    if (
      !isRecord(value) ||
      typeof value.id !== "string" ||
      !value.id
    ) {
      continue;
    }

    items.push({
      id: value.id,

      value:
        typeof value.value === "string"
          ? value.value
          : "",

      label:
        typeof value.label === "string"
          ? value.label
          : "",

      detail:
        typeof value.detail === "string"
          ? value.detail
          : "",
    });
  }

  return {
    columns,
    items,
  };
}