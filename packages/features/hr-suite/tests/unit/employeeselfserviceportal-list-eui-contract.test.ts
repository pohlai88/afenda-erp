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
  hrWorkforceEssExpenseClaimsSurfaceKey,
  hrWorkforceEssPayDocumentsSurfaceKey,
  hrWorkforceEssProfileSummarySurfaceKey,
  hrWorkforceEssRequestTrackerSurfaceKey,
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

    const profileSection = pageModel.sections.find(
      (section) =>
        section.surfaceKey === hrWorkforceEssProfileSummarySurfaceKey,
    );
    expect(JSON.stringify(profileSection?.listConfiguration.rows)).toContain(
      "Nadia Ismail",
    );
    expect(JSON.stringify(profileSection?.listConfiguration.rows)).not.toContain(
      "Victor Tan",
    );

    const paySection = pageModel.sections.find(
      (section) => section.surfaceKey === hrWorkforceEssPayDocumentsSurfaceKey,
    );
    expect(JSON.stringify(paySection?.listConfiguration.rows)).toContain(
      "Restricted",
    );
  });

  it("keeps rejection reason and correction guidance visible in ESS tracking surfaces", async () => {
    resetHrWorkforceEssStore("org-ess-guidance");

    const pageModel = await buildHrWorkforceEssPageModel({
      organizationId: "org-ess-guidance",
      actorUserId: "user_ess_peer",
      visibleEmployeeIds: ["ess-employee-2"],
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "status",
      status: "rejected",
    });

    const requestTrackerSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrWorkforceEssRequestTrackerSurfaceKey,
    );
    const claimsSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrWorkforceEssExpenseClaimsSurfaceKey,
    );
    const trackingRows = JSON.stringify(
      requestTrackerSection?.listConfiguration.rows,
    );
    const claimRows = JSON.stringify(claimsSection?.listConfiguration.rows);

    expect(trackingRows).toContain(
      "Attach manager exception approval before resubmitting.",
    );
    expect(claimRows).toContain(
      "Attach manager exception approval before resubmitting.",
    );
  });

  it("does not expand write-only employee scope to other employees or approval inbox", async () => {
    resetHrWorkforceEssStore("org-ess-write-self");

    const pageModel = await buildHrWorkforceEssPageModel({
      organizationId: "org-ess-write-self",
      actorUserId: "user_ess_employee",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "employee",
      status: "all",
    });
    const sectionKeys = pageModel.sections.map((section) => section.surfaceKey);
    const profileSection = pageModel.sections.find(
      (section) =>
        section.surfaceKey === hrWorkforceEssProfileSummarySurfaceKey,
    );
    const serializedRows = JSON.stringify(
      pageModel.sections.flatMap((section) => section.listConfiguration.rows),
    );

    expect(sectionKeys).not.toContain(hrWorkforceEssApprovalInboxSurfaceKey);
    expect(profileSection?.listConfiguration.rows).toHaveLength(1);
    expect(serializedRows).toContain("Nadia Ismail");
    expect(serializedRows).not.toContain("Victor Tan");
    expect(serializedRows).not.toContain("EMP-1002");
  });
});
