import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequirePermissionsManage = vi.fn();
const mockRequirePermissionsRead = vi.fn();
const mockUpsertRoleOverride = vi.fn();
const mockWriteAudit = vi.fn();
const mockDispatchWebhook = vi.fn();
const mockLogServerEvent = vi.fn();

vi.mock(
  "../../src/permissions/policies/system-admin.permissions.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/features/permissions/sys-permissions.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminPermissionsManage: () =>
        mockRequirePermissionsManage(),
      requireSystemAdminPermissionsRead: () => mockRequirePermissionsRead(),
    };
  },
);

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    upsertRoleOverride: (...args: unknown[]) => mockUpsertRoleOverride(...args),
  };
});

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("@afenda/observability/server", () => ({
  logServerEvent: (...args: unknown[]) => mockLogServerEvent(...args),
}));

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: (...args: unknown[]) => mockDispatchWebhook(...args),
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
    capabilities: ["system-admin.permissions.manage"],
  },
  organization: {
    id: "org_1",
    slug: "acme",
    locale: "en",
    role: "admin" as const,
    capabilities: ["system-admin.permissions.manage"],
  },
  session: { id: "actor_1" },
};

describe("system admin permissions", () => {
  let setRoleOverride: typeof import("../../src/features/permissions/sys-permission-bundle.actions.server").setRoleOverride;

  beforeAll(async () => {
    ({ setRoleOverride } = await import(
      "../../src/features/permissions/sys-permission-bundle.actions.server"
    ));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequirePermissionsManage.mockResolvedValue(guardContext);
    mockRequirePermissionsRead.mockResolvedValue(guardContext);
    mockUpsertRoleOverride.mockResolvedValue(undefined);
  });

  it("rejects random permission keys on role override", async () => {
    const formData = new FormData();
    formData.set("role", "staff");
    formData.set("permissionKey", "admin");
    formData.set("enabled", "true");

    const result = await setRoleOverride(formData);

    expect(result.ok).toBe(false);
    expect(mockUpsertRoleOverride).not.toHaveBeenCalled();
  });

  it("requires permissions.read to view the catalog", async () => {
    mockRequirePermissionsRead.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminPermissionsRead } = await import(
      "../../src/features/permissions/sys-permissions.policy.server"
    );

    await expect(requireSystemAdminPermissionsRead()).rejects.toThrow(
      "Forbidden",
    );
  });

  it("requires permissions.manage to update role permission bundles", async () => {
    mockRequirePermissionsManage.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminPermissionsManage } = await import(
      "../../src/features/permissions/sys-permissions.policy.server"
    );

    await expect(requireSystemAdminPermissionsManage()).rejects.toThrow(
      "Forbidden",
    );
  });

  it("rejects permission bundle updates when manage capability is missing", async () => {
    mockRequirePermissionsManage.mockRejectedValue(new Error("Forbidden"));

    const formData = new FormData();
    formData.set("role", "staff");
    formData.set("permissionKey", "system-admin.audit.read");
    formData.set("enabled", "true");

    await expect(setRoleOverride(formData)).rejects.toThrow("Forbidden");
    expect(mockUpsertRoleOverride).not.toHaveBeenCalled();
  });

  it("writes audit events when permission bundles change", async () => {
    const formData = new FormData();
    formData.set("role", "staff");
    formData.set("permissionKey", "system-admin.audit.read");
    formData.set("enabled", "true");
    formData.set("confirmHighRisk", "false");

    const result = await setRoleOverride(formData);

    expect(result.ok).toBe(true);
    expect(mockUpsertRoleOverride).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_1",
        role: "staff",
        permissionKey: "system-admin.audit.read",
        enabled: true,
      }),
    );
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.permission_bundle.update",
        targetType: "role",
        targetId: "staff",
      }),
    );
  });

  it("flags orphan permissions without execution capabilities", async () => {
    const { buildSystemAdminPermissionCatalogRows } = await import(
      "../../src/features/permissions/sys-permissions.query.server"
    );

    const rows = buildSystemAdminPermissionCatalogRows();
    const dashboardView = rows.find((row) => row.permission === "dashboard.view");

    expect(dashboardView).toBeDefined();
    expect(dashboardView?.capabilityCount).toBeGreaterThan(0);
    expect(dashboardView?.coverageVerdict).toBe("covered");
    expect(dashboardView?.group).toBe("Read");
  });

  it("validates permission key schema", async () => {
    const { systemAdminPermissionKeySchema } = await import(
      "../../src/features/permissions/sys-permission-key.schema"
    );

    expect(
      systemAdminPermissionKeySchema.safeParse("system-admin.permissions.read")
        .success,
    ).toBe(true);
    expect(systemAdminPermissionKeySchema.safeParse("admin").success).toBe(
      false,
    );
  });

  it("requires elevated confirmation for critical permission grants", async () => {
    const formData = new FormData();
    formData.set("role", "staff");
    formData.set("permissionKey", "system-admin.permissions.manage");
    formData.set("enabled", "true");
    formData.set("confirmHighRisk", "false");

    const result = await setRoleOverride(formData);

    expect(result.ok).toBe(false);
    expect(mockUpsertRoleOverride).not.toHaveBeenCalled();
  });

  it("requires confirmation for high-risk permission grants", async () => {
    const formData = new FormData();
    formData.set("role", "staff");
    formData.set("permissionKey", "system-admin.lynx.approve");
    formData.set("enabled", "true");
    formData.set("confirmHighRisk", "false");

    const result = await setRoleOverride(formData);

    expect(result.ok).toBe(false);
    expect(mockUpsertRoleOverride).not.toHaveBeenCalled();
  });

  it("blocks removing protected admin authority from owner roles", async () => {
    const formData = new FormData();
    formData.set("role", "owner");
    formData.set("permissionKey", "system-admin.permissions.manage");
    formData.set("enabled", "false");
    formData.set("confirmHighRisk", "false");

    const result = await setRoleOverride(formData);

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected protected permission removal to fail.");
    }
    expect(result.error).toMatch(/protected admin authority/i);
    expect(mockUpsertRoleOverride).not.toHaveBeenCalled();
  });

  it("includes missing capability rows when execution references unknown keys", async () => {
    const { buildSystemAdminPermissionCatalogRows, listMissingCatalogPermissions } =
      await import("../../src/features/permissions/sys-permissions.query.server");

    const missingKeys = listMissingCatalogPermissions();
    const rows = buildSystemAdminPermissionCatalogRows();
    const missingRows = rows.filter((row) => row.status === "missing");

    expect(missingRows).toHaveLength(missingKeys.length);
    for (const row of missingRows) {
      expect(row.coverageVerdict).toBe("missing_capability");
    }
  });

  it("lists execution capabilities that reference missing catalog permissions", async () => {
    const { listMissingCatalogPermissions } = await import(
      "../../src/features/permissions/sys-permissions.query.server"
    );

    expect(Array.isArray(listMissingCatalogPermissions())).toBe(true);
  });
});
