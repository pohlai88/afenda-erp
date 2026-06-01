import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrIndustryFrmReadPermission } from "../../src/industry-specific/field-worker-remote-workforce-management/contracts/hr.industry.frm.contract";
import { buildHrIndustryFrmPageModel } from "../../src/industry-specific/field-worker-remote-workforce-management/data/hr.industry.frm.page-model.server";
import {
  listHrIndustryFrmAttendanceOutcomeRefs,
  resetHrIndustryFrmStore,
} from "../../src/industry-specific/field-worker-remote-workforce-management/data/hr.industry.frm-store.shared";
import { buildHrIndustryFrmListSurface } from "../../src/industry-specific/field-worker-remote-workforce-management/surface/hr.industry.frm-lists.surface";
import {
  HR_INDUSTRY_FRM_LIST_SURFACE_KEYS,
  hrIndustryFrmAssignmentsSurfaceKey,
  hrIndustryFrmPayrollExportsSurfaceKey,
} from "../../src/industry-specific/field-worker-remote-workforce-management/surface/hr.industry.frm-surface-metadata.shared";

describe("field worker remote workforce list EUI contract", () => {
  it("builds governed server-window list configuration", () => {
    const surface = buildHrIndustryFrmListSurface({
      surfaceKey: hrIndustryFrmAssignmentsSurfaceKey,
      searchValue: "Maya",
      rows: [
        {
          id: "assign-field-001",
          cells: {
            employeeDisplayName: "Maya Chen",
            worksiteName: "Project Alpha Construction Site",
            assignmentType: "Project Based",
            managerDisplayName: "Omar Rahman",
            departmentName: "Field Operations",
            dateRange: "2026-05-01 - 2026-06-30",
            status: "Active",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.requiresErpPermission).toEqual(hrIndustryFrmReadPermission);
    expect(surface.presentation.toolbar?.search?.value).toBe("Maya");
    expect(surface.surface.columnsId).toBe(hrIndustryFrmAssignmentsSurfaceKey);
    expect(surface.pagination.totalCount).toBe(1);
  });

  it("builds a page model with gated integration sections", async () => {
    resetHrIndustryFrmStore("org-frm-eui");

    const pageModel = await buildHrIndustryFrmPageModel({
      organizationId: "org-frm-eui",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "site",
    });

    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrIndustryFrmPayrollExportsSurfaceKey,
    );
    expect(pageModel.sections).toHaveLength(
      HR_INDUSTRY_FRM_LIST_SURFACE_KEYS.length,
    );
  });

  it("exposes only explicit event attendance outcomes", () => {
    const store = resetHrIndustryFrmStore("org-frm-privacy");
    const refs = listHrIndustryFrmAttendanceOutcomeRefs(store);

    expect(refs.every((ref) => ref.gpsValidationRef.length > 0)).toBe(true);
    expect(refs.map((ref) => ref.outcome)).toContain("exception");
  });
});
