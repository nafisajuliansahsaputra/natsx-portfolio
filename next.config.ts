import type {
  NextConfig,
} from "next";

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL
    ?.trim();

const remotePatterns: URL[] =
  [];

const portfolioMediaCdnPrefix =
  process.env
    .NEXT_PUBLIC_PORTFOLIO_MEDIA_CDN_PREFIX
    ?.trim()
    .replace(
      /\/+$/,
      "",
    ) ??
  "";

let supabaseOrigin:
  | string
  | null = null;

let supabaseWebSocketOrigin:
  | string
  | null = null;

let portfolioMediaCdnOrigin:
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


if (
  portfolioMediaCdnPrefix
) {
  try {
    const parsedMediaCdn =
      new URL(
        portfolioMediaCdnPrefix,
      );

    portfolioMediaCdnOrigin =
      parsedMediaCdn.origin;

    const normalizedPath =
      parsedMediaCdn.pathname
        .replace(
          /\/+$/,
          "",
        );

    remotePatterns.push(
      new URL(
        `${normalizedPath || ""}/**`,
        parsedMediaCdn,
      ),
    );
  } catch {
    /*
     * Relative prefixes such as /portfolio-media are same-origin and do not
     * need a remotePatterns entry.
     */
  }
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
  portfolioMediaCdnOrigin &&
  !connectSources.includes(
    portfolioMediaCdnOrigin,
  )
) {
  connectSources.push(
    portfolioMediaCdnOrigin,
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
  Array.from(
    new Set(
      [
        supabaseOrigin,
        portfolioMediaCdnOrigin,
      ].filter(
        (
          value,
        ): value is string =>
          Boolean(
            value,
          ),
      ),
    ),
  )
    .map(
      (
        origin,
      ) =>
        ` ${origin}`,
    )
    .join("");

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

    /*
     * Portfolio media paths are immutable UUID/versioned keys. Keep optimized
     * variants warm for 30 days so one origin fetch serves many visits.
     */
    minimumCacheTTL:
      30 * 24 * 60 * 60,

    formats: [
      "image/avif",
      "image/webp",
    ],
  },

  async headers() {
    return [
      {
        source:
          "/media/:path*",

        headers: [
          {
            key:
              "Cache-Control",

            value:
              "public, max-age=31536000, immutable",
          },
        ],
      },

      {
        source:
          "/runtime-models/:path*",

        headers: [
          {
            key:
              "Cache-Control",

            value:
              "public, max-age=31536000, immutable",
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
