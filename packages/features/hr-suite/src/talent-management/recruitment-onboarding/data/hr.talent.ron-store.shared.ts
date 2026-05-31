import {
  HR_RON_CHECK_TYPES,
  HR_RON_ONBOARDING_OWNER_ROLES,
  type HrRonAccessRole,
  type HrRonCandidateStatus,
  type HrRonCommunicationEvent,
  type HrRonHiringRecommendation,
  type HrRonPipelineStage,
  type HrRonReadinessDomain,
  type HrRonReportGroupBy,
} from "../schemas/hr.talent.ron-constants.shared";
import {
  hrRonApplicationSchema,
  hrRonAssessmentSchema,
  hrRonCandidateProfileSchema,
  hrRonCommunicationSchema,
  hrRonInterviewScheduleSchema,
  hrRonInterviewScorecardSchema,
  hrRonJobPostingSchema,
  hrRonOfferSchema,
  hrRonOnboardingTaskSchema,
  hrRonPreEmploymentCheckSchema,
  hrRonReadinessSnapshotSchema,
  hrRonRequisitionSchema,
  hrRonScreeningQuestionSchema,
  type HrRonApplicationInput,
  type HrRonAssessmentInput,
  type HrRonCandidateProfileInput,
  type HrRonCommunicationInput,
  type HrRonInterviewScheduleInput,
  type HrRonInterviewScorecardInput,
  type HrRonJobPostingInput,
  type HrRonOfferInput,
  type HrRonOnboardingTaskInput,
  type HrRonPreEmploymentCheckInput,
  type HrRonReadinessSnapshotInput,
  type HrRonRequisitionInput,
  type HrRonScreeningQuestionInput,
} from "../schemas/hr.talent.ron.schema";
import {
  hrTalentRonAuditActions,
  type HrTalentRonAuditAction,
} from "../events/hr.talent.ron.event";

export type HrRonApprovalStep = {
  id: string;
  targetId: string;
  targetType: "requisition" | "offer";
  role: "manager" | "hr" | "finance" | "executive";
  sequence: number;
  status: "pending" | "approved" | "returned";
  required: boolean;
  decidedAt: string | null;
};

export type HrRonScreeningResult = {
  applicationId: string;
  passed: boolean;
  knockoutQuestionIds: readonly string[];
  evaluatedAt: string;
};

export type HrRonPipelineMove = {
  applicationId: string;
  fromStage: HrRonPipelineStage;
  toStage: HrRonPipelineStage;
  fromStatus: HrRonCandidateStatus;
  toStatus: HrRonCandidateStatus;
  movedAt: string;
  movedByUserId: string;
};

export type HrRonCandidateConversionReference = {
  organizationId: string;
  candidateId: string;
  applicationId: string;
  offerId: string;
  employeeReferenceId: string;
  displayName: string;
  legalEntityCode: string;
  departmentId: string;
  proposedRole: string;
  managerEmployeeId: string;
  startDate: string;
  employmentType: string;
  salaryAmount: number;
  salaryCurrency: string;
};

export type HrRonAuditEvent = {
  id: string;
  organizationId: string;
  action: HrTalentRonAuditAction;
  actorId: string;
  targetId: string;
  targetType: string;
  occurredAt: string;
  summary: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type HrRonReportRow = {
  id: string;
  groupBy: HrRonReportGroupBy;
  groupKey: string;
  groupLabel: string;
  applicationCount: number;
  hiredCount: number;
  offerAcceptedCount: number;
  onboardingBlockedCount: number;
};

export type HrRonAccessContext = {
  role: HrRonAccessRole;
  actorUserId?: string | null;
  actorEmployeeId?: string | null;
  managedEmployeeIds?: readonly string[];
  interviewerUserId?: string | null;
  canReadSensitiveCandidateData?: boolean;
  canReadFinance?: boolean;
  canReadIt?: boolean;
};

export type HrRonStore = {
  requisitions: HrRonRequisitionInput[];
  postings: HrRonJobPostingInput[];
  candidates: HrRonCandidateProfileInput[];
  applications: HrRonApplicationInput[];
  screeningQuestions: HrRonScreeningQuestionInput[];
  screeningResults: HrRonScreeningResult[];
  pipelineMoves: HrRonPipelineMove[];
  interviews: HrRonInterviewScheduleInput[];
  scorecards: HrRonInterviewScorecardInput[];
  assessments: HrRonAssessmentInput[];
  communications: HrRonCommunicationInput[];
  offers: HrRonOfferInput[];
  checks: HrRonPreEmploymentCheckInput[];
  conversions: HrRonCandidateConversionReference[];
  onboardingTasks: HrRonOnboardingTaskInput[];
  readiness: HrRonReadinessSnapshotInput[];
  approvals: HrRonApprovalStep[];
  auditEvents: HrRonAuditEvent[];
};

const stores = new Map<string, HrRonStore>();

function cloneStore(store: HrRonStore): HrRonStore {
  return {
    requisitions: [...store.requisitions],
    postings: [...store.postings],
    candidates: [...store.candidates],
    applications: [...store.applications],
    screeningQuestions: [...store.screeningQuestions],
    screeningResults: [...store.screeningResults],
    pipelineMoves: [...store.pipelineMoves],
    interviews: [...store.interviews],
    scorecards: [...store.scorecards],
    assessments: [...store.assessments],
    communications: [...store.communications],
    offers: [...store.offers],
    checks: [...store.checks],
    conversions: [...store.conversions],
    onboardingTasks: [...store.onboardingTasks],
    readiness: [...store.readiness],
    approvals: [...store.approvals],
    auditEvents: [...store.auditEvents],
  };
}

function nowIso() {
  return "2026-05-31T08:00:00.000Z";
}

function todayDate() {
  return nowIso().slice(0, 10);
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function assertFound<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

export function createHrRonRequisition(
  input: HrRonRequisitionInput,
): HrRonRequisitionInput {
  return hrRonRequisitionSchema.parse(input);
}

export function resolveHrRonRequisitionApprovalWorkflow(
  requisition: Pick<HrRonRequisitionInput, "id" | "approvalRequired" | "status">,
): HrRonApprovalStep[] {
  if (!requisition.approvalRequired) {
    return [];
  }
  return [
    "manager",
    "hr",
    "finance",
  ].map((role, index) => ({
    id: `${requisition.id}:approval:${role}`,
    targetId: requisition.id,
    targetType: "requisition" as const,
    role: role as HrRonApprovalStep["role"],
    sequence: index + 1,
    status: requisition.status === "approved" ? "approved" : "pending",
    required: true,
    decidedAt: requisition.status === "approved" ? nowIso() : null,
  }));
}

export function assertHrRonPostingAllowed(
  requisition: Pick<
    HrRonRequisitionInput,
    "approvalRequired" | "status" | "id"
  >,
) {
  if (requisition.approvalRequired && requisition.status !== "approved") {
    throw new Error(
      `Requisition ${requisition.id} must be approved before posting.`,
    );
  }
}

export function createHrRonJobPosting(input: {
  requisition: HrRonRequisitionInput;
  posting: HrRonJobPostingInput;
}): HrRonJobPostingInput {
  assertHrRonPostingAllowed(input.requisition);
  return hrRonJobPostingSchema.parse(input.posting);
}

export function publishHrRonPostingReference(
  posting: HrRonJobPostingInput,
): HrRonJobPostingInput {
  return hrRonJobPostingSchema.parse({
    ...posting,
    status: "published",
    publishedAt: posting.publishedAt ?? nowIso(),
  });
}

export function parseHrRonResumeReference(input: {
  resumeText?: string | null;
  enabled: boolean;
}) {
  if (!input.enabled || !input.resumeText) {
    return {
      skills: [] as string[],
      education: [] as string[],
      workHistory: [] as string[],
      certifications: [] as string[],
      contactDetails: [] as string[],
    };
  }

  const segments = input.resumeText
    .split(/[;\n]/g)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return {
    skills: segments.filter((segment) => segment.startsWith("Skill:")),
    education: segments.filter((segment) => segment.startsWith("Education:")),
    workHistory: segments.filter((segment) => segment.startsWith("Work:")),
    certifications: segments.filter((segment) =>
      segment.startsWith("Certification:"),
    ),
    contactDetails: segments.filter((segment) => segment.startsWith("Contact:")),
  };
}

export function createHrRonCandidateProfileFromApplication(input: {
  organizationId: string;
  candidateId: string;
  displayName: string;
  email: string;
  phone: string;
  source: HrRonCandidateProfileInput["source"];
  resumeDocumentId?: string | null;
  resumeText?: string | null;
  parseResume?: boolean;
}): HrRonCandidateProfileInput {
  const parsedResume = parseHrRonResumeReference({
    resumeText: input.resumeText,
    enabled: input.parseResume ?? true,
  });

  return hrRonCandidateProfileSchema.parse({
    id: input.candidateId,
    organizationId: input.organizationId,
    displayName: input.displayName,
    email: input.email,
    phone: input.phone,
    source: input.source,
    resumeDocumentId: input.resumeDocumentId ?? null,
    skills: parsedResume.skills,
    education: parsedResume.education,
    workHistory: parsedResume.workHistory,
    certifications: parsedResume.certifications,
  });
}

export function submitHrRonApplication(input: {
  profile: HrRonCandidateProfileInput;
  application: HrRonApplicationInput;
}) {
  return {
    candidate: hrRonCandidateProfileSchema.parse(input.profile),
    application: hrRonApplicationSchema.parse(input.application),
  };
}

export function evaluateHrRonScreeningAnswers(input: {
  applicationId: string;
  questions: readonly HrRonScreeningQuestionInput[];
  answers: Record<string, string>;
  evaluatedAt?: string;
}): HrRonScreeningResult {
  const parsedQuestions = input.questions.map((question) =>
    hrRonScreeningQuestionSchema.parse(question),
  );
  const knockoutQuestionIds = parsedQuestions
    .filter(
      (question) =>
        question.knockout &&
        question.expectedAnswer &&
        input.answers[question.id] !== question.expectedAnswer,
    )
    .map((question) => question.id);

  return {
    applicationId: input.applicationId,
    passed: knockoutQuestionIds.length === 0,
    knockoutQuestionIds,
    evaluatedAt: input.evaluatedAt ?? nowIso(),
  };
}

export function moveHrRonCandidateStage(input: {
  application: HrRonApplicationInput;
  toStage: HrRonPipelineStage;
  toStatus: HrRonCandidateStatus;
  movedByUserId: string;
  movedAt?: string;
}) {
  const move: HrRonPipelineMove = {
    applicationId: input.application.id,
    fromStage: input.application.stage,
    toStage: input.toStage,
    fromStatus: input.application.status,
    toStatus: input.toStatus,
    movedAt: input.movedAt ?? nowIso(),
    movedByUserId: input.movedByUserId,
  };

  return {
    application: hrRonApplicationSchema.parse({
      ...input.application,
      stage: input.toStage,
      status: input.toStatus,
    }),
    move,
  };
}

export function scheduleHrRonInterview(
  input: HrRonInterviewScheduleInput,
): HrRonInterviewScheduleInput {
  return hrRonInterviewScheduleSchema.parse(input);
}

export function buildHrRonInterviewNotifications(
  interview: HrRonInterviewScheduleInput,
): HrRonCommunicationInput[] {
  return interview.interviewerUserIds.map((userId) =>
    hrRonCommunicationSchema.parse({
      id: `${interview.id}:invite:${userId}`,
      organizationId: interview.organizationId,
      applicationId: interview.applicationId,
      candidateId: interview.candidateId,
      event: "interview_invitation",
      recipientEmail: `${userId}@afenda.local`,
      sentAt: interview.confirmationSentAt ?? nowIso(),
    }),
  );
}

export function submitHrRonInterviewScorecard(
  input: HrRonInterviewScorecardInput,
): HrRonInterviewScorecardInput {
  return hrRonInterviewScorecardSchema.parse(input);
}

export function aggregateHrRonPanelScore(
  scorecards: readonly Pick<
    HrRonInterviewScorecardInput,
    "rating" | "recommendation"
  >[],
) {
  if (scorecards.length === 0) {
    return {
      averageRating: null,
      recommendation: "hold" as HrRonHiringRecommendation,
    };
  }

  const averageRating =
    scorecards.reduce((sum, scorecard) => sum + scorecard.rating, 0) /
    scorecards.length;
  const recommendation =
    averageRating >= 4.5 ? "strong_hire" : averageRating >= 3.5 ? "hire" : "hold";

  return { averageRating, recommendation };
}

export function assignHrRonAssessment(
  input: HrRonAssessmentInput,
): HrRonAssessmentInput {
  return hrRonAssessmentSchema.parse(input);
}

export function recordHrRonAssessmentResult(input: {
  assessment: HrRonAssessmentInput;
  score: number;
  status: HrRonAssessmentInput["status"];
  resultRecordedAt?: string;
}): HrRonAssessmentInput {
  return hrRonAssessmentSchema.parse({
    ...input.assessment,
    score: input.score,
    status: input.status,
    resultRecordedAt: input.resultRecordedAt ?? nowIso(),
  });
}

export function buildHrRonCandidateCommunication(input: {
  organizationId: string;
  applicationId: string;
  candidate: Pick<HrRonCandidateProfileInput, "id" | "email">;
  event: HrRonCommunicationEvent;
  sentAt?: string;
}): HrRonCommunicationInput {
  return hrRonCommunicationSchema.parse({
    id: `${input.applicationId}:${input.event}`,
    organizationId: input.organizationId,
    applicationId: input.applicationId,
    candidateId: input.candidate.id,
    event: input.event,
    recipientEmail: input.candidate.email,
    sentAt: input.sentAt ?? nowIso(),
  });
}

export function createHrRonOffer(input: HrRonOfferInput): HrRonOfferInput {
  return hrRonOfferSchema.parse(input);
}

export function resolveHrRonOfferApprovalWorkflow(
  offer: Pick<HrRonOfferInput, "id" | "approvalRequired" | "status">,
): HrRonApprovalStep[] {
  if (!offer.approvalRequired) {
    return [];
  }
  return [
    "hr",
    "finance",
  ].map((role, index) => ({
    id: `${offer.id}:approval:${role}`,
    targetId: offer.id,
    targetType: "offer" as const,
    role: role as HrRonApprovalStep["role"],
    sequence: index + 1,
    status:
      offer.status === "approved" || offer.status === "sent" || offer.status === "accepted"
        ? "approved"
        : "pending",
    required: true,
    decidedAt:
      offer.status === "approved" || offer.status === "sent" || offer.status === "accepted"
        ? nowIso()
        : null,
  }));
}

export function assertHrRonOfferSendAllowed(
  offer: Pick<HrRonOfferInput, "id" | "approvalRequired" | "status">,
) {
  if (offer.approvalRequired && offer.status !== "approved") {
    throw new Error(`Offer ${offer.id} must be approved before it is sent.`);
  }
}

export function recordHrRonOfferLetterReference(input: {
  offer: HrRonOfferInput;
  offerLetterDocumentId: string;
}): HrRonOfferInput {
  return hrRonOfferSchema.parse({
    ...input.offer,
    offerLetterDocumentId: input.offerLetterDocumentId,
  });
}

export function recordHrRonPreEmploymentCheck(
  input: HrRonPreEmploymentCheckInput,
): HrRonPreEmploymentCheckInput {
  return hrRonPreEmploymentCheckSchema.parse(input);
}

export function buildHrRonCandidateConversionReference(input: {
  organizationId: string;
  candidate: HrRonCandidateProfileInput;
  application: HrRonApplicationInput;
  requisition: HrRonRequisitionInput;
  offer: HrRonOfferInput;
}): HrRonCandidateConversionReference {
  if (input.offer.status !== "accepted") {
    throw new Error("Only accepted offers can be converted.");
  }

  return {
    organizationId: input.organizationId,
    candidateId: input.candidate.id,
    applicationId: input.application.id,
    offerId: input.offer.id,
    employeeReferenceId: `employee-from-${input.candidate.id}`,
    displayName: input.candidate.displayName,
    legalEntityCode: input.requisition.legalEntityCode,
    departmentId: input.requisition.departmentId,
    proposedRole: input.offer.proposedRole,
    managerEmployeeId: input.offer.managerEmployeeId,
    startDate: input.offer.startDate,
    employmentType: input.offer.employmentType,
    salaryAmount: input.offer.salaryAmount,
    salaryCurrency: input.offer.salaryCurrency,
  };
}

export function generateHrRonOnboardingTasks(input: {
  organizationId: string;
  onboardingCaseId: string;
  employeeReferenceId: string;
  legalEntityCode: string;
  departmentId: string;
  role: string;
  employmentType: string;
  locationId: string;
  employeeCategory: string;
  dueDate?: string;
}): HrRonOnboardingTaskInput[] {
  const dueDate = input.dueDate ?? todayDate();
  return HR_RON_ONBOARDING_OWNER_ROLES.map((ownerRole, index) =>
    hrRonOnboardingTaskSchema.parse({
      id: `${input.onboardingCaseId}:task:${ownerRole}`,
      organizationId: input.organizationId,
      onboardingCaseId: input.onboardingCaseId,
      employeeReferenceId: input.employeeReferenceId,
      title: `${formatEnumLabel(ownerRole)} onboarding task`,
      ownerRole,
      status: index === 0 ? "in_progress" : "pending",
      mandatory: true,
      blocking: ownerRole !== "admin",
      dueDate,
      completedAt: null,
      documentReference: ownerRole === "document_owner" ? "doc.identity" : null,
      policyAcknowledgmentCode: ownerRole === "new_hire" ? "policy.handbook" : null,
    }),
  );
}

export function assignHrRonOnboardingTask(
  task: HrRonOnboardingTaskInput,
): HrRonOnboardingTaskInput {
  return hrRonOnboardingTaskSchema.parse(task);
}

export function completeHrRonOnboardingTask(input: {
  task: HrRonOnboardingTaskInput;
  completedAt?: string;
}): HrRonOnboardingTaskInput {
  return hrRonOnboardingTaskSchema.parse({
    ...input.task,
    status: "completed",
    completedAt: input.completedAt ?? nowIso(),
  });
}

export function recordHrRonOnboardingDocument(input: {
  task: HrRonOnboardingTaskInput;
  documentReference: string;
}) {
  return hrRonOnboardingTaskSchema.parse({
    ...input.task,
    documentReference: input.documentReference,
  });
}

export function recordHrRonPolicyAcknowledgment(input: {
  task: HrRonOnboardingTaskInput;
  policyAcknowledgmentCode: string;
}) {
  return hrRonOnboardingTaskSchema.parse({
    ...input.task,
    policyAcknowledgmentCode: input.policyAcknowledgmentCode,
  });
}

export function getHrRonOnboardingCompletionBlockers(
  tasks: readonly HrRonOnboardingTaskInput[],
) {
  return tasks.filter(
    (task) =>
      task.mandatory &&
      task.blocking &&
      !["completed", "waived", "cancelled"].includes(task.status),
  );
}

export function buildHrRonReadinessSnapshot(input: {
  organizationId: string;
  employeeReferenceId: string;
  tasks: readonly HrRonOnboardingTaskInput[];
  updatedAt?: string;
}): HrRonReadinessSnapshotInput[] {
  const statusForDomain = (
    domain: HrRonReadinessDomain,
  ): HrRonReadinessSnapshotInput["status"] => {
    const relevantTasks = input.tasks.filter((task) => {
      if (domain === "payroll") return task.ownerRole === "payroll";
      if (domain === "iam") return task.ownerRole === "it";
      if (domain === "document_management") return task.ownerRole === "document_owner";
      if (domain === "employee_lifecycle") return task.ownerRole === "manager";
      return task.ownerRole === "hr" || task.ownerRole === "new_hire";
    });
    if (relevantTasks.some((task) => task.status === "blocked")) return "blocked";
    if (relevantTasks.some((task) => task.status === "overdue")) return "overdue";
    if (relevantTasks.every((task) => task.status === "completed")) {
      return "completed";
    }
    return "missing";
  };

  return [
    "employee_records",
    "payroll",
    "iam",
    "document_management",
    "employee_lifecycle",
  ].map((domain) => {
    const status = statusForDomain(domain as HrRonReadinessDomain);
    return hrRonReadinessSnapshotSchema.parse({
      id: `${input.employeeReferenceId}:readiness:${domain}`,
      organizationId: input.organizationId,
      employeeReferenceId: input.employeeReferenceId,
      domain,
      status,
      missingItems: status === "completed" ? [] : [`${domain} readiness incomplete`],
      updatedAt: input.updatedAt ?? nowIso(),
    });
  });
}

export function listHrRonHistoryByCandidateOrEmployee(input: {
  store: HrRonStore;
  candidateId?: string;
  employeeReferenceId?: string;
}) {
  return input.store.auditEvents.filter((event) => {
    if (input.candidateId && event.metadata.candidateId === input.candidateId) {
      return true;
    }
    if (
      input.employeeReferenceId &&
      event.metadata.employeeReferenceId === input.employeeReferenceId
    ) {
      return true;
    }
    return false;
  });
}

export function buildHrRonReportRows(input: {
  store: HrRonStore;
  groupBy: HrRonReportGroupBy;
}): HrRonReportRow[] {
  const keyForApplication = (
    application: HrRonApplicationInput,
  ): readonly [string, string] => {
    const requisition = input.store.requisitions.find(
      (row) => row.id === application.requisitionId,
    );
    const conversion = input.store.conversions.find(
      (row) => row.applicationId === application.id,
    );
    const onboardingTasks = conversion
      ? input.store.onboardingTasks.filter(
          (task) => task.employeeReferenceId === conversion.employeeReferenceId,
        )
      : [];
    switch (input.groupBy) {
      case "requisition":
        return [application.requisitionId, requisition?.title ?? application.requisitionId];
      case "source":
        return [application.source, formatEnumLabel(application.source)];
      case "stage":
        return [application.stage, formatEnumLabel(application.stage)];
      case "recruiter":
        return [application.recruiterUserId, application.recruiterUserId];
      case "hiring_manager":
        return [
          application.hiringManagerEmployeeId,
          requisition?.hiringManagerDisplayName ?? application.hiringManagerEmployeeId,
        ];
      case "department":
        return [
          requisition?.departmentId ?? "unknown",
          requisition?.departmentName ?? "Unknown department",
        ];
      case "onboarding_status": {
        const blockers = getHrRonOnboardingCompletionBlockers(onboardingTasks);
        return [blockers.length > 0 ? "blocked" : "ready", blockers.length > 0 ? "Blocked" : "Ready"];
      }
      case "period":
        return [application.submittedAt.slice(0, 7), application.submittedAt.slice(0, 7)];
    }
  };

  const groups = new Map<string, HrRonReportRow>();
  for (const application of input.store.applications) {
    const [groupKey, groupLabel] = keyForApplication(application);
    const row =
      groups.get(groupKey) ??
      ({
        id: `${input.groupBy}:${groupKey}`,
        groupBy: input.groupBy,
        groupKey,
        groupLabel,
        applicationCount: 0,
        hiredCount: 0,
        offerAcceptedCount: 0,
        onboardingBlockedCount: 0,
      } satisfies HrRonReportRow);
    const acceptedOffer = input.store.offers.some(
      (offer) => offer.applicationId === application.id && offer.status === "accepted",
    );
    const conversion = input.store.conversions.find(
      (item) => item.applicationId === application.id,
    );
    const blockers = conversion
      ? getHrRonOnboardingCompletionBlockers(
          input.store.onboardingTasks.filter(
            (task) => task.employeeReferenceId === conversion.employeeReferenceId,
          ),
        )
      : [];
    groups.set(groupKey, {
      ...row,
      applicationCount: row.applicationCount + 1,
      hiredCount: row.hiredCount + (application.status === "hired" ? 1 : 0),
      offerAcceptedCount: row.offerAcceptedCount + (acceptedOffer ? 1 : 0),
      onboardingBlockedCount:
        row.onboardingBlockedCount + (blockers.length > 0 ? 1 : 0),
    });
  }

  return [...groups.values()];
}

export function filterHrRonRecordsForAccess(input: {
  store: HrRonStore;
  access: HrRonAccessContext;
}): HrRonStore {
  if (["hr", "auditor"].includes(input.access.role)) {
    return cloneStore(input.store);
  }

  const managed = new Set(input.access.managedEmployeeIds ?? []);
  const interviewerUserId = input.access.interviewerUserId ?? input.access.actorUserId;
  const applicationIds = new Set(
    input.store.applications
      .filter((application) => {
        if (input.access.role === "recruiter") {
          return application.recruiterUserId === input.access.actorUserId;
        }
        if (input.access.role === "hiring_manager") {
          return managed.has(application.hiringManagerEmployeeId);
        }
        if (input.access.role === "interviewer") {
          return input.store.interviews.some(
            (interview) =>
              interview.applicationId === application.id &&
              interview.interviewerUserIds.includes(interviewerUserId ?? ""),
          );
        }
        if (input.access.role === "finance") {
          return input.access.canReadFinance === true;
        }
        if (input.access.role === "it") {
          return input.access.canReadIt === true;
        }
        return false;
      })
      .map((application) => application.id),
  );
  const candidateIds = new Set(
    input.store.applications
      .filter((application) => applicationIds.has(application.id))
      .map((application) => application.candidateId),
  );
  const conversionEmployeeIds = new Set(
    input.store.conversions
      .filter((conversion) => applicationIds.has(conversion.applicationId))
      .map((conversion) => conversion.employeeReferenceId),
  );

  return {
    requisitions: input.store.requisitions.filter((requisition) =>
      [...applicationIds].some((applicationId) =>
        input.store.applications.some(
          (application) =>
            application.id === applicationId &&
            application.requisitionId === requisition.id,
        ),
      ),
    ),
    postings: input.store.postings.filter((posting) =>
      input.store.requisitions.some(
        (requisition) => requisition.id === posting.requisitionId,
      ),
    ),
    candidates: input.store.candidates.filter((candidate) =>
      candidateIds.has(candidate.id),
    ),
    applications: input.store.applications.filter((application) =>
      applicationIds.has(application.id),
    ),
    screeningQuestions: [...input.store.screeningQuestions],
    screeningResults: input.store.screeningResults.filter((result) =>
      applicationIds.has(result.applicationId),
    ),
    pipelineMoves: input.store.pipelineMoves.filter((move) =>
      applicationIds.has(move.applicationId),
    ),
    interviews: input.store.interviews.filter((interview) =>
      applicationIds.has(interview.applicationId),
    ),
    scorecards: input.store.scorecards.filter((scorecard) =>
      input.store.interviews.some(
        (interview) =>
          interview.id === scorecard.interviewId &&
          applicationIds.has(interview.applicationId),
      ),
    ),
    assessments: input.store.assessments.filter((assessment) =>
      applicationIds.has(assessment.applicationId),
    ),
    communications: input.store.communications.filter((communication) =>
      applicationIds.has(communication.applicationId),
    ),
    offers: input.store.offers.filter((offer) =>
      applicationIds.has(offer.applicationId),
    ),
    checks: input.store.checks.filter((check) => candidateIds.has(check.candidateId)),
    conversions: input.store.conversions.filter((conversion) =>
      applicationIds.has(conversion.applicationId),
    ),
    onboardingTasks: input.store.onboardingTasks.filter((task) =>
      conversionEmployeeIds.has(task.employeeReferenceId),
    ),
    readiness: input.store.readiness.filter((snapshot) =>
      conversionEmployeeIds.has(snapshot.employeeReferenceId),
    ),
    approvals: input.store.approvals.filter((approval) =>
      input.store.offers.some(
        (offer) => offer.id === approval.targetId && applicationIds.has(offer.applicationId),
      ),
    ),
    auditEvents: input.store.auditEvents.filter((event) =>
      event.metadata.applicationId
        ? applicationIds.has(String(event.metadata.applicationId))
        : false,
    ),
  };
}

export function emitHrRonAuditEvent(input: {
  store: HrRonStore;
  organizationId: string;
  action: HrTalentRonAuditAction;
  actorId: string;
  targetId: string;
  targetType: string;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
  occurredAt?: string;
}): HrRonAuditEvent {
  const event = {
    id: `audit:${input.action}:${input.targetId}:${input.store.auditEvents.length + 1}`,
    organizationId: input.organizationId,
    action: input.action,
    actorId: input.actorId,
    targetId: input.targetId,
    targetType: input.targetType,
    occurredAt: input.occurredAt ?? nowIso(),
    summary: input.summary,
    metadata: input.metadata ?? {},
  } satisfies HrRonAuditEvent;
  input.store.auditEvents = [...input.store.auditEvents, event];
  return event;
}

export function createHrRonSampleStore(
  organizationId = "org_afenda_demo",
): HrRonStore {
  const requisition = createHrRonRequisition({
    id: "ron-req-001",
    organizationId,
    title: "Senior Operations Analyst",
    requisitionType: "new_headcount",
    legalEntityCode: "US01",
    departmentId: "dept-operations",
    departmentName: "Operations",
    positionId: "pos-ops-analyst",
    locationId: "loc-nyc",
    locationName: "New York",
    grade: "G7",
    hiringManagerEmployeeId: "emp-manager-001",
    hiringManagerDisplayName: "Mina Park",
    recruiterUserId: "user-recruiter-001",
    budgetReference: "BUD-OPS-2026-01",
    employmentType: "full_time",
    headcount: 2,
    approvalRequired: true,
    status: "approved",
    createdAt: nowIso(),
    approvedAt: nowIso(),
  });
  const posting = publishHrRonPostingReference(
    createHrRonJobPosting({
      requisition,
      posting: {
        id: "ron-posting-001",
        organizationId,
        requisitionId: requisition.id,
        channel: "external",
        title: requisition.title,
        description: "Own operating rhythm and hiring analytics.",
        requirements: "Analytics, stakeholder management, operations.",
        status: "draft",
        integrationTarget: "career_site",
        publishedAt: null,
      },
    }),
  );
  const candidate = createHrRonCandidateProfileFromApplication({
    organizationId,
    candidateId: "ron-candidate-001",
    displayName: "Avery Chen",
    email: "avery.chen@example.com",
    phone: "+1-555-0101",
    source: "career_site",
    resumeDocumentId: "doc-resume-001",
    resumeText:
      "Skill: Analytics;Skill: SQL;Education: MBA;Work: Operations lead;Certification: SHRM;Contact: avery.chen@example.com",
  });
  const application = hrRonApplicationSchema.parse({
    id: "ron-app-001",
    organizationId,
    candidateId: candidate.id,
    requisitionId: requisition.id,
    postingId: posting.id,
    source: candidate.source,
    stage: "offer",
    status: "offer",
    submittedAt: nowIso(),
    recruiterUserId: requisition.recruiterUserId,
    hiringManagerEmployeeId: requisition.hiringManagerEmployeeId,
  });
  const screeningQuestion = hrRonScreeningQuestionSchema.parse({
    id: "ron-screen-001",
    requisitionId: requisition.id,
    prompt: "Can you work in New York?",
    knockout: true,
    expectedAnswer: "yes",
  });
  const screeningResult = evaluateHrRonScreeningAnswers({
    applicationId: application.id,
    questions: [screeningQuestion],
    answers: { [screeningQuestion.id]: "yes" },
  });
  const interview = scheduleHrRonInterview({
    id: "ron-interview-001",
    organizationId,
    applicationId: application.id,
    candidateId: candidate.id,
    interviewerUserIds: ["user-interviewer-001", "user-interviewer-002"],
    hiringManagerEmployeeId: requisition.hiringManagerEmployeeId,
    scheduledAt: nowIso(),
    interviewType: "panel",
    confirmationSentAt: nowIso(),
  });
  const scorecards = [
    submitHrRonInterviewScorecard({
      id: "ron-scorecard-001",
      interviewId: interview.id,
      interviewerUserId: "user-interviewer-001",
      rating: 4,
      comments: "Strong operations judgment.",
      recommendation: "hire",
      submittedAt: nowIso(),
    }),
    submitHrRonInterviewScorecard({
      id: "ron-scorecard-002",
      interviewId: interview.id,
      interviewerUserId: "user-interviewer-002",
      rating: 5,
      comments: "Excellent stakeholder answers.",
      recommendation: "strong_hire",
      submittedAt: nowIso(),
    }),
  ];
  const assessment = recordHrRonAssessmentResult({
    assessment: assignHrRonAssessment({
      id: "ron-assessment-001",
      organizationId,
      applicationId: application.id,
      assessmentName: "Operations case study",
      assignedAt: nowIso(),
      resultRecordedAt: null,
      score: null,
      status: "assigned",
    }),
    score: 88,
    status: "passed",
  });
  const offer = createHrRonOffer({
    id: "ron-offer-001",
    organizationId,
    applicationId: application.id,
    candidateId: candidate.id,
    proposedRole: "Senior Operations Analyst",
    salaryAmount: 125000,
    salaryCurrency: "USD",
    startDate: "2026-07-01",
    employmentType: "full_time",
    managerEmployeeId: requisition.hiringManagerEmployeeId,
    locationId: requisition.locationId,
    conditions: ["Background check", "Right-to-work verification"],
    approvalRequired: true,
    status: "accepted",
    offerLetterDocumentId: "doc-offer-001",
    approvedAt: nowIso(),
    sentAt: nowIso(),
    acceptedAt: nowIso(),
  });
  const conversion = buildHrRonCandidateConversionReference({
    organizationId,
    candidate,
    application: { ...application, status: "hired", stage: "hired" },
    requisition,
    offer,
  });
  const onboardingTasks = generateHrRonOnboardingTasks({
    organizationId,
    onboardingCaseId: "ron-onboarding-001",
    employeeReferenceId: conversion.employeeReferenceId,
    legalEntityCode: conversion.legalEntityCode,
    departmentId: conversion.departmentId,
    role: conversion.proposedRole,
    employmentType: conversion.employmentType,
    locationId: requisition.locationId,
    employeeCategory: "regular",
    dueDate: "2026-07-01",
  });
  const firstTask = assertFound(onboardingTasks[0], "Missing onboarding task.");
  const completedFirstTask = completeHrRonOnboardingTask({
    task: firstTask,
  });
  const tasks = [completedFirstTask, ...onboardingTasks.slice(1)];
  const readiness = buildHrRonReadinessSnapshot({
    organizationId,
    employeeReferenceId: conversion.employeeReferenceId,
    tasks,
  });

  const store: HrRonStore = {
    requisitions: [requisition],
    postings: [posting],
    candidates: [candidate],
    applications: [{ ...application, status: "hired", stage: "hired" }],
    screeningQuestions: [screeningQuestion],
    screeningResults: [screeningResult],
    pipelineMoves: [
      {
        applicationId: application.id,
        fromStage: "applied",
        toStage: "offer",
        fromStatus: "applied",
        toStatus: "offer",
        movedAt: nowIso(),
        movedByUserId: requisition.recruiterUserId,
      },
    ],
    interviews: [interview],
    scorecards,
    assessments: [assessment],
    communications: [
      buildHrRonCandidateCommunication({
        organizationId,
        applicationId: application.id,
        candidate,
        event: "application_received",
      }),
      ...buildHrRonInterviewNotifications(interview),
      buildHrRonCandidateCommunication({
        organizationId,
        applicationId: application.id,
        candidate,
        event: "offer",
      }),
      buildHrRonCandidateCommunication({
        organizationId,
        applicationId: application.id,
        candidate,
        event: "onboarding_start",
      }),
    ],
    offers: [offer],
    checks: HR_RON_CHECK_TYPES.map((checkType) =>
      recordHrRonPreEmploymentCheck({
        id: `ron-check-${checkType}`,
        organizationId,
        candidateId: candidate.id,
        offerId: offer.id,
        checkType,
        status: "clear",
        reference: `ref-${checkType}`,
        recordedAt: nowIso(),
      }),
    ),
    conversions: [conversion],
    onboardingTasks: tasks,
    readiness,
    approvals: [
      ...resolveHrRonRequisitionApprovalWorkflow(requisition),
      ...resolveHrRonOfferApprovalWorkflow(offer),
    ],
    auditEvents: [],
  };

  for (const [action, targetId, targetType, summary] of [
    [hrTalentRonAuditActions.requisition.created, requisition.id, "requisition", "Requisition created"],
    [hrTalentRonAuditActions.posting.published, posting.id, "posting", "Posting published"],
    [hrTalentRonAuditActions.application.submitted, application.id, "application", "Application submitted"],
    [hrTalentRonAuditActions.interview.scorecardSubmitted, interview.id, "interview", "Scorecard submitted"],
    [hrTalentRonAuditActions.offer.accepted, offer.id, "offer", "Offer accepted"],
    [hrTalentRonAuditActions.onboarding.caseTriggered, conversion.employeeReferenceId, "onboarding", "Onboarding started"],
  ] as const) {
    emitHrRonAuditEvent({
      store,
      organizationId,
      action,
      actorId: requisition.recruiterUserId,
      targetId,
      targetType,
      summary,
      metadata: {
        candidateId: candidate.id,
        applicationId: application.id,
        employeeReferenceId: conversion.employeeReferenceId,
      },
    });
  }

  return store;
}

export function getHrRonStore(organizationId: string): HrRonStore {
  const existing = stores.get(organizationId);
  if (existing) {
    return existing;
  }
  const seeded = createHrRonSampleStore(organizationId);
  stores.set(organizationId, seeded);
  return seeded;
}

export function resetHrRonStoreForTests(organizationId: string) {
  const seeded = createHrRonSampleStore(organizationId);
  stores.set(organizationId, seeded);
  return seeded;
}
