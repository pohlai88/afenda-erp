import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { HR_COMPLIANCE_LIST_SURFACE_KEYS } from "../../src/metadata";
import { hrComplianceEvidenceLinksSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-evidence-links-list.surface";
import { hrComplianceAuditTrailSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-audit-trail-list.surface";
import {
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
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-surface-metadata.shared";

const workbenchComponentPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/employee-management/compliance-regulatory-tracking/components/hr.workforce.compliance-section.component.server.tsx",
);

const surfaceKeyByIdentifier = {
  hrComplianceAlertsSurfaceKey,
  hrComplianceReviewQueueSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceStatutoryRequirementsSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceEvidenceLinksSurfaceKey,
  hrComplianceAuditTrailSurfaceKey,
} as const;

describe("hr compliance workbench Pattern C section order", () => {
  it("matches HR_COMPLIANCE_LIST_SURFACE_KEYS registry order", () => {
    const source = readFileSync(workbenchComponentPath, "utf8");
    const identifiers = [
      ...source.matchAll(/surfaceKey=\{(hrCompliance\w+)\}/g),
    ].map((match) => match[1]);

    const workbenchSurfaceKeys = identifiers.flatMap((identifier) => {
      const surfaceKey =
        surfaceKeyByIdentifier[
          identifier as keyof typeof surfaceKeyByIdentifier
        ];
      return surfaceKey ? [surfaceKey] : [];
    });

    expect(workbenchSurfaceKeys).toEqual([...HR_COMPLIANCE_LIST_SURFACE_KEYS]);
  });
});
