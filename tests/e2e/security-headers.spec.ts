import {
  expect,
  test,
} from "@playwright/test";

test(
  "public responses include hardened production security headers",
  async ({
    request,
  }) => {
    const response =
      await request.get(
        "/",
      );

    expect(
      response.ok(),
    ).toBeTruthy();

    const headers =
      response.headers();

    expect(
      headers[
        "x-dns-prefetch-control"
      ],
    ).toBe(
      "on",
    );

    expect(
      headers[
        "strict-transport-security"
      ],
    ).toBe(
      "max-age=31536000",
    );

    expect(
      headers[
        "x-content-type-options"
      ],
    ).toBe(
      "nosniff",
    );

    expect(
      headers[
        "x-frame-options"
      ],
    ).toBe(
      "SAMEORIGIN",
    );

    expect(
      headers[
        "referrer-policy"
      ],
    ).toBe(
      "strict-origin-when-cross-origin",
    );

    const permissionsPolicy =
      headers[
        "permissions-policy"
      ];

    expect(
      permissionsPolicy,
    ).toContain(
      "camera=()",
    );

    expect(
      permissionsPolicy,
    ).toContain(
      "microphone=()",
    );

    expect(
      permissionsPolicy,
    ).toContain(
      "geolocation=()",
    );

    expect(
      permissionsPolicy,
    ).toContain(
      "browsing-topics=()",
    );

    expect(
      headers[
        "x-permitted-cross-domain-policies"
      ],
    ).toBe(
      "none",
    );

    const contentSecurityPolicy =
      headers[
        "content-security-policy"
      ];

    expect(
      contentSecurityPolicy,
    ).toBeTruthy();

    expect(
      contentSecurityPolicy,
    ).toContain(
      "default-src 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "script-src 'self' 'unsafe-inline'",
    );

    expect(
      contentSecurityPolicy,
    ).not.toContain(
      "'unsafe-eval'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "style-src 'self' 'unsafe-inline'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "img-src 'self' data: blob:",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "media-src 'self' blob:",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "connect-src 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "font-src 'self' data:",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "worker-src 'self' blob:",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "frame-src 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "object-src 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "manifest-src 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "base-uri 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "form-action 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "frame-ancestors 'self'",
    );
  },
);