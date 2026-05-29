import { describe, expect, it } from "vitest";

import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";
import { buildHrComplianceAlertsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-alerts-list.surface";
import { buildHrComplianceExceptionsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-exceptions-list.surface";
import { buildHrComplianceFilingsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-filings-list.surface";
import { buildHrComplianceLaborLawRequirementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import { buildHrComplianceObligationsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-obligations-list.surface";
import { buildHrCompliancePolicyAcknowledgementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-policy-acknowledgements-list.surface";
import { buildHrComplianceRegulatoryCalendarListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-regulatory-calendar-list.surface";
import { buildHrComplianceSafetyTrainingRequirementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-safety-training-requirements-list.surface";
import { buildHrComplianceWorkAuthDocumentsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-auth-documents-list.surface";
import { buildHrComplianceWorkEligibilityListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-eligibility-list.surface";
import { buildHrComplianceWorkplaceSafetyRequirementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-workplace-safety-list.surface";

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
      build: () => buildHrComplianceAlertsListSurface({ window: emptyWindow }),
    },
    {
      label: "obligations",
      build: () =>
        buildHrComplianceObligationsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "filings",
      build: () =>
        buildHrComplianceFilingsListSurface({ window: emptyWindow, canWrite: true }),
    },
    {
      label: "regulatory calendar",
      build: () =>
        buildHrComplianceRegulatoryCalendarListSurface({ window: emptyWindow }),
    },
    {
      label: "policy acknowledgements",
      build: () =>
        buildHrCompliancePolicyAcknowledgementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "labor law requirements",
      build: () =>
        buildHrComplianceLaborLawRequirementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "safety training requirements",
      build: () =>
        buildHrComplianceSafetyTrainingRequirementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "workplace safety requirements",
      build: () =>
        buildHrComplianceWorkplaceSafetyRequirementsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "work eligibility",
      build: () =>
        buildHrComplianceWorkEligibilityListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "work auth documents",
      build: () =>
        buildHrComplianceWorkAuthDocumentsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
    {
      label: "exceptions",
      build: () =>
        buildHrComplianceExceptionsListSurface({
          window: emptyWindow,
          canWrite: true,
        }),
    },
  ] as const;

  it.each(cases)("$label surface satisfies governed list metadata contract", ({
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
    expect(configuration.surface?.columnsId).toBeTruthy();
    expect(configuration.presentation?.toolbar?.search?.param).toBeTruthy();
  });
});
