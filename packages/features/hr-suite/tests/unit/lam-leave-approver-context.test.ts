import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    getUserProfile: vi.fn(),
    resolveHrEmployeeIdsForAuthUser: vi.fn(),
  };
});

import {
  getUserProfile,
  resolveHrEmployeeIdsForAuthUser,
} from "@afenda/db";

import { resolveHrLeaveApproverContext } from "../../src/time-attendance/leave-attendance-management/data/hr.time.leave-approver-context.shared.server";

describe("LAM manager approver identity", () => {
  it("derives HR approve flag from write and manager ids from auth email linkage", async () => {
    vi.mocked(getUserProfile).mockResolvedValue({
      id: "profile-1",
      authUserId: "user-1",
      email: "manager@example.com",
      name: "Manager",
      defaultOrganizationId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue(["emp-mgr"]);

    const context = await resolveHrLeaveApproverContext({
      organizationId: "org-1",
      authUserId: "user-1",
      canWrite: false,
    });

    expect(resolveHrEmployeeIdsForAuthUser).toHaveBeenCalledWith({
      organizationId: "org-1",
      authUserId: "user-1",
      authUserEmail: "manager@example.com",
    });
    expect(context.actorCanHrApprove).toBe(false);
    expect(context.actorManagerEmployeeIds).toEqual(["emp-mgr"]);
  });

  it("grants HR approve when actor has leave write", async () => {
    vi.mocked(getUserProfile).mockResolvedValue(null);
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue([]);

    const context = await resolveHrLeaveApproverContext({
      organizationId: "org-1",
      authUserId: "user-hr",
      canWrite: true,
    });

    expect(context.actorCanHrApprove).toBe(true);
    expect(context.actorManagerEmployeeIds).toEqual([]);
  });
});
