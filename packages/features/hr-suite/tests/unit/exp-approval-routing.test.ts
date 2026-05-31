import { describe, expect, it } from "vitest";

import {
  assertExpDecisionReason,
  buildExpManagerChain,
  clampExpManagerChainDepth,
  matchesExpApprovalRoute,
  nextExpStageAfterApproval,
  pickHighestPriorityExpApprovalRoute,
  resolveExpApprovalRouteFromChain,
  resolveExpInitialApprovalStage,
} from "@afenda/db";

describe("HRM-EXP-017 approval routing", () => {
  it("caps manager chain depth at five", () => {
    expect(clampExpManagerChainDepth(0)).toBe(1);
    expect(clampExpManagerChainDepth(99)).toBe(5);
  });

  it("walks manager chain up to configured depth", () => {
    const managers = new Map<string, string | null>([
      ["emp-1", "mgr-1"],
      ["mgr-1", "mgr-2"],
      ["mgr-2", "mgr-3"],
    ]);

    const chain = buildExpManagerChain({
      employeeId: "emp-1",
      managerEmployeeId: "mgr-1",
      maxDepth: 2,
      resolveManager: (id) => ({
        id,
        managerEmployeeId: managers.get(id) ?? null,
      }),
    });

    expect(chain).toEqual(["mgr-1", "mgr-2"]);
  });

  it("matches routes by department, cost center, amount, category, project, legal entity", () => {
    const route = {
      id: "route-1",
      policyGroupCode: "default",
      name: "Finance high travel",
      priority: 10,
      departmentId: "dept-1",
      costCenterCode: "CC-TRAVEL",
      legalEntityCode: "MY-01",
      categoryCode: "travel",
      projectCode: "PRJ-9",
      minAmountCents: 50_000,
      maxAmountCents: 500_000,
      requiresPolicyException: false,
      approverKind: "finance_pool" as const,
      specificApproverAuthUserId: null,
      managerChainMaxDepth: null,
      active: true,
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      effectiveTo: null,
    };

    expect(
      matchesExpApprovalRoute(route, {
        employee: {
          employeeId: "emp-1",
          departmentId: "dept-1",
          costCenterCode: "CC-TRAVEL",
          legalEntityCode: "MY-01",
          managerEmployeeId: "mgr-1",
          departmentHeadEmployeeId: null,
          hrOwnerEmployeeId: null,
        },
        policyGroupCode: "default",
        categoryCode: "travel",
        projectCode: "PRJ-9",
        amountCents: 120_000,
        hasOpenPolicyException: false,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      }),
    ).toBe(true);

    expect(
      matchesExpApprovalRoute(route, {
        employee: {
          employeeId: "emp-1",
          departmentId: "dept-1",
          costCenterCode: "CC-TRAVEL",
          legalEntityCode: "MY-01",
          managerEmployeeId: "mgr-1",
          departmentHeadEmployeeId: null,
          hrOwnerEmployeeId: null,
        },
        policyGroupCode: "default",
        categoryCode: "travel",
        projectCode: "PRJ-9",
        amountCents: 10_000,
        hasOpenPolicyException: false,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      }),
    ).toBe(false);
  });

  it("routes to exception stage when open policy exceptions exist", () => {
    expect(
      resolveExpInitialApprovalStage({
        managerEmployeeIds: ["mgr-1"],
        requiresFinanceSecondApproval: true,
        requiresHrSecondApproval: false,
        hasOpenPolicyException: true,
      }),
    ).toBe("exception");
  });

  it("advances manager stage to finance when configured", () => {
    expect(
      nextExpStageAfterApproval({
        currentStage: "manager",
        requiresFinanceSecondApproval: true,
        requiresHrSecondApproval: false,
      }),
    ).toBe("finance");
    expect(
      nextExpStageAfterApproval({
        currentStage: "finance",
        requiresFinanceSecondApproval: true,
        requiresHrSecondApproval: true,
      }),
    ).toBe("hr");
  });

  it("stores approvalStage in resolved snapshot", () => {
    const route = resolveExpApprovalRouteFromChain({
      employee: {
        employeeId: "emp-1",
        departmentId: "dept-1",
        costCenterCode: "CC-1",
        legalEntityCode: "LE-1",
        managerEmployeeId: "mgr-1",
        departmentHeadEmployeeId: null,
        hrOwnerEmployeeId: null,
      },
      claim: {
        policyGroupCode: "default",
        categoryCode: "meals",
        projectCode: null,
        amountCents: 25_000,
        hasOpenPolicyException: false,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
      policy: {
        requireFinanceSecondApproval: true,
        requireHrSecondApproval: false,
        managerChainMaxDepth: 3,
      },
      managerEmployeeIds: ["mgr-1"],
      matchedRoute: null,
    });

    expect(route.initialStage).toBe("manager");
    expect(route.snapshot.approvalStage).toBe("manager");
    expect(route.snapshot.requiresFinanceSecondApproval).toBe(true);
  });

  it("picks highest-specificity matching route", () => {
    const generic = {
      id: "generic",
      policyGroupCode: "default",
      name: "Generic",
      priority: 1,
      departmentId: null,
      costCenterCode: null,
      legalEntityCode: null,
      categoryCode: null,
      projectCode: null,
      minAmountCents: null,
      maxAmountCents: null,
      requiresPolicyException: false,
      approverKind: "manager_chain" as const,
      specificApproverAuthUserId: null,
      managerChainMaxDepth: null,
      active: true,
      effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
      effectiveTo: null,
    };
    const specific = {
      ...generic,
      id: "specific",
      departmentId: "dept-1",
      categoryCode: "travel",
      priority: 2,
    };

    const picked = pickHighestPriorityExpApprovalRoute({
      routes: [generic, specific],
      employee: {
        employeeId: "emp-1",
        departmentId: "dept-1",
        costCenterCode: null,
        legalEntityCode: null,
        managerEmployeeId: null,
        departmentHeadEmployeeId: null,
        hrOwnerEmployeeId: null,
      },
      claim: {
        policyGroupCode: "default",
        categoryCode: "travel",
        projectCode: null,
        amountCents: 10_000,
        hasOpenPolicyException: false,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
    });

    expect(picked?.id).toBe("specific");
  });
});

describe("HRM-EXP-019 decision reasons", () => {
  it("requires rejection reason", () => {
    expect(() =>
      assertExpDecisionReason({ decision: "reject", reason: "   " }),
    ).toThrow("decision_reason_required");
    expect(
      assertExpDecisionReason({ decision: "reject", reason: "Policy breach" }),
    ).toBe("Policy breach");
  });
});
