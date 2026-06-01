import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrIndustryRwsReadPermission } from "../../src/industry-specific/retail-seasonal-hourly-workforce-scheduling/contracts/hr.industry.rws.contract";
import { buildHrIndustryRwsPageModel } from "../../src/industry-specific/retail-seasonal-hourly-workforce-scheduling/data/hr.industry.rws.page-model.server";
import {
  listHrIndustryRwsCoverageGapRefs,
  listHrIndustryRwsIntegrationExposureRefs,
  listHrIndustryRwsOpenShiftEligibilityRefs,
  listHrIndustryRwsPayrollScheduleRefs,
  resetHrIndustryRwsStore,
} from "../../src/industry-specific/retail-seasonal-hourly-workforce-scheduling/data/hr.industry.rws-store.shared";
import { buildHrIndustryRwsListSurface } from "../../src/industry-specific/retail-seasonal-hourly-workforce-scheduling/surface/hr.industry.rws-lists.surface";
import {
  HR_INDUSTRY_RWS_LIST_SURFACE_KEYS,
  hrIndustryRwsAssignmentsSurfaceKey,
  hrIndustryRwsAuditTrailSurfaceKey,
  hrIndustryRwsComplianceFindingsSurfaceKey,
  hrIndustryRwsIntegrationExposuresSurfaceKey,
  hrIndustryRwsLaborBudgetsSurfaceKey,
  hrIndustryRwsSchedulesSurfaceKey,
} from "../../src/industry-specific/retail-seasonal-hourly-workforce-scheduling/surface/hr.industry.rws-surface-metadata.shared";

describe("retail seasonal hourly workforce scheduling EUI contract", () => {
  it("builds governed server-window list configuration", () => {
    const surface = buildHrIndustryRwsListSurface({
      surfaceKey: hrIndustryRwsAssignmentsSurfaceKey,
      searchValue: "cashier",
      rows: [
        {
          id: "rws-asg-300",
          rowTone: "attention",
          cells: {
            employee: "Alicia Moreno",
            storeDepartment: "NYC Flagship / Front of Store",
            roleShift: "Cashier / Peak",
            shiftWindow: "2026-11-27 08:00-16:00",
            workerType: "Seasonal",
            availability: "Preferred",
            skillStatus: "POS certified",
            compliance: "Clear",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.requiresErpPermission).toEqual(hrIndustryRwsReadPermission);
    expect(surface.presentation!.toolbar?.search?.value).toBe("cashier");
    expect(surface.surface.columnsId).toBe(hrIndustryRwsAssignmentsSurfaceKey);
    expect(surface.pagination!.totalCount).toBe(1);
  });

  it("builds a page model with gated cost, integration, and audit sections", async () => {
    resetHrIndustryRwsStore("org-rws-eui");

    const pageModel = await buildHrIndustryRwsPageModel({
      organizationId: "org-rws-eui",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canReadLaborCost: true,
      canExposeIntegrations: true,
      reportGroupBy: "store",
      status: "all",
    });

    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrIndustryRwsLaborBudgetsSurfaceKey,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrIndustryRwsIntegrationExposuresSurfaceKey,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrIndustryRwsAuditTrailSurfaceKey,
    );
    expect(pageModel.sections).toHaveLength(
      HR_INDUSTRY_RWS_LIST_SURFACE_KEYS.length,
    );
  });

  it("redacts labor cost and restricted worker details without access", async () => {
    resetHrIndustryRwsStore("org-rws-redaction");

    const pageModel = await buildHrIndustryRwsPageModel({
      organizationId: "org-rws-redaction",
      visibleEmployeeIds: null,
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canReadLaborCost: false,
      canExposeIntegrations: false,
      reportGroupBy: "store",
      status: "all",
    });

    const scheduleSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrIndustryRwsSchedulesSurfaceKey,
    );
    const complianceSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrIndustryRwsComplianceFindingsSurfaceKey,
    );

    expect(scheduleSection?.listConfiguration.rows[0]?.cells.laborCost).toBe(
      "Restricted",
    );
    expect(complianceSection?.listConfiguration.rows[0]?.cells.finding).toBe(
      "Restricted",
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).not.toContain(
      hrIndustryRwsLaborBudgetsSurfaceKey,
    );
  });

  it("exposes integration references from scheduling state", () => {
    const store = resetHrIndustryRwsStore("org-rws-refs");

    expect(listHrIndustryRwsOpenShiftEligibilityRefs(store)).not.toHaveLength(0);
    expect(listHrIndustryRwsCoverageGapRefs(store)).not.toHaveLength(0);
    expect(
      listHrIndustryRwsPayrollScheduleRefs(store).some(
        (ref) => ref.attendanceOutcomeRef.startsWith("att-outcome"),
      ),
    ).toBe(true);
    expect(listHrIndustryRwsIntegrationExposureRefs(store)).not.toHaveLength(0);
  });
});
