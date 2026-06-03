import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@afenda/config/env", () => ({
  getNeonAuthEnv: vi.fn(),
}));

import { getNeonAuthEnv } from "@afenda/config/env";
import {
  resetNeonAuthJwtVerifyCacheForTests,
  verifyNeonAuthAccessToken,
} from "../../security/jwt-verify.server";
import {
  neonAuthJwksUrl,
  resetNeonAuthJwksCacheForTests,
} from "../../security/jwks.shared.server";

describe("neonAuthJwksUrl", () => {
  it("appends .well-known/jwks.json to the auth base URL", () => {
    expect(
      neonAuthJwksUrl(
        "https://ep-snowy-hat-aof9n5iw.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth",
      ).href,
    ).toBe(
      "https://ep-snowy-hat-aof9n5iw.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json",
    );
  });
});

describe("verifyNeonAuthAccessToken", () => {
  beforeEach(() => {
    resetNeonAuthJwtVerifyCacheForTests();
    resetNeonAuthJwksCacheForTests();
    vi.restoreAllMocks();
  });

  it("throws when Neon Auth base URL is missing", async () => {
    vi.mocked(getNeonAuthEnv).mockReturnValue({
      configured: false,
    } as never);

    await expect(verifyNeonAuthAccessToken("token")).rejects.toThrow(
      "Neon Auth is not configured.",
    );
  });

  it("rejects malformed tokens", async () => {
    vi.mocked(getNeonAuthEnv).mockReturnValue({
      configured: true,
      NEON_AUTH_BASE_URL:
        "https://ep-snowy-hat-aof9n5iw.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth",
    } as never);

    await expect(verifyNeonAuthAccessToken("not-a-jwt")).rejects.toThrow();
  });
});
