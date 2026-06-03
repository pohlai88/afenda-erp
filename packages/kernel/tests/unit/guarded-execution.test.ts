import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExecutionContext } from "../../src/execution-kernel/context/execution-context";

const context: ExecutionContext = {
  organizationId: "org_123",
  organizationSlug: "afenda-ops",
  userId: "user_123",
  membershipId: "member_123",
  locale: "en-MY",
  actorType: "user",
  capabilities: ["hr.view"],
  role: "owner",
  sessionSource: "dev",
};

const mocks = vi.hoisted(() => ({
  requireExecutionContext: vi.fn(async () => context),
  requireExecutionPermission: vi.fn(),
  assertExecutionPolicy: vi.fn(async () => undefined),
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));

vi.mock("../../src/execution-kernel/context/execution-context", () => ({
  requireExecutionContext: mocks.requireExecutionContext,
}));
vi.mock("../../src/execution-kernel/access/execution-access", () => ({
  requireExecutionPermission: mocks.requireExecutionPermission,
}));
vi.mock("../../src/execution-kernel/policy/execution-policy", () => ({
  assertExecutionPolicy: mocks.assertExecutionPolicy,
}));
vi.mock("../../src/execution-kernel/audit/execution-audit", () => ({
  writeExecutionAuditEvent: mocks.writeExecutionAuditEvent,
}));

const { runGuardedExecution } = await import(
  "../../src/execution-kernel/execution/guarded-execution"
);

describe("runGuardedExecution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireExecutionContext.mockResolvedValue(context);
  });

  it("runs the protection envelope then feature execute and audit", async () => {
    const revalidate = vi.fn();

    const result = await runGuardedExecution({
      action: "hr.employee.update",
      permission: "hr.view",
      input: { employeeId: "emp_1", name: "Ada" },
      parse: async (input) => input,
      resolveTarget: (input) => ({
        targetType: "hr-employee",
        targetId: input.employeeId,
      }),
      execute: async () => ({ ok: true }),
      revalidate,
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.requireExecutionContext).toHaveBeenCalledOnce();
    expect(mocks.requireExecutionPermission).toHaveBeenCalledWith(
      context,
      "hr.view",
    );
    expect(mocks.assertExecutionPolicy).toHaveBeenCalledWith(
      context,
      expect.objectContaining({
        action: "hr.employee.update",
        targetType: "hr-employee",
        targetId: "emp_1",
      }),
    );
    expect(mocks.writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_123",
        actorId: "user_123",
        module: "hr",
        action: "hr.employee.update",
        targetType: "hr-employee",
        targetId: "emp_1",
      }),
    );
    expect(revalidate).toHaveBeenCalledOnce();
  });

  it("skips audit when audit.skip is set", async () => {
    await runGuardedExecution({
      action: "hr.employee.preview",
      permission: "hr.view",
      input: {},
      parse: async (input) => input,
      resolveTarget: () => ({ targetType: "hr-employee" }),
      execute: async () => null,
      audit: { skip: true },
    });

    expect(mocks.writeExecutionAuditEvent).not.toHaveBeenCalled();
  });
});
