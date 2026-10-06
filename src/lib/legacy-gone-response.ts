const LEGACY_GONE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>410 Gone — NATSX</title>
  </head>
  <body>
    <main>
      <h1>410 Gone</h1>
      <p>This legacy page is no longer available.</p>
    </main>
  </body>
</html>`;

export function createLegacyGoneResponse() {
  return new Response(
    LEGACY_GONE_HTML,
    {
      status:
        410,

      headers: {
        "Content-Type":
          "text/html; charset=utf-8",

        "Cache-Control":
          "public, max-age=3600",

        "X-Robots-Tag":
          "noindex, nofollow",
      },
    },
  );
}
