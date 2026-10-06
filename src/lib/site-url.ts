const CANONICAL_SITE_URL =
  "https://natsx.my.id";

function normalizeUrl(
  value: string,
) {
  const withProtocol =
    /^https?:\/\//i.test(
      value,
    )
      ? value
      : `https://${value}`;

  return new URL(
    withProtocol,
  )
    .toString()
    .replace(
      /\/$/,
      "",
    );
}

export function getSiteUrl() {
  const explicitUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.trim();

  if (explicitUrl) {
    return normalizeUrl(
      explicitUrl,
    );
  }

  if (
    process.env.VERCEL ===
    "1"
  ) {
    return CANONICAL_SITE_URL;
  }

  return "http://localhost:3000";
}

export function getAbsoluteUrl(
  path = "/",
) {
  return new URL(
    path,
    `${getSiteUrl()}/`,
  ).toString();
}