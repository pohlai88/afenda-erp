import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@afenda/config/env", () => ({
  getNeonAuthEnv: vi.fn(() => ({ NEON_AUTH_BASE_URL: "https://auth.example.test/neondb/auth" })),
}));

import { getNeonAuthEnv } from "@afenda/config/env";
import { getNeonAuthJwkByKid, resetNeonAuthJwksCacheForTests } from "../../src/security/jwks.shared.server";
import { verifyNeonAuthWebhookPayload } from "../../src/security/webhook-verify.server";

describe("neon-auth webhook verify", () => {
  beforeEach(() => {
    resetNeonAuthJwksCacheForTests();
    vi.mocked(getNeonAuthEnv).mockReturnValue({
      configured: true,
      NEON_AUTH_BASE_URL: "https://auth.example.test/neondb/auth",
    } as never);
  });

  it("rejects missing signature headers", async () => {
    await expect(
      verifyNeonAuthWebhookPayload({ rawBody: "{}", headers: new Headers() }),
    ).rejects.toThrow(/Missing/);
  });

  it("rejects future timestamps beyond clock skew", async () => {
    const future = String(Date.now() + 5 * 60 * 1000);
    const headers = new Headers({
      "x-neon-signature": "a..b",
      "x-neon-signature-kid": "kid_1",
      "x-neon-timestamp": future,
    });

    await expect(
      verifyNeonAuthWebhookPayload({ rawBody: "{}", headers }),
    ).rejects.toThrow(/future/);
  });

  it("refetches JWKS when kid is missing after rotation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [{ kid: "old", kty: "OKP", crv: "Ed25519", x: "abc" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [{ kid: "new", kty: "OKP", crv: "Ed25519", x: "def" }] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getNeonAuthJwkByKid("new")).resolves.toMatchObject({ kid: "new" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
  });
});
