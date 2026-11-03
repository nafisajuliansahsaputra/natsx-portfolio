type StructuredDataProps = {
  data: Record<string, unknown>;
};

/**
 * Safely serialize server-provided JSON-LD without changing visible UI.
 */
export default function StructuredData({
  data,
}: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
