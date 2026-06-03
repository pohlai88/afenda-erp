import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@afenda/config/env", () => ({
  getNeonAuthEnv: vi.fn(() => ({ NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS: "blocked.test" })),
  isNeonAuthEnabled: vi.fn(() => true),
}));
vi.mock("../../security/webhook-verify.server", () => ({
  verifyNeonAuthWebhookPayload: vi.fn(),
}));

import { isNeonAuthEnabled } from "@afenda/config/env";
import { verifyNeonAuthWebhookPayload } from "../../security/webhook-verify.server";
import { handleNeonAuthWebhookPost } from "../../webhooks/handler.server";
import {
  registerNeonAuthWebhookHooks,
  resetNeonAuthWebhookHooksForTests,
} from "../../webhooks/hooks.server";

describe("neon-auth webhook handler", () => {
  beforeEach(() => {
    vi.mocked(isNeonAuthEnabled).mockReturnValue(true);
    vi.mocked(verifyNeonAuthWebhookPayload).mockReset();
    resetNeonAuthWebhookHooksForTests();
  });

  it("returns 503 when neon auth is disabled", async () => {
    vi.mocked(isNeonAuthEnabled).mockReturnValue(false);
    const response = await handleNeonAuthWebhookPost(
      new Request("http://localhost/webhook", { method: "POST", body: "{}" }),
    );
    expect(response.status).toBe(503);
  });

  it("returns 401 when verification fails", async () => {
    vi.mocked(verifyNeonAuthWebhookPayload).mockRejectedValue(new Error("bad sig"));
    const response = await handleNeonAuthWebhookPost(
      new Request("http://localhost/webhook", { method: "POST", body: "{}" }),
    );
    expect(response.status).toBe(401);
  });

  it("blocks signup for configured domains on user.before_create", async () => {
    vi.mocked(verifyNeonAuthWebhookPayload).mockResolvedValue({
      event_id: "evt_1",
      event_type: "user.before_create",
      timestamp: new Date().toISOString(),
      user: { email: "user@blocked.test" },
    });

    const response = await handleNeonAuthWebhookPost(
      new Request("http://localhost/webhook", { method: "POST", body: "{}" }),
    );
    const body = await response.json();
    expect(body).toMatchObject({ allowed: false });
  });

  it("allows signup for non-blocked domains", async () => {
    vi.mocked(verifyNeonAuthWebhookPayload).mockResolvedValue({
      event_id: "evt_2",
      event_type: "user.before_create",
      timestamp: new Date().toISOString(),
      user: { email: "user@example.com" },
    });

    const response = await handleNeonAuthWebhookPost(
      new Request("http://localhost/webhook", { method: "POST", body: "{}" }),
    );
    const body = await response.json();
    expect(body).toMatchObject({ allowed: true });
  });

  it("delegates custom delivery to registered hooks", async () => {
    const custom = new Response(JSON.stringify({ ok: true }), { status: 202 });
    registerNeonAuthWebhookHooks({
      onCustomDeliveryRequired: () => custom,
    });
    vi.mocked(verifyNeonAuthWebhookPayload).mockResolvedValue({
      event_id: "evt_3",
      event_type: "send.otp",
      timestamp: new Date().toISOString(),
      event_data: { delivery_preference: "email", otp: "123456" },
    });

    const response = await handleNeonAuthWebhookPost(
      new Request("http://localhost/webhook", { method: "POST", body: "{}" }),
    );
    expect(response.status).toBe(202);
  });
});
