import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrIndustryGpgReadPermission } from "../../src/industry-specific/government-classification-pay-grades/hr.industry.gpg.contract";
import { buildHrIndustryGpgPageModel } from "../../src/industry-specific/government-classification-pay-grades/hr.industry.gpg.page-model.server";
import { buildHrIndustryGpgListSurface } from "../../src/industry-specific/government-classification-pay-grades/hr.industry.gpg-lists.surface";
import {
  HR_INDUSTRY_GPG_LIST_SURFACE_KEYS,
  HR_INDUSTRY_GPG_READ_ONLY_LIST_SURFACE_KEYS,
  hrIndustryGpgAuditTrailSurfaceKey,
  hrIndustryGpgClassificationAssignmentsSurfaceKey,
  hrIndustryGpgIntegrationExposuresSurfaceKey,
  hrIndustryGpgRoutePaths,
  hrIndustryGpgUiCopy,
} from "../../src/industry-specific/government-classification-pay-grades/metadata";

describe("government classification pay grades list EUI contract", () => {
  it("registers governed route, copy, and read-only list surface keys", () => {
    expect(hrIndustryGpgRoutePaths.hub).toBe(
      "/hr/government-classification-pay-grades",
    );
    expect(hrIndustryGpgUiCopy.title).toBe(
      "Government Classification Pay Grades",
    );
    expect(HR_INDUSTRY_GPG_LIST_SURFACE_KEYS).toEqual(
      expect.arrayContaining([
        hrIndustryGpgClassificationAssignmentsSurfaceKey,
        hrIndustryGpgIntegrationExposuresSurfaceKey,
        hrIndustryGpgAuditTrailSurfaceKey,
      ]),
    );
    expect(HR_INDUSTRY_GPG_READ_ONLY_LIST_SURFACE_KEYS).toEqual(
      expect.arrayContaining([
        hrIndustryGpgClassificationAssignmentsSurfaceKey,
        hrIndustryGpgIntegrationExposuresSurfaceKey,
        hrIndustryGpgAuditTrailSurfaceKey,
      ]),
    );
  });

  it("builds governed server-window list configuration", () => {
    const surface = buildHrIndustryGpgListSurface({
      surfaceKey: hrIndustryGpgClassificationAssignmentsSurfaceKey,
      searchValue: "Ada",
      rows: [
        {
          id: "gpg-assignment-001",
          cells: {
            employeeDisplayName: "Ada Lovelace",
            positionTitle: "Senior Policy Analyst",
            classificationCode: "GS-0343",
            gradeStep: "GS-12 Step 4",
            agencyName: "Digital Services Agency",
            departmentName: "Public Operations",
            effectiveDate: "2026-05-31",
            status: "Active",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.requiresErpPermission).toEqual(hrIndustryGpgReadPermission);
    expect(surface.presentation!.toolbar?.search?.value).toBe("Ada");
    expect(surface.surface.columnsId).toBe(
      hrIndustryGpgClassificationAssignmentsSurfaceKey,
    );
    expect(surface.pagination!.totalCount).toBe(1);
  });

  it("builds a page model with gated integration and audit sections", async () => {
    const pageModel = await buildHrIndustryGpgPageModel({
      organizationId: "org-gpg-eui",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "agency",
      status: "all",
    });

    expect(pageModel.sections.map((section) => section.surfaceKey)).toEqual(
      expect.arrayContaining([
        hrIndustryGpgIntegrationExposuresSurfaceKey,
        hrIndustryGpgAuditTrailSurfaceKey,
      ]),
    );
    expect(pageModel.sections).toHaveLength(
      HR_INDUSTRY_GPG_LIST_SURFACE_KEYS.length,
    );
  });
});
