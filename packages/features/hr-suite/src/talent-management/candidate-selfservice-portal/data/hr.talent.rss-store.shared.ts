import type {
  HrTalentRssAuditTargetType,
  HrTalentRssIntegrationExposure,
} from "../contracts/hr.talent.rss.contract";
import {
  hrTalentRssAuditActions,
  type HrTalentRssAuditAction,
} from "../events/hr.talent.rss.event";
import type {
  HrTalentRssAccessLogInput,
  HrTalentRssApplicationInput,
  HrTalentRssApprovalInput,
  HrTalentRssAssessmentInput,
  HrTalentRssCandidateProfileInput,
  HrTalentRssCandidateReviewInput,
  HrTalentRssDocumentSubmissionInput,
  HrTalentRssInterviewInput,
  HrTalentRssJobPostingInput,
  HrTalentRssNotificationInput,
  HrTalentRssOfferInput,
  HrTalentRssPreEmploymentFormInput,
  HrTalentRssPrivacyRecordInput,
  HrTalentRssRequisitionRequestInput,
  HrTalentRssRetentionActionInput,
  HrTalentRssScorecardInput,
  HrTalentRssTaskInput,
} from "../schemas/hr.talent.rss.schema";
import type { HrTalentRssReportGroupBy } from "../schemas/hr.talent.rss-constants.shared";

export type HrTalentRssAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrTalentRssAuditAction;
  readonly actorId: string;
  readonly targetType: HrTalentRssAuditTargetType;
  readonly targetId: string;
  readonly candidateId?: string;
  readonly applicationId?: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrTalentRssReportRow = {
  readonly id: string;
  readonly groupBy: HrTalentRssReportGroupBy;
  readonly group: string;
  readonly count: number;
  readonly pendingTasks: number;
  readonly restrictedRecords: number;
  readonly lastActivityAt: string;
};

export type HrTalentRssStore = {
  candidateProfiles: HrTalentRssCandidateProfileInput[];
  jobPostings: HrTalentRssJobPostingInput[];
  applications: HrTalentRssApplicationInput[];
  documents: HrTalentRssDocumentSubmissionInput[];
  interviews: HrTalentRssInterviewInput[];
  assessments: HrTalentRssAssessmentInput[];
  preEmploymentForms: HrTalentRssPreEmploymentFormInput[];
  offers: HrTalentRssOfferInput[];
  requisitionRequests: HrTalentRssRequisitionRequestInput[];
  candidateReviews: HrTalentRssCandidateReviewInput[];
  scorecards: HrTalentRssScorecardInput[];
  approvals: HrTalentRssApprovalInput[];
  roleTasks: HrTalentRssTaskInput[];
  notifications: HrTalentRssNotificationInput[];
  privacyRecords: HrTalentRssPrivacyRecordInput[];
  accessLogs: HrTalentRssAccessLogInput[];
  retentionActions: HrTalentRssRetentionActionInput[];
  auditEvents: HrTalentRssAuditEvent[];
};

export type HrTalentRssAccessFilter = {
  readonly actorUserId?: string;
  readonly role:
    | "candidate"
    | "internal_employee"
    | "hiring_manager"
    | "interviewer"
    | "recruiter"
    | "approver"
    | "auditor"
    | "hr";
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadRestricted: boolean;
  readonly visibleCandidateIds?: readonly string[] | null;
};

const stores = new Map<string, HrTalentRssStore>();

function withOrg<T extends { organizationId: string }>(
  organizationId: string,
  rows: readonly Omit<T, "organizationId">[],
): T[] {
  return rows.map((row) => ({ ...row, organizationId }) as T);
}

function date(offsetDays: number) {
  const value = new Date("2026-06-01T08:00:00.000Z");
  value.setUTCDate(value.getUTCDate() + offsetDays);
  return value.toISOString();
}

function createSeedStore(organizationId: string): HrTalentRssStore {
  const candidateProfiles = withOrg<HrTalentRssCandidateProfileInput>(
    organizationId,
    [
      {
        id: "rss-candidate-1",
        candidateRef: "CAN-2026-001",
        displayName: "Amina Rahman",
        email: "amina.rahman@example.test",
        phoneMasked: "+60 *** 0101",
        role: "candidate",
        accountStatus: "active",
        profileStatus: "verified",
        privacyTier: "standard",
        consentStatus: "captured",
        retentionStatus: "active",
        profileUpdatedAt: date(-8),
        lastPortalAccessAt: date(-1),
        permittedUpdateUntil: date(14),
      },
      {
        id: "rss-candidate-2",
        candidateRef: "CAN-2026-002",
        displayName: "Daniel Lim",
        email: "daniel.lim@example.test",
        phoneMasked: "+60 *** 2290",
        role: "internal_employee",
        accountStatus: "active",
        profileStatus: "complete",
        privacyTier: "restricted",
        consentStatus: "captured",
        retentionStatus: "retention_review",
        profileUpdatedAt: date(-5),
        lastPortalAccessAt: date(-2),
        permittedUpdateUntil: date(7),
      },
    ],
  );

  const jobPostings = withOrg<HrTalentRssJobPostingInput>(organizationId, [
    {
      id: "rss-posting-1",
      postingRef: "JOB-OPS-142",
      title: "Operations Coordinator",
      department: "Operations",
      location: "Kuala Lumpur",
      visibility: "external",
      status: "open",
      requisitionRef: "REQ-142",
      applicationsCount: 24,
      closingAt: date(21),
    },
    {
      id: "rss-posting-2",
      postingRef: "JOB-FIN-204",
      title: "Senior Finance Analyst",
      department: "Finance",
      location: "Remote",
      visibility: "internal",
      status: "internal_only",
      requisitionRef: "REQ-204",
      applicationsCount: 5,
      closingAt: date(10),
    },
  ]);

  const applications = withOrg<HrTalentRssApplicationInput>(organizationId, [
    {
      id: "rss-application-1",
      applicationRef: "APP-001",
      candidateId: "rss-candidate-1",
      candidateDisplayName: "Amina Rahman",
      postingId: "rss-posting-1",
      postingTitle: "Operations Coordinator",
      internalApplication: false,
      source: "career_site",
      status: "interview",
      currentStage: "Hiring manager interview",
      submittedAt: date(-6),
      ownerUserId: "user_recruiter_1",
      hiringManagerUserId: "user_manager_1",
      interviewerUserIds: ["user_interviewer_1"],
    },
    {
      id: "rss-application-2",
      applicationRef: "APP-002",
      candidateId: "rss-candidate-2",
      candidateDisplayName: "Daniel Lim",
      postingId: "rss-posting-2",
      postingTitle: "Senior Finance Analyst",
      internalApplication: true,
      source: "internal_portal",
      status: "assessment",
      currentStage: "Finance assessment",
      submittedAt: date(-4),
      ownerUserId: "user_recruiter_1",
      hiringManagerUserId: "user_manager_2",
      interviewerUserIds: ["user_interviewer_2"],
    },
  ]);

  const documents = withOrg<HrTalentRssDocumentSubmissionInput>(
    organizationId,
    [
      {
        id: "rss-document-1",
        candidateId: "rss-candidate-1",
        applicationId: "rss-application-1",
        documentType: "resume",
        title: "Amina Rahman resume",
        status: "verified",
        privacyTier: "standard",
        submittedAt: date(-6),
        verifiedAt: date(-5),
      },
      {
        id: "rss-document-2",
        candidateId: "rss-candidate-2",
        applicationId: "rss-application-2",
        documentType: "work_eligibility",
        title: "Work eligibility reference",
        status: "submitted",
        privacyTier: "restricted",
        submittedAt: date(-3),
      },
    ],
  );

  const interviews = withOrg<HrTalentRssInterviewInput>(organizationId, [
    {
      id: "rss-interview-1",
      applicationId: "rss-application-1",
      candidateId: "rss-candidate-1",
      candidateDisplayName: "Amina Rahman",
      interviewType: "video",
      scheduledAt: date(2),
      status: "confirmed",
      rescheduleEnabled: true,
      instructions: "Join the secure meeting link five minutes early.",
      interviewerUserIds: ["user_interviewer_1", "user_manager_1"],
    },
    {
      id: "rss-interview-2",
      applicationId: "rss-application-2",
      candidateId: "rss-candidate-2",
      candidateDisplayName: "Daniel Lim",
      interviewType: "technical",
      scheduledAt: date(4),
      status: "invited",
      rescheduleEnabled: true,
      instructions: "Complete the finance case study before the panel.",
      interviewerUserIds: ["user_interviewer_2", "user_manager_2"],
    },
  ]);

  const assessments = withOrg<HrTalentRssAssessmentInput>(organizationId, [
    {
      id: "rss-assessment-1",
      applicationId: "rss-application-2",
      candidateId: "rss-candidate-2",
      assessmentName: "Finance modeling exercise",
      accessRef: "assessment://rss-assessment-1",
      status: "accessed",
      assignedAt: date(-2),
      expiresAt: date(5),
    },
  ]);

  const preEmploymentForms = withOrg<HrTalentRssPreEmploymentFormInput>(
    organizationId,
    [
      {
        id: "rss-form-1",
        applicationId: "rss-application-1",
        candidateId: "rss-candidate-1",
        formType: "right_to_work",
        status: "submitted",
        submittedAt: date(-1),
      },
      {
        id: "rss-form-2",
        applicationId: "rss-application-2",
        candidateId: "rss-candidate-2",
        formType: "reference_details",
        status: "pending",
      },
    ],
  );

  const offers = withOrg<HrTalentRssOfferInput>(organizationId, [
    {
      id: "rss-offer-1",
      applicationId: "rss-application-1",
      candidateId: "rss-candidate-1",
      offerRef: "OFF-001",
      status: "sent",
      documentAcknowledged: false,
      approverUserId: "user_approver_1",
    },
  ]);

  const requisitionRequests = withOrg<HrTalentRssRequisitionRequestInput>(
    organizationId,
    [
      {
        id: "rss-req-request-1",
        requestRef: "REQ-SELF-001",
        hiringManagerUserId: "user_manager_1",
        title: "Customer success associate",
        status: "pending",
        submittedAt: date(-2),
      },
    ],
  );

  const candidateReviews = withOrg<HrTalentRssCandidateReviewInput>(
    organizationId,
    [
      {
        id: "rss-review-1",
        applicationId: "rss-application-1",
        candidateId: "rss-candidate-1",
        reviewerUserId: "user_manager_1",
        reviewerRole: "hiring_manager",
        decision: "shortlist",
        comment: "Strong operations coordination experience.",
        reviewedAt: date(-1),
      },
    ],
  );

  const scorecards = withOrg<HrTalentRssScorecardInput>(organizationId, [
    {
      id: "rss-scorecard-1",
      interviewId: "rss-interview-1",
      applicationId: "rss-application-1",
      reviewerUserId: "user_interviewer_1",
      reviewerRole: "interviewer",
      status: "submitted",
      rating: 4,
      recommendation: "hire",
      comments: "Good communication and stakeholder follow-up.",
      submittedAt: date(-1),
    },
  ]);

  const approvals = withOrg<HrTalentRssApprovalInput>(organizationId, [
    {
      id: "rss-approval-1",
      approvalType: "requisition",
      targetId: "rss-req-request-1",
      approverUserId: "user_approver_1",
      status: "pending",
      requestedAt: date(-2),
    },
    {
      id: "rss-approval-2",
      approvalType: "offer",
      targetId: "rss-offer-1",
      approverUserId: "user_approver_1",
      status: "approved",
      decisionComment: "Offer package approved.",
      requestedAt: date(-3),
      decidedAt: date(-2),
    },
  ]);

  const roleTasks = withOrg<HrTalentRssTaskInput>(organizationId, [
    {
      id: "rss-task-1",
      taskType: "interview",
      ownerRole: "candidate",
      candidateId: "rss-candidate-1",
      applicationId: "rss-application-1",
      title: "Confirm interview attendance",
      status: "completed",
      dueAt: date(1),
    },
    {
      id: "rss-task-2",
      taskType: "approval",
      ownerRole: "approver",
      ownerUserId: "user_approver_1",
      title: "Review requisition request",
      status: "pending",
      dueAt: date(2),
    },
    {
      id: "rss-task-3",
      taskType: "privacy",
      ownerRole: "recruiter",
      ownerUserId: "user_recruiter_1",
      candidateId: "rss-candidate-2",
      title: "Review retention policy exception",
      status: "overdue",
      dueAt: date(-1),
    },
  ]);

  const notifications = withOrg<HrTalentRssNotificationInput>(
    organizationId,
    [
      {
        id: "rss-notification-1",
        event: "interview_invitation",
        recipientRole: "candidate",
        recipientRef: "rss-candidate-1",
        channel: "email",
        status: "delivered",
        sentAt: date(-2),
      },
      {
        id: "rss-notification-2",
        event: "approval_request",
        recipientRole: "approver",
        recipientRef: "user_approver_1",
        channel: "portal",
        status: "sent",
        sentAt: date(-1),
      },
    ],
  );

  const privacyRecords = withOrg<HrTalentRssPrivacyRecordInput>(
    organizationId,
    [
      {
        id: "rss-privacy-1",
        candidateId: "rss-candidate-1",
        privacyTier: "standard",
        consentStatus: "captured",
        consentCapturedAt: date(-7),
        retentionStatus: "active",
        retentionPolicyRef: "RSS-RET-24M",
      },
      {
        id: "rss-privacy-2",
        candidateId: "rss-candidate-2",
        privacyTier: "restricted",
        consentStatus: "captured",
        consentCapturedAt: date(-4),
        retentionStatus: "retention_review",
        retentionPolicyRef: "RSS-RET-INTERNAL",
      },
    ],
  );

  const accessLogs = withOrg<HrTalentRssAccessLogInput>(organizationId, [
    {
      id: "rss-access-1",
      actorUserId: "user_recruiter_1",
      actorRole: "recruiter",
      targetType: "application",
      targetId: "rss-application-1",
      privacyTier: "standard",
      accessReason: "Pipeline review",
      accessedAt: date(-1),
    },
    {
      id: "rss-access-2",
      actorUserId: "user_manager_2",
      actorRole: "hiring_manager",
      targetType: "document",
      targetId: "rss-document-2",
      privacyTier: "restricted",
      accessReason: "Eligibility review",
      accessedAt: date(-1),
    },
  ]);

  const retentionActions = withOrg<HrTalentRssRetentionActionInput>(
    organizationId,
    [
      {
        id: "rss-retention-1",
        candidateId: "rss-candidate-2",
        action: "retention_reviewed",
        policyRef: "RSS-RET-INTERNAL",
        status: "retention_review",
        performedByUserId: "user_privacy_admin",
        performedAt: date(-1),
      },
    ],
  );

  const auditEvents = withOrg<HrTalentRssAuditEvent>(organizationId, [
    {
      id: "rss-audit-1",
      action: hrTalentRssAuditActions.candidateProfileCreated,
      actorId: "rss-candidate-1",
      targetType: "candidate_profile",
      targetId: "rss-candidate-1",
      candidateId: "rss-candidate-1",
      summary: "Candidate profile created for Amina Rahman.",
      occurredAt: date(-8),
    },
    {
      id: "rss-audit-2",
      action: hrTalentRssAuditActions.applicationSubmitted,
      actorId: "rss-candidate-1",
      targetType: "application",
      targetId: "rss-application-1",
      candidateId: "rss-candidate-1",
      applicationId: "rss-application-1",
      summary: "Application APP-001 submitted through the portal.",
      occurredAt: date(-6),
    },
    {
      id: "rss-audit-3",
      action: hrTalentRssAuditActions.privacyAccessLogged,
      actorId: "user_manager_2",
      targetType: "privacy",
      targetId: "rss-access-2",
      candidateId: "rss-candidate-2",
      summary: "Restricted candidate document access logged.",
      occurredAt: date(-1),
    },
  ]);

  return {
    candidateProfiles,
    jobPostings,
    applications,
    documents,
    interviews,
    assessments,
    preEmploymentForms,
    offers,
    requisitionRequests,
    candidateReviews,
    scorecards,
    approvals,
    roleTasks,
    notifications,
    privacyRecords,
    accessLogs,
    retentionActions,
    auditEvents,
  };
}

export function getHrTalentRssStore(
  organizationId: string,
): HrTalentRssStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrTalentRssStore(
  organizationId: string,
): HrTalentRssStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function nextHrTalentRssId(
  prefix: string,
  rows: readonly { readonly id: string }[],
) {
  return `${prefix}-${rows.length + 1}`;
}

export function emitHrTalentRssAuditEvent(
  store: HrTalentRssStore,
  input: Omit<HrTalentRssAuditEvent, "id" | "organizationId" | "occurredAt"> & {
    readonly organizationId: string;
    readonly occurredAt?: string;
  },
) {
  const event: HrTalentRssAuditEvent = {
    ...input,
    id: nextHrTalentRssId("rss-audit", store.auditEvents),
    organizationId: input.organizationId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };
  store.auditEvents.unshift(event);
  return event;
}

function maskCandidateProfile(
  row: HrTalentRssCandidateProfileInput,
): HrTalentRssCandidateProfileInput {
  if (row.privacyTier === "standard") return row;
  return {
    ...row,
    displayName: "Restricted candidate",
    email: "restricted-candidate@example.invalid",
    phoneMasked: "Restricted",
  };
}

function maskDocument(
  row: HrTalentRssDocumentSubmissionInput,
): HrTalentRssDocumentSubmissionInput {
  if (row.privacyTier === "standard") return row;
  return {
    ...row,
    title: "Restricted document",
  };
}

function candidateVisible(
  candidateId: string,
  visibleCandidateIds?: readonly string[] | null,
) {
  return !visibleCandidateIds || visibleCandidateIds.includes(candidateId);
}

export function filterHrTalentRssRecordsForAccess(input: {
  readonly store: HrTalentRssStore;
  readonly access: HrTalentRssAccessFilter;
}): HrTalentRssStore {
  const { store, access } = input;
  const visibleCandidateIds =
    access.role === "hr" ||
    access.role === "recruiter" ||
    access.role === "approver" ||
    access.role === "auditor"
      ? access.visibleCandidateIds ?? null
      : access.visibleCandidateIds ?? [];

  const candidateProfiles = store.candidateProfiles
    .filter((row) => candidateVisible(row.id, visibleCandidateIds))
    .map((row) => (access.canReadRestricted ? row : maskCandidateProfile(row)));
  const candidateIds = new Set(candidateProfiles.map((row) => row.id));
  const applicationIds = new Set(
    store.applications
      .filter((row) => candidateIds.has(row.candidateId))
      .map((row) => row.id),
  );

  return {
    candidateProfiles,
    jobPostings: [...store.jobPostings],
    applications: store.applications.filter((row) =>
      candidateIds.has(row.candidateId),
    ),
    documents: store.documents
      .filter((row) => candidateIds.has(row.candidateId))
      .map((row) => (access.canReadRestricted ? row : maskDocument(row))),
    interviews: store.interviews.filter((row) =>
      candidateIds.has(row.candidateId),
    ),
    assessments: store.assessments.filter((row) =>
      candidateIds.has(row.candidateId),
    ),
    preEmploymentForms: store.preEmploymentForms.filter((row) =>
      candidateIds.has(row.candidateId),
    ),
    offers: store.offers.filter((row) => candidateIds.has(row.candidateId)),
    requisitionRequests:
      access.canWrite || access.canApprove
        ? [...store.requisitionRequests]
        : [],
    candidateReviews:
      access.canWrite || access.canApprove
        ? store.candidateReviews.filter((row) =>
            candidateIds.has(row.candidateId),
          )
        : [],
    scorecards:
      access.canWrite || access.canApprove
        ? store.scorecards.filter((row) => applicationIds.has(row.applicationId))
        : [],
    approvals: access.canApprove ? [...store.approvals] : [],
    roleTasks: store.roleTasks.filter(
      (row) =>
        !row.candidateId ||
        candidateIds.has(row.candidateId) ||
        row.ownerUserId === access.actorUserId ||
        access.canApprove,
    ),
    notifications: store.notifications.filter(
      (row) =>
        row.recipientRef === access.actorUserId ||
        access.canWrite ||
        access.canApprove,
    ),
    privacyRecords: access.canReadRestricted
      ? store.privacyRecords.filter((row) => candidateIds.has(row.candidateId))
      : [],
    accessLogs: access.canReadRestricted
      ? store.accessLogs.filter(
          (row) =>
            !row.targetId.includes("candidate") ||
            candidateVisible(row.targetId, visibleCandidateIds),
        )
      : [],
    retentionActions: access.canReadRestricted
      ? store.retentionActions.filter((row) =>
          candidateIds.has(row.candidateId),
        )
      : [],
    auditEvents: store.auditEvents.filter(
      (row) => !row.candidateId || candidateIds.has(row.candidateId),
    ),
  };
}

function groupValue(input: {
  readonly groupBy: HrTalentRssReportGroupBy;
  readonly application: HrTalentRssApplicationInput;
  readonly profile?: HrTalentRssCandidateProfileInput;
  readonly privacy?: HrTalentRssPrivacyRecordInput;
}) {
  switch (input.groupBy) {
    case "role":
      return input.profile?.role ?? "unknown";
    case "status":
      return input.application.status;
    case "stage":
      return input.application.currentStage;
    case "posting":
      return input.application.postingTitle;
    case "privacy":
      return input.profile?.privacyTier ?? "standard";
    case "consent":
      return input.privacy?.consentStatus ?? "not_required";
    case "period":
      return input.application.submittedAt.slice(0, 7);
  }
}

export function buildHrTalentRssReportRows(input: {
  readonly store: HrTalentRssStore;
  readonly groupBy: HrTalentRssReportGroupBy;
}): HrTalentRssReportRow[] {
  const profiles = new Map(input.store.candidateProfiles.map((row) => [row.id, row]));
  const privacy = new Map(input.store.privacyRecords.map((row) => [row.candidateId, row]));
  const groups = new Map<string, HrTalentRssApplicationInput[]>();

  for (const application of input.store.applications) {
    const group = groupValue({
      groupBy: input.groupBy,
      application,
      profile: profiles.get(application.candidateId),
      privacy: privacy.get(application.candidateId),
    });
    groups.set(group, [...(groups.get(group) ?? []), application]);
  }

  return [...groups.entries()].map(([group, rows]) => ({
    id: `rss-report-${input.groupBy}-${group.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    groupBy: input.groupBy,
    group,
    count: rows.length,
    pendingTasks: input.store.roleTasks.filter(
      (task) =>
        task.status !== "completed" &&
        rows.some((row) => row.id === task.applicationId),
    ).length,
    restrictedRecords: rows.filter(
      (row) => profiles.get(row.candidateId)?.privacyTier !== "standard",
    ).length,
    lastActivityAt: rows
      .map((row) => row.submittedAt)
      .sort()
      .at(-1) ?? date(0),
  }));
}

export function listHrTalentRssIntegrationExposures(
  store: HrTalentRssStore,
): HrTalentRssIntegrationExposure[] {
  return [
    ...store.applications.map((row) => ({
      ref: row.applicationRef,
      targetType: "application" as const,
      targetId: row.id,
      summary: `${row.candidateDisplayName} application is ${row.status}.`,
      exposedAt: row.submittedAt,
    })),
    ...store.offers.map((row) => ({
      ref: row.offerRef,
      targetType: "offer" as const,
      targetId: row.id,
      summary: `Offer ${row.offerRef} is ${row.status}.`,
      exposedAt: row.candidateRespondedAt ?? date(0),
    })),
    ...store.privacyRecords.map((row) => ({
      ref: row.retentionPolicyRef,
      targetType: "privacy" as const,
      targetId: row.id,
      summary: `Consent ${row.consentStatus}; retention ${row.retentionStatus}.`,
      exposedAt: row.consentCapturedAt ?? date(0),
    })),
  ];
}
