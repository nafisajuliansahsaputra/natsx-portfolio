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

const securityHeaders = [
  {
    key:
      "X-DNS-Prefetch-Control",

    value:
      "on",
  },

  {
    key:
      "Strict-Transport-Security",

    value:
      "max-age=31536000",
  },

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
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },

  {
    key:
      "X-Permitted-Cross-Domain-Policies",

    value:
      "none",
  },

  {
    key:
      "Content-Security-Policy",

    value:
      [
        "base-uri 'self'",
        "frame-ancestors 'self'",
        "object-src 'self'",
      ].join(
        "; ",
      ),
  },
];

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

        headers:
          securityHeaders,
      },
    ];
  },
};

export default nextConfig;