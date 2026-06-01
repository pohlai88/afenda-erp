import { describe, expect, it } from "vitest";

import {
  parseHrWorkforceEssSearchParams,
  toHrWorkforceEssPageModelInput,
} from "../../src/employee-management/employee-selfservice-portal/data/hr.workforce.ess-search-params.parse.shared";

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
