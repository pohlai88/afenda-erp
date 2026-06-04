import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";

const mockRequireIntegrationsRead = vi.fn();
const mockRequireIntegrationsWrite = vi.fn();
const mockRevokeCredential = vi.fn();
const mockWriteAudit = vi.fn();
const mockDispatchWebhook = vi.fn();

vi.mock(
  "../../src/integrations/policies/system-admin.integrations.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/features/integrations/sys-integrations.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminIntegrationsRead: () => mockRequireIntegrationsRead(),
      requireSystemAdminIntegrationsWrite: () => mockRequireIntegrationsWrite(),
    };
  },
);

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    revokeApiCredential: (...args: unknown[]) => mockRevokeCredential(...args),
  };
});

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: (...args: unknown[]) =>
    mockDispatchWebhook(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const guardContext = {
  context: {
    userId: "actor_1",
    actorType: "user" as const,
    organizationId: "org_1",
    organizationSlug: "acme",
    locale: "en",
    role: "admin" as const,
    capabilities: ["system-admin.integrations.write"],
  },
  organization: {
    id: "org_1",
    slug: "acme",
    locale: "en",
    role: "admin" as const,
    capabilities: ["system-admin.integrations.write"],
  },
  session: { id: "actor_1" },
};

import {
  assertCredentialValueNotExposed,
  formatMaskedCredentialPrefix,
} from "../../src/features/integrations/sys-credential-visibility.shared";
import { formatIntegrationReadinessVerdictLabel } from "../../src/features/integrations/sys-integrations-readiness.contract";
import { evaluateIntegrationsReadiness } from "../../src/features/integrations/sys-integrations.readiness.server";
import { systemAdminIntegrationsAuditActions } from "../../src/features/integrations/sys-integrations.event";
import { buildApiCredentialsListSurface } from "../../src/features/integrations/sys-integrations-list.surface";
import { buildIntegrationsGovernanceListSurface } from "../../src/features/integrations/sys-integrations-governance.surface";
import {
  resolveSystemAdminApiCredentialRowTrailingAction,
  resolveSystemAdminWebhookRowTrailingAction,
} from "../../src/features/integrations/sys-integrations-list-trailing.shared";

describe("system admin integrations", () => {
  let revokeApiCredentialAction: typeof import("../../src/features/integrations/sys-integrations.actions.server").revokeApiCredentialAction;

  beforeAll(async () => {
    ({ revokeApiCredentialAction } = await import(
      "../../src/features/integrations/sys-integrations.actions.server"
    ));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireIntegrationsRead.mockResolvedValue(guardContext);
    mockRequireIntegrationsWrite.mockResolvedValue(guardContext);
    mockRevokeCredential.mockResolvedValue(undefined);
  });

  it("requires integrations.read to load the page model", async () => {
    mockRequireIntegrationsRead.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminIntegrationsRead } = await import(
      "../../src/features/integrations/sys-integrations.policy.server"
    );

    await expect(requireSystemAdminIntegrationsRead()).rejects.toThrow(
      "Forbidden",
    );
  });

  it("requires integrations.write to revoke credentials", async () => {
    mockRequireIntegrationsWrite.mockRejectedValue(new Error("Forbidden"));

    await expect(revokeApiCredentialAction("cred_1")).rejects.toThrow(
      "Forbidden",
    );
    expect(mockRevokeCredential).not.toHaveBeenCalled();
  });

  it("writes audit events when credentials are revoked", async () => {
    const result = await revokeApiCredentialAction("cred_1");

    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: systemAdminIntegrationsAuditActions.apiCredentialRevoke,
        targetType: "organization_integrations",
        targetId: "cred_1",
      }),
    );
  });

  it("masks credential prefixes and rejects full secret exposure", () => {
    expect(formatMaskedCredentialPrefix("sk_live_ab12")).toBe(
      "*************ab12",
    );
    expect(() =>
      assertCredentialValueNotExposed("sk_live_1234567890abcdef"),
    ).toThrow(/must not be exposed/i);
  });

  it("formats integration readiness verdict labels for governed surfaces", () => {
    expect(formatIntegrationReadinessVerdictLabel("ready")).toBe("Ready");
    expect(formatIntegrationReadinessVerdictLabel("warning")).toBe("Warning");
    expect(formatIntegrationReadinessVerdictLabel("blocked")).toBe("Blocked");
  });

  it("reports blocked readiness when no outbound channels exist", () => {
    expect(
      evaluateIntegrationsReadiness({
        credentials: [],
        webhooks: [],
        deliveries: [],
        ssoConnections: [],
      }).verdict,
    ).toBe("blocked");
  });

  it("parses governed integration list surfaces", () => {
    const governanceParsed = parseListSurfaceRendererConfiguration(
      buildIntegrationsGovernanceListSurface({
        readiness: evaluateIntegrationsReadiness({
          credentials: [],
          webhooks: [],
          deliveries: [],
          ssoConnections: [],
        }),
        activeCredentialCount: 0,
        enabledWebhookCount: 0,
        failedDeliveryCount: 0,
        stagedSsoCount: 0,
      }),
    );
    const credentialsParsed = parseListSurfaceRendererConfiguration(
      buildApiCredentialsListSurface({
        credentials: [
          {
            id: "cred_1",
            label: "CI",
            keyPrefix: "sk_live_ab12",
            scopes: ["erp.read"],
            status: "active",
            lastUsedAt: null,
          },
        ],
      }),
    );

    expect(governanceParsed.success).toBe(true);
    expect(credentialsParsed.success).toBe(true);
    if (credentialsParsed.success) {
      expect(credentialsParsed.data.rows[0]?.cells.keyPrefix).toBe(
        "*************ab12",
      );
      expect(credentialsParsed.data.rows[0]?.cells.status).toBe("Active");
    }
  });

  it("serializes governed trailing actions for Pattern C rows", () => {
    const revoke = resolveSystemAdminApiCredentialRowTrailingAction({
      canMutate: true,
    });
    const disable = resolveSystemAdminWebhookRowTrailingAction({
      enabled: true,
      canMutate: true,
    });

    expect(revoke?.descriptor?.label).toBe("Revoke");
    expect(disable?.descriptor?.label).toBe("Disable");
  });

  it("uses stable integrations audit action identifiers", () => {
    expect(systemAdminIntegrationsAuditActions.view).toBe(
      "system-admin.integrations.view",
    );
    expect(systemAdminIntegrationsAuditActions.apiCredentialRevoke).toBe(
      "system-admin.integration.credentials.revoke",
    );
  });

  it("reports warning readiness when webhook deliveries fail", () => {
    expect(
      evaluateIntegrationsReadiness({
        credentials: [
          {
            id: "cred_1",
            label: "Primary",
            keyPrefix: "afk_live_ab12",
            scopes: ["erp.read"],
            status: "active",
            lastUsedAt: null,
          },
        ],
        webhooks: [
          {
            id: "wh_1",
            label: "Ops",
            url: "https://example.com/hook",
            status: "enabled",
            eventFilters: ["tenant.webhook.created"],
          },
        ],
        deliveries: [
          {
            id: "del_1",
            eventType: "tenant.webhook.created",
            status: "failed",
            attemptCount: 3,
            retryOutcome: "exhausted",
            responseCode: 500,
            createdAt: new Date(),
          },
        ],
        ssoConnections: [],
      }).verdict,
    ).toBe("warning");
  });
});
