import { describe, expect, it } from "vitest";

import {
  HR_TALENT_RSS_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_TALENT_RSS_REQUIREMENT_COVERAGE,
  assertHrTalentRssEnterpriseCoverage,
} from "../../src/talent-management/candidate-selfservice-portal/hr.talent.rss-coverage.shared";
import { hrTalentRssAuditActions } from "../../src/talent-management/candidate-selfservice-portal/events";

describe("Candidate Self-Service Portal enterprise coverage", () => {
  it("ships all RSS requirements and enterprise acceptance criteria", () => {
    expect(() => assertHrTalentRssEnterpriseCoverage()).not.toThrow();
    expect(HR_TALENT_RSS_REQUIREMENT_COVERAGE).toHaveLength(28);
    expect(HR_TALENT_RSS_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(26);
    expect(
      HR_TALENT_RSS_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped",
      ),
    ).toBe(true);
    expect(
      HR_TALENT_RSS_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped",
      ),
    ).toBe(true);
  });

  it("declares audit events for every controlled portal workflow class", () => {
    expect(Object.values(hrTalentRssAuditActions)).toEqual(
      expect.arrayContaining([
        "hr.talent.rss.candidate_profile.created",
        "hr.talent.rss.application.submitted",
        "hr.talent.rss.application.withdrawn",
        "hr.talent.rss.document.uploaded",
        "hr.talent.rss.interview.responded",
        "hr.talent.rss.assessment.accessed",
        "hr.talent.rss.form.submitted",
        "hr.talent.rss.offer.responded",
        "hr.talent.rss.scorecard.submitted",
        "hr.talent.rss.approval.decided",
        "hr.talent.rss.privacy.access_logged",
        "hr.talent.rss.retention.action_recorded",
      ]),
    );
  });
});
