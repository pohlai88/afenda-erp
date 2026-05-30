import { describe, expect, it } from "vitest";

import {
  computeHrFwaDurationDays,
  requiresHrFwaApprovalStage,
  resolveHrFwaApprovalRouteFromChain,
} from "../../src/time-attendance/flexible-work-arrangement-tracking/policies/hr.time.fwa-routing.policy.server";

describe("FWA-010 approval routing", () => {
  it("routes long duration to HR stage", () => {
    const route = resolveHrFwaApprovalRouteFromChain({
      employee: {
        employeeId: "emp-1",
        departmentId: "dept-1",
        legalEntityCode: "LE-1",
        countryCode: "SG",
        workLocationCode: "HQ",
        roleCode: "ENG",
        managerEmployeeId: "mgr-1",
      },
      request: {
        durationDays: 120,
        remoteLocationCountryCode: "SG",
        exceptionRequested: false,
      },
      policy: {
        requireHrApproval: false,
        requireDepartmentApproval: false,
        allowExceptionApproval: true,
        requireHrApprovalWhenDurationDaysGte: 90,
        requireHrApprovalRoleCodes: [],
        requireHrApprovalLegalEntityCodes: [],
        requireExceptionWhenCrossBorderRemote: true,
        managerChainMaxDepth: 3,
      },
      managerEmployeeIds: ["mgr-1"],
    });

    expect(route.initialStage).toBe("manager");
    expect(route.requiresHrStage).toBe(true);
    expect(route.routingFactors.durationDays).toBe(120);
  });

  it("flags exception stage for ineligible requests", () => {
    const route = resolveHrFwaApprovalRouteFromChain({
      employee: {
        employeeId: "emp-1",
        departmentId: null,
        legalEntityCode: null,
        countryCode: "SG",
        workLocationCode: null,
        roleCode: null,
        managerEmployeeId: null,
      },
      request: {
        durationDays: 30,
        remoteLocationCountryCode: "MY",
        exceptionRequested: true,
      },
      policy: {
        requireHrApproval: true,
        requireDepartmentApproval: true,
        allowExceptionApproval: true,
        requireHrApprovalWhenDurationDaysGte: null,
        requireHrApprovalRoleCodes: [],
        requireHrApprovalLegalEntityCodes: [],
        requireExceptionWhenCrossBorderRemote: true,
        managerChainMaxDepth: 3,
      },
      managerEmployeeIds: [],
    });

    expect(route.initialStage).toBe("exception");
    expect(route.requiresExceptionStage).toBe(true);
  });

  it("requires HR for configured role codes", () => {
    expect(
      requiresHrFwaApprovalStage({
        employee: {
          employeeId: "emp-1",
          departmentId: null,
          legalEntityCode: null,
          countryCode: "SG",
          workLocationCode: null,
          roleCode: "EXEC",
          managerEmployeeId: null,
        },
        request: {
          durationDays: 7,
          remoteLocationCountryCode: null,
          exceptionRequested: false,
        },
        policy: {
          requireHrApproval: false,
          requireDepartmentApproval: false,
          allowExceptionApproval: true,
          requireHrApprovalWhenDurationDaysGte: null,
          requireHrApprovalRoleCodes: ["EXEC"],
          requireHrApprovalLegalEntityCodes: [],
          requireExceptionWhenCrossBorderRemote: false,
          managerChainMaxDepth: 3,
        },
      }),
    ).toBe(true);
  });

  it("computes arrangement duration in days", () => {
    const days = computeHrFwaDurationDays({
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-01-08T00:00:00.000Z"),
    });
    expect(days).toBe(7);
  });
});
