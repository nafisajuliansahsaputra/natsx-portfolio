/*
 * Public portfolio circuit breaker.
 *
 * 1) During the known Supabase Fair Use restriction, public reads stay on the
 *    checked-in snapshot through the day after quota reset.
 *
 * 2) After that incident window, any public-data failure opens a short
 *    in-process runtime circuit so one bad origin/cache refresh does not make
 *    every visitor repeat the same failing Supabase request.
 *
 * The runtime circuit is intentionally short and self-expiring. CMS cache/tag
 * invalidation still controls freshness when Supabase is healthy.
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

const RUNTIME_FAILURE_WINDOW_MS =
  5 * 60 * 1000;

let runtimeSnapshotUntil =
  0;

export function shouldUsePublicPortfolioSnapshot() {
  const now =
    Date.now();

  return (
    now <
      PUBLIC_SNAPSHOT_UNTIL ||
    now <
      runtimeSnapshotUntil
  );
}

export function markPublicPortfolioUnavailable() {
  runtimeSnapshotUntil =
    Math.max(
      runtimeSnapshotUntil,
      Date.now() +
        RUNTIME_FAILURE_WINDOW_MS,
    );
}

export function getPublicPortfolioCircuitState() {
  const now =
    Date.now();

  return {
    incidentSnapshot:
      now <
      PUBLIC_SNAPSHOT_UNTIL,

    runtimeFallback:
      now <
      runtimeSnapshotUntil,

    runtimeFallbackUntil:
      runtimeSnapshotUntil >
      now
        ? runtimeSnapshotUntil
        : null,
  };
}
