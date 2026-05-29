import { beforeEach, describe, expect, it, vi } from "vitest";
import { systemAdminSeedRoles } from "../../src/roles/contracts";
import { buildRolesListSurface } from "../../src/roles/data/system-admin.roles-list.surface";
import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";

const mockListTenantMembers = vi.fn();
const mockListRoleOverrides = vi.fn();
const mockAssignTenantMembershipRole = vi.fn();
const mockRequireRolesManage = vi.fn();
const mockRequireRolesRead = vi.fn();
const mockWriteAudit = vi.fn();

vi.mock(
  "../../src/users/data/system-admin.identity.repository.server",
  () => ({
    listTenantMembers: (...args: unknown[]) => mockListTenantMembers(...args),
    listRoleOverridesForOrganization: (...args: unknown[]) =>
      mockListRoleOverrides(...args),
  }),
);

vi.mock(
  "../../src/overview/policies/system-admin.capability.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/overview/policies/system-admin.capability.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminRolesManage: () => mockRequireRolesManage(),
      requireSystemAdminRolesRead: () => mockRequireRolesRead(),
    };
  },
);

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    assignTenantMembershipRole: (...args: unknown[]) =>
      mockAssignTenantMembershipRole(...args),
  };
});

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const guardContext = {
  context: { userId: "actor_1", actorType: "user" as const },
  organization: { id: "org_1" },
  session: { id: "actor_1" },
};

describe("system admin roles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRolesManage.mockResolvedValue(guardContext);
    mockRequireRolesRead.mockResolvedValue(guardContext);
    mockListRoleOverrides.mockResolvedValue([]);
    mockListTenantMembers.mockResolvedValue([
      { role: "admin", status: "active" },
      { role: "admin", status: "active" },
      { role: "viewer", status: "active" },
    ]);
    mockAssignTenantMembershipRole.mockResolvedValue(undefined);
  });

  it(
    "lists seeded roles with active assignment counts",
    async () => {
      const { listSystemAdminRoles } = await import(
        "../../src/roles/data/system-admin.roles.query.server"
      );

      const roles = await listSystemAdminRoles({ organizationId: "org_1" });

      expect(roles).toHaveLength(systemAdminSeedRoles.length);
      expect(roles.find((role) => role.key === "admin")?.assignedMembers).toBe(2);
    },
    20_000,
  );

  it("builds page model with permission counts and catalog view audit", async () => {
    const { buildSystemAdminRolesPageModel } = await import(
      "../../src/roles/data/system-admin.roles.page-model.server"
    );

    const model = await buildSystemAdminRolesPageModel({
      organizationId: "org_1",
      actorId: "actor_1",
      actorType: "user",
      searchParams: { rolesQ: "admin" },
    });

    expect(model.searchValue).toBe("admin");
    expect(model.roles.length).toBeGreaterThan(0);
    expect(model.roles.every((role) => (role.permissionCount ?? 0) >= 0)).toBe(
      true,
    );
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.role_catalog.view",
      }),
    );
  });

  it("blocks assignment of deprecated catalog roles", async () => {
    const { assignRoleToMembership } = await import(
      "../../src/roles/data/system-admin.roles.query.server"
    );

    const deprecatedRoles = systemAdminSeedRoles.filter(
      (role) => role.status === "deprecated",
    );
    if (deprecatedRoles.length === 0) {
      await expect(
        assignRoleToMembership({
          organizationId: "org_1",
          actorId: "actor_1",
          membershipId: "member_1",
          role: "owner",
        }),
      ).resolves.toBeUndefined();
      return;
    }

    await expect(
      assignRoleToMembership({
        organizationId: "org_1",
        actorId: "actor_1",
        membershipId: "member_1",
        role: deprecatedRoles[0]!.key,
      }),
    ).rejects.toThrow("Deprecated roles cannot be assigned.");
  });

  it("records audit when assigning a role", async () => {
    const { assignSystemAdminRole } = await import(
      "../../src/roles/actions/system-admin.roles.actions.server"
    );

    const formData = new FormData();
    formData.set("membershipId", "member_1");
    formData.set("role", "staff");

    const result = await assignSystemAdminRole(undefined, formData);

    expect(result.ok).toBe(true);
    expect(mockAssignTenantMembershipRole).toHaveBeenCalled();
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.role_assignment.create",
        targetId: "member_1",
      }),
    );
  });

  it("requires roles.manage to assign roles", async () => {
    mockRequireRolesManage.mockRejectedValue(new Error("Forbidden"));

    const { assignSystemAdminRole } = await import(
      "../../src/roles/actions/system-admin.roles.actions.server"
    );

    const formData = new FormData();
    formData.set("membershipId", "member_1");
    formData.set("role", "staff");

    await expect(assignSystemAdminRole(undefined, formData)).rejects.toThrow(
      "Forbidden",
    );
  });

  it("denies non-admin read via policy guard", async () => {
    mockRequireRolesRead.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminRolesRead } = await import(
      "../../src/roles/policies/system-admin.roles.policy.server"
    );

    await expect(requireSystemAdminRolesRead()).rejects.toThrow("Forbidden");
  });

  it("exposes permission bundle and membership links on the governed surface", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildRolesListSurface({
        roles: [
          {
            id: "admin",
            key: "admin",
            name: "Admin",
            description: "Organization administrator",
            status: "active",
            assignedMembers: 1,
            permissionCount: 12,
          },
        ],
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const row = parsed.data.rows[0];
      expect(row?.cellKinds?.permissions?.kind).toBe("link");
      expect(row?.cellKinds?.assignedMembers?.kind).toBe("link");
    }
  });
});
