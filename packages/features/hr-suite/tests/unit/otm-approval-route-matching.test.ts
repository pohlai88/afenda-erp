import { describe, expect, it } from "vitest";

import {
  matchesOtmApprovalRoute,
  otmRouteSpecificityScore,
  pickHighestPriorityOtmApprovalRoute,
  type HrOvertimeApprovalRouteRow,
} from "@afenda/db";

const baseRoute = (
  overrides: Partial<HrOvertimeApprovalRouteRow> = {},
): HrOvertimeApprovalRouteRow => ({
  id: "route-1",
  policyGroupCode: "default",
  name: "Default route",
  priority: 0,
  departmentId: null,
  costCenterCode: null,
  workLocationCode: null,
  grade: null,
  minEstimatedAmountCents: null,
  maxEstimatedAmountCents: null,
  requiresEligibilityException: false,
  requiresPolicyException: false,
  approverKind: "manager_chain",
  specificApproverAuthUserId: null,
  managerChainMaxDepth: null,
  active: true,
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: null,
  ...overrides,
});

const employee = {
  employeeId: "emp-1",
  departmentId: "dept-1",
  costCenterCode: "CC-OPS",
  workLocationCode: "KL-HQ",
  grade: "G5",
  managerEmployeeId: "mgr-1",
  departmentHeadEmployeeId: null,
  hrOwnerEmployeeId: null,
};

const requestContext = {
  policyGroupCode: "default",
  estimatedAmountCents: 25_000,
  hasEligibilityException: false,
  hasOpenPolicyException: false,
  asOf: new Date("2026-06-01T00:00:00.000Z"),
};

describe("HRM-OTM-016 routing matrix", () => {
  it("matches department, cost center, location, and grade scopes", () => {
    const route = baseRoute({
      id: "scoped",
      departmentId: "dept-1",
      costCenterCode: "CC-OPS",
      workLocationCode: "KL-HQ",
      grade: "G5",
    });

    expect(
      matchesOtmApprovalRoute(route, {
        ...requestContext,
        employee,
      }),
    ).toBe(true);

    expect(
      matchesOtmApprovalRoute(route, {
        ...requestContext,
        employee: { ...employee, grade: "G4" },
      }),
    ).toBe(false);
  });

  it("matches estimated amount band", () => {
    const route = baseRoute({
      minEstimatedAmountCents: 20_000,
      maxEstimatedAmountCents: 30_000,
    });

    expect(
      matchesOtmApprovalRoute(route, {
        ...requestContext,
        employee,
      }),
    ).toBe(true);

    expect(
      matchesOtmApprovalRoute(route, {
        ...requestContext,
        estimatedAmountCents: 10_000,
        employee,
      }),
    ).toBe(false);
  });

  it("matches eligibility and policy exception flags", () => {
    const route = baseRoute({
      id: "exception-route",
      requiresEligibilityException: true,
      requiresPolicyException: true,
    });

    expect(
      matchesOtmApprovalRoute(route, {
        ...requestContext,
        hasEligibilityException: true,
        hasOpenPolicyException: true,
        employee,
      }),
    ).toBe(true);

    expect(
      matchesOtmApprovalRoute(route, {
        ...requestContext,
        hasEligibilityException: false,
        hasOpenPolicyException: true,
        employee,
      }),
    ).toBe(false);
  });

  it("prefers higher priority and more specific routes", () => {
    const generic = baseRoute({ id: "generic", priority: 1 });
    const specific = baseRoute({
      id: "specific",
      priority: 5,
      departmentId: "dept-1",
      costCenterCode: "CC-OPS",
    });

    expect(otmRouteSpecificityScore(specific)).toBeGreaterThan(
      otmRouteSpecificityScore(generic),
    );

    const picked = pickHighestPriorityOtmApprovalRoute({
      routes: [generic, specific],
      employee,
      request: requestContext,
    });

    expect(picked?.id).toBe("specific");
  });

  it("returns null when no route matches", () => {
    const route = baseRoute({
      departmentId: "other-dept",
    });

    const picked = pickHighestPriorityOtmApprovalRoute({
      routes: [route],
      employee,
      request: requestContext,
    });

    expect(picked).toBeNull();
  });
});
