import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildCapabilitiesListSurface } from "../../src/capabilities/data/system-admin.capabilities-list.surface";
import {
  evaluateCapabilityCoverage,
  resolveSystemAdminCapabilityReadinessVerdict,
} from "../../src/capabilities/data/system-admin.capabilities.coverage.server";
import { systemAdminCapabilitySettingsActionSchema } from "../../src/capabilities/schemas/system-admin.capability-settings.schema";
import { resolveSystemAdminCapabilityAuditAction } from "../../src/capabilities/events/system-admin.capabilities.event";
import { resolveSystemAdminCapabilityRowTrailingAction } from "../../src/capabilities/surface/system-admin.capabilities-list-trailing.shared";

const mockRequireCapabilitiesManage = vi.fn();
const mockListCapabilitySettings = vi.fn();
const mockUpsertCapabilitySettings = vi.fn();
const mockWriteAudit = vi.fn();
const mockGetExecutionCapability = vi.fn();

vi.mock("@afenda/db", () => ({
  listTenantCapabilitySettings: (...args: unknown[]) =>
    mockListCapabilitySettings(...args),
  upsertTenantCapabilitySettings: (...args: unknown[]) =>
    mockUpsertCapabilitySettings(...args),
}));

vi.mock("../../src/capabilities/policies/system-admin.capabilities.policy.server", () => ({
  requireSystemAdminCapabilitiesManage: () => mockRequireCapabilitiesManage(),
}));

vi.mock("@afenda/kernel/execution", () => ({
  getExecutionCapability: (...args: unknown[]) => mockGetExecutionCapability(...args),
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: vi.fn().mockResolvedValue(undefined),
}));

const guardContext = {
  context: { userId: "actor_1", actorType: "user" as const },
  organization: { id: "org_1" },
  session: { id: "actor_1" },
};

describe("system admin capabilities schemas", () => {
  it("validates capability availability input", () => {
    expect(
      systemAdminCapabilitySettingsActionSchema.safeParse({
        capabilityKey: "finance.view",
        availability: "disabled",
      }).success,
    ).toBe(true);
  });
});

describe("system admin capabilities coverage", () => {
  it("flags missing permission in coverage verdict", () => {
    const result = evaluateCapabilityCoverage({
      capability: {
        key: "custom.orphan",
        label: "Orphan",
        moduleKey: "finance",
        route: "/finance",
        requiredPermission: "not.in.catalog" as never,
        auditArea: "finance",
        status: "active",
        description: "Test",
      },
    });

    expect(result.verdict).toBe("missing_permission");
    expect(
      resolveSystemAdminCapabilityReadinessVerdict({
        coverageVerdict: result.verdict,
        availability: "enabled",
        issues: result.issues,
      }),
    ).toBe("blocked");
  });
});

describe("system admin capabilities actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilitiesManage.mockResolvedValue(guardContext);
    mockListCapabilitySettings.mockResolvedValue([]);
    mockUpsertCapabilitySettings.mockResolvedValue(undefined);
    mockGetExecutionCapability.mockReturnValue({
      key: "finance.view",
      label: "Finance view",
      moduleKey: "finance",
      route: "/finance",
      requiredPermission: "finance.view",
      auditArea: "finance",
      status: "active",
      description: "View finance",
    });
  });

  it("denies manage mutations when policy guard fails", async () => {
    mockRequireCapabilitiesManage.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminCapabilitiesManage } = await import(
      "../../src/capabilities/policies/system-admin.capabilities.policy.server"
    );

    await expect(requireSystemAdminCapabilitiesManage()).rejects.toThrow(
      "Forbidden",
    );
  });

  it("writes audit evidence on capability disable", async () => {
    mockListCapabilitySettings.mockResolvedValue([
      {
        organizationId: "org_1",
        capabilityKey: "finance.view",
        availability: "enabled",
      },
    ]);

    const { setSystemAdminCapabilityAvailabilityAction } = await import(
      "../../src/capabilities/actions/system-admin.capability-settings.actions.server"
    );

    const result = await setSystemAdminCapabilityAvailabilityAction({
      capabilityKey: "finance.view",
      availability: "disabled",
    });

    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.capability.disable",
        targetType: "capability",
        targetId: "finance.view",
      }),
    );
  });

  it("skips writes and audit when availability is unchanged", async () => {
    mockListCapabilitySettings.mockResolvedValue([
      {
        organizationId: "org_1",
        capabilityKey: "finance.view",
        availability: "enabled",
      },
    ]);

    const { setSystemAdminCapabilityAvailabilityAction } = await import(
      "../../src/capabilities/actions/system-admin.capability-settings.actions.server"
    );

    const result = await setSystemAdminCapabilityAvailabilityAction({
      capabilityKey: "finance.view",
      availability: "enabled",
    });

    expect(result.ok).toBe(true);
    expect(mockUpsertCapabilitySettings).not.toHaveBeenCalled();
    expect(mockWriteAudit).not.toHaveBeenCalled();
  });

  it("rejects mutations when capability settings query is truncated", async () => {
    mockListCapabilitySettings.mockResolvedValue(
      Array.from({ length: 500 }, (_, index) => ({
        organizationId: "org_1",
        capabilityKey: `capability.${index}`,
        availability: "enabled" as const,
      })),
    );

    const { setSystemAdminCapabilityAvailabilityAction } = await import(
      "../../src/capabilities/actions/system-admin.capability-settings.actions.server"
    );

    const result = await setSystemAdminCapabilityAvailabilityAction({
      capabilityKey: "finance.view",
      availability: "disabled",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("truncated");
    }
    expect(mockUpsertCapabilitySettings).not.toHaveBeenCalled();
  });

  it("selects granular audit actions from availability transitions", () => {
    expect(
      resolveSystemAdminCapabilityAuditAction({
        previous: "enabled",
        next: "preview",
      }),
    ).toBe("system-admin.capability.preview");
  });
});

describe("system admin capabilities list surface", () => {
  it("serializes governed list configuration with readiness and trailing metadata", () => {
    const surface = buildCapabilitiesListSurface({
      canMutate: true,
      capabilities: [
        {
          id: "finance.view",
          capability: "finance.view",
          module: "finance",
          route: "/finance",
          requiredPermission: "finance.view",
          availability: "enabled",
          readinessVerdict: "ready",
          coverageVerdict: "covered",
          accessCoverage: "Catalog",
          auditCoverage: "Declared",
          docsCoverage: "Declared",
          issues: "None",
        },
      ],
    });

    expect(surface.requiresErpPermission).toEqual({
      module: "system-admin",
      object: "capabilities",
      function: "read",
    });
    expect(surface.columns.map((column) => column.id)).toContain(
      "readinessVerdict",
    );
    expect(surface.rows[0]?.trailingAction?.descriptor?.label).toBe("Disable");

    const protectedAction = resolveSystemAdminCapabilityRowTrailingAction({
      capabilityKey: "system-admin.settings.read",
      availability: "enabled",
      canMutate: true,
    });
    expect(protectedAction?.state).toBe("disabled");
  });
});
