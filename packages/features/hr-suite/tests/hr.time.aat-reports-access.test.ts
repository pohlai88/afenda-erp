import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
  hasExecutionPermission: vi.fn(),
}));

vi.mock("@afenda/db", () => ({
  getUserProfile: vi.fn(),
  resolveHrEmployeeIdsForAuthUser: vi.fn(),
  resolveEmployeeIdsVisibleToActor: vi.fn(),
}));

import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";
import {
  getUserProfile,
  resolveEmployeeIdsVisibleToActor,
  resolveHrEmployeeIdsForAuthUser,
} from "@afenda/db";

import {
  AAT_SENSITIVE_REASON_MASK,
  maskHrAatAbsenceReason,
} from "../data/hr.time.aat-reason-masking.server";
import {
  HrAatAccessDeniedError,
  requireHrAatReportExport,
  requireHrAatReportRead,
} from "../policies/hr.time.aat-access.policy.server";

describe("requireHrAatReportRead (HRM-AAT-025)", () => {
  it("denies users without hr.view or base analytics permissions", async () => {
    const context = {
      userId: "user-0",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "viewer" as const,
      capabilities: [] as const,
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(hasExecutionPermission).mockReturnValue(false);

    await expect(requireHrAatReportRead()).rejects.toBeInstanceOf(
      HrAatAccessDeniedError,
    );
    expect(requireExecutionPermission).toHaveBeenCalledWith(context, "hr.view");
  });

  it("grants org scope to HR writers", async () => {
    const context = {
      userId: "user-hr",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "admin" as const,
      capabilities: [
        "hr.view" as const,
        "hr.leave.read" as const,
        "hr.leave.write" as const,
      ],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(getUserProfile).mockResolvedValue({
      email: "hr@acme.local",
    } as never);
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue(["emp-hr"]);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.view" ||
        capability === "hr.leave.read" ||
        capability === "hr.leave.write",
    );

    const guard = await requireHrAatReportRead();

    expect(guard.accessRole).toBe("hr");
    expect(guard.accessScope).toBe("org");
    expect(guard.canExport).toBe(true);
    expect(guard.canViewSensitiveReasons).toBe(true);
  });

  it("grants org scope to payroll readers with leave and attendance read", async () => {
    const context = {
      userId: "user-payroll",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "staff" as const,
      capabilities: [
        "hr.view" as const,
        "hr.leave.read" as const,
        "hr.attendance.read" as const,
      ],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(getUserProfile).mockResolvedValue(undefined);
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue([]);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.view" ||
        capability === "hr.leave.read" ||
        capability === "hr.attendance.read",
    );

    const guard = await requireHrAatReportRead();

    expect(guard.accessRole).toBe("payroll");
    expect(guard.accessScope).toBe("org");
    expect(guard.canViewPayrollRefs).toBe(true);
    expect(guard.canViewSensitiveReasons).toBe(false);
  });

  it("grants org scope to compliance readers", async () => {
    const context = {
      userId: "user-compliance",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "staff" as const,
      capabilities: ["hr.view" as const, "hr.compliance.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(getUserProfile).mockResolvedValue(undefined);
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue([]);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.view" || capability === "hr.compliance.read",
    );

    const guard = await requireHrAatReportRead();

    expect(guard.accessRole).toBe("compliance");
    expect(guard.accessScope).toBe("org");
  });

  it("grants org scope to auditors", async () => {
    const context = {
      userId: "user-auditor",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "admin" as const,
      capabilities: ["hr.view" as const, "system-admin.audit.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(getUserProfile).mockResolvedValue(undefined);
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue([]);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.view" || capability === "system-admin.audit.read",
    );

    const guard = await requireHrAatReportRead();

    expect(guard.accessRole).toBe("auditor");
    expect(guard.accessScope).toBe("org");
  });

  it("restricts leave readers without elevated roles to team scope", async () => {
    const context = {
      userId: "user-manager",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "staff" as const,
      capabilities: ["hr.view" as const, "hr.leave.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(getUserProfile).mockResolvedValue({
      email: "manager@acme.local",
    } as never);
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue(["emp-mgr"]);
    vi.mocked(resolveEmployeeIdsVisibleToActor).mockResolvedValue([
      "emp-mgr",
      "emp-1",
    ]);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.view" || capability === "hr.leave.read",
    );

    const guard = await requireHrAatReportRead();

    expect(guard.accessRole).toBe("manager");
    expect(guard.accessScope).toBe("team");
    await expect(guard.resolveVisibleEmployeeIds()).resolves.toEqual([
      "emp-mgr",
      "emp-1",
    ]);
  });

  it("requires linked employee record for self-scoped leave readers", async () => {
    const context = {
      userId: "user-self",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "staff" as const,
      capabilities: ["hr.view" as const, "hr.leave.read" as const],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(getUserProfile).mockResolvedValue(undefined);
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue([]);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.view" || capability === "hr.leave.read",
    );

    await expect(requireHrAatReportRead()).rejects.toMatchObject({
      message: "hr_aat_self_employee_link_required",
    });
  });
});

describe("requireHrAatReportExport (HRM-AAT-024)", () => {
  it("delegates to read guard for authorized exporters", async () => {
    const context = {
      userId: "user-hr",
      organizationId: "org-1",
      organizationSlug: "acme",
      locale: "en",
      role: "admin" as const,
      capabilities: [
        "hr.view" as const,
        "hr.leave.read" as const,
        "hr.attendance.write" as const,
      ],
    };

    vi.mocked(requireExecutionContext).mockResolvedValue(context as never);
    vi.mocked(getUserProfile).mockResolvedValue(undefined);
    vi.mocked(resolveHrEmployeeIdsForAuthUser).mockResolvedValue(["emp-hr"]);
    vi.mocked(hasExecutionPermission).mockImplementation(
      (_ctx, capability) =>
        capability === "hr.view" ||
        capability === "hr.leave.read" ||
        capability === "hr.attendance.write",
    );

    const guard = await requireHrAatReportExport();

    expect(guard.canExport).toBe(true);
    expect(guard.accessRole).toBe("hr");
  });
});

describe("maskHrAatAbsenceReason (HRM-AAT-026)", () => {
  it("masks sensitive leave reasons for unauthorized viewers", () => {
    expect(
      maskHrAatAbsenceReason({
        reason: "Post-surgery recovery",
        leaveType: "medical",
        canViewSensitiveReasons: false,
        actorEmployeeIds: ["emp-manager"],
        subjectEmployeeId: "emp-1",
      }),
    ).toBe(AAT_SENSITIVE_REASON_MASK);
  });

  it("allows employees to view their own sensitive reasons", () => {
    expect(
      maskHrAatAbsenceReason({
        reason: "Post-surgery recovery",
        leaveType: "medical",
        canViewSensitiveReasons: false,
        actorEmployeeIds: ["emp-1"],
        subjectEmployeeId: "emp-1",
      }),
    ).toBe("Post-surgery recovery");
  });

  it("allows HR sensitive readers to view team medical reasons", () => {
    expect(
      maskHrAatAbsenceReason({
        reason: "Hospital stay",
        leaveType: "hospitalization",
        canViewSensitiveReasons: true,
        actorEmployeeIds: ["emp-hr"],
        subjectEmployeeId: "emp-1",
      }),
    ).toBe("Hospital stay");
  });

  it("does not mask non-sensitive leave reasons for managers", () => {
    expect(
      maskHrAatAbsenceReason({
        reason: "Family travel",
        leaveType: "annual",
        canViewSensitiveReasons: false,
        actorEmployeeIds: ["emp-manager"],
        subjectEmployeeId: "emp-1",
      }),
    ).toBe("Family travel");
  });
});
