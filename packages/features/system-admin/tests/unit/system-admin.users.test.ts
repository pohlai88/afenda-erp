import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GOVERNED_ACTION_ID_FIELD,
  GOVERNED_CONFIRM_FIELD,
  GOVERNED_SELECTED_ROW_ID_FIELD,
  clearGovernedServerActionRegistryForTest,
  resolveGovernedBulkServerAction,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { systemAdminInspectUserAccessInputSchema, systemAdminInviteUserInputSchema, systemAdminResendInvitationInputSchema, systemAdminUserStatusInputSchema } from "../../src/features/users/sys-users.schema";
import { SYSTEM_ADMIN_USERS_BULK_SUSPEND_ACTION_ID } from "../../src/features/users/sys-users-actions.contract";

const mockRequireUsersManage = vi.fn();
const mockRequireUsersRead = vi.fn();
const mockWriteAudit = vi.fn();
const mockRequireExecutionContext = vi.fn();
const mockUpdateMembershipStatus = vi.fn();
const mockResendInvitation = vi.fn();
const mockRevokeInvitation = vi.fn();
const mockGetMembership = vi.fn();
const mockListActorLastActivityAt = vi.fn();
const mockCreateOrganizationInvitation = vi.fn();
const mockHasOrganizationInvitationWithEmail = vi.fn();
const mockHasTenantMemberWithEmail = vi.fn();
const mockAssertInvite = vi.fn();
const mockCreateInvite = vi.fn();
const mockInspectAccess = vi.fn();
const mockCreateNeonAuthUser = vi.fn();
const mockBanNeonAuthUser = vi.fn();
const mockRevokeNeonAuthUserSessions = vi.fn();
const mockImpersonateNeonAuthUser = vi.fn();

vi.mock(
  "../../src/overview/policies/system-admin.capability.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/features/overview/sys-capability.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminUsersManage: () => mockRequireUsersManage(),
      requireSystemAdminUsersRead: () => mockRequireUsersRead(),
    };
  },
);

vi.mock("@afenda/kernel/execution", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@afenda/kernel/execution")>();
  return {
    ...actual,
    requireExecutionContext: () => mockRequireExecutionContext(),
    writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
  };
});

vi.mock("@afenda/auth/server", () => ({
  createNeonAuthAdminUser: (...args: unknown[]) =>
    mockCreateNeonAuthUser(...args),
  banNeonAuthAdminUser: (...args: unknown[]) => mockBanNeonAuthUser(...args),
  revokeNeonAuthAdminUserSessions: (...args: unknown[]) =>
    mockRevokeNeonAuthUserSessions(...args),
  impersonateNeonAuthAdminUser: (...args: unknown[]) =>
    mockImpersonateNeonAuthUser(...args),
}));

vi.mock(
  "../../src/features/memberships/sys-memberships.query.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/features/memberships/sys-memberships.query.server")
      >();
    return {
      ...actual,
      updateMembershipStatus: (...args: unknown[]) =>
        mockUpdateMembershipStatus(...args),
    };
  },
);

vi.mock("@afenda/db", () => {
  return {
    createOrganizationInvitation: (...args: unknown[]) =>
      mockCreateOrganizationInvitation(...args),
    getTenantMembershipById: (...args: unknown[]) => mockGetMembership(...args),
    hasOrganizationInvitationWithEmail: (...args: unknown[]) =>
      mockHasOrganizationInvitationWithEmail(...args),
    hasTenantMemberWithEmail: (...args: unknown[]) =>
      mockHasTenantMemberWithEmail(...args),
    listActorLastActivityAt: (...args: unknown[]) =>
      mockListActorLastActivityAt(...args),
    resendOrganizationInvitation: (...args: unknown[]) =>
      mockResendInvitation(...args),
    revokeOrganizationInvitation: (...args: unknown[]) =>
      mockRevokeInvitation(...args),
  };
});

vi.mock(
  "../../src/features/users/sys-users.query.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/features/users/sys-users.query.server")
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
  "../../src/features/users/sys-users-access.query.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/features/users/sys-users-access.query.server")
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
  context: {
    organizationId: "org_1",
    organizationSlug: "demo-org",
    userId: "actor_1",
    membershipId: "member_actor",
    locale: "en-MY",
    actorType: "user" as const,
    capabilities: [
      "system-admin.users.read",
      "system-admin.users.manage",
      "system-admin.identity.read",
      "system-admin.identity.write",
    ],
    role: "admin" as const,
    sessionSource: "neon" as const,
  },
  organization: {
    id: "org_1",
    slug: "demo-org",
    locale: "en-MY",
    role: "admin" as const,
    capabilities: [
      "system-admin.users.read",
      "system-admin.users.manage",
      "system-admin.identity.read",
      "system-admin.identity.write",
    ],
  },
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
    mockRequireExecutionContext.mockResolvedValue(guardContext.context);
    mockUpdateMembershipStatus.mockResolvedValue(undefined);
    mockListActorLastActivityAt.mockResolvedValue(new Map());
    mockCreateOrganizationInvitation.mockResolvedValue({
      invitationId: "invite_1",
      token: "tok",
    });
    mockHasOrganizationInvitationWithEmail.mockResolvedValue(false);
    mockHasTenantMemberWithEmail.mockResolvedValue(false);
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
    mockCreateNeonAuthUser.mockResolvedValue({ id: "user_new" });
    mockBanNeonAuthUser.mockResolvedValue({ id: "user_2" });
    mockRevokeNeonAuthUserSessions.mockResolvedValue({ revoked: true });
    mockImpersonateNeonAuthUser.mockResolvedValue({ redirectTo: "/account" });
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
    mockRequireExecutionContext.mockRejectedValueOnce(new Error("Forbidden"));

    const { requireSystemAdminUsersRead } = await import(
      "../../src/features/overview/sys-capability.policy.server"
    );

    await expect(requireSystemAdminUsersRead()).rejects.toThrow("Forbidden");
  });

  it("denies non-admin from manage mutations via policy guard", async () => {
    mockRequireExecutionContext.mockRejectedValueOnce(new Error("Forbidden"));

    const { requireSystemAdminUsersManage } = await import(
      "../../src/features/overview/sys-capability.policy.server"
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
        "../../src/features/users/sys-users.actions.server"
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
      "../../src/features/users/sys-users.actions.server"
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
      "../../src/features/users/sys-users.actions.server"
    );

    const result = await resendSystemAdminInvitation("invite_1");
    expect(result.ok).toBe(false);
  });

  it("writes audit evidence on suspend, reactivate, and remove", async () => {
    const {
      suspendSystemAdminUser,
      reactivateSystemAdminUser,
      removeSystemAdminUser,
    } = await import("../../src/features/users/sys-users.actions.server");

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
      "../../src/features/users/sys-users-governed-actions.server"
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
      "../../src/features/users/sys-users.actions.server"
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
      "../../src/features/users/sys-users.actions.server"
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
      "../../src/features/users/sys-users.actions.server"
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
      "../../src/features/users/sys-users.actions.server"
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
      "../../src/features/users/sys-users.actions.server"
    );

    const result = await suspendSystemAdminUser("member_1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("owner or admin");
    }
  });

  it("inspect access returns roles and effective permissions", async () => {
    const { inspectSystemAdminUserAccessAction } = await import(
      "../../src/features/users/sys-users.actions.server"
    );

    const result = await inspectSystemAdminUserAccessAction("member_1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.assignedRoles).toEqual(["admin"]);
      expect(result.data?.effectivePermissions).toContain("system-admin.users.read");
    }
  });

  it("creates a Neon Auth identity through system-admin", async () => {
    const { createSystemAdminNeonAuthUser } = await import(
      "../../src/features/users/sys-users.actions.server"
    );
    const formData = new FormData();
    formData.set("email", "new-auth@example.com");
    formData.set("name", "New Auth");
    formData.set("password", "temporary-secret");

    const result = await createSystemAdminNeonAuthUser(undefined, formData);

    expect(result.ok).toBe(true);
    expect(mockCreateNeonAuthUser).toHaveBeenCalledWith({
      email: "new-auth@example.com",
      name: "New Auth",
      password: "temporary-secret",
    });
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.neon-auth.user.create",
        targetType: "neon_auth_user",
      }),
    );
  });

  it("runs Neon Auth ban, session revocation, and impersonation against linked auth user ids", async () => {
    const {
      banSystemAdminNeonAuthUser,
      revokeSystemAdminNeonAuthUserSessions,
      impersonateSystemAdminNeonAuthUser,
    } = await import("../../src/features/users/sys-users.actions.server");

    await banSystemAdminNeonAuthUser("member_1");
    await revokeSystemAdminNeonAuthUserSessions("member_1");
    await impersonateSystemAdminNeonAuthUser("member_1");

    expect(mockBanNeonAuthUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_2" }),
    );
    expect(mockRevokeNeonAuthUserSessions).toHaveBeenCalledWith({
      userId: "user_2",
    });
    expect(mockImpersonateNeonAuthUser).toHaveBeenCalledWith({
      userId: "user_2",
    });
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.neon-auth.user.ban",
        targetType: "neon_auth_user",
        targetId: "user_2",
      }),
    );
  });

  it("blocks Neon Auth identity admin actions against the current session", async () => {
    mockGetMembership.mockResolvedValueOnce({
      membershipId: "member_1",
      authUserId: "actor_1",
      role: "admin",
      status: "active",
    });

    const { banSystemAdminNeonAuthUser } = await import(
      "../../src/features/users/sys-users.actions.server"
    );

    const result = await banSystemAdminNeonAuthUser("member_1");

    expect(result.ok).toBe(false);
    expect(mockBanNeonAuthUser).not.toHaveBeenCalled();
  });
});

describe("system admin users query", () => {
  it("passes list limit to tenant identity reads", async () => {
    const identityRepository = await import(
      "../../src/features/users/sys-identity.repository.server"
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
      "../../src/features/users/sys-users.query.server"
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
      "../../src/features/users/sys-users.query.server"
    );
    vi.spyOn(usersQuery, "listSystemAdminUsers").mockResolvedValueOnce([]);

    const { buildSystemAdminUsersPageModel } = await import(
      "../../src/features/users/sys-users.page-model.server"
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
      "../../src/features/users/sys-users.query.server"
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
      "../../src/features/users/sys-users.page-model.server"
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
      "../../src/features/users/sys-users-list.surface"
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
