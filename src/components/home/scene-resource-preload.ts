const warmedResources =
  new Map<
    string,
    Promise<void>
  >();

type NetworkInformationLike = {
  saveData?:
    boolean;

  effectiveType?:
    string;
};

type NavigatorWithConnection =
  Navigator & {
    connection?:
      NetworkInformationLike;

    deviceMemory?:
      number;
  };

async function consumeResponse(
  response: Response,
) {
  if (
    !response.ok
  ) {
    throw new Error(
      `Scene resource warm failed with HTTP ${response.status}.`,
    );
  }

  if (
    !response.body
  ) {
    return;
  }

  const reader =
    response.body.getReader();

  try {
    while (true) {
      const {
        done,
      } =
        await reader.read();

      if (done) {
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function getRuntimeNavigator() {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return null;
  }

  return navigator as
    NavigatorWithConnection;
}

function isConstrainedSceneWarmDevice() {
  const runtimeNavigator =
    getRuntimeNavigator();

  if (
    !runtimeNavigator
  ) {
    return false;
  }

  const effectiveType =
    runtimeNavigator
      .connection
      ?.effectiveType;

  const deviceMemory =
    runtimeNavigator
      .deviceMemory;

  return (
    effectiveType ===
      "3g" ||
    (
      typeof deviceMemory ===
        "number" &&
      deviceMemory <=
        4
    ) ||
    runtimeNavigator
      .hardwareConcurrency <=
      4
  );
}

export function canWarmSceneResources() {
  const runtimeNavigator =
    getRuntimeNavigator();

  if (
    !runtimeNavigator
  ) {
    return false;
  }

  if (
    typeof document !==
      "undefined" &&
    document.hidden
  ) {
    return false;
  }

  const connection =
    runtimeNavigator
      .connection;

  if (
    connection
      ?.saveData
  ) {
    return false;
  }

  const effectiveType =
    connection
      ?.effectiveType;

  return (
    effectiveType !==
      "slow-2g" &&
    effectiveType !==
      "2g"
  );
}

export function warmSceneResource(
  url:
    | string
    | null
    | undefined,

  signal?:
    AbortSignal,
) {
  if (
    !url ||
    signal
      ?.aborted
  ) {
    return Promise.resolve();
  }

  const existing =
    warmedResources.get(
      url,
    );

  if (existing) {
    return existing;
  }

  let request:
    Promise<void>;

  request =
    fetch(
      url,
      {
        cache:
          "force-cache",

        priority:
          "low",

        signal,
      } as RequestInit,
    )
      .then(
        consumeResponse,
      )
      .catch(
        () => {
          /*
           * A failed/aborted speculative warm must be retryable.
           * The visible scene loader remains the source of truth.
           */
          if (
            warmedResources.get(
              url,
            ) ===
            request
          ) {
            warmedResources.delete(
              url,
            );
          }
        },
      );

  warmedResources.set(
    url,
    request,
  );

  return request;
}

export async function warmSceneResources(
  urls:
    Array<
      | string
      | null
      | undefined
    >,

  concurrency =
    1,

  signal?:
    AbortSignal,
) {
  if (
    !canWarmSceneResources() ||
    signal
      ?.aborted
  ) {
    return;
  }

  const queue =
    Array.from(
      new Set(
        urls.filter(
          (
            url,
          ): url is string =>
            Boolean(
              url,
            ),
        ),
      ),
    );

  let cursor =
    0;

  async function worker() {
    while (
      cursor <
        queue.length &&
      !signal
        ?.aborted
    ) {
      const index =
        cursor;

      cursor +=
        1;

      await warmSceneResource(
        queue[
          index
        ],
        signal,
      );
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            Math.max(
              concurrency,
              1,
            ),
            queue.length,
          ),
      },
      () =>
        worker(),
    ),
  );
}

export function getSceneMargin(
  viewportMultiplier:
    number,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return "0px";
  }

  return `${Math.max(
    Math.round(
      window.innerHeight *
        viewportMultiplier,
    ),
    1,
  )}px 0px`;
}

export function getSceneWarmMargin(
  viewportMultiplier:
    number,
) {
  const adaptiveMultiplier =
    isConstrainedSceneWarmDevice()
      ? Math.max(
          viewportMultiplier *
            0.55,
          0.4,
        )
      : viewportMultiplier;

  return getSceneMargin(
    adaptiveMultiplier,
  );
}
