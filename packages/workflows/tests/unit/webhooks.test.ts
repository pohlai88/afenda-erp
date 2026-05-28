import { beforeEach, describe, expect, it, vi } from "vitest";

const { listWebhookDispatchTargets, recordWebhookDelivery } = vi.hoisted(() => ({
  listWebhookDispatchTargets: vi.fn(),
  recordWebhookDelivery: vi.fn(),
}));

vi.mock("@afenda/db", () => ({
  listWebhookDispatchTargets,
  recordWebhookDelivery,
}));

describe("webhook dispatcher", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("signs payloads and records delivered-after-retry outcomes", async () => {
    const { dispatchTenantWebhookEvent } = await import("../../src/webhooks");
    listWebhookDispatchTargets.mockResolvedValue([
      {
        id: "webhook_1",
        organizationId: "org_1",
        url: "https://example.test/webhook",
        signingSecret: "secret",
        eventFilters: ["tenant.member.invited"],
      },
    ]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, status: 202 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await dispatchTenantWebhookEvent({
      organizationId: "org_1",
      eventType: "tenant.member.invited",
      payload: { invitationId: "invite_1" },
    });

    expect(result).toEqual({
      targetCount: 1,
      deliveredCount: 1,
      failedCount: 0,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstRequest = fetchMock.mock.calls[0]?.[1] as
      | { headers: Record<string, string> }
      | undefined;
    expect(firstRequest?.headers["x-afenda-signature"]).toMatch(/^sha256=/);
    expect(recordWebhookDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        webhookId: "webhook_1",
        status: "delivered",
        responseCode: 202,
        attemptCount: 2,
        retryOutcome: "delivered_after_retry",
      }),
    );
  });

  it("records an undispatched failure when the signing secret cannot be read", async () => {
    const { dispatchTenantWebhookEvent } = await import("../../src/webhooks");
    listWebhookDispatchTargets.mockResolvedValue([
      {
        id: "webhook_2",
        organizationId: "org_1",
        url: "https://example.test/webhook",
        signingSecret: null,
        eventFilters: ["tenant.member.invited"],
      },
    ]);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await dispatchTenantWebhookEvent({
      organizationId: "org_1",
      eventType: "tenant.member.invited",
      payload: {},
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(recordWebhookDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        webhookId: "webhook_2",
        status: "failed",
        attemptCount: 0,
        retryOutcome: "not_dispatched",
      }),
    );
  });

  it("records exhausted retry failures with the endpoint response code", async () => {
    const { dispatchTenantWebhookEvent } = await import("../../src/webhooks");
    listWebhookDispatchTargets.mockResolvedValue([
      {
        id: "webhook_3",
        organizationId: "org_1",
        url: "https://example.test/webhook",
        signingSecret: "secret",
        eventFilters: ["tenant.member.invited"],
      },
    ]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    await dispatchTenantWebhookEvent({
      organizationId: "org_1",
      eventType: "tenant.member.invited",
      payload: {},
    });

    expect(recordWebhookDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        webhookId: "webhook_3",
        status: "failed",
        responseCode: 503,
        attemptCount: 3,
        retryOutcome: "exhausted",
      }),
    );
  });
});
