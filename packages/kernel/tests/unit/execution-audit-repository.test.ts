import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAuditLog: vi.fn(async () => undefined),
  insertAuditLog: vi.fn(async () => undefined),
}));

vi.mock("@afenda/db", () => ({
  createAuditLog: mocks.createAuditLog,
  insertAuditLog: mocks.insertAuditLog,
}));

const { writeExecutionAuditEvent, writeExecutionAuditEventInTransaction } =
  await import("../../src/ker-execution-audit");

describe("execution audit repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists through the non-transactional writer", async () => {
    await writeExecutionAuditEvent({
      organizationId: "org_123",
      actorId: "user_123",
      actorType: "user",
      action: "system_admin.role.updated",
      targetType: "role",
      targetId: "role_1",
      metadata: {
        token: "secret",
      },
    });

    expect(mocks.createAuditLog).toHaveBeenCalledTimes(1);
    expect(mocks.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_123",
        actorAuthUserId: "user_123",
        action: "system_admin.role.updated",
        subjectType: undefined,
        subjectId: undefined,
        targetType: "role",
        targetId: "role_1",
        metadata: {
          token: "[redacted]",
        },
      }),
    );
  });

  it("propagates transaction write failures", async () => {
    mocks.insertAuditLog.mockRejectedValueOnce(new Error("audit failed"));

    await expect(
      writeExecutionAuditEventInTransaction(
        {} as never,
        {
          organizationId: "org_123",
          actorId: "user_123",
          actorType: "user",
          action: "system_admin.role.updated",
          targetType: "role",
          targetId: "role_1",
        },
      ),
    ).rejects.toThrow("audit failed");

    expect(mocks.insertAuditLog).toHaveBeenCalledTimes(1);
    expect(mocks.insertAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org_123",
        actorAuthUserId: "user_123",
        subjectType: undefined,
        subjectId: undefined,
        entityId: "role_1",
        targetType: "role",
      }),
    );
  });
});
