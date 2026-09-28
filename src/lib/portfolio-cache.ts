export const PUBLIC_PORTFOLIO_CACHE_TAG =
  "natsx-public-portfolio";

/*
 * Public data changes through the CMS, which invalidates this tag explicitly.
 * A 24h safety TTL avoids needless Supabase reads when content is unchanged.
 */
export const PUBLIC_PORTFOLIO_CACHE_REVALIDATE_SECONDS =
  24 * 60 * 60;