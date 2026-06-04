import { describe, expect, it } from "vitest";

import {
  aggregateHrRonPanelScore,
  assertHrRonOfferSendAllowed,
  buildHrRonInterviewNotifications,
  createHrRonOffer,
  recordHrRonAssessmentResult,
  recordHrRonOfferLetterReference,
  recordHrRonPreEmploymentCheck,
  resolveHrRonOfferApprovalWorkflow,
  scheduleHrRonInterview,
  submitHrRonInterviewScorecard,
} from "../../src/talent-management/recruitment-onboarding/hr.talent.ron-store.shared";

describe("HRM-RON interviews, assessments, offers, and checks", () => {
  it("schedules interviews, sends invitations, and aggregates scorecards", () => {
    const interview = scheduleHrRonInterview({
      id: "interview-1",
      organizationId: "org-1",
      applicationId: "application-1",
      candidateId: "candidate-1",
      interviewerUserIds: ["interviewer-1", "interviewer-2"],
      hiringManagerEmployeeId: "mgr-1",
      scheduledAt: "2026-05-31T10:00:00.000Z",
      interviewType: "panel",
      confirmationSentAt: "2026-05-31T01:00:00.000Z",
    });
    const scorecards = [
      submitHrRonInterviewScorecard({
        id: "scorecard-1",
        interviewId: interview.id,
        interviewerUserId: "interviewer-1",
        rating: 4,
        comments: "Good role fit.",
        recommendation: "hire",
        submittedAt: "2026-05-31T12:00:00.000Z",
      }),
      submitHrRonInterviewScorecard({
        id: "scorecard-2",
        interviewId: interview.id,
        interviewerUserId: "interviewer-2",
        rating: 5,
        comments: "Strong evidence.",
        recommendation: "strong_hire",
        submittedAt: "2026-05-31T12:00:00.000Z",
      }),
    ];

    expect(buildHrRonInterviewNotifications(interview)).toHaveLength(2);
    expect(aggregateHrRonPanelScore(scorecards).recommendation).toBe(
      "strong_hire",
    );
  });

  it("records assessment results and gates offer sending behind approval", () => {
    const assessment = recordHrRonAssessmentResult({
      assessment: {
        id: "assessment-1",
        organizationId: "org-1",
        applicationId: "application-1",
        assessmentName: "Case study",
        assignedAt: "2026-05-31T00:00:00.000Z",
        resultRecordedAt: null,
        score: null,
        status: "assigned",
      },
      score: 91,
      status: "passed",
    });
    const offer = createHrRonOffer({
      id: "offer-1",
      organizationId: "org-1",
      applicationId: "application-1",
      candidateId: "candidate-1",
      proposedRole: "Revenue Operations Manager",
      salaryAmount: 140000,
      salaryCurrency: "USD",
      startDate: "2026-07-01",
      employmentType: "full_time",
      managerEmployeeId: "mgr-1",
      locationId: "loc-sfo",
      conditions: ["Reference check"],
      approvalRequired: true,
      status: "pending_approval",
      offerLetterDocumentId: null,
      approvedAt: null,
      sentAt: null,
      acceptedAt: null,
    });

    expect(assessment.status).toBe("passed");
    expect(resolveHrRonOfferApprovalWorkflow(offer)).toHaveLength(2);
    expect(() => assertHrRonOfferSendAllowed(offer)).toThrow("approved");
    expect(
      recordHrRonOfferLetterReference({
        offer: { ...offer, status: "approved" },
        offerLetterDocumentId: "doc-offer",
      }).offerLetterDocumentId,
    ).toBe("doc-offer");
    expect(
      recordHrRonPreEmploymentCheck({
        id: "check-1",
        organizationId: "org-1",
        candidateId: "candidate-1",
        offerId: offer.id,
        checkType: "right_to_work_check",
        status: "clear",
        reference: "rtw-clear",
        recordedAt: "2026-05-31T00:00:00.000Z",
      }).status,
    ).toBe("clear");
  });
});
