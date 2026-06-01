import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrTalentRssReadPermission } from "../../src/talent-management/candidate-selfservice-portal/contracts/hr.talent.rss.contract";
import { buildHrTalentRssPageModel } from "../../src/talent-management/candidate-selfservice-portal/data/hr.talent.rss.page-model.server";
import { resetHrTalentRssStore } from "../../src/talent-management/candidate-selfservice-portal/data/hr.talent.rss-store.shared";
import { buildHrTalentRssListSurface } from "../../src/talent-management/candidate-selfservice-portal/surface/hr.talent.rss-lists.surface";
import {
  HR_TALENT_RSS_LIST_SURFACE_KEYS,
  hrTalentRssApplicationsSurfaceKey,
  hrTalentRssAuditTrailSurfaceKey,
  hrTalentRssCandidateProfilesSurfaceKey,
  hrTalentRssPrivacyRecordsSurfaceKey,
} from "../../src/talent-management/candidate-selfservice-portal/surface/hr.talent.rss-surface-metadata.shared";

describe("Candidate Self-Service Portal list EUI contract", () => {
  it("builds governed Pattern C server-window list configuration", () => {
    const listSurface = buildHrTalentRssListSurface({
      surfaceKey: hrTalentRssApplicationsSurfaceKey,
      searchValue: "amina",
      rows: [
        {
          id: "rss-application-1",
          rowTone: "attention",
          cells: {
            application: "APP-001",
            candidate: "Amina Rahman",
            posting: "Operations Coordinator",
            internal: "No",
            status: "Interview",
            stage: "Hiring manager interview",
            submittedAt: "2026-05-26",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(listSurface).success).toBe(
      true,
    );
    expect(listSurface.requiresErpPermission).toEqual(
      hrTalentRssReadPermission,
    );
    expect(listSurface.surface.columnsId).toBe(
      hrTalentRssApplicationsSurfaceKey,
    );
    expect(listSurface.presentation?.toolbar?.search?.value).toBe("amina");
    expect(listSurface.pagination?.totalCount).toBe(1);
  });

  it("builds a page model with candidate, workflow, restricted, and audit sections", async () => {
    resetHrTalentRssStore("org-rss-enterprise");

    const pageModel = await buildHrTalentRssPageModel({
      organizationId: "org-rss-enterprise",
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "status",
      status: "all",
    });

    expect(pageModel.overview.stats).toHaveLength(4);
    expect(pageModel.sections.map((section) => section.surfaceKey)).toEqual(
      HR_TALENT_RSS_LIST_SURFACE_KEYS,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrTalentRssPrivacyRecordsSurfaceKey,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrTalentRssAuditTrailSurfaceKey,
    );
  });

  it("masks restricted candidate data and hides gated sections without restricted or audit access", async () => {
    resetHrTalentRssStore("org-rss-masked");

    const pageModel = await buildHrTalentRssPageModel({
      organizationId: "org-rss-masked",
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "status",
      status: "all",
    });

    const sectionKeys = pageModel.sections.map((section) => section.surfaceKey);
    expect(sectionKeys).toContain(hrTalentRssCandidateProfilesSurfaceKey);
    expect(sectionKeys).not.toContain(hrTalentRssPrivacyRecordsSurfaceKey);
    expect(sectionKeys).not.toContain(hrTalentRssAuditTrailSurfaceKey);
    expect(JSON.stringify(pageModel.sections)).toContain("Restricted candidate");
  });
});
