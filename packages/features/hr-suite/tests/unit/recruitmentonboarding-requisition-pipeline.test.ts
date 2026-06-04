import { describe, expect, it } from "vitest";

import {
  assertHrRonPostingAllowed,
  createHrRonCandidateProfileFromApplication,
  createHrRonJobPosting,
  createHrRonRequisition,
  evaluateHrRonScreeningAnswers,
  moveHrRonCandidateStage,
  parseHrRonResumeReference,
  submitHrRonApplication,
} from "../../src/talent-management/recruitment-onboarding/hr.talent.ron-store.shared";

const requisition = createHrRonRequisition({
  id: "req-1",
  organizationId: "org-1",
  title: "Revenue Operations Manager",
  requisitionType: "replacement",
  legalEntityCode: "US01",
  departmentId: "dept-revops",
  departmentName: "Revenue Operations",
  positionId: "pos-revops-manager",
  locationId: "loc-sfo",
  locationName: "San Francisco",
  grade: "G8",
  hiringManagerEmployeeId: "mgr-1",
  hiringManagerDisplayName: "Mina Park",
  recruiterUserId: "recruiter-1",
  budgetReference: "BUD-001",
  employmentType: "full_time",
  headcount: 1,
  approvalRequired: true,
  status: "approved",
  createdAt: "2026-05-31T00:00:00.000Z",
  approvedAt: "2026-05-31T01:00:00.000Z",
});

describe("HRM-RON requisition, posting, application, and pipeline", () => {
  it("blocks posting until required requisition approval is complete", () => {
    expect(() =>
      assertHrRonPostingAllowed({ ...requisition, status: "pending_approval" }),
    ).toThrow("must be approved");

    const posting = createHrRonJobPosting({
      requisition,
      posting: {
        id: "posting-1",
        organizationId: "org-1",
        requisitionId: requisition.id,
        channel: "external",
        title: requisition.title,
        description: "Own revenue operations systems.",
        requirements: "CRM, forecasting, stakeholder management.",
        status: "draft",
        integrationTarget: "career_site",
        publishedAt: null,
      },
    });

    expect(posting.channel).toBe("external");
  });

  it("creates profiles from online applications and parses resume references", () => {
    const parsed = parseHrRonResumeReference({
      enabled: true,
      resumeText:
        "Skill: CRM;Education: MBA;Work: RevOps lead;Certification: Salesforce;Contact: candidate@example.com",
    });
    expect(parsed.skills).toContain("Skill: CRM");

    const profile = createHrRonCandidateProfileFromApplication({
      organizationId: "org-1",
      candidateId: "candidate-1",
      displayName: "Avery Chen",
      email: "avery@example.com",
      phone: "+1-555-0101",
      source: "career_site",
      resumeDocumentId: "doc-resume",
      resumeText: "Skill: CRM;Education: MBA",
    });
    const submitted = submitHrRonApplication({
      profile,
      application: {
        id: "application-1",
        organizationId: "org-1",
        candidateId: profile.id,
        requisitionId: requisition.id,
        postingId: "posting-1",
        source: profile.source,
        stage: "applied",
        status: "applied",
        submittedAt: "2026-05-31T00:00:00.000Z",
        recruiterUserId: "recruiter-1",
        hiringManagerEmployeeId: "mgr-1",
      },
    });

    const screening = evaluateHrRonScreeningAnswers({
      applicationId: submitted.application.id,
      questions: [
        {
          id: "q-1",
          requisitionId: requisition.id,
          prompt: "Can work US hours?",
          knockout: true,
          expectedAnswer: "yes",
        },
      ],
      answers: { "q-1": "yes" },
    });
    const moved = moveHrRonCandidateStage({
      application: submitted.application,
      toStage: "shortlisted",
      toStatus: "shortlisted",
      movedByUserId: "recruiter-1",
    });

    expect(submitted.candidate.source).toBe("career_site");
    expect(screening.passed).toBe(true);
    expect(moved.application.stage).toBe("shortlisted");
    expect(moved.move.fromStage).toBe("applied");
  });
});
