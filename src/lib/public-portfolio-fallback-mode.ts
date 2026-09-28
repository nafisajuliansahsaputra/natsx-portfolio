/*
 * Temporary circuit breaker for the current Supabase Fair Use restriction.
 *
 * The organization quota resets on October 18, 2026. Keep public reads on
 * the checked-in snapshot through the following UTC day so visitors do not
 * repeatedly hit an API that is known to return 402.
 *
 * After this timestamp the normal Supabase loaders automatically become the
 * primary source again, while their try/catch snapshot fallback remains.
 */
const PUBLIC_SNAPSHOT_UNTIL =
  Date.UTC(
    2026,
    9,
    19,
    0,
    0,
    0,
  );

export function shouldUsePublicPortfolioSnapshot() {
  return Date.now() <
    PUBLIC_SNAPSHOT_UNTIL;
}
