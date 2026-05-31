import { describe, expect, it } from "vitest";

import {
  buildHrRonReportRows,
  emitHrRonAuditEvent,
  filterHrRonRecordsForAccess,
  listHrRonHistoryByCandidateOrEmployee,
  resetHrRonStoreForTests,
} from "../../src/talent-management/recruitment-onboarding/data/hr.talent.ron-store.shared";
import { hrTalentRonAuditActions } from "../../src/talent-management/recruitment-onboarding/events/hr.talent.ron.event";

describe("HRM-RON access, reporting, and audit", () => {
  it("builds reports by configured grouping", () => {
    const store = resetHrRonStoreForTests("org-ron-test");
    const rows = buildHrRonReportRows({ store, groupBy: "source" });

    expect(rows[0]?.groupKey).toBe("career_site");
    expect(rows[0]?.applicationCount).toBe(1);
    expect(rows[0]?.offerAcceptedCount).toBe(1);
  });

  it("restricts candidate data by recruiter and interviewer scope", () => {
    const store = resetHrRonStoreForTests("org-ron-test-access");
    const recruiterView = filterHrRonRecordsForAccess({
      store,
      access: { role: "recruiter", actorUserId: "user-recruiter-001" },
    });
    const interviewerView = filterHrRonRecordsForAccess({
      store,
      access: { role: "interviewer", interviewerUserId: "user-interviewer-001" },
    });
    const blockedRecruiterView = filterHrRonRecordsForAccess({
      store,
      access: { role: "recruiter", actorUserId: "other-user" },
    });

    expect(recruiterView.applications).toHaveLength(1);
    expect(interviewerView.interviews).toHaveLength(1);
    expect(blockedRecruiterView.applications).toHaveLength(0);
  });

  it("preserves history and appends audit events", () => {
    const store = resetHrRonStoreForTests("org-ron-test-audit");
    const event = emitHrRonAuditEvent({
      store,
      organizationId: "org-ron-test-audit",
      action: hrTalentRonAuditActions.onboarding.completed,
      actorId: "user-hr",
      targetId: "employee-from-ron-candidate-001",
      targetType: "onboarding",
      summary: "Onboarding completion recorded",
      metadata: {
        candidateId: "ron-candidate-001",
        applicationId: "ron-app-001",
        employeeReferenceId: "employee-from-ron-candidate-001",
      },
    });

    expect(event.action).toBe("hr.ron.onboarding.completed");
    expect(
      listHrRonHistoryByCandidateOrEmployee({
        store,
        candidateId: "ron-candidate-001",
      }).length,
    ).toBeGreaterThan(0);
  });
});
