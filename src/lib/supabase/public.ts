import {
  createClient as createSupabaseClient,
} from "@supabase/supabase-js";

const PUBLIC_SUPABASE_TIMEOUT_MS =
  4_000;

async function fetchPublicSupabase(
  input:
    Parameters<
      typeof fetch
    >[0],

  init?:
    Parameters<
      typeof fetch
    >[1],
) {
  const controller =
    new AbortController();

  const callerSignal =
    init
      ?.signal;

  const abortFromCaller =
    () => {
      controller.abort();
    };

  if (
    callerSignal
  ) {
    if (
      callerSignal
        .aborted
    ) {
      controller.abort();
    } else {
      callerSignal.addEventListener(
        "abort",
        abortFromCaller,
        {
          once:
            true,
        },
      );
    }
  }

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      PUBLIC_SUPABASE_TIMEOUT_MS,
    );

  try {
    return await fetch(
      input,
      {
        ...init,

        /*
         * The public loaders already sit behind Next unstable_cache. Avoid a
         * second raw-fetch cache layer so freshness/invalidation has one
         * explicit owner.
         */
        cache:
          "no-store",

        signal:
          controller.signal,
      },
    );
  } finally {
    clearTimeout(
      timeout,
    );

    callerSignal
      ?.removeEventListener(
        "abort",
        abortFromCaller,
      );
  }
}

export function createPublicClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {
    throw new Error(
      "Supabase public environment variables are missing.",
    );
  }

  return createSupabaseClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,

        detectSessionInUrl:
          false,
      },

      global: {
        fetch:
          fetchPublicSupabase,
      },
    },
  );
}
