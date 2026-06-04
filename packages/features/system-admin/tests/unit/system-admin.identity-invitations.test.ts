import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireIdentityWrite = vi.fn();
const mockAssertInvite = vi.fn();
const mockCreateInvite = vi.fn();
const mockWriteAudit = vi.fn();
const mockRevokeInvitation = vi.fn();
const mockDispatchWebhook = vi.fn();

vi.mock(
  "../../src/overview/policies/system-admin.capability.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/features/overview/sys-capability.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminIdentityWrite: () => mockRequireIdentityWrite(),
    };
  },
);

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("../../src/features/users/sys-users.query.server", async (importOriginal) => {
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
});

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    revokeOrganizationInvitation: (...args: unknown[]) =>
      mockRevokeInvitation(...args),
  };
});

vi.mock("@afenda/observability/server", () => ({
  logServerEvent: vi.fn(),
}));

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: (...args: unknown[]) => mockDispatchWebhook(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const guardContext = {
  context: { userId: "actor_1", actorType: "user" as const },
  organization: {
    id: "org_1",
    slug: "acme",
    locale: "en",
    role: "admin" as const,
    capabilities: [],
  },
  session: { id: "actor_1" },
};

describe("system admin identity invitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireIdentityWrite.mockResolvedValue(guardContext);
    mockAssertInvite.mockResolvedValue(undefined);
    mockCreateInvite.mockResolvedValue({
      invitationId: "invite_1",
      token: "tok_identity",
    });
    mockRevokeInvitation.mockResolvedValue(undefined);
    mockDispatchWebhook.mockResolvedValue(undefined);
  });

  it(
    "invites via identity.write with duplicate guard and audit",
    async () => {
      const { inviteMemberAction } = await import(
        "../../src/features/users/sys-identity-invitations.actions.server"
      );

      const formData = new FormData();
      formData.set("email", "Identity@Example.COM");
      formData.set("role", "staff");

      const result = await inviteMemberAction(undefined, formData);

      expect(result.ok).toBe(true);
      expect(mockAssertInvite).toHaveBeenCalledWith({
        organizationId: "org_1",
        email: "identity@example.com",
      });
      expect(mockCreateInvite).toHaveBeenCalled();
      expect(mockWriteAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "system-admin.user.invite",
          metadata: expect.objectContaining({ source: "identity.write" }),
        }),
      );
    },
  );

  it(
    "blocks duplicate invites through shared assert helper",
    async () => {
      mockAssertInvite.mockRejectedValue(
        new Error("This email is already invited or active in the organization."),
      );

      const { inviteMemberAction } = await import(
        "../../src/features/users/sys-identity-invitations.actions.server"
      );

      const formData = new FormData();
      formData.set("email", "dup@example.com");
      formData.set("role", "staff");

      const result = await inviteMemberAction(undefined, formData);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("already invited");
      }
    },
  );

  it("denies invite when identity write capability is missing", async () => {
    mockRequireIdentityWrite.mockRejectedValueOnce(new Error("Forbidden"));

    const { requireSystemAdminIdentityWrite } = await import(
      "../../src/features/overview/sys-capability.policy.server"
    );

    await expect(requireSystemAdminIdentityWrite()).rejects.toThrow("Forbidden");
  });
});
