import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
  hasExecutionPermission: vi.fn(),
}));

vi.mock("@afenda/db", () => ({
  resolveEmployeeIdsVisibleToActor: vi.fn().mockResolvedValue(["emp-1"]),
}));

import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import {
  canHrPerformanceEditReview,
  canHrPerformanceExposeOutcome,
  canHrPerformanceFinalizeReview,
  HR_PER_APPROVE_CAPABILITY,
  HR_PER_COMPENSATION_READ_CAPABILITY,
  HR_PER_READ_CAPABILITY,
  HR_PER_WRITE_CAPABILITY,
  requireHrPerformanceApprove,
  requireHrPerformanceRead,
  requireHrPerformanceWrite,
} from "../../src/talent-management/performance-appraisals/policies/hr.talent.performance-access.policy.server";

function mockContext(capabilities: string[]) {
  vi.mocked(requireExecutionContext).mockResolvedValue({
    userId: "user-1",
    organizationId: "org-1",
    organizationSlug: "demo",
    membershipId: "member-1",
    locale: "en",
    role: "member",
    actorType: "user",
    capabilities,
    sessionSource: "dev",
  } as never);
  vi.mocked(hasExecutionPermission).mockImplementation((_ctx, capability) =>
    capabilities.includes(capability as string),
  );
}

describe("HRM-PER-030 performance access policy", () => {
  beforeEach(() => {
    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => ({
      allowed: true,
      permission,
    }));
    mockContext([HR_PER_READ_CAPABILITY]);
  });

  it("requires read permission and derives capability flags", async () => {
    const guard = await requireHrPerformanceRead();

    expect(requireExecutionPermission).toHaveBeenCalledWith(
      expect.anything(),
      HR_PER_READ_CAPABILITY,
    );
    expect(guard.canWritePerformance).toBe(false);
    expect(guard.canApprovePerformance).toBe(false);
  });

  it("requires write and approve permissions for mutations", async () => {
    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => {
      if (permission === HR_PER_WRITE_CAPABILITY) {
        throw new Error("missing write");
      }
      return { allowed: true, permission };
    });
    await expect(requireHrPerformanceWrite()).rejects.toThrow("missing write");

    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => {
      if (permission === HR_PER_APPROVE_CAPABILITY) {
        throw new Error("missing approve");
      }
      return { allowed: true, permission };
    });
    await expect(requireHrPerformanceApprove()).rejects.toThrow("missing approve");
  });

  it("maps write, approve, and compensation read flags to workflow helpers", async () => {
    mockContext([
      HR_PER_READ_CAPABILITY,
      HR_PER_WRITE_CAPABILITY,
      HR_PER_APPROVE_CAPABILITY,
      HR_PER_COMPENSATION_READ_CAPABILITY,
    ]);

    const guard = await requireHrPerformanceApprove();
    expect(
      canHrPerformanceEditReview(guard, {
        status: "manager_evaluation",
        lockedAt: null,
      }),
    ).toBe(true);
    expect(
      canHrPerformanceEditReview(guard, {
        status: "finalized",
        lockedAt: null,
      }),
    ).toBe(false);
    expect(canHrPerformanceFinalizeReview(guard)).toBe(true);
    expect(canHrPerformanceExposeOutcome(guard)).toBe(true);
  });
});
