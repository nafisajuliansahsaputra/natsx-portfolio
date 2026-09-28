import {
  portfolioMediaMirror,
} from "@/data/portfolio-media-mirror";

/*
 * Portfolio media delivery is intentionally provider-agnostic.
 *
 * The database keeps stable bucket/path keys. Public delivery can then be
 * switched to a mirrored CDN without rewriting project rows or section JSON.
 *
 * Example prefixes:
 *   /portfolio-media
 *   https://cdn.example.com/natsx
 *   https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto
 *
 * A mirror must preserve this key shape:
 *   <prefix>/<bucket>/<path>
 */
const configuredPrefix =
  process.env
    .NEXT_PUBLIC_PORTFOLIO_MEDIA_CDN_PREFIX
    ?.trim()
    .replace(
      /\/+$/,
      "",
    ) ??
  "";

function encodeStorageKey(
  value: string,
) {
  return value
    .split("/")
    .filter(Boolean)
    .map(
      (segment) =>
        encodeURIComponent(
          segment,
        ),
    )
    .join("/");
}

export function getPortfolioMediaMirrorUrl(
  bucket: string,
  path: string,
) {
  const stableKey =
    `${bucket}/${path}`;

  const staticMirror =
    portfolioMediaMirror[
      stableKey
    ];

  if (
    staticMirror
  ) {
    return staticMirror;
  }

  if (
    !configuredPrefix
  ) {
    return null;
  }

  const encodedBucket =
    encodeStorageKey(
      bucket,
    );

  const encodedPath =
    encodeStorageKey(
      path,
    );

  if (
    !encodedBucket ||
    !encodedPath
  ) {
    return null;
  }

  return (
    `${configuredPrefix}/` +
    `${encodedBucket}/` +
    encodedPath
  );
}

export function hasPortfolioMediaMirror() {
  return (
    Object.keys(
      portfolioMediaMirror,
    ).length >
      0 ||
    Boolean(
      configuredPrefix,
    )
  );
}
