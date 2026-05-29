import { describe, expect, it } from "vitest";

import {
  buildHrComplianceLaborLawRequirementsListSurface,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceLaborLawSearchParam,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import {
  buildHrComplianceExceptionsListSurface,
  hrComplianceExceptionSearchParam,
  hrComplianceExceptionsSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-exceptions-list.surface";
import {
  buildHrComplianceObligationsListSurface,
  hrComplianceObligationSearchParam,
  hrComplianceObligationsSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-obligations-list.surface";

describe("hr workforce compliance list surfaces", () => {
  it("builds obligations list with toolbar, labels, and trailing metadata", () => {
    const configuration = buildHrComplianceObligationsListSurface({
      window: {
        rows: [
          {
            id: "obl_1",
            code: "PDPA-01",
            title: "Data protection register",
            description: null,
            complianceArea: "privacy",
            requirementKind: "statutory",
            status: "active",
            countryCode: "MY",
            legalEntityCode: "AFENDA-MY",
            workLocationCode: "KL-HQ",
            employmentType: "permanent",
            workerCategory: "staff",
            departmentName: "Legal",
            dueDate: new Date("2026-12-31T00:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      searchValue: "pdpa",
      canWrite: true,
    });

    expect(hrComplianceObligationsSurfaceKey).toBe(
      "hr.workforce.compliance.obligations.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceObligationSearchParam,
    );
    expect(configuration.rows).toHaveLength(1);
    expect(configuration.rows[0]?.cells.code).toBe("PDPA-01");
    expect(configuration.rows[0]?.cells.kind).toBe("Statutory");
    expect(configuration.rows[0]?.cells.scope).toBe(
      "MY · AFENDA-MY · KL-HQ · permanent · staff · Legal",
    );
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
    expect(configuration.surface?.empty?.description).toContain(
      "legal entity",
    );
  });

  it("builds exceptions list with row tone, link column, and trailing gate", () => {
    const configuration = buildHrComplianceExceptionsListSurface({
      window: {
        rows: [
          {
            id: "exc_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            complianceArea: "safety",
            itemType: "training_gap",
            title: "Missing induction",
            severity: "high",
            status: "open",
            correctiveActionDueDate: null,
            createdAt: new Date("2026-05-01T12:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(hrComplianceExceptionsSurfaceKey).toBe(
      "hr.workforce.compliance.exceptions.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceExceptionSearchParam,
    );
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
    expect(configuration.rows[0]?.linkColumnId).toBe("title");
    expect(configuration.rows[0]?.rowTone).toBe("critical");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
    expect(configuration.surface?.empty?.title).toBe("No open exceptions");
    expect(configuration.surface?.empty?.description).toContain(
      "obligation gap",
    );
  });

  it("builds labor law list with employee link and effective status tone", () => {
    const configuration = buildHrComplianceLaborLawRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            obligationId: "obl_1",
            obligationCode: "LL-01",
            obligationTitle: "Weekly hours register",
            complianceArea: "labor_law",
            status: "pending",
            dueDate: new Date("2026-06-10T00:00:00.000Z"),
            completedAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(hrComplianceLaborLawRequirementsSurfaceKey).toBe(
      "hr.workforce.compliance.labor-law-requirements.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceLaborLawSearchParam,
    );
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
    expect(configuration.rows[0]?.linkColumnId).toBe("employee");
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });
});
