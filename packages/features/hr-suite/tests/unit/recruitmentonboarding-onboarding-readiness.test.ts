import { describe, expect, it } from "vitest";

import {
  buildHrRonCandidateConversionReference,
  buildHrRonReadinessSnapshot,
  completeHrRonOnboardingTask,
  generateHrRonOnboardingTasks,
  getHrRonOnboardingCompletionBlockers,
  recordHrRonOnboardingDocument,
  recordHrRonPolicyAcknowledgment,
} from "../../src/talent-management/recruitment-onboarding/hr.talent.ron-store.shared";

describe("HRM-RON conversion, onboarding tasks, and readiness", () => {
  const candidate = {
    id: "candidate-1",
    organizationId: "org-1",
    displayName: "Avery Chen",
    email: "avery@example.com",
    phone: "+1-555-0101",
    source: "career_site" as const,
    skills: [],
    education: [],
    workHistory: [],
    certifications: [],
    resumeDocumentId: "doc-resume",
  };
  const application = {
    id: "application-1",
    organizationId: "org-1",
    candidateId: candidate.id,
    requisitionId: "req-1",
    postingId: "posting-1",
    source: candidate.source,
    stage: "hired" as const,
    status: "hired" as const,
    submittedAt: "2026-05-31T00:00:00.000Z",
    recruiterUserId: "recruiter-1",
    hiringManagerEmployeeId: "mgr-1",
  };
  const requisition = {
    id: "req-1",
    organizationId: "org-1",
    title: "Revenue Operations Manager",
    requisitionType: "replacement" as const,
    legalEntityCode: "US01",
    departmentId: "dept-revops",
    departmentName: "Revenue Operations",
    positionId: "pos-1",
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
    status: "approved" as const,
    createdAt: "2026-05-31T00:00:00.000Z",
    approvedAt: "2026-05-31T01:00:00.000Z",
  };
  const offer = {
    id: "offer-1",
    organizationId: "org-1",
    applicationId: application.id,
    candidateId: candidate.id,
    proposedRole: requisition.title,
    salaryAmount: 140000,
    salaryCurrency: "USD",
    startDate: "2026-07-01",
    employmentType: "full_time",
    managerEmployeeId: "mgr-1",
    locationId: "loc-sfo",
    conditions: [],
    approvalRequired: true,
    status: "accepted" as const,
    offerLetterDocumentId: "doc-offer",
    approvedAt: "2026-05-31T01:00:00.000Z",
    sentAt: "2026-05-31T02:00:00.000Z",
    acceptedAt: "2026-05-31T03:00:00.000Z",
  };

  it("builds conversion references without directly writing employee records", () => {
    const conversion = buildHrRonCandidateConversionReference({
      organizationId: "org-1",
      candidate,
      application,
      requisition,
      offer,
    });

    expect(conversion.employeeReferenceId).toBe("employee-from-candidate-1");
    expect(conversion.salaryAmount).toBe(140000);
  });

  it("generates owner-specific onboarding tasks and blocks incomplete mandatory items", () => {
    const tasks = generateHrRonOnboardingTasks({
      organizationId: "org-1",
      onboardingCaseId: "case-1",
      employeeReferenceId: "employee-from-candidate-1",
      legalEntityCode: "US01",
      departmentId: "dept-revops",
      role: "Revenue Operations Manager",
      employmentType: "full_time",
      locationId: "loc-sfo",
      employeeCategory: "regular",
      dueDate: "2026-07-01",
    });
    const taskWithDocument = recordHrRonOnboardingDocument({
      task: tasks.find((task) => task.ownerRole === "document_owner")!,
      documentReference: "doc-identity",
    });
    const acknowledged = recordHrRonPolicyAcknowledgment({
      task: tasks.find((task) => task.ownerRole === "new_hire")!,
      policyAcknowledgmentCode: "policy.handbook",
    });
    const completed = completeHrRonOnboardingTask({ task: acknowledged });
    const readiness = buildHrRonReadinessSnapshot({
      organizationId: "org-1",
      employeeReferenceId: "employee-from-candidate-1",
      tasks: [completed, taskWithDocument, ...tasks.slice(2)],
    });

    expect(new Set(tasks.map((task) => task.ownerRole))).toEqual(
      new Set(["new_hire", "hr", "manager", "it", "payroll", "admin", "document_owner"]),
    );
    expect(getHrRonOnboardingCompletionBlockers(tasks).length).toBeGreaterThan(0);
    expect(readiness.map((snapshot) => snapshot.domain)).toContain("payroll");
  });
});
