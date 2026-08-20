import type {
  NextConfig,
} from "next";

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL
    ?.trim();

const remotePatterns: URL[] =
  [];

if (supabaseUrl) {
  remotePatterns.push(
    new URL(
      "/storage/v1/object/public/**",
      supabaseUrl,
    ),
  );
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
  ],

  images: {
    remotePatterns,

    formats: [
      "image/avif",
      "image/webp",
    ],
  },

  async headers() {
    return [
      {
        source:
          "/:path*",

        headers: [
          {
            key:
              "X-Content-Type-Options",
            value:
              "nosniff",
          },
          {
            key:
              "X-Frame-Options",
            value:
              "SAMEORIGIN",
          },
          {
            key:
              "Referrer-Policy",
            value:
              "strict-origin-when-cross-origin",
          },
          {
            key:
              "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};


export default nextConfig;