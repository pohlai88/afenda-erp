import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrIndustryFhcReadPermission } from "../../src/industry-specific/food-handler-certification-health-compliance/contracts/hr.industry.fhc.contract";
import { buildHrIndustryFhcPageModel } from "../../src/industry-specific/food-handler-certification-health-compliance/data/hr.industry.fhc.page-model.server";
import {
  listHrIndustryFhcComplianceTrainingRefs,
  listHrIndustryFhcLearningRequirementRefs,
  listHrIndustryFhcShiftSchedulingEligibilityRefs,
  resetHrIndustryFhcStore,
  resolveHrIndustryFhcEmployeeCompliance,
} from "../../src/industry-specific/food-handler-certification-health-compliance/data/hr.industry.fhc-store.shared";
import { hrFhcEvidenceSubmissionSchema } from "../../src/industry-specific/food-handler-certification-health-compliance/schemas/hr.industry.fhc.schema";
import { buildHrIndustryFhcListSurface } from "../../src/industry-specific/food-handler-certification-health-compliance/surface/hr.industry.fhc-lists.surface";
import {
  HR_INDUSTRY_FHC_LIST_SURFACE_KEYS,
  hrIndustryFhcEmployeeComplianceSurfaceKey,
  hrIndustryFhcHealthCertificationsSurfaceKey,
  hrIndustryFhcIntegrationExposuresSurfaceKey,
} from "../../src/industry-specific/food-handler-certification-health-compliance/surface/hr.industry.fhc-surface-metadata.shared";

describe("food handler certification health compliance EUI contract", () => {
  it("builds governed server-window list configuration", () => {
    const surface = buildHrIndustryFhcListSurface({
      surfaceKey: hrIndustryFhcEmployeeComplianceSurfaceKey,
      searchValue: "Ben",
      rows: [
        {
          id: "fhc-eligibility-emp-201",
          rowTone: "critical",
          cells: {
            employeeDisplayName: "Ben Tan",
            outletName: "Ampang Restaurant",
            roleName: "Server",
            managerDisplayName: "Farah Ismail",
            complianceStatus: "Expired",
            eligibilityStatus: "Restricted",
            flags: "Expired Food Handler Permit",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.requiresErpPermission).toEqual(hrIndustryFhcReadPermission);
    expect(surface.presentation.toolbar?.search?.value).toBe("Ben");
    expect(surface.surface.columnsId).toBe(hrIndustryFhcEmployeeComplianceSurfaceKey);
    expect(surface.pagination.totalCount).toBe(1);
  });

  it("builds a page model with gated integration and audit sections", async () => {
    resetHrIndustryFhcStore("org-fhc-eui");

    const pageModel = await buildHrIndustryFhcPageModel({
      organizationId: "org-fhc-eui",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "outlet",
      status: "all",
    });

    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrIndustryFhcIntegrationExposuresSurfaceKey,
    );
    expect(pageModel.sections).toHaveLength(HR_INDUSTRY_FHC_LIST_SURFACE_KEYS.length);
  });

  it("redacts health certification details without restricted read access", async () => {
    resetHrIndustryFhcStore("org-fhc-redaction");

    const pageModel = await buildHrIndustryFhcPageModel({
      organizationId: "org-fhc-redaction",
      visibleEmployeeIds: null,
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "outlet",
      status: "all",
    });

    const healthSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrIndustryFhcHealthCertificationsSurfaceKey,
    );

    expect(healthSection?.listConfiguration.rows[0]?.cells.providerName).toBe(
      "Restricted",
    );
    expect(healthSection?.listConfiguration.rows[0]?.cells.screeningRef).toBe(
      "Restricted",
    );
  });

  it("derives compliance status, restrictions, and integration refs", () => {
    const store = resetHrIndustryFhcStore("org-fhc-status");
    const byEmployee = new Map(
      store.employeeRequirements.map((requirement) => [
        requirement.employeeId,
        requirement,
      ]),
    );

    expect(
      resolveHrIndustryFhcEmployeeCompliance({
        store,
        requirement: byEmployee.get("emp-200")!,
      }).complianceStatus,
    ).toBe("expiring");
    expect(
      resolveHrIndustryFhcEmployeeCompliance({
        store,
        requirement: byEmployee.get("emp-201")!,
      }).eligibilityStatus,
    ).toBe("restricted");
    expect(
      resolveHrIndustryFhcEmployeeCompliance({
        store,
        requirement: byEmployee.get("emp-202")!,
      }).complianceStatus,
    ).toBe("rejected");

    expect(
      listHrIndustryFhcShiftSchedulingEligibilityRefs(store).some(
        (ref) => ref.eligibilityStatus === "restricted",
      ),
    ).toBe(true);
    expect(
      listHrIndustryFhcComplianceTrainingRefs(store).some(
        (ref) => ref.status === "overdue",
      ),
    ).toBe(true);
    expect(listHrIndustryFhcLearningRequirementRefs(store)).not.toHaveLength(0);
  });

  it("requires rejection reason for rejected evidence", () => {
    const result = hrFhcEvidenceSubmissionSchema.safeParse({
      id: "fhc-evidence-invalid",
      organizationId: "org-fhc",
      employeeId: "emp-201",
      employeeDisplayName: "Ben Tan",
      evidenceType: "food_handler_permit",
      targetRef: "fhc-permit-201",
      documentRef: "doc-fhc-invalid",
      submittedAt: "2026-05-31T00:00:00.000Z",
      submittedBy: "emp-201",
      status: "rejected",
    });

    expect(result.success).toBe(false);
  });
});
