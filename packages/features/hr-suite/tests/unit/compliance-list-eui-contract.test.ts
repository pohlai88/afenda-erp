import { describe, expect, it } from "vitest";

import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";
import { buildHrComplianceReviewQueueListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-review-queue-list.surface";
import { buildHrComplianceAlertsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-alerts-list.surface";
import { buildHrComplianceExceptionsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-exceptions-list.surface";
import { buildHrComplianceFilingsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-filings-list.surface";
import { buildHrComplianceLaborLawRequirementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import { buildHrComplianceStatutoryRequirementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-statutory-requirements-list.surface";
import { buildHrComplianceObligationsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-obligations-list.surface";
import { buildHrCompliancePolicyAcknowledgementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-policy-acknowledgements-list.surface";
import { buildHrComplianceRegulatoryCalendarListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-regulatory-calendar-list.surface";
import { buildHrComplianceSafetyTrainingRequirementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-safety-training-requirements-list.surface";
import { buildHrComplianceWorkAuthDocumentsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-auth-documents-list.surface";
import { buildHrComplianceWorkEligibilityListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-eligibility-list.surface";
import { buildHrComplianceWorkplaceSafetyRequirementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-workplace-safety-list.surface";
import { buildHrComplianceEvidenceLinksListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-evidence-links-list.surface";
import { buildHrComplianceAuditTrailListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-audit-trail-list.surface";
import {
  HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY,
  HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY,
  hrComplianceAlertsSurfaceKey,
  hrComplianceReviewQueueSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceStatutoryRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceEvidenceLinksSurfaceKey,
  hrComplianceAuditTrailSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-surface-metadata.shared";

const emptyWindow = {
  rows: [],
  pageSize: 25,
  totalCount: 0,
  hasNextPage: false,
};

describe("compliance Pattern C governed list EUI contract", () => {
  const cases = [
    {
      label: "alerts",
      surfaceKey: hrComplianceAlertsSurfaceKey,
      build: () => buildHrComplianceAlertsListSurface({ window: emptyWindow }),
    },
    {
      label: "review queue",
      surfaceKey: hrComplianceReviewQueueSurfaceKey,
      build: () =>
        buildHrComplianceReviewQueueListSurface({
          window: { ...emptyWindow, mergeTruncated: false },
          canWrite: true,
        }),
    },
    {
      label: "obligations",
      surfaceKey: hrComplianceObligationsSurfaceKey,
      build: () =>
        buildHrComplianceObligationsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "filings",
      surfaceKey: hrComplianceFilingsSurfaceKey,
      build: () =>
        buildHrComplianceFilingsListSurface({ window: emptyWindow, canWrite: true }),
    },
    {
      label: "regulatory calendar",
      surfaceKey: hrComplianceRegulatoryCalendarSurfaceKey,
      build: () =>
        buildHrComplianceRegulatoryCalendarListSurface({ window: emptyWindow }),
    },
    {
      label: "policy acknowledgements",
      surfaceKey: hrCompliancePolicyAcknowledgementsSurfaceKey,
      build: () =>
        buildHrCompliancePolicyAcknowledgementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "labor law requirements",
      surfaceKey: hrComplianceLaborLawRequirementsSurfaceKey,
      build: () =>
        buildHrComplianceLaborLawRequirementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "statutory employment requirements",
      surfaceKey: hrComplianceStatutoryRequirementsSurfaceKey,
      build: () =>
        buildHrComplianceStatutoryRequirementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "safety training requirements",
      surfaceKey: hrComplianceSafetyTrainingRequirementsSurfaceKey,
      build: () =>
        buildHrComplianceSafetyTrainingRequirementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "workplace safety requirements",
      surfaceKey: hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
      build: () =>
        buildHrComplianceWorkplaceSafetyRequirementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "work eligibility",
      surfaceKey: hrComplianceWorkEligibilitySurfaceKey,
      build: () =>
        buildHrComplianceWorkEligibilityListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "work auth documents",
      surfaceKey: hrComplianceWorkAuthDocumentsSurfaceKey,
      build: () =>
        buildHrComplianceWorkAuthDocumentsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "exceptions",
      surfaceKey: hrComplianceExceptionsSurfaceKey,
      build: () =>
        buildHrComplianceExceptionsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "evidence links",
      surfaceKey: hrComplianceEvidenceLinksSurfaceKey,
      build: () =>
        buildHrComplianceEvidenceLinksListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "audit trail",
      surfaceKey: hrComplianceAuditTrailSurfaceKey,
      build: () =>
        buildHrComplianceAuditTrailListSurface({
          window: emptyWindow,
        }),
    },
  ] as const;

  it.each(cases)("$label surface satisfies governed list metadata contract", ({
    surfaceKey,
    build,
  }) => {
    const configuration = build();

    expect(configuration.dataNature).toBe("table");
    expect(configuration.presentation?.tableDensity).toBe("compact");
    expect(configuration.presentation?.stickyHeader).toBe(true);
    expect(configuration.requiresErpPermission).toEqual(
      hrWorkforceComplianceReadPermission,
    );
    expect(configuration.surface?.rowKey).toBe("id");
    expect(configuration.surface?.columnsId).toBe(
      HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey],
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey],
    );
    expect(configuration.surface?.header?.title).toBeTruthy();
    expect(configuration.surface?.empty?.title).toBeTruthy();
    expect(configuration.surface?.empty?.description).toBeTruthy();
    expect(configuration.presentation?.primaryColumnId).toBeTruthy();
  });
});
