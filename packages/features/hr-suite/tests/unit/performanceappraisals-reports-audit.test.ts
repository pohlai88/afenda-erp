import { describe, expect, it } from "vitest";

import {
  buildPerformanceNotifications,
  buildPerformanceOutcomeReference,
  buildPerformanceReportCsv,
  buildPerformanceReportRows,
  createSeedHrPerformanceStore,
  emitPerformanceAuditEvent,
  filterPerformanceReviewsForAccess,
  listPerformanceHistoryByEmployee,
} from "../../src/talent-management/performance-appraisals/data/hr.talent.performance-store.shared";
import { hrTalentPerformanceAuditActions } from "../../src/talent-management/performance-appraisals/events/hr.talent.performance.event";

describe("HRM-PER reports, notifications, integration refs, and audit", () => {
  const store = createSeedHrPerformanceStore("org-1");
  const cycle = store.cycles[0]!;
  const review = store.reviews[0]!;

  it("filters reports and exports CSV by configured grouping", () => {
    const rows = buildPerformanceReportRows({
      cycles: store.cycles,
      reviews: store.reviews,
      filter: { groupBy: "department", departmentId: review.departmentId },
      now: "2026-12-31",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.finalizedCount).toBe(1);

    const csv = buildPerformanceReportCsv(rows);
    expect(csv).toContain("average_final_rating");
    expect(csv).toContain(review.departmentName);
  });

  it("exposes outcome references only when authorized", () => {
    expect(
      buildPerformanceOutcomeReference({
        cycle,
        review,
        authorized: false,
      }),
    ).toBeNull();

    const ref = buildPerformanceOutcomeReference({
      cycle,
      review,
      authorized: true,
    });
    expect(ref?.finalRatingNumeric).toBe(4);
    expect(ref?.managerRecommendationKinds).toContain("compensation_review");
  });

  it("preserves employee history and restricts rows by access role", () => {
    expect(
      listPerformanceHistoryByEmployee({
        reviews: store.reviews,
        employeeId: review.employeeId,
      }),
    ).toHaveLength(1);

    expect(
      filterPerformanceReviewsForAccess({
        reviews: store.reviews,
        access: { role: "employee", actorEmployeeId: "other" },
      }),
    ).toHaveLength(0);
    expect(
      filterPerformanceReviewsForAccess({
        reviews: store.reviews,
        access: {
          role: "compensation",
          canReadCompensationOutcome: true,
        },
      }),
    ).toHaveLength(1);
  });

  it("builds notifications and audit events for governed appraisal actions", () => {
    const notifications = buildPerformanceNotifications({
      review,
      event: "submitted",
      hrRecipientIds: ["hr-1"],
      approverIds: ["approver-1"],
      sentAt: "2026-12-01T00:00:00.000Z",
    });
    expect(notifications.map((item) => item.recipientRole)).toEqual([
      "manager",
      "hr",
      "approver",
    ]);

    const audit = emitPerformanceAuditEvent({
      organizationId: "org-1",
      reviewId: review.id,
      action: hrTalentPerformanceAuditActions.managerEvaluation.ratingChange,
      actorId: "mgr-1",
      occurredAt: "2026-12-01T00:00:00.000Z",
      summary: "Changed manager rating after calibration.",
      metadata: { previousRating: 3, newRating: 4 },
    });
    expect(audit.action).toBe("hr.performance.manager_evaluation.rating_change");
    expect(audit.metadata.newRating).toBe(4);
  });
});
