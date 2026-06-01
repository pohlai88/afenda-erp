import { describe, expect, it } from "vitest";

import {
  parseHrTalentRssSearchParams,
  toHrTalentRssPageModelInput,
} from "../../src/talent-management/candidate-selfservice-portal/data/hr.talent.rss-search-params.parse.shared";

describe("Candidate Self-Service Portal search params", () => {
  it("parses and trims RSS list, grouping, and status params", () => {
    expect(
      parseHrTalentRssSearchParams({
        hrTalentRssCandidateProfilesSearch: [" amina ", "ignored"],
        hrTalentRssApplicationsSearch: " interview ",
        hrTalentRssPrivacyRecordsSearch: " restricted ",
        hrTalentRssAuditTrailSearch: " consent ",
        hrTalentRssReportGroupBy: "privacy",
        hrTalentRssStatus: "interview",
      }),
    ).toMatchObject({
      candidateProfilesSearch: "amina",
      applicationsSearch: "interview",
      privacyRecordsSearch: "restricted",
      auditTrailSearch: "consent",
      reportGroupBy: "privacy",
      status: "interview",
    });
  });

  it("normalizes page model input with capability defaults", () => {
    expect(
      toHrTalentRssPageModelInput({
        organizationId: "org_123",
        canReadAudit: true,
        searchParams: new URLSearchParams(
          "hrTalentRssReportGroupBy=not-real&hrTalentRssStatus=not-real",
        ),
      }),
    ).toMatchObject({
      organizationId: "org_123",
      visibleCandidateIds: null,
      canWrite: false,
      canApprove: false,
      canReadAudit: true,
      canReadRestricted: false,
      canExposeIntegrations: false,
      reportGroupBy: "status",
      status: "all",
    });
  });
});
