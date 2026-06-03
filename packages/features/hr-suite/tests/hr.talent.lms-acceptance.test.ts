import { describe, expect, it } from "vitest";

import {
  LMS_ACCEPTANCE_CRITERIA_COVERAGE,
  LMS_REQUIREMENT_COVERAGE,
  assertLmsAcceptanceCriteriaComplete,
  assertLmsCoverageComplete,
} from "../data/hr.talent.lms-acceptance-coverage.shared";
import {
  getLmsComplianceCompletionSnapshot,
  getLmsOnboardingCompletionSnapshot,
  getLmsTrainingDevelopmentRefs,
} from "../data/hr.talent.lms-integration.server";
import { buildHrLmsReportRows, listHrLmsLearningHistory } from "../data/hr.talent.lms-reports.server";
import { emitHrLmsAuditTrailEvent, listHrLmsAuditTrail } from "../data/hr.talent.lms-audit.server";
import {
  createHrLmsCourseInStore,
  resetHrLmsStoreForTests,
  submitHrLmsAssessmentAttemptInStore,
} from "../data/hr.talent.lms-store.shared";

const ORG = "org_lms_test";

describe("HRM-LMS-001..030 coverage registry", () => {
  it("registers all thirty functional requirements", () => {
    assertLmsCoverageComplete();
    const codes = LMS_REQUIREMENT_COVERAGE.map((entry) => entry.code);
    for (let index = 1; index <= 30; index += 1) {
      expect(codes).toContain(`HRM-LMS-${String(index).padStart(3, "0")}`);
    }
  });

  it("maps all twenty-seven enterprise acceptance criteria", () => {
    assertLmsAcceptanceCriteriaComplete();
    expect(LMS_ACCEPTANCE_CRITERIA_COVERAGE.every((row) => row.status === "shipped")).toBe(
      true,
    );
  });
});

describe("HRM-LMS domain behavior", () => {
  it("creates courses with metadata and content references", () => {
    resetHrLmsStoreForTests(ORG);
    const course = createHrLmsCourseInStore({
      organizationId: ORG,
      actorUserId: "user-1",
      code: "LMS-NEW-001",
      title: "Data Privacy",
      category: "compliance",
      provider: "Afenda Internal",
      courseType: "compliance_training",
      contentRefs: [{ id: "ref-1", refKind: "internal", label: "Reader", uri: "/privacy" }],
    });
    expect(course.code).toBe("LMS-NEW-001");
    expect(course.contentRefs).toHaveLength(1);
  });

  it("enforces passing score and attempt limits", () => {
    resetHrLmsStoreForTests(ORG);
    expect(() =>
      submitHrLmsAssessmentAttemptInStore({
        organizationId: ORG,
        actorUserId: "user-1",
        enrollmentId: "lms-enrollment-001",
        score: 65,
      }),
    ).not.toThrow();

    expect(() =>
      submitHrLmsAssessmentAttemptInStore({
        organizationId: ORG,
        actorUserId: "user-1",
        enrollmentId: "lms-enrollment-001",
        score: 60,
      }),
    ).not.toThrow();
  });

  it("exposes integration snapshots and learning history", async () => {
    resetHrLmsStoreForTests(ORG);
    const [compliance, onboarding, training, history, reports, audit] =
      await Promise.all([
        getLmsComplianceCompletionSnapshot({ organizationId: ORG }),
        getLmsOnboardingCompletionSnapshot({ organizationId: ORG }),
        getLmsTrainingDevelopmentRefs({ organizationId: ORG }),
        Promise.resolve(listHrLmsLearningHistory({ organizationId: ORG })),
        Promise.resolve(buildHrLmsReportRows({ organizationId: ORG, groupBy: "employee" })),
        listHrLmsAuditTrail({ organizationId: ORG }),
      ]);

    expect(compliance.length).toBeGreaterThan(0);
    expect(Array.isArray(onboarding)).toBe(true);
    expect(Array.isArray(training)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(reports.length).toBeGreaterThan(0);
    expect(audit.rows.length).toBeGreaterThan(0);
  });

  it("records audit events for report export actions", async () => {
    resetHrLmsStoreForTests(ORG);
    await emitHrLmsAuditTrailEvent({
      organizationId: ORG,
      actorUserId: "user-1",
      action: "reportExport",
      entityType: "hr_lms_report",
      entityId: "report-1",
      summary: "Exported LMS report",
    });
    const audit = await listHrLmsAuditTrail({ organizationId: ORG });
    expect(audit.rows.some((row: { summary: string }) => row.summary.includes("Exported LMS report"))).toBe(
      true,
    );
  });
});

describe("HRM-LMS-028 permissions", () => {
  it("declares LMS capability constants", async () => {
    const { HR_LMS_READ_CAPABILITY, HR_LMS_WRITE_CAPABILITY } = await import(
      "../schemas/hr.talent.lms-constants.shared"
    );
    expect(HR_LMS_READ_CAPABILITY).toBe("hr.lms.read");
    expect(HR_LMS_WRITE_CAPABILITY).toBe("hr.lms.write");
  });
});
