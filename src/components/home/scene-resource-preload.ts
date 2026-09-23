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
  };

export type SceneResourcePriority =
  | "high"
  | "low"
  | "auto";

async function consumeResponse(
  response: Response,
) {
  if (
    !response.ok ||
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

export function canWarmSceneResources() {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return false;
  }

  const connection =
    (
      navigator as
        NavigatorWithConnection
    ).connection;

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

  priority:
    SceneResourcePriority =
      "low",
) {
  if (!url) {
    return Promise.resolve();
  }

  const existing =
    warmedResources.get(
      url,
    );

  if (existing) {
    return existing;
  }

  const request =
    fetch(
      url,
      {
        cache:
          "force-cache",

        priority,
      } as RequestInit,
    )
      .then(
        consumeResponse,
      )
      .catch(
        () => {
          /*
           * Preloading is opportunistic.
           * The actual scene loader still
           * owns the visible-state fallback.
           */
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

  priority:
    SceneResourcePriority =
      "low",
) {
  if (
    !canWarmSceneResources()
  ) {
    return;
  }

  const queue =
    urls.filter(
      (
        url,
      ): url is string =>
        Boolean(
          url,
        ),
    );

  let cursor =
    0;

  async function worker() {
    while (
      cursor <
      queue.length
    ) {
      const index =
        cursor;

      cursor +=
        1;

      await warmSceneResource(
        queue[
          index
        ],
        priority,
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
