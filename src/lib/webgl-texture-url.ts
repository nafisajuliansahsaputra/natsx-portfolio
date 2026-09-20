const DEFAULT_QUALITY = 75;

export function getWebglTextureUrl(
  source: string | null,
  width: 1200 | 1920,
  quality = DEFAULT_QUALITY,
) {
  if (!source) {
    return null;
  }

  if (source.startsWith("/_next/image?")) {
    return source;
  }

  const params = new URLSearchParams({
    url: source,
    w: String(width),
    q: String(quality),
  });

  return `/_next/image?${params.toString()}`;
}
