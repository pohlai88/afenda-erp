import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrIndustryMscReadPermission } from "../../src/industry-specific/manufacturing-safety-training-osha-compliance/hr.industry.msc.contract";
import { buildHrIndustryMscPageModel } from "../../src/industry-specific/manufacturing-safety-training-osha-compliance/hr.industry.msc.page-model.server";
import {
  listHrIndustryMscComplianceTrainingRefs,
  listHrIndustryMscLearningRequirementRefs,
  listHrIndustryMscShiftSchedulingEligibilityRefs,
  resetHrIndustryMscStore,
  resolveHrIndustryMscSafetyEligibility,
} from "../../src/industry-specific/manufacturing-safety-training-osha-compliance/hr.industry.msc-store.shared";
import { buildHrIndustryMscListSurface } from "../../src/industry-specific/manufacturing-safety-training-osha-compliance/hr.industry.msc-lists.surface";
import {
  HR_INDUSTRY_MSC_LIST_SURFACE_KEYS,
  hrIndustryMscCertificationsSurfaceKey,
  hrIndustryMscEmployeeObligationsSurfaceKey,
  hrIndustryMscEvidenceLinksSurfaceKey,
  hrIndustryMscIncidentsSurfaceKey,
  hrIndustryMscIntegrationExposuresSurfaceKey,
} from "../../src/industry-specific/manufacturing-safety-training-osha-compliance/hr.industry.msc-surface-metadata.shared";

describe("manufacturing safety training OSHA compliance EUI contract", () => {
  it("builds governed server-window list configuration", () => {
    const surface = buildHrIndustryMscListSurface({
      surfaceKey: hrIndustryMscEmployeeObligationsSurfaceKey,
      searchValue: "Jamal",
      rows: [
        {
          id: "msc-eligibility-emp-301",
          rowTone: "critical",
          cells: {
            employeeDisplayName: "Jamal Reed",
            siteName: "Detroit Plant",
            departmentRole: "Warehouse / Forklift Operator",
            managerDisplayName: "Nora Fischer",
            requiredTraining: "Forklift, PPE, Workplace Hazard",
            riskLevel: "High",
            eligibilityStatus: "Restricted",
            flags: "expired Powered industrial truck",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.requiresErpPermission).toEqual(hrIndustryMscReadPermission);
    expect(surface.presentation!.toolbar?.search?.value).toBe("Jamal");
    expect(surface.surface.columnsId).toBe(
      hrIndustryMscEmployeeObligationsSurfaceKey,
    );
    expect(surface.pagination!.totalCount).toBe(1);
  });

  it("builds a page model with gated integration and audit sections", async () => {
    resetHrIndustryMscStore("org-msc-eui");

    const pageModel = await buildHrIndustryMscPageModel({
      organizationId: "org-msc-eui",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "site",
      status: "all",
    });

    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrIndustryMscIntegrationExposuresSurfaceKey,
    );
    expect(pageModel.sections).toHaveLength(
      HR_INDUSTRY_MSC_LIST_SURFACE_KEYS.length,
    );
  });

  it("redacts incident and document references without restricted read access", async () => {
    resetHrIndustryMscStore("org-msc-redaction");

    const pageModel = await buildHrIndustryMscPageModel({
      organizationId: "org-msc-redaction",
      visibleEmployeeIds: null,
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "site",
      status: "all",
    });

    const incidentSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrIndustryMscIncidentsSurfaceKey,
    );
    const evidenceSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrIndustryMscEvidenceLinksSurfaceKey,
    );

    expect(incidentSection?.listConfiguration.rows[0]?.cells.description).toBe(
      "Restricted",
    );
    expect(evidenceSection?.listConfiguration.rows[0]?.cells.documentRef).toBe(
      "Restricted",
    );
  });

  it("derives restrictions and integration refs from safety state", () => {
    const store = resetHrIndustryMscStore("org-msc-status");
    const byEmployee = new Map(
      store.employeeSafetyProfiles.map((profile) => [profile.employeeId, profile]),
    );

    expect(
      resolveHrIndustryMscSafetyEligibility({
        store,
        profile: byEmployee.get("emp-301")!,
      }).eligibilityStatus,
    ).toBe("restricted");
    expect(
      listHrIndustryMscShiftSchedulingEligibilityRefs(store).some(
        (ref) => ref.eligibilityStatus === "restricted",
      ),
    ).toBe(true);
    expect(
      listHrIndustryMscComplianceTrainingRefs(store).some(
        (ref) => ref.status === "overdue",
      ),
    ).toBe(true);
    expect(listHrIndustryMscLearningRequirementRefs(store)).not.toHaveLength(0);
  });

  it("keeps certification surface registered for expiry tracking", () => {
    expect(HR_INDUSTRY_MSC_LIST_SURFACE_KEYS).toContain(
      hrIndustryMscCertificationsSurfaceKey,
    );
  });
});
