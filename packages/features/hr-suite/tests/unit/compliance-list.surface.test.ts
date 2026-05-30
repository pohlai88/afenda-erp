import { describe, expect, it } from "vitest";

import {
  buildHrComplianceWorkAuthDocumentsListSurface,
  hrComplianceWorkAuthDocumentSearchParam,
  hrComplianceWorkAuthDocumentsSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-auth-documents-list.surface";
import {
  buildHrComplianceWorkEligibilityListSurface,
  hrComplianceWorkEligibilitySearchParam,
  hrComplianceWorkEligibilitySurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-eligibility-list.surface";
import {
  buildHrComplianceSafetyTrainingRequirementsListSurface,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceSafetyTrainingSearchParam,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-safety-training-requirements-list.surface";
import {
  buildHrComplianceWorkplaceSafetyRequirementsListSurface,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceWorkplaceSafetySearchParam,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-workplace-safety-list.surface";
import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";
import { formatComplianceDateTimeLocalInput } from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-form.shared";
import {
  buildHrComplianceLaborLawRequirementsListSurface,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceLaborLawSearchParam,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import {
  buildHrComplianceFilingsListSurface,
  hrComplianceFilingSearchParam,
  hrComplianceFilingsSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-filings-list.surface";
import {
  buildHrCompliancePolicyAcknowledgementsListSurface,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrCompliancePolicyAcknowledgementSearchParam,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-policy-acknowledgements-list.surface";
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
    expect(configuration.rows[0]?.rowTone).toBe("default");
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
            itemType: "missing",
            gapKind: "missing",
            title: "Missing: SAF-01 · Induction",
            severity: "high",
            status: "open",
            correctiveActionOwnerEmployeeId: null,
            correctiveActionOwnerEmployeeNumber: null,
            correctiveActionOwnerDisplayName: null,
            correctiveActionDescription: null,
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
    expect(configuration.rows[0]?.cells.gap).toBe("Missing");
    expect(configuration.rows[0]?.cells.gapKindValue).toBe("missing");
    expect(configuration.rows[0]?.cells.statusValue).toBe("open");
    expect(configuration.rows[0]?.cellKinds?.gap).toEqual({
      kind: "badge",
      tone: "attention",
    });
    expect(configuration.rows[0]?.rowHref).toBe("/hr/records/emp_1");
    expect(configuration.rows[0]?.linkColumnId).toBe("title");
    expect(configuration.rows[0]?.rowTone).toBe("critical");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
    expect(configuration.rows[0]?.cellKinds?.status).toEqual({
      kind: "badge",
      tone: "attention",
    });
    expect(configuration.surface?.empty?.title).toBe("No open exceptions");
    expect(configuration.surface?.empty?.description).toContain(
      "missing, expired, overdue, or failed",
    );
    expect(configuration.rows[0]?.cells.correctiveActionDueDateInput).toBe("");

    const withDueDate = buildHrComplianceExceptionsListSurface({
      window: {
        rows: [
          {
            id: "exc_2",
            employeeId: "emp_2",
            employeeNumber: "E-200",
            employeeDisplayName: "Jordan Lee",
            complianceArea: "safety",
            itemType: "overdue",
            gapKind: "overdue",
            title: "Overdue: SAF-02",
            severity: "medium",
            status: "in_progress",
            correctiveActionOwnerEmployeeId: "emp_owner",
            correctiveActionOwnerEmployeeNumber: "E-200",
            correctiveActionOwnerDisplayName: "Jordan Lee",
            correctiveActionDescription: "Complete overdue safety training",
            correctiveActionDueDate: new Date("2026-06-15T08:30:00.000Z"),
            createdAt: new Date("2026-05-02T12:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(withDueDate.rows[0]?.cells.correctiveActionDueDateInput).toBe(
      formatComplianceDateTimeLocalInput(
        new Date("2026-06-15T08:30:00.000Z"),
      ),
    );
    expect(withDueDate.rows[0]?.cells.correctiveActionOwnerEmployeeIdValue).toBe(
      "emp_owner",
    );
    expect(withDueDate.rows[0]?.cells.owner).toContain("Jordan Lee");
    expect(withDueDate.rows[0]?.cells.correctiveActionDescriptionValue).toBe(
      "Complete overdue safety training",
    );

    const overdueCorrective = buildHrComplianceExceptionsListSurface({
      window: {
        rows: [
          {
            id: "exc_overdue",
            employeeId: "emp_3",
            employeeNumber: "E-300",
            employeeDisplayName: "Sam Rivera",
            complianceArea: "safety",
            itemType: "overdue",
            gapKind: "overdue",
            title: "Overdue corrective",
            severity: "low",
            status: "in_progress",
            correctiveActionOwnerEmployeeId: "emp_owner",
            correctiveActionOwnerEmployeeNumber: "E-300",
            correctiveActionOwnerDisplayName: "Sam Rivera",
            correctiveActionDescription: "Follow up",
            correctiveActionDueDate: new Date("2020-01-01T00:00:00.000Z"),
            createdAt: new Date("2026-05-02T12:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(overdueCorrective.rows[0]?.cells.correctiveDuePostureValue).toBe(
      "overdue",
    );
    expect(overdueCorrective.rows[0]?.cellKinds?.dueDate).toEqual({
      kind: "badge",
      tone: "critical",
    });
    expect(overdueCorrective.rows[0]?.rowTone).toBe("critical");
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
    expect(configuration.rows[0]?.rowHref).toBe("/hr/records/emp_1");
    expect(configuration.rows[0]?.linkColumnId).toBe("employee");
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.cells?.effectiveStatusValue).toBe("at_risk");
    expect(configuration.rows[0]?.cells?.trailingStatusValue).toBe("pending");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("builds overdue policy acknowledgment list with critical row tone", () => {
    const configuration = buildHrCompliancePolicyAcknowledgementsListSurface({
      window: {
        rows: [
          {
            id: "req_pa_overdue",
            employeeId: "emp_2",
            employeeNumber: "E-200",
            employeeDisplayName: "Jordan Lead",
            obligationId: "obl_pa_2",
            obligationCode: "CODE-2026",
            obligationTitle: "Code of conduct",
            complianceArea: "acknowledgement",
            status: "pending",
            dueDate: new Date("2026-05-01T00:00:00.000Z"),
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

    expect(configuration.rows[0]?.cells?.effectiveStatusValue).toBe("overdue");
    expect(configuration.rows[0]?.rowTone).toBe("critical");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("normalizes stored overdue requirement status for trailing selects", () => {
    const configuration = buildHrComplianceLaborLawRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_ll_overdue",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            obligationId: "obl_1",
            obligationCode: "LL-01",
            obligationTitle: "Weekly hours register",
            complianceArea: "labor_law",
            status: "overdue",
            dueDate: new Date("2026-05-01T00:00:00.000Z"),
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

    expect(configuration.rows[0]?.cells?.effectiveStatusValue).toBe("overdue");
    expect(configuration.rows[0]?.cells?.trailingStatusValue).toBe("pending");
    expect(configuration.rows[0]?.rowTone).toBe("critical");
  });

  it("builds policy acknowledgment list with version column and effective status tone", () => {
    const configuration = buildHrCompliancePolicyAcknowledgementsListSurface({
      window: {
        rows: [
          {
            id: "req_pa_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            obligationId: "obl_pa_1",
            obligationCode: "HANDBOOK-V2026",
            obligationTitle: "Employee handbook",
            complianceArea: "acknowledgement",
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

    expect(hrCompliancePolicyAcknowledgementsSurfaceKey).toBe(
      "hr.workforce.compliance.policy-acknowledgements.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrCompliancePolicyAcknowledgementSearchParam,
    );
    expect(configuration.rows[0]?.cells?.policyVersion).toBe("HANDBOOK-V2026");
    expect(configuration.rows[0]?.cells?.effectiveStatusValue).toBe("at_risk");
    expect(configuration.rows[0]?.cells?.trailingStatusValue).toBe("pending");
    expect(configuration.rows[0]?.rowHref).toBe("/hr/records/emp_1");
    expect(configuration.rows[0]?.linkColumnId).toBe("employee");
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("builds mandatory filings list with deadline derivation and trailing metadata", () => {
    const configuration = buildHrComplianceFilingsListSurface({
      window: {
        rows: [
          {
            id: "fil_1",
            obligationId: "obl_fil_1",
            obligationCode: "EPF-MONTHLY",
            obligationTitle: "EPF monthly declaration",
            complianceArea: "filing",
            countryCode: "MY",
            legalEntityCode: "AFENDA-MY",
            workLocationCode: null,
            employmentType: null,
            workerCategory: null,
            departmentName: null,
            status: "pending",
            filingDeadline: new Date("2026-05-01T00:00:00.000Z"),
            submittedAt: null,
            confirmedAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(hrComplianceFilingsSurfaceKey).toBe(
      "hr.workforce.compliance.filings.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceFilingSearchParam,
    );
    expect(configuration.rows[0]?.cells?.status).toBe("Overdue");
    expect(configuration.rows[0]?.rowTone).toBe("critical");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
    expect(configuration.rows[0]?.cells?.filingDeadlineInput).toBe(
      formatComplianceDateTimeLocalInput(new Date("2026-05-01T00:00:00.000Z")),
    );
    expect(configuration.rows[0]?.cells?.trailingStatusValue).toBe("pending");
    expect(configuration.rows[0]?.cells?.effectiveStatusValue).toBe("overdue");
    expect(configuration.presentation?.primaryColumnId).toBe("filingDeadline");
    expect(configuration.columns?.[0]?.id).toBe("filingDeadline");
    expect(configuration.surface?.columnsId).toBe("hr.workforce.compliance.filings");
  });

  it("builds workplace safety list with employee link and effective status tone", () => {
    const dueDate = new Date("2026-06-10T00:00:00.000Z");
    const configuration = buildHrComplianceWorkplaceSafetyRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_ws_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            obligationId: "obl_ws_1",
            obligationCode: "SAF-01",
            obligationTitle: "Safety induction",
            complianceArea: "safety",
            status: "pending",
            dueDate,
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

    expect(hrComplianceWorkplaceSafetyRequirementsSurfaceKey).toBe(
      "hr.workforce.compliance.workplace-safety-requirements.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceWorkplaceSafetySearchParam,
    );
    expect(configuration.rows[0]?.rowHref).toBe("/hr/records/emp_1");
    expect(configuration.rows[0]?.linkColumnId).toBe("employee");
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.cells.dueDateInput).toBe(
      formatComplianceDateTimeLocalInput(dueDate),
    );
    expect(configuration.rows[0]?.cells.statusValue).toBe("pending");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("keeps workplace safety trailing actions visible for compliant rows", () => {
    const configuration = buildHrComplianceWorkplaceSafetyRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_ws_2",
            employeeId: "emp_2",
            employeeNumber: "E-200",
            employeeDisplayName: "Jordan Lead",
            obligationId: "obl_ws_2",
            obligationCode: "SAF-02",
            obligationTitle: "Annual safety induction",
            complianceArea: "safety",
            status: "compliant",
            dueDate: new Date("2027-01-01T00:00:00.000Z"),
            completedAt: new Date("2026-01-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("builds safety training list with certification expiry serialization", () => {
    const dueDate = new Date("2027-03-15T00:00:00.000Z");
    const configuration = buildHrComplianceSafetyTrainingRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_st_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            obligationId: "obl_st_1",
            obligationCode: "TRN-01",
            obligationTitle: "Fire safety certification",
            complianceArea: "safety",
            requirementKind: "training",
            status: "compliant",
            dueDate,
            completedAt: new Date("2026-01-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(hrComplianceSafetyTrainingRequirementsSurfaceKey).toBe(
      "hr.workforce.compliance.safety-training-requirements.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceSafetyTrainingSearchParam,
    );
    expect(configuration.dataNature).toBe("table");
    expect(configuration.requiresErpPermission).toEqual(
      hrWorkforceComplianceReadPermission,
    );
    expect(configuration.rows[0]?.cells.dueDateInput).toBe(
      formatComplianceDateTimeLocalInput(dueDate),
    );
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("hides labor law trailing actions for compliant posture", () => {
    const configuration = buildHrComplianceLaborLawRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_compliant",
            employeeId: "emp_5",
            employeeNumber: "E-500",
            employeeDisplayName: "Casey Lead",
            obligationId: "obl_ll_1",
            obligationCode: "LL-02",
            obligationTitle: "Rest day register",
            complianceArea: "labor_law",
            status: "compliant",
            dueDate: new Date("2027-01-01T00:00:00.000Z"),
            completedAt: new Date("2026-01-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(configuration.rows[0]?.trailingAction?.state).toBe("hidden");
  });

  it("builds work eligibility list with employee link and trailing gate", () => {
    const configuration = buildHrComplianceWorkEligibilityListSurface({
      window: {
        rows: [
          {
            id: "we_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            status: "pending_verification",
            verifiedAt: null,
            expiresAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(hrComplianceWorkEligibilitySurfaceKey).toBe(
      "hr.workforce.compliance.work-eligibility.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceWorkEligibilitySearchParam,
    );
    expect(configuration.rows[0]?.rowHref).toBe("/hr/records/emp_1");
    expect(configuration.rows[0]?.linkColumnId).toBe("employee");
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("builds work authorization documents list with document columns and trailing gate", () => {
    const issuedAt = new Date("2024-01-01T00:00:00.000Z");
    const expiresAt = new Date("2029-01-01T00:00:00.000Z");
    const configuration = buildHrComplianceWorkAuthDocumentsListSurface({
      window: {
        rows: [
          {
            id: "wad_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            documentType: "passport",
            status: "pending_verification",
            documentNumber: "P123456",
            issuedAt,
            expiresAt,
            verifiedAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(hrComplianceWorkAuthDocumentsSurfaceKey).toBe(
      "hr.workforce.compliance.work-auth-documents.list",
    );
    expect(configuration.dataNature).toBe("table");
    expect(configuration.requiresErpPermission).toEqual(
      hrWorkforceComplianceReadPermission,
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceWorkAuthDocumentSearchParam,
    );
    expect(configuration.rows[0]?.rowHref).toBe("/hr/records/emp_1");
    expect(configuration.rows[0]?.cells.documentType).toBe("Passport");
    expect(configuration.rows[0]?.cellKinds?.documentType).toEqual({
      kind: "badge",
      tone: "default",
    });
    expect(configuration.rows[0]?.cells.statusValue).toBe("pending_verification");
    expect(configuration.rows[0]?.cells.effectiveStatusValue).toBe(
      "pending_verification",
    );
    expect(configuration.rows[0]?.cells.documentNumberValue).toBe("P123456");
    expect(configuration.rows[0]?.cells.issuedAtInput).toBe(
      formatComplianceDateTimeLocalInput(issuedAt),
    );
    expect(configuration.rows[0]?.cells.expiresAtInput).toBe(
      formatComplianceDateTimeLocalInput(expiresAt),
    );
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("flags missing work authorization documents with attention posture and serialized effective status", () => {
    const configuration = buildHrComplianceWorkAuthDocumentsListSurface({
      window: {
        rows: [
          {
            id: "wad_missing",
            employeeId: "emp_missing",
            employeeNumber: "E-050",
            employeeDisplayName: "Riley Newhire",
            documentType: "right_to_work",
            status: "missing",
            documentNumber: null,
            issuedAt: null,
            expiresAt: null,
            verifiedAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(configuration.rows[0]?.cells.status).toBe("Missing");
    expect(configuration.rows[0]?.cells.effectiveStatusValue).toBe("missing");
    expect(configuration.rows[0]?.cells.trailingStatusValue).toBe("missing");
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.cellKinds?.status).toEqual({
      kind: "badge",
      tone: "attention",
    });
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("derives missing posture from stale verified rows without document evidence", () => {
    const configuration = buildHrComplianceWorkAuthDocumentsListSurface({
      window: {
        rows: [
          {
            id: "wad_stale",
            employeeId: "emp_stale",
            employeeNumber: "E-075",
            employeeDisplayName: "Casey Stale",
            documentType: "visa",
            status: "verified",
            documentNumber: null,
            issuedAt: null,
            expiresAt: null,
            verifiedAt: new Date("2025-01-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(configuration.rows[0]?.cells.status).toBe("Missing");
    expect(configuration.rows[0]?.cells.effectiveStatusValue).toBe("missing");
    expect(configuration.rows[0]?.cells.trailingStatusValue).toBe("missing");
    expect(configuration.rows[0]?.cells.statusValue).toBe("verified");
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("marks expiring work authorization documents with attention tone", () => {
    const configuration = buildHrComplianceWorkAuthDocumentsListSurface({
      window: {
        rows: [
          {
            id: "wad_expiring",
            employeeId: "emp_3",
            employeeNumber: "E-300",
            employeeDisplayName: "Sam Operator",
            documentType: "passport",
            status: "verified",
            documentNumber: "P-001",
            issuedAt: new Date("2024-01-01T00:00:00.000Z"),
            expiresAt: new Date("2026-06-10T00:00:00.000Z"),
            verifiedAt: new Date("2024-02-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(configuration.rows[0]?.cells.status).toBe("Expiring");
    expect(configuration.rows[0]?.cells.effectiveStatusValue).toBe("expiring");
    expect(configuration.rows[0]?.cells.trailingStatusValue).toBe("verified");
    expect(configuration.rows[0]?.rowTone).toBe("attention");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("marks expired work authorization documents critical and keeps trailing ready for renewal", () => {
    const configuration = buildHrComplianceWorkAuthDocumentsListSurface({
      window: {
        rows: [
          {
            id: "wad_expired",
            employeeId: "emp_2",
            employeeNumber: "E-200",
            employeeDisplayName: "Jordan Lead",
            documentType: "work_permit",
            status: "verified",
            documentNumber: "WP-001",
            issuedAt: new Date("2024-01-01T00:00:00.000Z"),
            expiresAt: new Date("2026-01-01T00:00:00.000Z"),
            verifiedAt: new Date("2024-02-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(configuration.rows[0]?.cells.status).toBe("Expired");
    expect(configuration.rows[0]?.cells.trailingStatusValue).toBe("verified");
    expect(configuration.rows[0]?.rowTone).toBe("critical");
    expect(configuration.rows[0]?.cellKinds?.status).toEqual({
      kind: "badge",
      tone: "critical",
    });
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("hides work authorization trailing actions for active verified documents", () => {
    const configuration = buildHrComplianceWorkAuthDocumentsListSurface({
      window: {
        rows: [
          {
            id: "wad_verified",
            employeeId: "emp_3",
            employeeNumber: "E-300",
            employeeDisplayName: "Sam Analyst",
            documentType: "visa",
            status: "verified",
            documentNumber: "V-900",
            issuedAt: new Date("2025-01-01T00:00:00.000Z"),
            expiresAt: new Date("2028-01-01T00:00:00.000Z"),
            verifiedAt: new Date("2025-02-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(configuration.rows[0]?.cells.status).toBe("Verified");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("hidden");
  });

  it("hides work eligibility trailing actions for eligible posture", () => {
    const configuration = buildHrComplianceWorkEligibilityListSurface({
      window: {
        rows: [
          {
            id: "we_eligible",
            employeeId: "emp_4",
            employeeNumber: "E-400",
            employeeDisplayName: "Taylor Ops",
            status: "eligible",
            verifiedAt: new Date("2026-01-01T00:00:00.000Z"),
            expiresAt: new Date("2028-01-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(configuration.rows[0]?.trailingAction?.state).toBe("hidden");
  });
});
