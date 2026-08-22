import {
  getFinaleSectionMedia,
  type FinaleSectionMedia,
} from "@/lib/portfolio-media";

export type MetricsColumnCount =
  | 2
  | 3
  | 4;

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

export type QuoteAlignment =
  | "left"
  | "center";

export type QuoteSectionContent = {
  text: string;
  source: string;
  context: string;
  alignment: QuoteAlignment;
};

export type FinaleSectionContent = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  media: FinaleSectionMedia | null;
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

export function isQuoteAlignment(
  value: unknown,
): value is QuoteAlignment {
  return (
    value === "left" ||
    value === "center"
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

  const metrics: Record<
    string,
    unknown
  > = content.metrics;

  const columns =
    isMetricsColumnCount(
      metrics.columns,
    )
      ? metrics.columns
      : 3;

  const metricItems =
    metrics.items;

  if (
    !Array.isArray(
      metricItems,
    )
  ) {
    return {
      columns,
      items: [],
    };
  }

  const copyById: Record<
    string,
    unknown
  > = isRecord(
    metrics.copyById,
  )
    ? metrics.copyById
    : {};

  const items:
    MetricsSectionItem[] =
    [];

  for (
    const value of
    metricItems
  ) {
    if (
      !isRecord(value) ||
      typeof value.id !==
        "string" ||
      !value.id
    ) {
      continue;
    }

    const baseValue =
      typeof value.value ===
      "string"
        ? value.value
        : "";

    const baseLabel =
      typeof value.label ===
      "string"
        ? value.label
        : "";

    const baseDetail =
      typeof value.detail ===
      "string"
        ? value.detail
        : "";

    const localizedValue =
      copyById[value.id];

    const localizedCopy:
      | Record<
          string,
          unknown
        >
      | null =
      isRecord(
        localizedValue,
      )
        ? localizedValue
        : null;

    items.push({
      id:
        value.id,

      value:
        localizedCopy &&
        typeof localizedCopy.value ===
          "string"
          ? localizedCopy.value
          : baseValue,

      label:
        localizedCopy &&
        typeof localizedCopy.label ===
          "string"
          ? localizedCopy.label
          : baseLabel,

      detail:
        localizedCopy &&
        typeof localizedCopy.detail ===
          "string"
          ? localizedCopy.detail
          : baseDetail,
    });
  }

  return {
    columns,
    items,
  };
}

export function getQuoteSectionContent(
  content: unknown,
): QuoteSectionContent {
  if (
    !isRecord(content) ||
    !isRecord(content.quote)
  ) {
    return {
      text: "",
      source: "",
      context: "",
      alignment: "left",
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

    alignment:
      isQuoteAlignment(
        quote.alignment,
      )
        ? quote.alignment
        : "left",
  };
}

export function getFinaleSectionContent(
  content: unknown,
): FinaleSectionContent {
  const media =
    getFinaleSectionMedia(
      content,
    );

  if (
    !isRecord(content) ||
    !isRecord(content.finale)
  ) {
    return {
      title: "",
      body: "",
      ctaLabel: "",
      ctaUrl: "",
      media,
    };
  }

  const finale =
    content.finale;

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

    ctaUrl:
      typeof finale.ctaUrl ===
      "string"
        ? finale.ctaUrl
        : "",

    media,
  };
}