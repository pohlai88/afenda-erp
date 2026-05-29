import { describe, expect, it } from "vitest";

import {
  getHrComplianceListSurfaceKeys,
  HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_COMPLIANCE_LIST_SURFACE_KEYS,
} from "../../src/metadata";
import { hrComplianceRegulatoryCalendarSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-regulatory-calendar-list.surface";
import { hrComplianceAlertsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-alerts-list.surface";
import { hrComplianceFilingsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-filings-list.surface";
import { hrComplianceExceptionsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-exceptions-list.surface";
import { hrComplianceLaborLawRequirementsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-labor-law-requirements-list.surface";
import { hrComplianceObligationsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-obligations-list.surface";
import { hrCompliancePolicyAcknowledgementsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-policy-acknowledgements-list.surface";
import { hrComplianceSafetyTrainingRequirementsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-safety-training-requirements-list.surface";
import { hrComplianceWorkAuthDocumentsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-auth-documents-list.surface";
import { hrComplianceWorkEligibilitySurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-eligibility-list.surface";
import { hrComplianceWorkplaceSafetyRequirementsSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-workplace-safety-list.surface";

describe("hr compliance list surface metadata", () => {
  it("registers eleven Pattern C list surface keys", () => {
    expect(HR_COMPLIANCE_LIST_SURFACE_KEYS).toHaveLength(11);
    expect(getHrComplianceListSurfaceKeys()).toEqual(
      HR_COMPLIANCE_LIST_SURFACE_KEYS,
    );
  });

  it("exports compliance list surface keys from the metadata door", () => {
    expect(getHrComplianceListSurfaceKeys()).toEqual(
      HR_COMPLIANCE_LIST_SURFACE_KEYS,
    );
  });

  it("keeps stable surface key identifiers in workbench order", () => {
    expect([...HR_COMPLIANCE_LIST_SURFACE_KEYS]).toEqual([
      hrComplianceAlertsSurfaceKey,
      hrComplianceObligationsSurfaceKey,
      hrComplianceFilingsSurfaceKey,
      hrComplianceRegulatoryCalendarSurfaceKey,
      hrCompliancePolicyAcknowledgementsSurfaceKey,
      hrComplianceLaborLawRequirementsSurfaceKey,
      hrComplianceSafetyTrainingRequirementsSurfaceKey,
      hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
      hrComplianceWorkEligibilitySurfaceKey,
      hrComplianceWorkAuthDocumentsSurfaceKey,
      hrComplianceExceptionsSurfaceKey,
    ]);
  });

  it("maps each surface key to its governed columnsId registry value", () => {
    for (const surfaceKey of HR_COMPLIANCE_LIST_SURFACE_KEYS) {
      expect(HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey]).toBeTruthy();
      expect(HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey]).not.toContain(
        ".list",
      );
    }
  });
});
