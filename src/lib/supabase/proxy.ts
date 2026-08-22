import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

function applyAdminResponseHeaders(
  response: NextResponse,
) {
  response.headers.set(
    "Cache-Control",
    "no-store, max-age=0",
  );

  response.headers.set(
    "Pragma",
    "no-cache",
  );

  response.headers.set(
    "Expires",
    "0",
  );

  response.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive",
  );

  return response;
}

export async function updateSession(
  request: NextRequest,
) {
  let response =
    NextResponse.next({
      request,
    });

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {
    return applyAdminResponseHeaders(
      response,
    );
  }

  const supabase =
    createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(
            cookiesToSet,
            headers,
          ) {
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value,
                );
              },
            );

            response =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                response.cookies.set(
                  name,
                  value,
                  options,
                );
              },
            );

            Object.entries(
              headers,
            ).forEach(
              ([
                key,
                value,
              ]) => {
                response.headers.set(
                  key,
                  value,
                );
              },
            );
          },
        },
      },
    );

  /*
   * Verify / refresh the JWT.
   *
   * Do not replace this with
   * getSession() for server-side
   * authorization.
   */
  await supabase.auth.getClaims();

  return applyAdminResponseHeaders(
    response,
  );
}