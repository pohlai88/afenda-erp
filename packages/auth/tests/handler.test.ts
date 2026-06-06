import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@afenda/config/env", () => ({
  getNeonAuthEnv: vi.fn(),
  isNeonAuthEnabled: vi.fn(),
}));

vi.mock("../src/aut-webhook-verify-server", () => ({
  verifyNeonAuthWebhookPayload: vi.fn(),
}));

import { getNeonAuthEnv, isNeonAuthEnabled } from "@afenda/config/env";
import { verifyNeonAuthWebhookPayload } from "../src/aut-webhook-verify-server";
import { handleNeonAuthWebhookPost } from "../src/aut-handler-server";
import {
  registerNeonAuthWebhookHooks,
  resetNeonAuthWebhookHooksForTests,
} from "../src/aut-hooks-server";

function post(body: unknown, init?: RequestInit) {
  return new Request("https://example.com/api/internal/v1/webhooks/neon-auth", {
    method: "POST",
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
}

describe("handleNeonAuthWebhookPost", () => {
  beforeEach(() => {
    resetNeonAuthWebhookHooksForTests();
    vi.restoreAllMocks();
  });

  it("returns 503 when Neon Auth is disabled", async () => {
    vi.mocked(isNeonAuthEnabled).mockReturnValue(false);

    const response = await handleNeonAuthWebhookPost(post({}));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "neon_auth_disabled" });
  });

  it("returns 401 when webhook verification fails", async () => {
    vi.mocked(isNeonAuthEnabled).mockReturnValue(true);
    vi.mocked(verifyNeonAuthWebhookPayload).mockRejectedValue(
      new Error("Invalid webhook signature."),
    );

    const response = await handleNeonAuthWebhookPost(post('{"event_type":"user.created"}'));
    expect(response.status).toBe(401);
  });

  it("blocks signup domains configured in env", async () => {
    vi.mocked(isNeonAuthEnabled).mockReturnValue(true);
    vi.mocked(getNeonAuthEnv).mockReturnValue({
      NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS: "blocked.com",
    } as never);
    vi.mocked(verifyNeonAuthWebhookPayload).mockResolvedValue({
      event_id: "evt_1",
      event_type: "user.before_create",
      timestamp: new Date().toISOString(),
      user: { email: "user@blocked.com" },
    });

    const response = await handleNeonAuthWebhookPost(post({}));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      allowed: false,
      error_message: "Signups from this email domain are not allowed.",
      error_code: "DOMAIN_BLOCKED",
    });
  });

  it("invokes onUserCreated for user.created events", async () => {
    vi.mocked(isNeonAuthEnabled).mockReturnValue(true);
    vi.mocked(getNeonAuthEnv).mockReturnValue({} as never);
    const onUserCreated = vi.fn();
    registerNeonAuthWebhookHooks({ onUserCreated });

    const payload = {
      event_id: "evt_2",
      event_type: "user.created",
      timestamp: new Date().toISOString(),
      user: { id: "user_1", email: "ada@example.com" },
    };
    vi.mocked(verifyNeonAuthWebhookPayload).mockResolvedValue(payload);

    const response = await handleNeonAuthWebhookPost(post(payload));
    expect(response.status).toBe(200);
    expect(onUserCreated).toHaveBeenCalledWith(payload);
  });

  it("returns 400 for send.otp without custom delivery hook", async () => {
    vi.mocked(isNeonAuthEnabled).mockReturnValue(true);
    vi.mocked(getNeonAuthEnv).mockReturnValue({} as never);
    vi.mocked(verifyNeonAuthWebhookPayload).mockResolvedValue({
      event_id: "evt_3",
      event_type: "send.otp",
      timestamp: new Date().toISOString(),
    });

    const response = await handleNeonAuthWebhookPost(post({}));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "custom_delivery_not_implemented",
    });
  });
});
