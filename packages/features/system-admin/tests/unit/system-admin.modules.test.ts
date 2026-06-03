import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildModulesListSurface } from "../../src/modules/data/system-admin.modules-list.surface";
import { SYSTEM_ADMIN_PROTECTED_MODULE_KEY } from "../../src/modules/contracts";

const mockRequireModulesManage = vi.fn();
const mockRequireModulesRead = vi.fn();
const mockWriteAudit = vi.fn();
const mockUpsertSettings = vi.fn();
const mockListSettings = vi.fn();
const mockListPolicies = vi.fn();
const mockDispatchWebhook = vi.fn();

vi.mock(
  "../../src/overview/policies/system-admin.capability.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/overview/policies/system-admin.capability.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminModulesManage: () => mockRequireModulesManage(),
      requireSystemAdminModulesRead: () => mockRequireModulesRead(),
    };
  },
);

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    listTenantModuleSettings: (...args: unknown[]) => mockListSettings(...args),
    upsertTenantModuleSettings: (...args: unknown[]) => mockUpsertSettings(...args),
  };
});

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: (...args: unknown[]) => mockDispatchWebhook(...args),
}));

vi.mock(
  "../../src/tenant-execution/data/system-admin.execution-settings.repository.server",
  () => ({
    listTenantModuleSettings: (...args: unknown[]) => mockListSettings(...args),
    listTenantPolicySettings: (...args: unknown[]) => mockListPolicies(...args),
  }),
);

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@afenda/observability/server", () => ({
  logServerEvent: vi.fn(),
}));

const guardContext = {
  context: { userId: "actor_1", actorType: "user" as const },
  organization: { id: "org_1" },
  session: { id: "actor_1" },
};

describe("system admin modules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireModulesManage.mockResolvedValue(guardContext);
    mockRequireModulesRead.mockResolvedValue(guardContext);
    mockListSettings.mockResolvedValue([]);
    mockListPolicies.mockResolvedValue([]);
    mockUpsertSettings.mockResolvedValue(undefined);
    mockDispatchWebhook.mockResolvedValue(undefined);
  });

  it("denies non-admin read via policy guard", async () => {
    mockRequireModulesRead.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminModulesRead } = await import(
      "../../src/modules/policies/system-admin.modules.policy.server"
    );

    await expect(requireSystemAdminModulesRead()).rejects.toThrow("Forbidden");
  });

  it("writes audit when module catalog is viewed", async () => {
    const { buildSystemAdminModulesPageModel } = await import(
      "../../src/modules/data/system-admin.modules.page-model.server"
    );

    await buildSystemAdminModulesPageModel({
      organizationId: "org_1",
      actorId: "actor_1",
      actorType: "user",
      searchParams: { modulesQ: "finance" },
    });

    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.module_catalog.view",
      }),
    );
  });

  it("blocks disabling the protected system-admin module", async () => {
    const { setSystemAdminModuleEnabledAction } = await import(
      "../../src/modules/actions/system-admin.module-settings.actions.server"
    );

    const result = await setSystemAdminModuleEnabledAction({
      moduleKey: SYSTEM_ADMIN_PROTECTED_MODULE_KEY,
      enabled: false,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("cannot be disabled");
    }
    expect(mockUpsertSettings).not.toHaveBeenCalled();
  });

  it("writes audit when module settings change", async () => {
    mockListSettings.mockResolvedValue([
      {
        moduleKey: "finance",
        enabled: true,
        visible: true,
        readiness: "active",
        configuration: {},
        updatedAt: new Date(),
      },
    ]);

    const { setSystemAdminModuleEnabledAction } = await import(
      "../../src/modules/actions/system-admin.module-settings.actions.server"
    );

    const result = await setSystemAdminModuleEnabledAction({
      moduleKey: "finance",
      enabled: false,
    });

    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.module.disable",
        targetId: "finance",
      }),
    );
  });

  it("serializes governed list surface for Pattern C", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildModulesListSurface({
        canMutate: true,
        modules: [
          {
            id: "finance",
            module: "Finance",
            category: "finance",
            status: "active",
            availability: "enabled",
            visibility: "visible",
            capabilities: "4",
            permissions: "finance.view",
            policies: "1",
            readinessVerdict: "ready",
            lastChanged: "2026-05-29",
          },
        ],
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiresErpPermission?.object).toBe("modules");
      expect(parsed.data.rows[0]?.cellKinds?.module?.kind).toBe("link");
      expect(parsed.data.rows[0]?.trailingAction?.state).toBe("ready");
    }
  });

  it("marks protected module trailing action as disallowed", () => {
    const surface = buildModulesListSurface({
      canMutate: true,
      modules: [
        {
          id: SYSTEM_ADMIN_PROTECTED_MODULE_KEY,
          module: "System Admin",
          category: "platform",
          status: "active",
          availability: "enabled",
          visibility: "visible",
          capabilities: "10",
          permissions: "system-admin.modules.read",
          policies: "0",
          readinessVerdict: "ready",
          lastChanged: "2026-05-29",
        },
      ],
    });

    expect(surface.rows[0]?.trailingAction?.state).toBe("disabled");
    expect(surface.rows[0]?.trailingAction?.disabledReason).toContain(
      "cannot be disabled",
    );
  });

  it("requires confirm when enabling a deprecated module", () => {
    const surface = buildModulesListSurface({
      canMutate: true,
      modules: [
        {
          id: "reports",
          module: "Reports",
          category: "platform",
          status: "deprecated",
          availability: "disabled",
          visibility: "visible",
          capabilities: "2",
          permissions: "reports.view",
          policies: "0",
          readinessVerdict: "attention",
          lastChanged: "2026-05-29",
        },
      ],
    });

    expect(surface.rows[0]?.trailingAction?.descriptor?.confirm?.title).toBe(
      "Enable deprecated module",
    );
  });
});
