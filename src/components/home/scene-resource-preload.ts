const warmedResources =
  new Map<
    string,
    Promise<void>
  >();

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

export function warmSceneResource(
  url:
    | string
    | null
    | undefined,
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
      },
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

export function warmSceneResources(
  urls:
    Array<
      | string
      | null
      | undefined
    >,
) {
  return Promise.all(
    urls.map(
      warmSceneResource,
    ),
  ).then(
    () => undefined,
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
