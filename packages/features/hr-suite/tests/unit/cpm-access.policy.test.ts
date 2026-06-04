import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
  hasExecutionPermission: vi.fn(),
}));

import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import {
  canHrCpmEditRecommendation,
  canHrCpmFinalizeRecommendation,
  canHrCpmReviewRecommendation,
  canHrCpmSubmitRecommendation,
  HR_CPM_APPROVE_CAPABILITY,
  HR_CPM_WRITE_CAPABILITY,
  requireHrCpmApprove,
  requireHrCpmRead,
  requireHrCpmWrite,
} from "../../src/payroll-compensation/compensation-planning-modeling/hr.payroll.cpm-access.policy.server";

function mockContext(capabilities: string[]) {
  vi.mocked(requireExecutionContext).mockResolvedValue({
    userId: "user_1",
    organizationId: "org_1",
    organizationSlug: "demo",
    locale: "en",
    role: "member",
    capabilities,
  } as never);
  vi.mocked(hasExecutionPermission).mockImplementation((_ctx, capability) =>
    capabilities.includes(capability as string),
  );
}

describe("HRM-CPM-021 access policy", () => {
  beforeEach(() => {
    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => ({
      allowed: true,
      permission,
    }));
    mockContext(["hr.cpm.read"]);
  });

  it("requires hr.cpm.read and denies approve without hr.cpm.approve", async () => {
    const guard = await requireHrCpmRead();
    expect(guard.canApprove).toBe(false);
    expect(requireExecutionPermission).toHaveBeenCalledWith(
      expect.anything(),
      "hr.cpm.read",
    );
  });

  it("allows approve flag when hr.cpm.approve is granted", async () => {
    mockContext(["hr.cpm.read", HR_CPM_APPROVE_CAPABILITY]);

    const guard = await requireHrCpmRead();
    expect(guard.canApprove).toBe(true);
  });
});

describe("HRM-CPM AC-21 unauthorized access", () => {
  it("requires hr.cpm.write for submit mutations", async () => {
    mockContext(["hr.cpm.read"]);
    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => {
      if (permission === HR_CPM_WRITE_CAPABILITY) {
        throw new Error(`missing capability: ${permission}`);
      }
      return { allowed: true, permission };
    });

    await expect(requireHrCpmWrite()).rejects.toThrow("missing capability");
    expect(requireExecutionPermission).toHaveBeenCalledWith(
      expect.anything(),
      HR_CPM_WRITE_CAPABILITY,
    );
  });

  it("requires hr.cpm.approve for HR review and final approval", async () => {
    mockContext(["hr.cpm.read", "hr.cpm.write"]);
    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => {
      if (permission === HR_CPM_APPROVE_CAPABILITY) {
        throw new Error(`missing capability: ${permission}`);
      }
      return { allowed: true, permission };
    });

    await expect(requireHrCpmApprove()).rejects.toThrow("missing capability");
    expect(requireExecutionPermission).toHaveBeenCalledWith(
      expect.anything(),
      HR_CPM_APPROVE_CAPABILITY,
    );
  });
});

describe("CPM workflow capability matrix", () => {
  beforeEach(() => {
    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => ({
      allowed: true,
      permission,
    }));
  });

  it("maps write and approve capabilities to workflow actions", async () => {
    mockContext(["hr.cpm.read", "hr.cpm.write"]);
    const writer = await requireHrCpmRead();

    expect(canHrCpmSubmitRecommendation(writer)).toBe(true);
    expect(canHrCpmReviewRecommendation(writer)).toBe(false);
    expect(canHrCpmFinalizeRecommendation(writer)).toBe(false);
    expect(canHrCpmEditRecommendation(writer, "draft", null)).toBe(true);
    expect(canHrCpmEditRecommendation(writer, "approved", null)).toBe(false);

    mockContext(["hr.cpm.read", "hr.cpm.write", "hr.cpm.approve"]);
    const approver = await requireHrCpmApprove();

    expect(canHrCpmReviewRecommendation(approver)).toBe(true);
    expect(canHrCpmFinalizeRecommendation(approver)).toBe(true);
    expect(
      canHrCpmEditRecommendation(approver, "pending_approval", new Date()),
    ).toBe(false);
  });
});
