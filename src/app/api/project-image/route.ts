import sharp from "sharp";

export const runtime =
  "nodejs";

const CACHE_SECONDS =
  2678400;

const MAX_CONCURRENT_TRANSFORMS =
  2;

let activeTransforms =
  0;

const transformWaiters:
  Array<
    () => void
  > =
  [];

async function withTransformSlot<
  Result,
>(
  task:
    () =>
      Promise<Result>,
) {
  if (
    activeTransforms >=
    MAX_CONCURRENT_TRANSFORMS
  ) {
    await new Promise<void>(
      (
        resolve,
      ) => {
        transformWaiters.push(
          resolve,
        );
      },
    );
  }

  activeTransforms +=
    1;

  try {
    return await task();
  } finally {
    activeTransforms -=
      1;

    transformWaiters
      .shift()
      ?.();
  }
}

function getSafeWidth(
  value:
    string | null,
) {
  const parsed =
    Number.parseInt(
      value ?? "",
      10,
    );

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 720;
  }

  return Math.min(
    Math.max(
      parsed,
      320,
    ),
    1200,
  );
}

function getSafeQuality(
  value:
    string | null,
) {
  const parsed =
    Number.parseInt(
      value ?? "",
      10,
    );

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 72;
  }

  return Math.min(
    Math.max(
      parsed,
      60,
    ),
    90,
  );
}

function isSafeStoragePath(
  path:
    string,
) {
  return (
    path.startsWith(
      "projects/",
    ) &&
    !path.includes(
      "..",
    ) &&
    !path.includes(
      "\\",
    )
  );
}

export async function GET(
  request:
    Request,
) {
  const url =
    new URL(
      request.url,
    );

  const path =
    url.searchParams.get(
      "path",
    ) ??
    "";

  if (
    !isSafeStoragePath(
      path,
    )
  ) {
    return new Response(
      "Invalid media path.",
      {
        status:
          400,
      },
    );
  }

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  if (
    !supabaseUrl
  ) {
    return new Response(
      "Media service unavailable.",
      {
        status:
          503,
      },
    );
  }

  const width =
    getSafeWidth(
      url.searchParams.get(
        "w",
      ),
    );

  const quality =
    getSafeQuality(
      url.searchParams.get(
        "q",
      ),
    );

  const encodedPath =
    path
      .split(
        "/",
      )
      .map(
        encodeURIComponent,
      )
      .join(
        "/",
      );

  const sourceUrl =
    `${supabaseUrl}/storage/v1/object/public/portfolio-media/${encodedPath}`;

  try {
    return await withTransformSlot(
      async () => {
        const source =
          await fetch(
            sourceUrl,
            {
              cache:
                "force-cache",
            },
          );

        if (
          !source.ok
        ) {
          return new Response(
            "Source image unavailable.",
            {
              status:
                source.status,
            },
          );
        }

        const input =
          Buffer.from(
            await source.arrayBuffer(),
          );

        const output =
          await sharp(
            input,
            {
              failOn:
                "none",

              sequentialRead:
                true,

              limitInputPixels:
                400_000_000,
            },
          )
            .rotate()
            .resize({
              width,

              withoutEnlargement:
                true,

              fit:
                "inside",

              fastShrinkOnLoad:
                true,
            })
            .webp({
              quality,

              effort:
                0,
            })
            .toBuffer();

        return new Response(
          output,
          {
            headers: {
              "Content-Type":
                "image/webp",

              "Content-Length":
                String(
                  output.byteLength,
                ),

              "Cache-Control":
                `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=604800`,
            },
          },
        );
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[Project image] derivative failed:",
      {
        path,
        width,
        error:
          error instanceof
          Error
            ? error.message
            : String(
                error,
              ),
      },
    );

    return new Response(
      null,
      {
        status:
          307,

        headers: {
          Location:
            sourceUrl,

          "Cache-Control":
            "public, max-age=3600",
        },
      },
    );
  }
}
