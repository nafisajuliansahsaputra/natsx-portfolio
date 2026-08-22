import {
  expect,
  test,
} from "@playwright/test";

test(
  "public responses include production security headers",
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

    expect(
      headers[
        "permissions-policy"
      ],
    ).toContain(
      "camera=()",
    );

    expect(
      headers[
        "permissions-policy"
      ],
    ).toContain(
      "microphone=()",
    );

    expect(
      headers[
        "permissions-policy"
      ],
    ).toContain(
      "geolocation=()",
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
    ).toContain(
      "base-uri 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "frame-ancestors 'self'",
    );

    expect(
      contentSecurityPolicy,
    ).toContain(
      "object-src 'self'",
    );
  },
);