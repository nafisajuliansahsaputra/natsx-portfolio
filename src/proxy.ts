import type {
  NextRequest,
} from "next/server";

import {
  updateSession,
} from "@/lib/supabase/proxy";

export async function proxy(
  request: NextRequest,
) {
  return updateSession(
    request,
  );
}

export const config = {
  matcher: [
    /*
     * Admin routes need Supabase
     * SSR session refresh.
     *
     * Public portfolio routes do
     * not need auth cookies.
     */
    "/admin/:path*",
  ],
};