import { describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";

vi.mock("server-only", () => ({}));

vi.mock("@afenda/config/env", () => ({
  getNeonAuthEnv: vi.fn(),
}));

vi.mock("../../security/jwks.shared.server", () => ({
  getNeonAuthJwkByKid: vi.fn(),
}));

import { getNeonAuthEnv } from "@afenda/config/env";
import { getNeonAuthJwkByKid } from "../src/aut-jwks-shared-server";
import { verifyNeonAuthWebhookPayload } from "../src/aut-webhook-verify-server";

const baseUrl =
  "https://ep-snowy-hat-aof9n5iw.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth";

function headers(input: Record<string, string>) {
  return new Headers(input);
}

describe("verifyNeonAuthWebhookPayload", () => {
  it("throws when Neon Auth is not configured", async () => {
    vi.mocked(getNeonAuthEnv).mockReturnValue({ configured: false } as never);

    await expect(
      verifyNeonAuthWebhookPayload({
        rawBody: "{}",
        headers: headers({}),
      }),
    ).rejects.toThrow("Neon Auth is not configured.");
  });

  it("requires Neon webhook signature headers", async () => {
    vi.mocked(getNeonAuthEnv).mockReturnValue({
      configured: true,
      NEON_AUTH_BASE_URL: baseUrl,
    } as never);

    await expect(
      verifyNeonAuthWebhookPayload({
        rawBody: "{}",
        headers: headers({}),
      }),
    ).rejects.toThrow("Missing x-neon-signature header.");
  });

  it("rejects stale webhook timestamps", async () => {
    vi.mocked(getNeonAuthEnv).mockReturnValue({
      configured: true,
      NEON_AUTH_BASE_URL: baseUrl,
    } as never);

    const staleTimestamp = String(Date.now() - 6 * 60 * 1000);

    await expect(
      verifyNeonAuthWebhookPayload({
        rawBody: '{"event_type":"user.created"}',
        headers: headers({
          "x-neon-signature": "a.b.c",
          "x-neon-signature-kid": "kid_1",
          "x-neon-timestamp": staleTimestamp,
        }),
      }),
    ).rejects.toThrow("Webhook timestamp is too old.");
  });

  it("rejects detached JWS signatures that are not three segments", async () => {
    vi.mocked(getNeonAuthEnv).mockReturnValue({
      configured: true,
      NEON_AUTH_BASE_URL: baseUrl,
    } as never);
    const { publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
    vi.mocked(getNeonAuthJwkByKid).mockResolvedValue(
      publicKey.export({ format: "jwk" }) as never,
    );

    await expect(
      verifyNeonAuthWebhookPayload({
        rawBody: '{"event_type":"user.created"}',
        headers: headers({
          "x-neon-signature": "only-two-segments",
          "x-neon-signature-kid": "kid_1",
          "x-neon-timestamp": String(Date.now()),
        }),
      }),
    ).rejects.toThrow("Expected detached JWS format.");
  });
});
