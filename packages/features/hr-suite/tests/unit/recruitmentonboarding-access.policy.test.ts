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
  HR_RON_APPROVE_CAPABILITY,
  HR_RON_AUDIT_READ_CAPABILITY,
  HR_RON_OFFER_APPROVE_CAPABILITY,
  HR_RON_READ_CAPABILITY,
  HR_RON_SENSITIVE_READ_CAPABILITY,
  HR_RON_WRITE_CAPABILITY,
  requireHrRonApprove,
  requireHrRonOfferApprove,
  requireHrRonRead,
  requireHrRonWrite,
} from "../../src/talent-management/recruitment-onboarding/policies/hr.talent.ron-access.policy.server";

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

describe("HRM-RON-040 recruitment onboarding access policy", () => {
  beforeEach(() => {
    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => ({
      allowed: true,
      permission,
    }));
    mockContext([HR_RON_READ_CAPABILITY]);
  });

  it("requires read permission and derives capability flags", async () => {
    const guard = await requireHrRonRead();

    expect(requireExecutionPermission).toHaveBeenCalledWith(
      expect.anything(),
      HR_RON_READ_CAPABILITY,
    );
    expect(guard.canWrite).toBe(false);
    expect(guard.canReadAudit).toBe(false);
  });

  it("requires write, requisition approval, and offer approval permissions", async () => {
    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => {
      if (permission === HR_RON_WRITE_CAPABILITY) {
        throw new Error("missing write");
      }
      return { allowed: true, permission };
    });
    await expect(requireHrRonWrite()).rejects.toThrow("missing write");

    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => {
      if (permission === HR_RON_APPROVE_CAPABILITY) {
        throw new Error("missing requisition approve");
      }
      return { allowed: true, permission };
    });
    await expect(requireHrRonApprove()).rejects.toThrow(
      "missing requisition approve",
    );

    vi.mocked(requireExecutionPermission).mockImplementation((_ctx, permission) => {
      if (permission === HR_RON_OFFER_APPROVE_CAPABILITY) {
        throw new Error("missing offer approve");
      }
      return { allowed: true, permission };
    });
    await expect(requireHrRonOfferApprove()).rejects.toThrow(
      "missing offer approve",
    );
  });

  it("maps audit and sensitive read flags", async () => {
    mockContext([
      HR_RON_READ_CAPABILITY,
      HR_RON_AUDIT_READ_CAPABILITY,
      HR_RON_SENSITIVE_READ_CAPABILITY,
    ]);

    const guard = await requireHrRonRead();
    expect(guard.canReadAudit).toBe(true);
    expect(guard.canReadSensitiveCandidateData).toBe(true);
  });
});
