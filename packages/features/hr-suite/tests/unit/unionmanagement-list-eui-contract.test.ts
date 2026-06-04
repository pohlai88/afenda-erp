import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrIndustryUcbReadPermission } from "../../src/industry-specific/union-management/hr.industry.ucb.contract";
import { buildHrIndustryUcbPageModel } from "../../src/industry-specific/union-management/hr.industry.ucb.page-model.server";
import {
  listHrIndustryUcbIntegrationExposureRefs,
  listHrIndustryUcbPayrollDeductionRefs,
  listHrIndustryUcbRuleReferenceExports,
  listHrIndustryUcbSeniorityDecisionRefs,
  resetHrIndustryUcbStore,
} from "../../src/industry-specific/union-management/hr.industry.ucb-store.shared";
import { buildHrIndustryUcbListSurface } from "../../src/industry-specific/union-management/hr.industry.ucb-lists.surface";
import {
  HR_INDUSTRY_UCB_LIST_SURFACE_KEYS,
  hrIndustryUcbAuditTrailSurfaceKey,
  hrIndustryUcbDuesReferencesSurfaceKey,
  hrIndustryUcbGrievancesSurfaceKey,
  hrIndustryUcbIntegrationExposuresSurfaceKey,
  hrIndustryUcbMembershipsSurfaceKey,
  hrIndustryUcbRuleConflictsSurfaceKey,
} from "../../src/industry-specific/union-management/hr.industry.ucb-surface-metadata.shared";

describe("union management EUI contract", () => {
  it("builds governed server-window list configuration", () => {
    const surface = buildHrIndustryUcbListSurface({
      surfaceKey: hrIndustryUcbGrievancesSurfaceKey,
      searchValue: "overtime",
      rows: [
        {
          id: "ucb-grv-1001",
          rowTone: "attention",
          cells: {
            case: "GRV-2026-1001",
            employee: "Jamal Reed",
            clause: "Article 7 - Overtime",
            classification: "Scheduling / High",
            process: "Step 2, escalation 1",
            deadline: "2026-06-05 / hearing 2026-06-03",
            status: "Meeting Scheduled",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    expect(surface.requiresErpPermission).toEqual(hrIndustryUcbReadPermission);
    expect(surface.presentation?.toolbar?.search?.value).toBe("overtime");
    expect(surface.surface.columnsId).toBe(hrIndustryUcbGrievancesSurfaceKey);
    expect(surface.pagination?.totalCount).toBe(1);
  });

  it("builds a page model with gated restricted, payroll, integration, and audit sections", async () => {
    resetHrIndustryUcbStore("org-ucb-eui");

    const pageModel = await buildHrIndustryUcbPageModel({
      organizationId: "org-ucb-eui",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canManageGrievances: true,
      canReadLegalReferences: true,
      canExposePayroll: true,
      canExposeIntegrations: true,
      canExportReports: true,
      reportGroupBy: "union",
      status: "all",
    });

    const surfaceKeys = pageModel.sections.map((section) => section.surfaceKey);
    expect(surfaceKeys).toContain(hrIndustryUcbMembershipsSurfaceKey);
    expect(surfaceKeys).toContain(hrIndustryUcbDuesReferencesSurfaceKey);
    expect(surfaceKeys).toContain(hrIndustryUcbIntegrationExposuresSurfaceKey);
    expect(surfaceKeys).toContain(hrIndustryUcbAuditTrailSurfaceKey);
    expect(pageModel.sections).toHaveLength(
      HR_INDUSTRY_UCB_LIST_SURFACE_KEYS.length,
    );
  });

  it("hides restricted membership and payroll sections without access", async () => {
    resetHrIndustryUcbStore("org-ucb-redaction");

    const pageModel = await buildHrIndustryUcbPageModel({
      organizationId: "org-ucb-redaction",
      visibleEmployeeIds: null,
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canManageGrievances: false,
      canReadLegalReferences: false,
      canExposePayroll: false,
      canExposeIntegrations: false,
      canExportReports: false,
      reportGroupBy: "union",
      status: "all",
    });

    const surfaceKeys = pageModel.sections.map((section) => section.surfaceKey);
    const conflictSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrIndustryUcbRuleConflictsSurfaceKey,
    );

    expect(surfaceKeys).not.toContain(hrIndustryUcbMembershipsSurfaceKey);
    expect(surfaceKeys).not.toContain(hrIndustryUcbDuesReferencesSurfaceKey);
    expect(surfaceKeys).not.toContain(hrIndustryUcbIntegrationExposuresSurfaceKey);
    expect(conflictSection?.listConfiguration.rows[0]?.cells.conflict).toBe(
      "Restricted",
    );
  });

  it("exposes downstream references from union management state", () => {
    const store = resetHrIndustryUcbStore("org-ucb-refs");

    expect(listHrIndustryUcbRuleReferenceExports(store)).not.toHaveLength(0);
    expect(listHrIndustryUcbSeniorityDecisionRefs(store)).not.toHaveLength(0);
    expect(
      listHrIndustryUcbPayrollDeductionRefs(store).some((ref) =>
        ref.deductionRef.startsWith("payroll-deduction"),
      ),
    ).toBe(true);
    expect(listHrIndustryUcbIntegrationExposureRefs(store)).not.toHaveLength(0);
  });
});
