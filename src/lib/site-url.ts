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

  const vercelProductionUrl =
    process.env
      .VERCEL_PROJECT_PRODUCTION_URL
      ?.trim();

  if (
    vercelProductionUrl
  ) {
    return normalizeUrl(
      vercelProductionUrl,
    );
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