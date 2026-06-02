import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GOVERNED_ACTION_ID_FIELD,
  GOVERNED_CONFIRM_FIELD,
  GOVERNED_SELECTED_ROW_ID_FIELD,
  clearGovernedServerActionRegistryForTest,
  resolveGovernedBulkServerAction,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import {
  systemAdminInspectUserAccessInputSchema,
  systemAdminInviteUserInputSchema,
  systemAdminResendInvitationInputSchema,
  systemAdminUserStatusInputSchema,
} from "../../src/users/schemas";
import { SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID } from "../../src/users/contracts/system-admin.users-actions.contract";

const mockRequireUsersManage = vi.fn();
const mockRequireUsersRead = vi.fn();
const mockWriteAudit = vi.fn();
const mockUpdateMembershipStatus = vi.fn();
const mockResendInvitation = vi.fn();
const mockRevokeInvitation = vi.fn();
const mockGetMembership = vi.fn();
const mockAssertInvite = vi.fn();
const mockCreateInvite = vi.fn();
const mockInspectAccess = vi.fn();

vi.mock(
  "../../src/overview/policies/system-admin.capability.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/overview/policies/system-admin.capability.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminUsersManage: () => mockRequireUsersManage(),
      requireSystemAdminUsersRead: () => mockRequireUsersRead(),
    };
  },
);

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock(
  "../../src/memberships/data/system-admin.memberships.query.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/memberships/data/system-admin.memberships.query.server")
      >();
    return {
      ...actual,
      updateMembershipStatus: (...args: unknown[]) =>
        mockUpdateMembershipStatus(...args),
    };
  },
);

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    getTenantMembershipById: (...args: unknown[]) => mockGetMembership(...args),
    resendOrganizationInvitation: (...args: unknown[]) =>
      mockResendInvitation(...args),
    revokeOrganizationInvitation: (...args: unknown[]) =>
      mockRevokeInvitation(...args),
  };
});

vi.mock(
  "../../src/users/data/system-admin.users.query.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/users/data/system-admin.users.query.server")
      >();
    return {
      ...actual,
      assertSystemAdminUserCanBeInvited: (...args: unknown[]) =>
        mockAssertInvite(...args),
      createSystemAdminUserInvitation: (...args: unknown[]) =>
        mockCreateInvite(...args),
    };
  },
);

vi.mock(
  "../../src/users/data/system-admin.users-access.query.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/users/data/system-admin.users-access.query.server")
      >();
    return {
      ...actual,
      inspectSystemAdminUserAccess: (...args: unknown[]) =>
        mockInspectAccess(...args),
    };
  },
);

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const guardContext = {
  context: { userId: "actor_1", actorType: "user" as const },
  organization: { id: "org_1" },
  session: { id: "actor_1" },
};

describe("system admin users schemas", () => {
  it("validates invite, status, resend, and inspect inputs", () => {
    expect(
      systemAdminInviteUserInputSchema.parse({
        email: "Admin@Example.COM",
        role: "admin",
      }),
    ).toEqual({ email: "admin@example.com", role: "admin" });

    expect(
      systemAdminUserStatusInputSchema.safeParse({
        membershipId: "member_1",
        status: "removed",
      }).success,
    ).toBe(true);

    expect(
      systemAdminResendInvitationInputSchema.safeParse({
        invitationId: "invite_1",
      }).success,
    ).toBe(true);

    expect(
      systemAdminInspectUserAccessInputSchema.safeParse({
        membershipId: "member_1",
      }).success,
    ).toBe(true);
  });
});

describe("system admin users actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireUsersManage.mockResolvedValue(guardContext);
    mockRequireUsersRead.mockResolvedValue(guardContext);
    mockUpdateMembershipStatus.mockResolvedValue(undefined);
    mockGetMembership.mockResolvedValue({
      membershipId: "member_1",
      authUserId: "user_2",
      role: "admin",
      status: "active",
    });
    mockCreateInvite.mockResolvedValue({ invitationId: "invite_1", token: "tok" });
    mockAssertInvite.mockResolvedValue(undefined);
    mockResendInvitation.mockResolvedValue({ invitationId: "invite_1", token: "tok2" });
    mockRevokeInvitation.mockResolvedValue(undefined);
    mockInspectAccess.mockResolvedValue({
      membershipId: "member_1",
      userLabel: "Alex",
      email: "alex@example.com",
      membershipStatus: "active",
      assignedRoles: ["admin"],
      effectivePermissions: ["system-admin.users.read"],
      enabledModules: ["Finance"],
      accessibleCapabilities: ["system-admin.users.read"],
      blockedCapabilities: ["finance.view"],
      accessImpact: "Active memberships receive access through assigned roles and tenant overrides.",
    });
  });

  afterEach(() => {
    clearGovernedServerActionRegistryForTest();
  });

  it("denies non-admin from reading users via policy guard", async () => {
    mockRequireUsersRead.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminUsersRead } = await import(
      "../../src/overview/policies/system-admin.capability.policy.server"
    );

    await expect(requireSystemAdminUsersRead()).rejects.toThrow("Forbidden");
  });

  it("denies non-admin from manage mutations via policy guard", async () => {
    mockRequireUsersManage.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminUsersManage } = await import(
      "../../src/overview/policies/system-admin.capability.policy.server"
    );

    await expect(requireSystemAdminUsersManage()).rejects.toThrow("Forbidden");
  });

  it(
    "blocks duplicate invites",
    async () => {
      mockAssertInvite.mockRejectedValue(
        new Error("This email is already invited or active in the organization."),
      );

      const { inviteSystemAdminUser } = await import(
        "../../src/users/actions/system-admin.users.actions.server"
      );
      const formData = new FormData();
      formData.set("email", "dup@example.com");
      formData.set("role", "staff");

      const result = await inviteSystemAdminUser(undefined, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("already invited");
      }
    },
  );

  it("writes audit evidence on invite", async () => {
    const { inviteSystemAdminUser } = await import(
      "../../src/users/actions/system-admin.users.actions.server"
    );
    const formData = new FormData();
    formData.set("email", "new@example.com");
    formData.set("role", "staff");

    const result = await inviteSystemAdminUser(undefined, formData);
    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.user.invite",
        targetType: "user_invitation",
      }),
    );
  });

  it("resend invite only works for pending invitations", async () => {
    mockResendInvitation.mockRejectedValue(
      new Error("Only pending invitations can be resent."),
    );

    const { resendSystemAdminInvitation } = await import(
      "../../src/users/actions/system-admin.users.actions.server"
    );

    const result = await resendSystemAdminInvitation("invite_1");
    expect(result.ok).toBe(false);
  });

  it("writes audit evidence on suspend, reactivate, and remove", async () => {
    const {
      suspendSystemAdminUser,
      reactivateSystemAdminUser,
      removeSystemAdminUser,
    } = await import("../../src/users/actions/system-admin.users.actions.server");

    await suspendSystemAdminUser("member_1");
    await reactivateSystemAdminUser("member_1");
    await removeSystemAdminUser("member_1");

    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "system-admin.user.suspend" }),
    );
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "system-admin.user.reactivate" }),
    );
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "system-admin.user.remove" }),
    );
  });

  it("registered bulk suspend rejects no selected rows before auth", async () => {
    const { registerSystemAdminUsersGovernedActions } = await import(
      "../../src/users/actions/system-admin.users-governed-actions.server"
    );
    registerSystemAdminUsersGovernedActions();
    const action = resolveGovernedBulkServerAction(
      SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID,
    );
    const formData = new FormData();
    formData.set(
      GOVERNED_ACTION_ID_FIELD,
      SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID,
    );
    formData.set(GOVERNED_CONFIRM_FIELD, "confirmed");

    const result = (await action?.(
      undefined,
      formData,
    )) as ActionResult | undefined;

    expect(result?.ok).toBe(false);
    expect(result).toMatchObject({ code: "governed.selection.too_few" });
    expect(mockRequireUsersManage).not.toHaveBeenCalled();
  });

  it("bulk suspend rejects tampered selected membership ids", async () => {
    mockGetMembership.mockResolvedValueOnce(null);
    const { bulkSuspendSystemAdminUsers } = await import(
      "../../src/users/actions/system-admin.users.actions.server"
    );
    const formData = new FormData();
    formData.append(GOVERNED_SELECTED_ROW_ID_FIELD, "member_missing");

    const result = await bulkSuspendSystemAdminUsers(undefined, formData);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      code: "system-admin.users.bulk.selection_mismatch",
    });
    expect(mockUpdateMembershipStatus).not.toHaveBeenCalled();
  });

  it("bulk suspend rejects self-suspension", async () => {
    mockGetMembership.mockResolvedValueOnce({
      membershipId: "member_1",
      authUserId: "actor_1",
      role: "admin",
      status: "active",
    });
    const { bulkSuspendSystemAdminUsers } = await import(
      "../../src/users/actions/system-admin.users.actions.server"
    );
    const formData = new FormData();
    formData.append(GOVERNED_SELECTED_ROW_ID_FIELD, "member_1");

    const result = await bulkSuspendSystemAdminUsers(undefined, formData);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      code: "system-admin.users.bulk.self_suspension",
    });
    expect(mockUpdateMembershipStatus).not.toHaveBeenCalled();
  });

  it("bulk suspend suspends valid active memberships and revalidates users", async () => {
    const memberOne = {
      membershipId: "member_1",
      authUserId: "user_1",
      role: "admin",
      status: "active",
    };
    const memberTwo = {
      membershipId: "member_2",
      authUserId: "user_2",
      role: "staff",
      status: "active",
    };
    mockGetMembership
      .mockResolvedValueOnce(memberOne)
      .mockResolvedValueOnce(memberTwo)
      .mockResolvedValueOnce(memberOne)
      .mockResolvedValueOnce(memberTwo);
    const { bulkSuspendSystemAdminUsers } = await import(
      "../../src/users/actions/system-admin.users.actions.server"
    );
    const { revalidatePath } = await import("next/cache");
    const formData = new FormData();
    formData.append(GOVERNED_SELECTED_ROW_ID_FIELD, "member_1");
    formData.append(GOVERNED_SELECTED_ROW_ID_FIELD, "member_2");

    const result = await bulkSuspendSystemAdminUsers(undefined, formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.updatedCount).toBe(2);
    }
    expect(mockUpdateMembershipStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipId: "member_1",
        status: "suspended",
      }),
    );
    expect(mockUpdateMembershipStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipId: "member_2",
        status: "suspended",
      }),
    );
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "system-admin.user.suspend" }),
    );
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(
      "/system-admin/users",
    );
  });

  it("blocks self suspend and remove from the Users surface", async () => {
    mockGetMembership.mockResolvedValue({
      membershipId: "member_1",
      authUserId: "actor_1",
      role: "admin",
      status: "active",
    });

    const { suspendSystemAdminUser } = await import(
      "../../src/users/actions/system-admin.users.actions.server"
    );

    const result = await suspendSystemAdminUser("member_1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("your own membership");
    }
    expect(mockUpdateMembershipStatus).not.toHaveBeenCalled();
  });

  it("cannot suspend last active admin", async () => {
    mockUpdateMembershipStatus.mockRejectedValue(
      new Error("At least one active owner or admin must remain."),
    );

    const { suspendSystemAdminUser } = await import(
      "../../src/users/actions/system-admin.users.actions.server"
    );

    const result = await suspendSystemAdminUser("member_1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("owner or admin");
    }
  });

  it("inspect access returns roles and effective permissions", async () => {
    const { inspectSystemAdminUserAccessAction } = await import(
      "../../src/users/actions/system-admin.users.actions.server"
    );

    const result = await inspectSystemAdminUserAccessAction("member_1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.assignedRoles).toEqual(["admin"]);
      expect(result.data?.effectivePermissions).toContain("system-admin.users.read");
    }
  });
});

describe("system admin users query", () => {
  it("passes list limit to tenant identity reads", async () => {
    const identityRepository = await import(
      "../../src/users/data/system-admin.identity.repository.server"
    );
    const listMembers = vi
      .spyOn(identityRepository, "listTenantMembers")
      .mockResolvedValueOnce([]);
    const listInvitations = vi
      .spyOn(identityRepository, "listOrganizationInvitations")
      .mockResolvedValueOnce([]);

    const db = await import("@afenda/db");
    vi.spyOn(db, "listActorLastActivityAt").mockResolvedValueOnce(new Map());

    const { listSystemAdminUsers } = await import(
      "../../src/users/data/system-admin.users.query.server"
    );

    await listSystemAdminUsers({ organizationId: "org_1", limit: 25 });

    expect(listMembers).toHaveBeenCalledWith({
      organizationId: "org_1",
      limit: 25,
    });
    expect(listInvitations).toHaveBeenCalledWith({
      organizationId: "org_1",
      limit: 25,
    });
  });
});

describe("system admin users page model", () => {
  it("writes audit evidence when the user directory is viewed", async () => {
    const usersQuery = await import(
      "../../src/users/data/system-admin.users.query.server"
    );
    vi.spyOn(usersQuery, "listSystemAdminUsers").mockResolvedValueOnce([]);

    const { buildSystemAdminUsersPageModel } = await import(
      "../../src/users/data/system-admin.users.page-model.server"
    );

    await buildSystemAdminUsersPageModel({
      organizationId: "org_1",
      actorId: "actor_1",
      actorType: "user",
    });

    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.user_directory.view",
      }),
    );
  });

  it("filters users by search and status", async () => {
    const usersQuery = await import(
      "../../src/users/data/system-admin.users.query.server"
    );
    vi.spyOn(usersQuery, "listSystemAdminUsers").mockResolvedValueOnce([
      {
        id: "member_1",
        membershipId: "member_1",
        invitationId: null,
        authUserId: "user_1",
        name: "Alex Admin",
        email: "alex@example.com",
        status: "active",
        membership: "active",
        roles: ["admin"],
        lastActive: "27 May 2026",
        invitedAt: null,
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        id: "invite_1",
        membershipId: null,
        invitationId: "invite_1",
        authUserId: null,
        name: "Pending invite",
        email: "pending@example.com",
        status: "invited",
        membership: "pending",
        roles: ["staff"],
        lastActive: "Not joined",
        invitedAt: new Date("2026-01-02T00:00:00.000Z"),
        joinedAt: null,
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    ]);

    const { buildSystemAdminUsersPageModel } = await import(
      "../../src/users/data/system-admin.users.page-model.server"
    );

    const model = await buildSystemAdminUsersPageModel({
      organizationId: "org_1",
      actorId: "actor_1",
      actorType: "user",
      searchParams: { usersQ: "alex", usersStatus: "active" },
    });

    expect(model.users).toHaveLength(1);
    expect(model.users[0]?.email).toBe("alex@example.com");
  });
});

describe("system admin users list surface", () => {
  it("serializes governed list configuration for users", async () => {
    const { buildUsersListSurface } = await import(
      "../../src/users/surface/system-admin.users-list.surface"
    );

    const surface = buildUsersListSurface({
      users: [
        {
          id: "member_1",
          membershipId: "member_1",
          invitationId: null,
          authUserId: "user_1",
          name: "Alex",
          email: "alex@example.com",
          status: "active",
          membership: "active",
          roles: ["admin"],
          lastActive: "27 May 2026",
          invitedAt: null,
          joinedAt: new Date("2026-01-01T00:00:00.000Z"),
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ],
      canMutate: true,
    });

    expect(surface.dataNature).toBe("table");
    expect(surface.rows).toHaveLength(1);
    expect(surface.rows[0]?.cells.email).toBe("alex@example.com");
    expect(surface.rows[0]?.trailingAction).toBeDefined();
    expect(surface.rows[0]?.trailingAction?.state).toBe("ready");
    expect(surface.rows[0]?.cellKinds?.roles?.kind).toBe("link");
  });
});
