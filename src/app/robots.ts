import type {
  MetadataRoute,
} from "next";

import {
  getAbsoluteUrl,
  getSiteUrl,
} from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.VERCEL_ENV === "preview"
        ? {
            userAgent: "*",
            disallow: "/",
          }
        : {
            userAgent: "*",
            allow: "/",
            disallow: [
              "/admin",
              "/admin/",
            ],
          },

    sitemap:
      getAbsoluteUrl(
        "/sitemap.xml",
      ),

    host:
      getSiteUrl(),
  };
}