import type {
  NextConfig,
} from "next";

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL
    ?.trim();

const remotePatterns: URL[] =
  [];

let supabaseOrigin:
  | string
  | null = null;

let supabaseWebSocketOrigin:
  | string
  | null = null;

if (supabaseUrl) {
  const parsedSupabaseUrl =
    new URL(
      supabaseUrl,
    );

  supabaseOrigin =
    parsedSupabaseUrl.origin;

  supabaseWebSocketOrigin =
    parsedSupabaseUrl.protocol ===
    "https:"
      ? `wss://${parsedSupabaseUrl.host}`
      : `ws://${parsedSupabaseUrl.host}`;

  remotePatterns.push(
    new URL(
      "/storage/v1/object/public/**",
      parsedSupabaseUrl,
    ),
  );
}

const isDevelopment =
  process.env.NODE_ENV !==
  "production";

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
];

if (
  isDevelopment
) {
  /*
   * Turbopack / React development tooling
   * may require eval-based source execution.
   *
   * Never included in production CSP.
   */
  scriptSources.push(
    "'unsafe-eval'",
  );
}

const connectSources = [
  "'self'",

  /*
   * GLTFLoader turns embedded GLB images
   * into blob URLs. Three.js may load those
   * through ImageBitmapLoader/fetch, so the
   * URLs must be allowed by connect-src.
   */
  "blob:",
];

if (
  isDevelopment
) {
  /*
   * Next.js dev HMR uses WebSocket.
   *
   * This development-only allowance is
   * intentionally absent from production.
   */
  connectSources.push(
    "ws:",
    "wss:",
  );
}

if (
  supabaseOrigin
) {
  connectSources.push(
    supabaseOrigin,
  );
}

if (
  supabaseWebSocketOrigin
) {
  connectSources.push(
    supabaseWebSocketOrigin,
  );
}

const externalMediaSources =
  supabaseOrigin
    ? ` ${supabaseOrigin}`
    : "";

const contentSecurityPolicy =
  [
    "default-src 'self'",

    `script-src ${scriptSources.join(
      " ",
    )}`,

    "style-src 'self' 'unsafe-inline'",

    `img-src 'self' data: blob:${externalMediaSources}`,

    `media-src 'self' blob:${externalMediaSources}`,

    `connect-src ${connectSources.join(
      " ",
    )}`,

    "font-src 'self' data:",

    "worker-src 'self' blob:",

    "frame-src 'self'",

    "object-src 'self'",

    "manifest-src 'self'",

    "base-uri 'self'",

    "form-action 'self'",

    "frame-ancestors 'self'",
  ].join(
    "; ",
  );

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
      contentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
  ],

  images: {
    remotePatterns,

    formats: [
      "image/webp",
    ],

    minimumCacheTTL:
      2678400,
  },

  async headers() {
    return [
      {
        source:
          "/models/:path*",

        headers: [
          {
            key:
              "Cache-Control",

            value:
              "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },

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
