import { describe, expect, it } from "vitest";

import {
  parseHrWorkforceEssSearchParams,
  toHrWorkforceEssPageModelInput,
} from "../../src/employee-management/employee-selfservice-portal/hr.workforce.ess-search-params.parse.shared";
import {
  HR_WORKFORCE_ESS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_WORKFORCE_ESS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_WORKFORCE_ESS_LIST_SURFACE_KEYS,
} from "../../src/employee-management/employee-selfservice-portal/hr.workforce.ess-surface-metadata.shared";

describe("Employee Self-Service Portal search params", () => {
  it("parses and trims ESS list, grouping, and status params", () => {
    expect(
      parseHrWorkforceEssSearchParams({
        hrWorkforceEssProfileSearch: [" Nadia ", "ignored"],
        hrWorkforceEssLeaveRequestsSearch: " annual ",
        hrWorkforceEssPayDocumentsSearch: " payslip ",
        hrWorkforceEssApprovalsSearch: " pending ",
        hrWorkforceEssAuditTrailSearch: " access ",
        hrWorkforceEssReportGroupBy: "department",
        hrWorkforceEssStatus: "pending_approval",
      }),
    ).toMatchObject({
      profileSearch: "Nadia",
      leaveRequestsSearch: "annual",
      payDocumentsSearch: "payslip",
      approvalsSearch: "pending",
      auditTrailSearch: "access",
      reportGroupBy: "department",
      status: "pending_approval",
    });
  });

  it("parses every registered ESS list search param into its page model field", () => {
    const searchParams = new URLSearchParams();

    HR_WORKFORCE_ESS_LIST_SURFACE_KEYS.forEach((surfaceKey, index) => {
      const param = HR_WORKFORCE_ESS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      searchParams.set(param, ` value-${index} `);
    });

    const parsed = parseHrWorkforceEssSearchParams(searchParams);

    expect(
      new Set(Object.values(HR_WORKFORCE_ESS_LIST_SEARCH_PARAMS_BY_KEY)).size,
    ).toBe(HR_WORKFORCE_ESS_LIST_SURFACE_KEYS.length);
    expect(new Set(HR_WORKFORCE_ESS_LIST_SEARCH_PARAM_MODEL_FIELDS).size).toBe(
      HR_WORKFORCE_ESS_LIST_SURFACE_KEYS.length,
    );

    HR_WORKFORCE_ESS_LIST_SURFACE_KEYS.forEach((_, index) => {
      const modelField = HR_WORKFORCE_ESS_LIST_SEARCH_PARAM_MODEL_FIELDS[
        index
      ] as keyof typeof parsed;
      expect(parsed[modelField]).toBe(`value-${index}`);
    });
  });

  it("normalizes page model input with safe capability defaults", () => {
    expect(
      toHrWorkforceEssPageModelInput({
        organizationId: "org_123",
        actorUserId: "user_123",
        visibleEmployeeIds: ["ess-employee-1"],
        canReadAudit: true,
        searchParams: new URLSearchParams(
          "hrWorkforceEssReportGroupBy=not-real&hrWorkforceEssStatus=not-real",
        ),
      }),
    ).toMatchObject({
      organizationId: "org_123",
      actorUserId: "user_123",
      visibleEmployeeIds: ["ess-employee-1"],
      canWrite: false,
      canApprove: false,
      canReadAudit: true,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "status",
      status: "all",
    });
  });
});
