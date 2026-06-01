import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrWorkforceEssReadPermission } from "../../src/employee-management/employee-selfservice-portal/contracts/hr.workforce.ess.contract";
import { buildHrWorkforceEssPageModel } from "../../src/employee-management/employee-selfservice-portal/data/hr.workforce.ess.page-model.server";
import { resetHrWorkforceEssStore } from "../../src/employee-management/employee-selfservice-portal/data/hr.workforce.ess-store.shared";
import { buildHrWorkforceEssListSurface } from "../../src/employee-management/employee-selfservice-portal/surface/hr.workforce.ess-lists.surface";
import {
  HR_WORKFORCE_ESS_LIST_SURFACE_KEYS,
  hrWorkforceEssAccessLogSurfaceKey,
  hrWorkforceEssApprovalInboxSurfaceKey,
  hrWorkforceEssAuditTrailSurfaceKey,
  hrWorkforceEssPayDocumentsSurfaceKey,
  hrWorkforceEssProfileSummarySurfaceKey,
} from "../../src/employee-management/employee-selfservice-portal/surface/hr.workforce.ess-surface-metadata.shared";

describe("Employee Self-Service Portal list EUI contract", () => {
  it("builds a governed Pattern C server-window list configuration", () => {
    const listSurface = buildHrWorkforceEssListSurface({
      surfaceKey: hrWorkforceEssProfileSummarySurfaceKey,
      searchValue: "Nadia",
      rows: [
        {
          id: "ess-employee-1",
          rowTone: "attention",
          cells: {
            employee: "Nadia Ismail",
            employeeNumber: "EMP-1001",
            jobTitle: "Operations Specialist",
            department: "Operations",
            manager: "Hafiz Rahman",
            location: "Kuala Lumpur",
            status: "Active",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(listSurface).success).toBe(
      true,
    );
    expect(listSurface.requiresErpPermission).toEqual(
      hrWorkforceEssReadPermission,
    );
    expect(listSurface.surface.columnsId).toBe(
      hrWorkforceEssProfileSummarySurfaceKey,
    );
    expect(listSurface.presentation?.toolbar?.search?.value).toBe("Nadia");
    expect(listSurface.pagination?.totalCount).toBe(1);
  });

  it("builds all ESS sections when approval, restricted, and audit access are granted", async () => {
    resetHrWorkforceEssStore("org-ess-full");

    const pageModel = await buildHrWorkforceEssPageModel({
      organizationId: "org-ess-full",
      actorUserId: "user_ess_manager",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "department",
      status: "all",
    });

    expect(pageModel.overview.stats).toHaveLength(4);
    expect(pageModel.sections.map((section) => section.surfaceKey)).toEqual(
      HR_WORKFORCE_ESS_LIST_SURFACE_KEYS,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrWorkforceEssApprovalInboxSurfaceKey,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrWorkforceEssAccessLogSurfaceKey,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrWorkforceEssAuditTrailSurfaceKey,
    );
  });

  it("masks payroll-sensitive cells and hides gated sections without restricted privileges", async () => {
    resetHrWorkforceEssStore("org-ess-self");

    const pageModel = await buildHrWorkforceEssPageModel({
      organizationId: "org-ess-self",
      actorUserId: "user_ess_employee",
      visibleEmployeeIds: ["ess-employee-1"],
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "status",
      status: "all",
    });
    const sectionKeys = pageModel.sections.map((section) => section.surfaceKey);

    expect(sectionKeys).not.toContain(hrWorkforceEssApprovalInboxSurfaceKey);
    expect(sectionKeys).not.toContain(hrWorkforceEssAccessLogSurfaceKey);
    expect(sectionKeys).not.toContain(hrWorkforceEssAuditTrailSurfaceKey);

    const paySection = pageModel.sections.find(
      (section) => section.surfaceKey === hrWorkforceEssPayDocumentsSurfaceKey,
    );
    expect(JSON.stringify(paySection?.listConfiguration.rows)).toContain(
      "Restricted",
    );
  });
});
