import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMembersListSurface } from "../../src/features/memberships/sys-memberships-list.surface";
import { systemAdminMembershipsGalleryRows } from "../../src/features/memberships/sys-memberships-gallery.fixtures.shared";
import { systemAdminMembershipStatusInputSchema } from "../../src/features/memberships/sys-memberships.schema";

const mockListMemberships = vi.fn();
const mockRequireMembershipsManage = vi.fn();
const mockRequireMembershipsRead = vi.fn();
const mockRequireRolesManage = vi.fn();
const mockWriteAudit = vi.fn();
const mockUpdateMembershipStatus = vi.fn();
const mockRemoveRoleFromMembership = vi.fn();
const mockGetTenantMembershipById = vi.fn();

vi.mock("../../src/memberships/data/system-admin.memberships.query.server", () => ({
  listSystemAdminMemberships: (...args: unknown[]) => mockListMemberships(...args),
  updateMembershipStatus: (...args: unknown[]) => mockUpdateMembershipStatus(...args),
}));

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    getTenantMembershipById: (...args: unknown[]) =>
      mockGetTenantMembershipById(...args),
  };
});

vi.mock("../../src/overview/policies/system-admin.capability.policy.server", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../src/features/overview/sys-capability.policy.server")
    >();
  return {
    ...actual,
    requireSystemAdminMembershipsManage: () => mockRequireMembershipsManage(),
    requireSystemAdminMembershipsRead: () => mockRequireMembershipsRead(),
    requireSystemAdminRolesManage: () => mockRequireRolesManage(),
  };
});

vi.mock("../../src/roles/data/system-admin.roles.query.server", () => ({
  removeRoleFromMembership: (...args: unknown[]) => mockRemoveRoleFromMembership(...args),
}));

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: vi.fn().mockResolvedValue(undefined),
}));

const guardContext = {
  context: { userId: "actor_1", actorType: "user" as const },
  organization: { id: "org_1" },
  session: { id: "actor_1" },
};

describe("system admin memberships schemas", () => {
  it("validates membership status input", () => {
    expect(
      systemAdminMembershipStatusInputSchema.safeParse({
        membershipId: "member_1",
        status: "suspended",
      }).success,
    ).toBe(true);
  });
});

describe("system admin memberships actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireMembershipsManage.mockResolvedValue(guardContext);
    mockRequireMembershipsRead.mockResolvedValue(guardContext);
    mockRequireRolesManage.mockResolvedValue(guardContext);
    mockUpdateMembershipStatus.mockResolvedValue(undefined);
    mockRemoveRoleFromMembership.mockResolvedValue(undefined);
    mockGetTenantMembershipById.mockResolvedValue({
      membershipId: "member_1",
      authUserId: "user_other",
      role: "admin",
      status: "active",
    });
  });

  it("denies non-admin read via policy guard", async () => {
    mockRequireMembershipsRead.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminMembershipsRead } = await import(
      "../../src/features/memberships/sys-memberships.policy.server"
    );

    await expect(requireSystemAdminMembershipsRead()).rejects.toThrow("Forbidden");
  });

  it("denies non-admin manage mutations via policy guard", async () => {
    mockRequireMembershipsManage.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminMembershipsManage } = await import(
      "../../src/features/memberships/sys-memberships.policy.server"
    );

    await expect(requireSystemAdminMembershipsManage()).rejects.toThrow("Forbidden");
  });

  it("non-admin cannot suspend membership", async () => {
    mockRequireMembershipsManage.mockRejectedValue(new Error("Forbidden"));

    const { suspendSystemAdminMembership } = await import(
      "../../src/features/memberships/sys-memberships.actions.server"
    );

    await expect(suspendSystemAdminMembership("member_1")).rejects.toThrow("Forbidden");
    expect(mockUpdateMembershipStatus).not.toHaveBeenCalled();
  });

  it("writes audit evidence on membership suspension", async () => {
    const { suspendSystemAdminMembership } = await import(
      "../../src/features/memberships/sys-memberships.actions.server"
    );

    const result = await suspendSystemAdminMembership("member_1");
    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.membership.suspend",
        targetType: "membership",
        targetId: "member_1",
      }),
    );
  });

  it("writes audit evidence on membership reactivation", async () => {
    const { reactivateSystemAdminMembership } = await import(
      "../../src/features/memberships/sys-memberships.actions.server"
    );

    const result = await reactivateSystemAdminMembership("member_1");
    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.membership.activate",
      }),
    );
  });

  it("writes audit evidence on membership removal", async () => {
    const { removeSystemAdminMembership } = await import(
      "../../src/features/memberships/sys-memberships.actions.server"
    );

    const result = await removeSystemAdminMembership("member_1");
    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.membership.remove",
      }),
    );
  });

  it("cannot suspend last active admin", async () => {
    mockUpdateMembershipStatus.mockRejectedValue(
      new Error("At least one active owner or admin must remain."),
    );

    const { suspendSystemAdminMembership } = await import(
      "../../src/features/memberships/sys-memberships.actions.server"
    );

    const result = await suspendSystemAdminMembership("member_1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("owner or admin");
    }
  });

  it("cannot remove last active owner", async () => {
    mockUpdateMembershipStatus.mockRejectedValue(
      new Error("At least one active owner or admin must remain."),
    );

    const { removeSystemAdminMembership } = await import(
      "../../src/features/memberships/sys-memberships.actions.server"
    );

    const result = await removeSystemAdminMembership("member_1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("owner or admin");
    }
  });

  it("blocks self suspend and remove from the Memberships surface", async () => {
    mockGetTenantMembershipById.mockResolvedValue({
      membershipId: "member_1",
      authUserId: "actor_1",
      role: "admin",
      status: "active",
    });

    const { suspendSystemAdminMembership } = await import(
      "../../src/features/memberships/sys-memberships.actions.server"
    );

    const result = await suspendSystemAdminMembership("member_1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("your own membership");
    }
    expect(mockUpdateMembershipStatus).not.toHaveBeenCalled();
  });

  it("cannot reactivate removed memberships", async () => {
    mockGetTenantMembershipById.mockResolvedValue({
      membershipId: "member_1",
      authUserId: "user_other",
      role: "staff",
      status: "removed",
    });

    const { reactivateSystemAdminMembership } = await import(
      "../../src/features/memberships/sys-memberships.actions.server"
    );

    const result = await reactivateSystemAdminMembership("member_1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Removed memberships");
    }
    expect(mockUpdateMembershipStatus).not.toHaveBeenCalled();
  });

  it("writes audit evidence on role removal from memberships trailing action", async () => {
    const { removeSystemAdminRoleAssignmentForm } = await import(
      "../../src/features/roles/sys-roles.actions.server"
    );

    const formData = new FormData();
    formData.set("membershipId", "member_1");
    formData.set("role", "admin");

    const result = await removeSystemAdminRoleAssignmentForm(formData);
    expect(result.ok).toBe(true);
    expect(mockRemoveRoleFromMembership).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipId: "member_1",
        role: "admin",
      }),
    );
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.role_assignment.remove",
        targetId: "member_1",
      }),
    );
  });
});

describe("system admin memberships page model", () => {
  it("writes audit evidence when the membership directory is viewed", async () => {
    mockListMemberships.mockResolvedValue([]);

    const { buildSystemAdminMembershipsPageModel } = await import(
      "../../src/features/memberships/sys-memberships.page-model.server"
    );

    await buildSystemAdminMembershipsPageModel({
      organizationId: "org_test",
      actorId: "actor_1",
      actorType: "user",
    });

    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.membership_directory.view",
      }),
    );
  });

  it("filters memberships by search query, status, and role", async () => {
    mockListMemberships.mockResolvedValue([
      {
        membershipId: "member-1",
        authUserId: "user-1",
        name: "Alex Admin",
        email: "alex@example.com",
        status: "active",
        role: "admin",
        roleCount: 1,
        createdAt: new Date("2026-01-15T00:00:00.000Z"),
        updatedAt: new Date("2026-05-27T00:00:00.000Z"),
      },
      {
        membershipId: "member-2",
        authUserId: "user-2",
        name: "Sam Staff",
        email: "sam@example.com",
        status: "suspended",
        role: "staff",
        roleCount: 1,
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
        updatedAt: new Date("2026-05-12T00:00:00.000Z"),
      },
    ]);

    const { buildSystemAdminMembershipsPageModel } = await import(
      "../../src/features/memberships/sys-memberships.page-model.server"
    );

    const model = await buildSystemAdminMembershipsPageModel({
      organizationId: "org_test",
      actorId: "actor_1",
      actorType: "user",
      searchParams: {
        membersQ: "alex",
        membersStatus: "active",
      },
      limit: 100,
    });

    expect(model.searchValue).toBe("alex");
    expect(model.statusFilter).toBe("active");
    expect(model.memberships).toHaveLength(1);
    expect(model.memberships[0]?.name).toBe("Alex Admin");
  });

  it("filters memberships by role param", async () => {
    mockListMemberships.mockResolvedValue([
      {
        membershipId: "member-1",
        authUserId: "user-1",
        name: "Alex Admin",
        email: "alex@example.com",
        status: "active",
        role: "admin",
        roleCount: 1,
        createdAt: new Date("2026-01-15T00:00:00.000Z"),
        updatedAt: new Date("2026-05-27T00:00:00.000Z"),
      },
      {
        membershipId: "member-2",
        authUserId: "user-2",
        name: "Sam Staff",
        email: "sam@example.com",
        status: "active",
        role: "staff",
        roleCount: 1,
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
        updatedAt: new Date("2026-05-12T00:00:00.000Z"),
      },
    ]);

    const { buildSystemAdminMembershipsPageModel } = await import(
      "../../src/features/memberships/sys-memberships.page-model.server"
    );

    const model = await buildSystemAdminMembershipsPageModel({
      organizationId: "org_test",
      actorId: "actor_1",
      actorType: "user",
      searchParams: { membersRole: "staff" },
      limit: 100,
    });

    expect(model.roleFilter).toBe("staff");
    expect(model.memberships).toHaveLength(1);
    expect(model.memberships[0]?.role).toBe("staff");
  });
});

describe("system admin memberships list surface", () => {
  it("includes architecture-aligned columns and ERP permission metadata", () => {
    const surface = buildMembersListSurface({
      memberships: systemAdminMembershipsGalleryRows,
      canMutate: true,
    });

    expect(surface.requiresErpPermission).toEqual({
      module: "system-admin",
      object: "members",
      function: "read",
    });
    expect(surface.columns.map((column) => column.id)).toEqual([
      "member",
      "email",
      "status",
      "primaryRole",
      "roleCount",
      "joinedAt",
      "updatedAt",
    ]);
    expect(surface.presentation?.toolbar?.search?.param).toBe("membersQ");
    const roleFilter = surface.presentation?.toolbar?.filters?.find(
      (filter) => filter.param === "membersRole",
    );
    expect(roleFilter?.options.some((option) => option.value === "finance-manager")).toBe(
      true,
    );
    expect(roleFilter?.options.some((option) => option.value === "manager")).toBe(
      false,
    );
  });

  it("serializes list surface configuration for Pattern C", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildMembersListSurface({
        memberships: systemAdminMembershipsGalleryRows,
        canMutate: true,
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.surface.rowKey).toBe("membershipId");
      expect(parsed.data.rows[0]?.cells.primaryRole).toBe("admin");
      expect(parsed.data.rows[0]?.cells.roleCount).toBe("1");
      expect(parsed.data.rows[0]?.cellKinds?.primaryRole?.kind).toBe("link");
    }
  });

  it("preserves unfiltered total count in pagination metadata", () => {
    const surface = buildMembersListSurface({
      memberships: systemAdminMembershipsGalleryRows.slice(0, 1),
      canMutate: true,
      totalCount: systemAdminMembershipsGalleryRows.length,
    });

    expect(surface.pagination?.totalCount).toBe(3);
    expect(surface.rows).toHaveLength(1);
  });
});
