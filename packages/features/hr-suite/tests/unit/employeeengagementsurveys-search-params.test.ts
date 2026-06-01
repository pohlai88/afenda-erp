import { describe, expect, it } from "vitest";

import {
  parseHrTalentEngSearchParams,
  toHrTalentEngPageModelInput,
} from "../../src/talent-management/employee-engagement-surveys/data/hr.talent.eng-search-params.parse.shared";

describe("Employee Engagement Surveys search params", () => {
  it("parses and trims survey, restricted, audit, grouping, status, and segment params", () => {
    expect(
      parseHrTalentEngSearchParams({
        hrTalentEngSurveysSearch: [" Q2 ", "ignored"],
        hrTalentEngCommentsSearch: " workload ",
        hrTalentEngAuditTrailSearch: " analytics ",
        hrTalentEngReportGroupBy: "department",
        hrTalentEngStatus: "published",
        hrTalentEngSurveyId: " eng-survey-1 ",
        hrTalentEngSegmentDimension: "manager",
      }),
    ).toMatchObject({
      surveysSearch: "Q2",
      commentsSearch: "workload",
      auditTrailSearch: "analytics",
      reportGroupBy: "department",
      status: "published",
      surveyId: "eng-survey-1",
      segmentDimension: "manager",
    });
  });

  it("normalizes page model input with safe defaults", () => {
    expect(
      toHrTalentEngPageModelInput({
        organizationId: "org_123",
        actorUserId: "user_hr",
        canWrite: true,
        canApprove: true,
        canReadAudit: true,
        canReadRestricted: true,
        canExposeIntegrations: true,
        searchParams: new URLSearchParams(
          "hrTalentEngReportGroupBy=not-real&hrTalentEngStatus=not-real&hrTalentEngSegmentDimension=not-real",
        ),
      }),
    ).toMatchObject({
      organizationId: "org_123",
      actorUserId: "user_hr",
      canWrite: true,
      canApprove: true,
      canReadAudit: true,
      canReadRestricted: true,
      canExposeIntegrations: true,
      reportGroupBy: "survey",
      status: "all",
      segmentDimension: "all",
    });
  });
});
