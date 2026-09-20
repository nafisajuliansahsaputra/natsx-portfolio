import sharp from "sharp";

export const runtime =
  "nodejs";

const CACHE_SECONDS =
  2678400;

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
    return 900;
  }

  return Math.min(
    Math.max(
      parsed,
      320,
    ),
    1600,
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
    return 78;
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
      },
    )
      .rotate()
      .resize({
        width,
        withoutEnlargement:
          true,
        fit:
          "inside",
      })
      .webp({
        quality,
        effort:
          4,
        smartSubsample:
          true,
      })
      .toBuffer();

  return new Response(
    output,
    {
      headers: {
        "Content-Type":
          "image/webp",

        "Cache-Control":
          `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=604800`,
      },
    },
  );
}
