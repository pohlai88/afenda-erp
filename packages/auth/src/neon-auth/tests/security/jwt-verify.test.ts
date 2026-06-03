import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@afenda/config/env", () => ({
  getNeonAuthEnv: vi.fn(() => ({ NEON_AUTH_BASE_URL: "https://auth.example.test/neondb/auth" })),
}));
vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => "mock-jwks"),
  jwtVerify: vi.fn(),
}));

import { jwtVerify } from "jose";
import {
  resetNeonAuthJwtVerifyCacheForTests,
  verifyNeonAuthAccessToken,
} from "../../security/jwt-verify.server";

describe("neon-auth jwt verify", () => {
  beforeEach(() => {
    resetNeonAuthJwtVerifyCacheForTests();
    vi.mocked(jwtVerify).mockReset();
  });

  it("verifies access tokens against Neon JWKS", async () => {
    vi.mocked(jwtVerify).mockResolvedValue({ payload: { sub: "user_1" }, protectedHeader: {} } as never);

    await expect(verifyNeonAuthAccessToken("token")).resolves.toMatchObject({ sub: "user_1" });
    expect(jwtVerify).toHaveBeenCalledWith(
      "token",
      "mock-jwks",
      expect.objectContaining({ issuer: "https://auth.example.test", audience: "https://auth.example.test" }),
    );
  });
});
