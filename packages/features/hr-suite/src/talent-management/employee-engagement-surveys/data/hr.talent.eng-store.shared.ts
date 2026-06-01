import type {
  HrTalentEngAuditTargetType,
  HrTalentEngIntegrationExposure,
} from "../contracts/hr.talent.eng.contract";
import {
  hrTalentEngAuditActions,
  type HrTalentEngAuditAction,
} from "../events/hr.talent.eng.event";
import type {
  HrTalentEngAudienceMemberInput,
  HrTalentEngAudienceSegmentInput,
  HrTalentEngBenchmarkInput,
  HrTalentEngCategoryScoreInput,
  HrTalentEngImprovementActionInput,
  HrTalentEngInvitationInput,
  HrTalentEngNotificationInput,
  HrTalentEngOpenTextCommentInput,
  HrTalentEngQuestionScoreInput,
  HrTalentEngSegmentScoreInput,
  HrTalentEngSurveyCycleInput,
  HrTalentEngSurveyInput,
  HrTalentEngSurveyQuestionInput,
  HrTalentEngSurveyResponseInput,
  HrTalentEngSurveyTemplateInput,
} from "../schemas/hr.talent.eng.schema";
import type { HrTalentEngReportGroupBy } from "../schemas/hr.talent.eng-constants.shared";

export type HrTalentEngAuditEvent = {
  readonly id: string;
  readonly organizationId: string;
  readonly action: HrTalentEngAuditAction;
  readonly actorId: string;
  readonly targetType: HrTalentEngAuditTargetType;
  readonly targetId: string;
  readonly summary: string;
  readonly occurredAt: string;
};

export type HrTalentEngReportRow = {
  readonly id: string;
  readonly groupBy: HrTalentEngReportGroupBy;
  readonly group: string;
  readonly surveyCount: number;
  readonly responseRate: string;
  readonly averageScore: string;
  readonly enps: string;
  readonly lowRiskCount: number;
  readonly openActions: number;
  readonly lastActivityAt: string;
  readonly suppressed: boolean;
};

export type HrTalentEngStore = {
  audienceMembers: HrTalentEngAudienceMemberInput[];
  templates: HrTalentEngSurveyTemplateInput[];
  questions: HrTalentEngSurveyQuestionInput[];
  surveys: HrTalentEngSurveyInput[];
  audienceSegments: HrTalentEngAudienceSegmentInput[];
  invitations: HrTalentEngInvitationInput[];
  responses: HrTalentEngSurveyResponseInput[];
  questionScores: HrTalentEngQuestionScoreInput[];
  categoryScores: HrTalentEngCategoryScoreInput[];
  segmentScores: HrTalentEngSegmentScoreInput[];
  openTextComments: HrTalentEngOpenTextCommentInput[];
  benchmarks: HrTalentEngBenchmarkInput[];
  surveyCycles: HrTalentEngSurveyCycleInput[];
  improvementActions: HrTalentEngImprovementActionInput[];
  notifications: HrTalentEngNotificationInput[];
  auditEvents: HrTalentEngAuditEvent[];
};

export type HrTalentEngAccessFilter = {
  readonly actorUserId?: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadRestricted: boolean;
  readonly visibleEmployeeIds?: readonly string[] | null;
};

const stores = new Map<string, HrTalentEngStore>();

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

function createSeedStore(organizationId: string): HrTalentEngStore {
  const audienceMembers = withOrg<HrTalentEngAudienceMemberInput>(
    organizationId,
    [
      {
        id: "eng-employee-1",
        employeeNumber: "EMP-1001",
        displayName: "Nadia Ismail",
        department: "Operations",
        location: "Kuala Lumpur",
        managerUserId: "user_manager_ops",
        managerName: "Hafiz Rahman",
        legalEntity: "Afenda Malaysia",
        grade: "P3",
        tenureBand: "2-5y",
        employmentType: "full_time",
        employeeCategory: "professional",
      },
      {
        id: "eng-employee-2",
        employeeNumber: "EMP-1002",
        displayName: "Victor Tan",
        department: "Retail",
        location: "Johor Bahru",
        managerUserId: "user_manager_retail",
        managerName: "Sarah Lee",
        legalEntity: "Afenda Malaysia",
        grade: "P2",
        tenureBand: "0-1y",
        employmentType: "full_time",
        employeeCategory: "frontline",
      },
      {
        id: "eng-employee-3",
        employeeNumber: "EMP-1003",
        displayName: "Grace Lim",
        department: "Operations",
        location: "Kuala Lumpur",
        managerUserId: "user_manager_ops",
        managerName: "Hafiz Rahman",
        legalEntity: "Afenda Malaysia",
        grade: "P4",
        tenureBand: "5y+",
        employmentType: "full_time",
        employeeCategory: "manager",
      },
    ],
  );

  const templates = withOrg<HrTalentEngSurveyTemplateInput>(organizationId, [
    {
      id: "eng-template-1",
      templateRef: "ENG-TPL-CORE",
      title: "Core engagement and wellbeing template",
      surveyType: "engagement",
      status: "active",
      categories: [
        "leadership",
        "culture",
        "wellbeing",
        "recognition",
        "communication",
        "retention",
      ],
      questionBankSize: 18,
      ownerUserId: "user_hr_partner",
      updatedAt: date(-30),
    },
    {
      id: "eng-template-2",
      templateRef: "ENG-TPL-PULSE",
      title: "Monthly pulse check",
      surveyType: "pulse",
      status: "active",
      categories: ["workload", "wellbeing", "communication"],
      questionBankSize: 8,
      ownerUserId: "user_hr_partner",
      updatedAt: date(-14),
    },
  ]);

  const questions = withOrg<HrTalentEngSurveyQuestionInput>(organizationId, [
    {
      id: "eng-question-1",
      templateId: "eng-template-1",
      questionRef: "ENG-Q-LEAD-01",
      label: "My manager gives clear direction and support.",
      questionType: "rating_scale",
      category: "leadership",
      required: true,
      allowComment: true,
      scaleMin: 1,
      scaleMax: 5,
      options: [],
      scoringWeight: 1,
    },
    {
      id: "eng-question-2",
      templateId: "eng-template-1",
      questionRef: "ENG-Q-WELL-01",
      label: "My workload is sustainable.",
      questionType: "rating_scale",
      category: "workload",
      required: true,
      allowComment: true,
      scaleMin: 1,
      scaleMax: 5,
      options: [],
      scoringWeight: 1,
    },
    {
      id: "eng-question-3",
      templateId: "eng-template-1",
      questionRef: "ENG-Q-RET-01",
      label: "I intend to stay with the organization.",
      questionType: "single_choice",
      category: "retention",
      required: true,
      allowComment: true,
      options: ["Yes", "Unsure", "No"],
      scoringWeight: 1,
    },
    {
      id: "eng-question-4",
      templateId: "eng-template-1",
      questionRef: "ENG-Q-COMMENT-01",
      label: "What one change would most improve your experience?",
      questionType: "open_text",
      category: "culture",
      required: false,
      allowComment: true,
      options: [],
      scoringWeight: 0.2,
    },
  ]);

  const surveys = withOrg<HrTalentEngSurveyInput>(organizationId, [
    {
      id: "eng-survey-1",
      surveyRef: "ENG-2026-Q2",
      title: "Q2 engagement and wellbeing survey",
      surveyType: "engagement",
      templateId: "eng-template-1",
      status: "published",
      anonymityMode: "anonymous",
      minResponseThreshold: 3,
      audienceSummary:
        "All active employees segmented by department, location, manager, grade, tenure, and employee category.",
      openAt: date(-7),
      closeAt: date(14),
      responseDeadlineAt: date(14),
      reminderSchedule: [date(3), date(10)],
      allowDraftResponses: true,
      enableOpenText: true,
      enableEngagementIndex: true,
      enableEnps: true,
      benchmarkLabel: "2026 internal engagement benchmark",
      period: "2026-Q2",
      invitedCount: 20,
      responseCount: 13,
      responseRate: 65,
      engagementIndex: 72,
      enps: 18,
      previousEngagementIndex: 68,
      createdByUserId: "user_hr_partner",
      publishedByUserId: "user_hr_director",
      analyticsGeneratedAt: date(-1),
    },
    {
      id: "eng-survey-2",
      surveyRef: "PULSE-2026-06",
      title: "June workload pulse",
      surveyType: "pulse",
      templateId: "eng-template-2",
      status: "scheduled",
      anonymityMode: "named",
      minResponseThreshold: 3,
      audienceSummary: "Operations and Retail teams.",
      openAt: date(5),
      closeAt: date(12),
      responseDeadlineAt: date(12),
      reminderSchedule: [date(9)],
      allowDraftResponses: true,
      enableOpenText: true,
      enableEngagementIndex: false,
      enableEnps: false,
      period: "2026-06",
      invitedCount: 8,
      responseCount: 0,
      responseRate: 0,
      createdByUserId: "user_hr_partner",
    },
  ]);

  const audienceSegments = withOrg<HrTalentEngAudienceSegmentInput>(
    organizationId,
    [
      {
        id: "eng-segment-1",
        surveyId: "eng-survey-1",
        dimension: "department",
        value: "Operations",
        eligibleCount: 12,
        invitedCount: 12,
        responseCount: 8,
        minThreshold: 3,
      },
      {
        id: "eng-segment-2",
        surveyId: "eng-survey-1",
        dimension: "department",
        value: "Retail",
        eligibleCount: 8,
        invitedCount: 8,
        responseCount: 5,
        minThreshold: 3,
      },
      {
        id: "eng-segment-3",
        surveyId: "eng-survey-1",
        dimension: "manager",
        value: "Sarah Lee",
        eligibleCount: 4,
        invitedCount: 4,
        responseCount: 2,
        minThreshold: 3,
      },
      {
        id: "eng-segment-4",
        surveyId: "eng-survey-2",
        dimension: "department",
        value: "Operations",
        eligibleCount: 5,
        invitedCount: 0,
        responseCount: 0,
        minThreshold: 3,
      },
    ],
  );

  const invitations = withOrg<HrTalentEngInvitationInput>(organizationId, [
    {
      id: "eng-invitation-1",
      surveyId: "eng-survey-1",
      employeeId: "eng-employee-1",
      employeeDisplayName: "Nadia Ismail",
      status: "submitted",
      sentAt: date(-7),
      reminderAt: date(-3),
      responseDeadlineAt: date(14),
      submittedAt: date(-2),
    },
    {
      id: "eng-invitation-2",
      surveyId: "eng-survey-1",
      employeeId: "eng-employee-2",
      employeeDisplayName: "Victor Tan",
      status: "opened",
      sentAt: date(-7),
      reminderAt: date(-3),
      responseDeadlineAt: date(14),
    },
    {
      id: "eng-invitation-3",
      surveyId: "eng-survey-2",
      employeeId: "eng-employee-3",
      employeeDisplayName: "Grace Lim",
      status: "queued",
      responseDeadlineAt: date(12),
    },
  ]);

  const responses = withOrg<HrTalentEngSurveyResponseInput>(organizationId, [
    {
      id: "eng-response-1",
      surveyId: "eng-survey-1",
      invitationId: "eng-invitation-1",
      employeeId: "eng-employee-1",
      status: "submitted",
      anonymous: true,
      scoreAverage: 4.2,
      enpsScore: 9,
      commentCount: 1,
      submittedAt: date(-2),
    },
    {
      id: "eng-response-2",
      surveyId: "eng-survey-1",
      invitationId: "eng-invitation-2",
      employeeId: "eng-employee-2",
      status: "draft",
      anonymous: true,
      scoreAverage: 3.2,
      enpsScore: 6,
      commentCount: 0,
      draftSavedAt: date(-1),
    },
  ]);

  const questionScores = withOrg<HrTalentEngQuestionScoreInput>(
    organizationId,
    [
      {
        id: "eng-question-score-1",
        surveyId: "eng-survey-1",
        questionId: "eng-question-1",
        questionLabel: "My manager gives clear direction and support.",
        category: "leadership",
        averageScore: 3.9,
        responseCount: 13,
        previousScore: 3.6,
        trend: 0.3,
      },
      {
        id: "eng-question-score-2",
        surveyId: "eng-survey-1",
        questionId: "eng-question-2",
        questionLabel: "My workload is sustainable.",
        category: "workload",
        averageScore: 2.8,
        responseCount: 13,
        previousScore: 3.1,
        trend: -0.3,
      },
    ],
  );

  const categoryScores = withOrg<HrTalentEngCategoryScoreInput>(
    organizationId,
    [
      {
        id: "eng-category-score-1",
        surveyId: "eng-survey-1",
        category: "leadership",
        averageScore: 3.9,
        responseCount: 13,
        benchmarkScore: 3.7,
        previousScore: 3.6,
        lowScoring: false,
        trend: 0.3,
      },
      {
        id: "eng-category-score-2",
        surveyId: "eng-survey-1",
        category: "workload",
        averageScore: 2.8,
        responseCount: 13,
        benchmarkScore: 3.5,
        previousScore: 3.1,
        lowScoring: true,
        trend: -0.3,
      },
      {
        id: "eng-category-score-3",
        surveyId: "eng-survey-1",
        category: "retention",
        averageScore: 3.1,
        responseCount: 13,
        benchmarkScore: 3.4,
        previousScore: 3.2,
        lowScoring: true,
        trend: -0.1,
      },
    ],
  );

  const segmentScores = withOrg<HrTalentEngSegmentScoreInput>(
    organizationId,
    [
      {
        id: "eng-segment-score-1",
        surveyId: "eng-survey-1",
        dimension: "department",
        value: "Operations",
        averageScore: 4.1,
        responseCount: 8,
        minThreshold: 3,
        highRisk: false,
      },
      {
        id: "eng-segment-score-2",
        surveyId: "eng-survey-1",
        dimension: "department",
        value: "Retail",
        averageScore: 3.0,
        responseCount: 5,
        minThreshold: 3,
        highRisk: true,
      },
      {
        id: "eng-segment-score-3",
        surveyId: "eng-survey-1",
        dimension: "manager",
        value: "Sarah Lee",
        averageScore: 2.6,
        responseCount: 2,
        minThreshold: 3,
        highRisk: true,
      },
    ],
  );

  const openTextComments = withOrg<HrTalentEngOpenTextCommentInput>(
    organizationId,
    [
      {
        id: "eng-comment-1",
        surveyId: "eng-survey-1",
        category: "workload",
        tag: "workload",
        sentiment: "negative",
        excerpt:
          "Planning changes are frequent and create unsustainable follow-up work.",
        responseCount: 6,
        minThreshold: 3,
        reviewedByUserId: "user_hr_partner",
        taggedAt: date(-1),
      },
      {
        id: "eng-comment-2",
        surveyId: "eng-survey-1",
        category: "retention",
        tag: "retention_risk",
        sentiment: "negative",
        excerpt: "Suppressed seed excerpt for below-threshold bucket.",
        responseCount: 2,
        minThreshold: 3,
      },
    ],
  );

  const benchmarks = withOrg<HrTalentEngBenchmarkInput>(organizationId, [
    {
      id: "eng-benchmark-1",
      surveyId: "eng-survey-1",
      benchmarkType: "internal",
      label: "Q1 2026 internal engagement",
      period: "2026-Q1",
      engagementIndex: 68,
      enps: 12,
      averageScore: 3.5,
    },
    {
      id: "eng-benchmark-2",
      surveyId: "eng-survey-1",
      benchmarkType: "external",
      label: "External APAC services benchmark",
      period: "2026",
      engagementIndex: 70,
      enps: 16,
      averageScore: 3.6,
    },
  ]);

  const surveyCycles = withOrg<HrTalentEngSurveyCycleInput>(
    organizationId,
    [
      {
        id: "eng-cycle-1",
        surveyId: "eng-survey-1",
        cycleRef: "ENG-Q2-2026",
        period: "2026-Q2",
        status: "published",
        engagementIndex: 72,
        enps: 18,
        responseRate: 65,
        trendFromPrevious: 4,
      },
      {
        id: "eng-cycle-2",
        surveyId: "eng-survey-1",
        cycleRef: "ENG-Q1-2026",
        period: "2026-Q1",
        status: "closed",
        engagementIndex: 68,
        enps: 12,
        responseRate: 71,
        closedAt: date(-62),
        trendFromPrevious: -2,
      },
    ],
  );

  const improvementActions = withOrg<HrTalentEngImprovementActionInput>(
    organizationId,
    [
      {
        id: "eng-action-1",
        surveyId: "eng-survey-1",
        actionRef: "ENG-ACT-001",
        title: "Stabilize workload planning cadence",
        sourceCategory: "workload",
        sourceSegment: "Retail",
        ownerUserId: "user_manager_retail",
        ownerName: "Sarah Lee",
        dueAt: date(-1),
        priority: "high",
        status: "overdue",
        progressPercent: 40,
        createdAt: date(-2),
      },
      {
        id: "eng-action-2",
        surveyId: "eng-survey-1",
        actionRef: "ENG-ACT-002",
        title: "Run manager communication roundtables",
        sourceCategory: "communication",
        ownerUserId: "user_hr_partner",
        ownerName: "HR Partner",
        dueAt: date(21),
        priority: "medium",
        status: "in_progress",
        progressPercent: 20,
        createdAt: date(-1),
      },
    ],
  );

  const notifications = withOrg<HrTalentEngNotificationInput>(
    organizationId,
    [
      {
        id: "eng-notification-1",
        surveyId: "eng-survey-1",
        recipientUserId: "eng-employee-2",
        event: "survey_reminder",
        channel: "portal",
        status: "sent",
        message: "Q2 engagement survey reminder sent.",
        sentAt: date(-3),
      },
      {
        id: "eng-notification-2",
        actionId: "eng-action-1",
        recipientUserId: "user_manager_retail",
        event: "action_overdue",
        channel: "email",
        status: "sent",
        message: "Improvement action ENG-ACT-001 is overdue.",
        sentAt: date(0),
      },
    ],
  );

  const auditEvents = withOrg<HrTalentEngAuditEvent>(organizationId, [
    {
      id: "eng-audit-1",
      action: hrTalentEngAuditActions.surveyCreated,
      actorId: "user_hr_partner",
      targetType: "survey",
      targetId: "eng-survey-1",
      summary: "Survey ENG-2026-Q2 created from template ENG-TPL-CORE.",
      occurredAt: date(-8),
    },
    {
      id: "eng-audit-2",
      action: hrTalentEngAuditActions.surveyPublished,
      actorId: "user_hr_director",
      targetType: "survey",
      targetId: "eng-survey-1",
      summary: "Survey ENG-2026-Q2 published to 20 employees.",
      occurredAt: date(-7),
    },
    {
      id: "eng-audit-3",
      action: hrTalentEngAuditActions.responseSubmitted,
      actorId: "anonymous",
      targetType: "response",
      targetId: "eng-response-1",
      summary: "Anonymous response submitted for ENG-2026-Q2.",
      occurredAt: date(-2),
    },
    {
      id: "eng-audit-4",
      action: hrTalentEngAuditActions.analyticsGenerated,
      actorId: "user_hr_partner",
      targetType: "analytics",
      targetId: "eng-survey-1",
      summary: "Analytics generated with anonymous threshold enforcement.",
      occurredAt: date(-1),
    },
  ]);

  return {
    audienceMembers,
    templates,
    questions,
    surveys,
    audienceSegments,
    invitations,
    responses,
    questionScores,
    categoryScores,
    segmentScores,
    openTextComments,
    benchmarks,
    surveyCycles,
    improvementActions,
    notifications,
    auditEvents,
  };
}

export function getHrTalentEngStore(organizationId: string): HrTalentEngStore {
  const existing = stores.get(organizationId);
  if (existing) return existing;
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function resetHrTalentEngStore(
  organizationId: string,
): HrTalentEngStore {
  const store = createSeedStore(organizationId);
  stores.set(organizationId, store);
  return store;
}

export function nextHrTalentEngId(
  prefix: string,
  rows: readonly { readonly id: string }[],
) {
  return `${prefix}-${rows.length + 1}`;
}

export function emitHrTalentEngAuditEvent(
  store: HrTalentEngStore,
  input: Omit<HrTalentEngAuditEvent, "id" | "organizationId" | "occurredAt"> & {
    readonly organizationId: string;
    readonly occurredAt?: string;
  },
) {
  const event: HrTalentEngAuditEvent = {
    ...input,
    id: nextHrTalentEngId("eng-audit", store.auditEvents),
    organizationId: input.organizationId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };
  store.auditEvents.unshift(event);
  return event;
}

export function shouldSuppressHrTalentEngAnonymousBucket(input: {
  readonly totalResponses: number;
  readonly bucketResponses: number;
  readonly minThreshold: number;
}) {
  return (
    input.bucketResponses < input.minThreshold ||
    input.totalResponses - input.bucketResponses < input.minThreshold
  );
}

function surveyById(store: HrTalentEngStore) {
  return new Map(store.surveys.map((survey) => [survey.id, survey]));
}

function employeeVisible(
  employeeId: string,
  visibleIds: ReadonlySet<string> | null,
) {
  return visibleIds === null || visibleIds.has(employeeId);
}

function buildVisibleEmployeeSet(input: {
  readonly access: HrTalentEngAccessFilter;
  readonly members: readonly HrTalentEngAudienceMemberInput[];
}) {
  if (input.access.canWrite || input.access.canApprove || input.access.canReadRestricted) {
    return input.access.visibleEmployeeIds
      ? new Set(input.access.visibleEmployeeIds)
      : null;
  }
  const explicit = input.access.visibleEmployeeIds;
  if (explicit) return new Set(explicit);
  if (!input.access.actorUserId) return new Set<string>();
  return new Set(
    input.members
      .filter(
        (row) =>
          row.id === input.access.actorUserId ||
          row.employeeNumber === input.access.actorUserId,
      )
      .map((row) => row.id),
  );
}

function sanitizeInvitation(
  invitation: HrTalentEngInvitationInput,
  survey: HrTalentEngSurveyInput | undefined,
): HrTalentEngInvitationInput {
  if (survey?.anonymityMode !== "anonymous") return invitation;
  return {
    ...invitation,
    employeeDisplayName: "Anonymous audience member",
    employeeId: "anonymous",
    submittedAt: undefined,
  };
}

function sanitizeResponse(
  response: HrTalentEngSurveyResponseInput,
  survey: HrTalentEngSurveyInput | undefined,
): HrTalentEngSurveyResponseInput {
  if (survey?.anonymityMode !== "anonymous") return response;
  return {
    ...response,
    employeeId: "anonymous",
    invitationId: "anonymous",
  };
}

function sanitizeComment(
  comment: HrTalentEngOpenTextCommentInput,
  survey: HrTalentEngSurveyInput | undefined,
): HrTalentEngOpenTextCommentInput {
  if (survey?.anonymityMode !== "anonymous") return comment;
  const suppressed = shouldSuppressHrTalentEngAnonymousBucket({
    totalResponses: survey.responseCount,
    bucketResponses: comment.responseCount,
    minThreshold: comment.minThreshold,
  });
  return suppressed
    ? {
        ...comment,
        excerpt: "Suppressed anonymous comment bucket",
        tag: "unclassified",
      }
    : comment;
}

export function filterHrTalentEngRecordsForAccess(input: {
  readonly store: HrTalentEngStore;
  readonly access: HrTalentEngAccessFilter;
}): HrTalentEngStore {
  const { store, access } = input;
  const surveyMap = surveyById(store);
  const visibleIds = buildVisibleEmployeeSet({
    access,
    members: store.audienceMembers,
  });
  const canManage = access.canWrite || access.canApprove;

  const invitations = (canManage ? store.invitations : store.invitations.filter((row) =>
    employeeVisible(row.employeeId, visibleIds),
  )).map((row) => sanitizeInvitation(row, surveyMap.get(row.surveyId)));

  const responses = (canManage ? store.responses : store.responses.filter((row) =>
    employeeVisible(row.employeeId, visibleIds),
  )).map((row) => sanitizeResponse(row, surveyMap.get(row.surveyId)));

  return {
    audienceMembers: canManage
      ? [...store.audienceMembers]
      : store.audienceMembers.filter((row) => employeeVisible(row.id, visibleIds)),
    templates: [...store.templates],
    questions: [...store.questions],
    surveys: [...store.surveys],
    audienceSegments: [...store.audienceSegments],
    invitations,
    responses,
    questionScores: [...store.questionScores],
    categoryScores: [...store.categoryScores],
    segmentScores: [...store.segmentScores],
    openTextComments: access.canReadRestricted
      ? store.openTextComments.map((row) =>
          sanitizeComment(row, surveyMap.get(row.surveyId)),
        )
      : [],
    benchmarks: [...store.benchmarks],
    surveyCycles: [...store.surveyCycles],
    improvementActions: [...store.improvementActions],
    notifications:
      canManage || access.canReadRestricted
        ? [...store.notifications]
        : store.notifications.filter((row) =>
            employeeVisible(row.recipientUserId, visibleIds),
          ),
    auditEvents: [...store.auditEvents],
  };
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function average(values: readonly number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function reportRowsFromSurveys(input: {
  readonly store: HrTalentEngStore;
  readonly groupBy: HrTalentEngReportGroupBy;
}): HrTalentEngReportRow[] {
  const groups = new Map<string, HrTalentEngSurveyInput[]>();
  for (const survey of input.store.surveys) {
    const group = input.groupBy === "period" ? survey.period : survey.title;
    groups.set(group, [...(groups.get(group) ?? []), survey]);
  }

  return [...groups.entries()].map(([group, rows]) => ({
    id: `eng-report-${input.groupBy}-${group.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    groupBy: input.groupBy,
    group,
    surveyCount: rows.length,
    responseRate: `${formatNumber(average(rows.map((row) => row.responseRate)))}%`,
    averageScore: `${formatNumber(average(rows.map((row) => (row.engagementIndex ?? 0) / 20)))}/5`,
    enps: formatNumber(average(rows.map((row) => row.enps ?? 0))),
    lowRiskCount: input.store.categoryScores.filter(
      (scoreRow) =>
        rows.some((survey) => survey.id === scoreRow.surveyId) &&
        scoreRow.lowScoring,
    ).length,
    openActions: input.store.improvementActions.filter(
      (action) =>
        rows.some((survey) => survey.id === action.surveyId) &&
        action.status !== "completed",
    ).length,
    lastActivityAt:
      rows
        .map((row) => row.analyticsGeneratedAt ?? row.closeAt)
        .sort()
        .at(-1) ?? date(0),
    suppressed: false,
  }));
}

export function buildHrTalentEngReportRows(input: {
  readonly store: HrTalentEngStore;
  readonly groupBy: HrTalentEngReportGroupBy;
}): HrTalentEngReportRow[] {
  if (input.groupBy === "survey" || input.groupBy === "period") {
    return reportRowsFromSurveys(input);
  }

  if (input.groupBy === "category") {
    const groups = new Map<string, HrTalentEngCategoryScoreInput[]>();
    for (const row of input.store.categoryScores) {
      groups.set(row.category, [...(groups.get(row.category) ?? []), row]);
    }
    return [...groups.entries()].map(([group, rows]) => ({
      id: `eng-report-category-${group}`,
      groupBy: input.groupBy,
      group,
      surveyCount: new Set(rows.map((row) => row.surveyId)).size,
      responseRate: "See survey",
      averageScore: `${formatNumber(average(rows.map((row) => row.averageScore)))}/5`,
      enps: "See survey",
      lowRiskCount: rows.filter((row) => row.lowScoring).length,
      openActions: input.store.improvementActions.filter(
        (action) => action.sourceCategory === group && action.status !== "completed",
      ).length,
      lastActivityAt: date(0),
      suppressed: false,
    }));
  }

  const dimension =
    input.groupBy === "department" ||
    input.groupBy === "location" ||
    input.groupBy === "manager"
      ? input.groupBy
      : "department";
  const surveys = surveyById(input.store);
  return input.store.segmentScores
    .filter((row) => row.dimension === dimension)
    .map((row) => {
      const survey = surveys.get(row.surveyId);
      const suppressed =
        survey?.anonymityMode === "anonymous" &&
        shouldSuppressHrTalentEngAnonymousBucket({
          totalResponses: survey.responseCount,
          bucketResponses: row.responseCount,
          minThreshold: row.minThreshold,
        });
      return {
        id: `eng-report-${dimension}-${row.id}`,
        groupBy: input.groupBy,
        group: suppressed ? "Suppressed anonymous segment" : row.value,
        surveyCount: 1,
        responseRate: suppressed ? "Suppressed" : "See completion",
        averageScore: suppressed ? "Suppressed" : `${formatNumber(row.averageScore)}/5`,
        enps: "See survey",
        lowRiskCount: row.highRisk && !suppressed ? 1 : 0,
        openActions: suppressed
          ? 0
          : input.store.improvementActions.filter(
              (action) =>
                action.sourceSegment === row.value && action.status !== "completed",
            ).length,
        lastActivityAt: survey?.analyticsGeneratedAt ?? date(0),
        suppressed,
      };
    });
}

export function listHrTalentEngIntegrationExposures(
  store: HrTalentEngStore,
): HrTalentEngIntegrationExposure[] {
  return [
    ...store.surveys.map((row) => ({
      ref: row.surveyRef,
      targetType: "survey" as const,
      targetId: row.id,
      summary: `${row.title} is ${row.status} with ${row.responseRate}% response rate.`,
      exposedAt: row.analyticsGeneratedAt ?? row.closeAt,
    })),
    ...store.improvementActions.map((row) => ({
      ref: row.actionRef,
      targetType: "improvement_action" as const,
      targetId: row.id,
      summary: `${row.title} is ${row.status}.`,
      exposedAt: row.completedAt ?? row.createdAt,
    })),
  ];
}
