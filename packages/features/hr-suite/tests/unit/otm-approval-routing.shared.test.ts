import { describe, expect, it } from "vitest";

import {
  assertOtmDecisionReason,
  buildOtmManagerChain,
  clampOtmManagerChainDepth,
  nextOtmStageAfterManagerApproval,
  resolveOtmApprovalRouteFromChain,
  resolveOtmInitialApprovalStage,
  resolveOtmSubmissionApprovers,
} from "@afenda/db";

describe("HRM-OTM-015 approval routing", () => {
  it("caps manager chain depth at five", () => {
    expect(clampOtmManagerChainDepth(0)).toBe(1);
    expect(clampOtmManagerChainDepth(99)).toBe(5);
  });

  it("walks manager chain up to configured depth", () => {
    const managers = new Map<string, string | null>([
      ["emp-1", "mgr-1"],
      ["mgr-1", "mgr-2"],
      ["mgr-2", "mgr-3"],
      ["mgr-3", "mgr-4"],
      ["mgr-4", "mgr-5"],
      ["mgr-5", "mgr-6"],
    ]);

    const chain = buildOtmManagerChain({
      employeeId: "emp-1",
      managerEmployeeId: "mgr-1",
      maxDepth: 3,
      resolveManager: (id) => ({
        id,
        managerEmployeeId: managers.get(id) ?? null,
      }),
    });

    expect(chain).toEqual(["mgr-1", "mgr-2", "mgr-3"]);
  });

  it("starts at manager when HR second approval is required and manager exists", () => {
    expect(
      resolveOtmInitialApprovalStage({
        managerEmployeeIds: ["mgr-1"],
        requiresHrSecondApproval: true,
      }),
    ).toBe("manager");
  });

  it("starts at HR when second approval is required but no manager chain", () => {
    expect(
      resolveOtmInitialApprovalStage({
        managerEmployeeIds: [],
        requiresHrSecondApproval: true,
      }),
    ).toBe("hr");
  });

  it("advances manager stage to HR when second approval is configured", () => {
    expect(
      nextOtmStageAfterManagerApproval({ requiresHrSecondApproval: true }),
    ).toBe("hr");
    expect(
      nextOtmStageAfterManagerApproval({ requiresHrSecondApproval: false }),
    ).toBe("complete");
  });

  it("stores approvalStage in resolved snapshot", () => {
    const route = resolveOtmApprovalRouteFromChain({
      employee: {
        employeeId: "emp-1",
        departmentId: "dept-1",
        costCenterCode: "CC-1",
        workLocationCode: "HQ",
        grade: "G5",
        managerEmployeeId: "mgr-1",
        departmentHeadEmployeeId: null,
        hrOwnerEmployeeId: null,
      },
      request: {
        policyGroupCode: "default",
        estimatedAmountCents: 12_000,
        hasEligibilityException: false,
        hasOpenPolicyException: false,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
      policy: {
        requireHrSecondApproval: true,
        managerChainMaxDepth: 3,
      },
      managerEmployeeIds: ["mgr-1"],
      matchedRoute: null,
    });

    expect(route.initialStage).toBe("manager");
    expect(route.snapshot.approvalStage).toBe("manager");
    expect(route.snapshot.requiresHrSecondApproval).toBe(true);
  });

  it("resolves HR pool approvers for HR stage", () => {
    const route = resolveOtmApprovalRouteFromChain({
      employee: {
        employeeId: "emp-1",
        departmentId: null,
        costCenterCode: null,
        workLocationCode: null,
        grade: null,
        managerEmployeeId: null,
        departmentHeadEmployeeId: null,
        hrOwnerEmployeeId: null,
      },
      request: {
        policyGroupCode: "default",
        estimatedAmountCents: 0,
        hasEligibilityException: false,
        hasOpenPolicyException: false,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
      policy: {
        requireHrSecondApproval: true,
        managerChainMaxDepth: 3,
      },
      managerEmployeeIds: [],
      matchedRoute: null,
    });

    const approvers = resolveOtmSubmissionApprovers({
      route,
      stage: "hr",
      resolveAuthUserIdForEmployee: () => null,
      hrPoolAuthUserIds: ["hr-user-1", "hr-user-2"],
    });

    expect(approvers).toEqual(["hr-user-1", "hr-user-2"]);
  });
});

describe("HRM-OTM-018 decision reasons", () => {
  it("requires rejection and adjust reasons", () => {
    expect(() =>
      assertOtmDecisionReason({ decision: "reject", reason: "  " }),
    ).toThrow("decision_reason_required");
    expect(() =>
      assertOtmDecisionReason({ decision: "adjust", reason: null }),
    ).toThrow("decision_reason_required");
    expect(
      assertOtmDecisionReason({
        decision: "reject",
        reason: "Insufficient business case",
      }),
    ).toBe("Insufficient business case");
  });

  it("requires return reason", () => {
    expect(() =>
      assertOtmDecisionReason({ decision: "return", reason: "" }),
    ).toThrow("return_reason_required");
  });
});
