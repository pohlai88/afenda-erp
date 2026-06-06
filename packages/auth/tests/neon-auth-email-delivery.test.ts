import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { handleNeonAuthCustomDeliveryRequired } from "../src/aut-neon-auth-email-delivery-server";

const originalEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
};

function withEnv(env: Record<string, string | undefined>) {
  for (const key of ["RESEND_API_KEY", "RESEND_FROM"]) {
    if (env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  }
}

describe("handleNeonAuthCustomDeliveryRequired", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    withEnv({});
  });

  afterEach(() => {
    withEnv(originalEnv);
  });

  it("returns 503 when Resend is not configured", async () => {
    const response = await handleNeonAuthCustomDeliveryRequired({
      event_id: "evt_1",
      event_type: "send.otp",
      timestamp: new Date().toISOString(),
      user: { email: "ada@example.com" },
      event_data: { otp: "123456" },
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "custom_otp_delivery_failed",
      reason: "resend_not_configured",
    });
  });

  it("delivers OTP emails through Resend", async () => {
    withEnv({
      RESEND_API_KEY: "resend_key_123",
      RESEND_FROM: "Afenda <no-reply@nexuscanon.com>",
    });

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_1" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleNeonAuthCustomDeliveryRequired({
      event_id: "evt_2",
      event_type: "send.otp",
      timestamp: new Date().toISOString(),
      user: { email: "ada@example.com" },
      event_data: { otp: "654321", type: "sign-in" },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      delivered: "otp",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer resend_key_123",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("delivers magic links through Resend", async () => {
    withEnv({
      RESEND_API_KEY: "resend_key_123",
      RESEND_FROM: "Afenda <no-reply@nexuscanon.com>",
    });

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_2" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleNeonAuthCustomDeliveryRequired({
      event_id: "evt_3",
      event_type: "send.magic_link",
      timestamp: new Date().toISOString(),
      user: { email: "ada@example.com" },
      event_data: { url: "https://example.com/sign-in/verify?token=abc123" },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      delivered: "magic_link",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
