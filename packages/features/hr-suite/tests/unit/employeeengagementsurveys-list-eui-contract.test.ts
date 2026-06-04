import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { describe, expect, it } from "vitest";

import { hrTalentEngReadPermission } from "../../src/talent-management/employee-engagement-surveys/hr.talent.eng.contract";
import { buildHrTalentEngPageModel } from "../../src/talent-management/employee-engagement-surveys/hr.talent.eng.page-model.server";
import { resetHrTalentEngStore } from "../../src/talent-management/employee-engagement-surveys/hr.talent.eng-store.shared";
import { buildHrTalentEngListSurface } from "../../src/talent-management/employee-engagement-surveys/hr.talent.eng-lists.surface";
import {
  HR_TALENT_ENG_LIST_SURFACE_KEYS,
  hrTalentEngAuditTrailSurfaceKey,
  hrTalentEngOpenTextCommentsSurfaceKey,
  hrTalentEngSegmentScoresSurfaceKey,
  hrTalentEngSurveysSurfaceKey,
} from "../../src/talent-management/employee-engagement-surveys/hr.talent.eng-surface-metadata.shared";

describe("Employee Engagement Surveys list EUI contract", () => {
  it("builds a governed Pattern C server-window list configuration", () => {
    const listSurface = buildHrTalentEngListSurface({
      surfaceKey: hrTalentEngSurveysSurfaceKey,
      searchValue: "Q2",
      rows: [
        {
          id: "eng-survey-1",
          rowTone: "attention",
          cells: {
            survey: "ENG-2026-Q2 - Q2 engagement and wellbeing survey",
            type: "Engagement",
            status: "Published",
            anonymity: "Anonymous",
            openAt: "2026-05-25",
            closeAt: "2026-06-15",
            responseRate: "65%",
          },
        },
      ],
    });

    expect(parseListSurfaceRendererConfiguration(listSurface).success).toBe(
      true,
    );
    expect(listSurface.requiresErpPermission).toEqual(
      hrTalentEngReadPermission,
    );
    expect(listSurface.surface.columnsId).toBe(hrTalentEngSurveysSurfaceKey);
    expect(listSurface.presentation?.toolbar?.search?.value).toBe("Q2");
    expect(listSurface.pagination?.totalCount).toBe(1);
  });

  it("builds all engagement sections when restricted and audit access are granted", async () => {
    resetHrTalentEngStore("org-eng-full");

    const pageModel = await buildHrTalentEngPageModel({
      organizationId: "org-eng-full",
      actorUserId: "user_hr_partner",
      visibleEmployeeIds: null,
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "department",
      status: "all",
      segmentDimension: "all",
    });

    expect(pageModel.overview.stats).toHaveLength(4);
    expect(pageModel.sections.map((section) => section.surfaceKey)).toEqual(
      HR_TALENT_ENG_LIST_SURFACE_KEYS,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrTalentEngOpenTextCommentsSurfaceKey,
    );
    expect(pageModel.sections.map((section) => section.surfaceKey)).toContain(
      hrTalentEngAuditTrailSurfaceKey,
    );
  });

  it("hides restricted comments and audit while suppressing small anonymous segments", async () => {
    resetHrTalentEngStore("org-eng-limited");

    const pageModel = await buildHrTalentEngPageModel({
      organizationId: "org-eng-limited",
      actorUserId: "eng-employee-1",
      visibleEmployeeIds: ["eng-employee-1"],
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "manager",
      status: "all",
      segmentDimension: "all",
    });
    const sectionKeys = pageModel.sections.map((section) => section.surfaceKey);

    expect(sectionKeys).not.toContain(hrTalentEngOpenTextCommentsSurfaceKey);
    expect(sectionKeys).not.toContain(hrTalentEngAuditTrailSurfaceKey);

    const segmentSection = pageModel.sections.find(
      (section) => section.surfaceKey === hrTalentEngSegmentScoresSurfaceKey,
    );
    expect(JSON.stringify(segmentSection?.listConfiguration.rows)).toContain(
      "Suppressed anonymous segment",
    );
    expect(JSON.stringify(segmentSection?.listConfiguration.rows)).not.toContain(
      "Sarah Lee",
    );
  });
});
