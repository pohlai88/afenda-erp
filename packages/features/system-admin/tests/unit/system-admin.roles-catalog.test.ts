import { describe, expect, it, vi } from "vitest";
import {
  systemAdminDeprecateRoleInputSchema,
  systemAdminUpdateRoleInputSchema,
} from "../../src/roles/schemas/system-admin.roles.schema";

const mockUpsertTenantRoleCatalogEntry = vi.fn();
const mockRequireRolesManage = vi.fn();
const mockWriteAudit = vi.fn();

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    upsertTenantRoleCatalogEntry: (...args: unknown[]) =>
      mockUpsertTenantRoleCatalogEntry(...args),
  };
});

vi.mock(
  "../../src/overview/policies/system-admin.capability.policy.server",
  () => ({
    requireSystemAdminRolesManage: () => mockRequireRolesManage(),
  }),
);

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: vi.fn(async () => undefined),
}));

describe("system admin role catalog mutations", () => {
  it("validates role update schema", () => {
    const parsed = systemAdminUpdateRoleInputSchema.safeParse({
      role: "staff",
      displayName: "Operator",
      description: "Day-to-day ERP work",
    });

    expect(parsed.success).toBe(true);
  });

  it("validates role deprecate schema", () => {
    const parsed = systemAdminDeprecateRoleInputSchema.safeParse({
      role: "viewer",
    });

    expect(parsed.success).toBe(true);
  });

  it("writes audit when updating role metadata", async () => {
    mockRequireRolesManage.mockResolvedValue({
      context: { userId: "actor_1", actorType: "user" },
      organization: { id: "org_1" },
    });
    mockUpsertTenantRoleCatalogEntry.mockResolvedValue(undefined);

    const { updateSystemAdminRoleForm } = await import(
      "../../src/roles/actions/system-admin.roles.actions.server"
    );

    const formData = new FormData();
    formData.set("role", "staff");
    formData.set("displayName", "Field operator");
    formData.set("description", "Updated label");

    const result = await updateSystemAdminRoleForm(formData);

    expect(result.ok).toBe(true);
    expect(mockUpsertTenantRoleCatalogEntry).toHaveBeenCalled();
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.role.update",
        targetId: "staff",
      }),
    );
  });
});
