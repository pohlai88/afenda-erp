import {
  HR_PER_MANDATORY_SECTIONS,
  type HrPerAccessRole,
  type HrPerApprovalRole,
  type HrPerMandatorySection,
  type HrPerNotificationEvent,
  type HrPerRecommendationType,
  type HrPerReportGroupBy,
  type HrPerReviewStatus,
} from "./hr.talent.performance-constants.shared";
import {
  hrPerCycleSchema,
  hrPerGoalSchema,
  type HrPerCycleInput,
  type HrPerEmployeeProfileInput,
  type HrPerGoalInput,
  type HrPerReviewAssignmentInput,
} from "./hr.talent.performance.schema";
import {
  hrTalentPerformanceAuditActions,
  type HrTalentPerformanceAuditAction,
} from "./hr.talent.performance.event";

const DAY_MS = 24 * 60 * 60 * 1000;

export const HR_PER_DEFAULT_RATING_SCALE = [
  { rating: 1, code: "needs_improvement", label: "Needs improvement" },
  { rating: 2, code: "partially_meets", label: "Partially meets" },
  { rating: 3, code: "meets_expectations", label: "Meets expectations" },
  { rating: 4, code: "exceeds_expectations", label: "Exceeds expectations" },
  { rating: 5, code: "exceptional", label: "Exceptional" },
] as const;

export type HrPerformanceWeightedItem = {
  id: string;
  weight: number;
  rating: number;
};

export type HrPerformanceReviewRecord = HrPerReviewAssignmentInput & {
  goals: HrPerGoalInput[];
  selfAssessment?: {
    selfRating: number;
    comments: string;
    submittedAt: string;
  };
  managerEvaluation?: {
    managerRating: number;
    comments: string;
    performanceSummary: string;
    recommendations: HrPerRecommendationType[];
    submittedAt: string;
  };
  competencyAssessments: HrPerformanceWeightedItem[];
  kpiAssessments: Array<
    HrPerformanceWeightedItem & {
      target: string;
      result: string;
      achievementPercent: number;
    }
  >;
  meeting?: {
    discussionDate: string;
    notes: string;
  };
  hrReviewSubmittedAt: string | null;
  calibrationReference: string | null;
  approvalWorkflow: HrPerformanceApprovalStep[];
  outcome?: HrPerformanceOutcomeRecord;
};

export type HrPerformanceOutcomeRecord = {
  reviewId: string;
  finalRating: number;
  performanceCategory: string;
  promotionRecommended: boolean;
  compensationReviewRecommended: boolean;
  performanceImprovementRequired: boolean;
  developmentActions: string[];
  finalizedAt: string | null;
};

export type HrPerformanceApprovalStep = {
  id: string;
  reviewId: string;
  role: HrPerApprovalRole;
  sequence: number;
  status: "pending" | "approved" | "returned" | "acknowledged";
  required: boolean;
  decidedAt: string | null;
};

export type HrPerformanceAuditEvent = {
  id: string;
  organizationId: string;
  reviewId?: string;
  action: HrTalentPerformanceAuditAction;
  actorId: string;
  occurredAt: string;
  summary: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type HrPerformanceNotification = {
  id: string;
  reviewId: string;
  event: HrPerNotificationEvent;
  recipientRole: HrPerAccessRole | "approver";
  recipientId: string;
  sentAt: string;
};

export type HrPerformanceStore = {
  cycles: HrPerCycleInput[];
  employees: HrPerEmployeeProfileInput[];
  reviews: HrPerformanceReviewRecord[];
  notifications: HrPerformanceNotification[];
  auditEvents: HrPerformanceAuditEvent[];
};

export type HrPerformanceAccessContext = {
  role: HrPerAccessRole;
  actorEmployeeId?: string | null;
  managedEmployeeIds?: readonly string[];
  canReadRestricted?: boolean;
  canReadCompensationOutcome?: boolean;
};

export type HrPerformanceReportRow = {
  id: string;
  groupBy: HrPerReportGroupBy;
  groupKey: string;
  groupLabel: string;
  reviewCount: number;
  finalizedCount: number;
  overdueCount: number;
  averageFinalRating: number | null;
};

export type HrPerformanceReportFilter = {
  employeeId?: string | null;
  managerEmployeeId?: string | null;
  departmentId?: string | null;
  legalEntityCode?: string | null;
  cycleId?: string | null;
  rating?: number | null;
  completionStatus?: HrPerReviewStatus | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  groupBy: HrPerReportGroupBy;
};

export type HrPerformanceOutcomeRef = {
  organizationId: string;
  employeeId: string;
  appraisalId: string;
  reviewCycleId: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  finalizedAt: string;
  finalRatingNumeric: number;
  finalRatingCode: string;
  finalRatingLabel: string;
  performanceOutcomeCode: string;
  managerRecommendationKinds: readonly HrPerRecommendationType[];
};

const stores = new Map<string, HrPerformanceStore>();

function dateOnly(value: string) {
  return value.slice(0, 10);
}

function daysBetween(startDate: string, endDate: string) {
  return Math.floor((Date.parse(endDate) - Date.parse(startDate)) / DAY_MS);
}

function includesOrAll(values: readonly string[], candidate: string) {
  return values.length === 0 || values.includes(candidate);
}

function formatRatingLabel(rating: number) {
  const scale = HR_PER_DEFAULT_RATING_SCALE.find((entry) => entry.rating === rating);
  if (!scale) {
    throw new Error(`Unknown performance rating: ${rating}`);
  }
  return scale;
}

export function createHrPerformanceCycle(
  input: HrPerCycleInput,
): HrPerCycleInput {
  return hrPerCycleSchema.parse(input);
}

export function isEmployeeEligibleForPerformanceCycle(input: {
  cycle: HrPerCycleInput;
  employee: HrPerEmployeeProfileInput;
  asOfDate: string;
}): boolean {
  const eligibility = input.cycle.eligibility;
  const tenureDays = daysBetween(input.employee.hireDate, input.asOfDate);

  return (
    includesOrAll(eligibility.employmentStatuses, input.employee.employmentStatus) &&
    tenureDays >= eligibility.minTenureDays &&
    includesOrAll(eligibility.departmentIds, input.employee.departmentId) &&
    includesOrAll(eligibility.grades, input.employee.grade) &&
    includesOrAll(eligibility.roleIds, input.employee.roleId) &&
    includesOrAll(eligibility.legalEntityCodes, input.employee.legalEntityCode) &&
    includesOrAll(eligibility.employeeCategories, input.employee.employeeCategory)
  );
}

export function assignEligibleEmployeesToPerformanceCycle(input: {
  cycle: HrPerCycleInput;
  employees: readonly HrPerEmployeeProfileInput[];
  asOfDate?: string;
}): HrPerformanceReviewRecord[] {
  const asOfDate = input.asOfDate ?? input.cycle.reviewStartDate;
  return input.employees
    .filter((employee) =>
      isEmployeeEligibleForPerformanceCycle({
        cycle: input.cycle,
        employee,
        asOfDate,
      }),
    )
    .map((employee) => ({
      id: `${input.cycle.id}:${employee.employeeId}`,
      organizationId: input.cycle.organizationId,
      cycleId: input.cycle.id,
      employeeId: employee.employeeId,
      employeeDisplayName: employee.employeeDisplayName,
      managerEmployeeId: employee.managerEmployeeId,
      managerDisplayName: employee.managerEmployeeId
        ? input.employees.find(
            (candidate) => candidate.employeeId === employee.managerEmployeeId,
          )?.employeeDisplayName ?? employee.managerEmployeeId
        : null,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
      legalEntityCode: employee.legalEntityCode,
      status: "pending",
      assignedAt: `${input.cycle.reviewStartDate}T00:00:00.000Z`,
      submittedAt: null,
      finalizedAt: null,
      acknowledgedAt: null,
      lockedAt: null,
      goals: [],
      competencyAssessments: [],
      kpiAssessments: [],
      hrReviewSubmittedAt: null,
      calibrationReference: null,
      approvalWorkflow: resolvePerformanceApprovalWorkflow({
        reviewId: `${input.cycle.id}:${employee.employeeId}`,
        requiresHrReview: input.cycle.requiresHrReview,
        calibrationEnabled: input.cycle.calibrationEnabled,
      }),
    }));
}

export function createPerformanceGoal(input: HrPerGoalInput): HrPerGoalInput {
  return hrPerGoalSchema.parse(input);
}

export function assertGoalWeightsWithinPolicy(
  goals: readonly Pick<HrPerGoalInput, "weight" | "status">[],
) {
  const activeWeight = goals
    .filter((goal) => goal.status !== "cancelled")
    .reduce((sum, goal) => sum + goal.weight, 0);

  if (activeWeight > 100) {
    throw new Error("Performance goal weights must not exceed 100%.");
  }
}

export function updatePerformanceGoalProgress(
  goal: HrPerGoalInput,
  progressPercent: number,
  achievementResult: number | null,
): HrPerGoalInput {
  return createPerformanceGoal({
    ...goal,
    progressPercent,
    achievementResult,
    status: progressPercent >= 100 ? "completed" : "in_progress",
  });
}

export function submitSelfAssessment(
  review: HrPerformanceReviewRecord,
  input: {
    selfRating: number;
    comments: string;
    submittedAt: string;
  },
): HrPerformanceReviewRecord {
  assertPerformanceReviewEditable(review);
  return {
    ...review,
    status: "manager_evaluation",
    selfAssessment: input,
    submittedAt: input.submittedAt,
  };
}

export function submitManagerEvaluation(
  review: HrPerformanceReviewRecord,
  input: {
    managerRating: number;
    comments: string;
    performanceSummary: string;
    recommendations: readonly HrPerRecommendationType[];
    submittedAt: string;
  },
): HrPerformanceReviewRecord {
  assertPerformanceReviewEditable(review);
  return {
    ...review,
    status: "hr_review",
    managerEvaluation: {
      ...input,
      recommendations: [...input.recommendations],
    },
    submittedAt: input.submittedAt,
  };
}

export function calculateWeightedAssessmentScore(
  items: readonly HrPerformanceWeightedItem[],
): number | null {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (items.length === 0 || totalWeight <= 0) {
    return null;
  }

  const weighted = items.reduce(
    (sum, item) => sum + item.rating * item.weight,
    0,
  );
  return Number((weighted / totalWeight).toFixed(2));
}

function calculateGoalScore(goals: readonly HrPerGoalInput[]): number | null {
  const scorableGoals = goals.filter(
    (goal) => goal.status !== "cancelled" && goal.achievementResult != null,
  );
  const totalWeight = scorableGoals.reduce((sum, goal) => sum + goal.weight, 0);
  if (scorableGoals.length === 0 || totalWeight <= 0) {
    return null;
  }

  const weighted = scorableGoals.reduce((sum, goal) => {
    const rating = Math.min(goal.achievementResult ?? 0, 150) / 30;
    return sum + rating * goal.weight;
  }, 0);

  return Number((weighted / totalWeight).toFixed(2));
}

export function calculateWeightedPerformanceScore(input: {
  goals: readonly HrPerGoalInput[];
  competencies: readonly HrPerformanceWeightedItem[];
  kpis: readonly HrPerformanceWeightedItem[];
  sectionWeights?: {
    goals?: number;
    competencies?: number;
    kpis?: number;
    manager?: number;
  };
  managerRating?: number | null;
}): number | null {
  const sections = [
    {
      weight: input.sectionWeights?.goals ?? 40,
      score: calculateGoalScore(input.goals),
    },
    {
      weight: input.sectionWeights?.competencies ?? 20,
      score: calculateWeightedAssessmentScore(input.competencies),
    },
    {
      weight: input.sectionWeights?.kpis ?? 30,
      score: calculateWeightedAssessmentScore(input.kpis),
    },
    {
      weight: input.sectionWeights?.manager ?? 10,
      score: input.managerRating ?? null,
    },
  ].filter((section) => section.score != null && section.weight > 0);

  const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }

  const weighted = sections.reduce(
    (sum, section) => sum + (section.score ?? 0) * section.weight,
    0,
  );
  return Number((weighted / totalWeight).toFixed(2));
}

export function recordPerformanceMeeting(
  review: HrPerformanceReviewRecord,
  meeting: { discussionDate: string; notes: string },
): HrPerformanceReviewRecord {
  assertPerformanceReviewEditable(review);
  return { ...review, meeting };
}

export function recordCalibrationReference(
  review: HrPerformanceReviewRecord,
  calibrationReference: string,
): HrPerformanceReviewRecord {
  assertPerformanceReviewEditable(review);
  return {
    ...review,
    status: "calibration",
    calibrationReference,
  };
}

export function resolvePerformanceApprovalWorkflow(input: {
  reviewId: string;
  requiresHrReview: boolean;
  calibrationEnabled: boolean;
}): HrPerformanceApprovalStep[] {
  const roles: HrPerApprovalRole[] = [
    "manager",
    ...(input.requiresHrReview ? (["hr"] as const) : []),
    ...(input.calibrationEnabled ? (["calibration_panel"] as const) : []),
    "final_approver",
  ];

  return roles.map((role, index) => ({
    id: `${input.reviewId}:approval:${role}`,
    reviewId: input.reviewId,
    role,
    sequence: index + 1,
    status: "pending",
    required: true,
    decidedAt: null,
  }));
}

export function getPerformanceFinalizationBlockers(input: {
  cycle: Pick<
    HrPerCycleInput,
    "mandatorySections" | "requiresHrReview" | "calibrationEnabled"
  >;
  review: HrPerformanceReviewRecord;
}): HrPerMandatorySection[] {
  const blockers = new Set<HrPerMandatorySection>();

  for (const section of input.cycle.mandatorySections) {
    if (section === "goals" && input.review.goals.length === 0) {
      blockers.add(section);
    }
    if (section === "self_assessment" && !input.review.selfAssessment) {
      blockers.add(section);
    }
    if (section === "manager_evaluation" && !input.review.managerEvaluation) {
      blockers.add(section);
    }
    if (
      section === "competency_assessment" &&
      input.review.competencyAssessments.length === 0
    ) {
      blockers.add(section);
    }
    if (section === "kpi_assessment" && input.review.kpiAssessments.length === 0) {
      blockers.add(section);
    }
    if (section === "meeting" && !input.review.meeting) {
      blockers.add(section);
    }
    if (section === "hr_review" && !input.review.hrReviewSubmittedAt) {
      blockers.add(section);
    }
    if (section === "calibration" && !input.review.calibrationReference) {
      blockers.add(section);
    }
    if (section === "acknowledgment" && !input.review.acknowledgedAt) {
      blockers.add(section);
    }
  }

  if (input.cycle.requiresHrReview && !input.review.hrReviewSubmittedAt) {
    blockers.add("hr_review");
  }
  if (input.cycle.calibrationEnabled && !input.review.calibrationReference) {
    blockers.add("calibration");
  }

  const hasOpenApproval = input.review.approvalWorkflow.some(
    (step) => step.required && step.status !== "approved",
  );
  if (hasOpenApproval) {
    blockers.add("hr_review");
  }
  if (!input.review.outcome) {
    blockers.add("manager_evaluation");
  }

  return HR_PER_MANDATORY_SECTIONS.filter((section) => blockers.has(section));
}

export function isPerformanceReviewLocked(
  review: Pick<HrPerformanceReviewRecord, "status" | "lockedAt">,
): boolean {
  return (
    review.lockedAt != null ||
    review.status === "finalized" ||
    review.status === "acknowledged"
  );
}

export function assertPerformanceReviewEditable(
  review: Pick<HrPerformanceReviewRecord, "status" | "lockedAt">,
) {
  if (isPerformanceReviewLocked(review)) {
    throw new Error("Finalized performance reviews are locked from normal editing.");
  }
}

export function finalizePerformanceReview(input: {
  cycle: HrPerCycleInput;
  review: HrPerformanceReviewRecord;
  finalizedAt: string;
}): HrPerformanceReviewRecord {
  const blockers = getPerformanceFinalizationBlockers(input);
  if (blockers.length > 0) {
    throw new Error(`Performance review cannot be finalized: ${blockers.join(", ")}`);
  }

  return {
    ...input.review,
    status: "finalized",
    finalizedAt: input.finalizedAt,
    lockedAt: input.finalizedAt,
    outcome: input.review.outcome
      ? { ...input.review.outcome, finalizedAt: input.finalizedAt }
      : undefined,
  };
}

export function acknowledgePerformanceReview(
  review: HrPerformanceReviewRecord,
  acknowledgedAt: string,
): HrPerformanceReviewRecord {
  if (review.status !== "finalized" && review.status !== "acknowledged") {
    throw new Error("Only finalized performance reviews can be acknowledged.");
  }

  return {
    ...review,
    status: "acknowledged",
    acknowledgedAt,
  };
}

export function listPerformanceHistoryByEmployee(input: {
  reviews: readonly HrPerformanceReviewRecord[];
  employeeId: string;
  cycleId?: string | null;
}) {
  return input.reviews.filter(
    (review) =>
      review.employeeId === input.employeeId &&
      (!input.cycleId || review.cycleId === input.cycleId),
  );
}

export function buildPerformanceOutcomeReference(input: {
  cycle: HrPerCycleInput;
  review: HrPerformanceReviewRecord;
  authorized: boolean;
}): HrPerformanceOutcomeRef | null {
  if (!input.authorized || !input.review.outcome || !input.review.finalizedAt) {
    return null;
  }

  const rating = formatRatingLabel(input.review.outcome.finalRating);
  return {
    organizationId: input.review.organizationId,
    employeeId: input.review.employeeId,
    appraisalId: input.review.id,
    reviewCycleId: input.review.cycleId,
    reviewPeriodStart: input.cycle.periodStart,
    reviewPeriodEnd: input.cycle.periodEnd,
    finalizedAt: input.review.finalizedAt,
    finalRatingNumeric: input.review.outcome.finalRating,
    finalRatingCode: rating.code,
    finalRatingLabel: rating.label,
    performanceOutcomeCode: input.review.outcome.performanceCategory,
    managerRecommendationKinds:
      input.review.managerEvaluation?.recommendations ?? [],
  };
}

export function buildPerformanceNotifications(input: {
  review: HrPerformanceReviewRecord;
  event: HrPerNotificationEvent;
  hrRecipientIds?: readonly string[];
  approverIds?: readonly string[];
  sentAt: string;
}): HrPerformanceNotification[] {
  const recipients: Array<{ role: HrPerformanceNotification["recipientRole"]; id: string | null }> =
    [];

  if (["pending", "returned", "overdue", "finalized"].includes(input.event)) {
    recipients.push({ role: "employee", id: input.review.employeeId });
  }
  if (
    ["pending", "submitted", "overdue", "acknowledged", "finalized"].includes(
      input.event,
    )
  ) {
    recipients.push({ role: "manager", id: input.review.managerEmployeeId });
  }
  if (
    ["submitted", "returned", "overdue", "acknowledged", "finalized"].includes(
      input.event,
    )
  ) {
    for (const id of input.hrRecipientIds ?? []) {
      recipients.push({ role: "hr", id });
    }
  }
  if (["submitted", "returned", "overdue"].includes(input.event)) {
    for (const id of input.approverIds ?? []) {
      recipients.push({ role: "approver", id });
    }
  }

  return recipients
    .filter((recipient): recipient is { role: HrPerformanceNotification["recipientRole"]; id: string } =>
      Boolean(recipient.id),
    )
    .map((recipient, index) => ({
      id: `${input.review.id}:${input.event}:${recipient.role}:${index}`,
      reviewId: input.review.id,
      event: input.event,
      recipientRole: recipient.role,
      recipientId: recipient.id,
      sentAt: input.sentAt,
    }));
}

export function filterPerformanceReviewsForAccess(input: {
  reviews: readonly HrPerformanceReviewRecord[];
  access: HrPerformanceAccessContext;
}): HrPerformanceReviewRecord[] {
  const managed = new Set(input.access.managedEmployeeIds ?? []);

  return input.reviews.filter((review) => {
    if (input.access.role === "employee") {
      return review.employeeId === input.access.actorEmployeeId;
    }
    if (input.access.role === "manager") {
      return managed.has(review.employeeId);
    }
    if (input.access.role === "compensation") {
      return (
        input.access.canReadCompensationOutcome === true &&
        (review.status === "finalized" || review.status === "acknowledged")
      );
    }
    if (input.access.role === "auditor") {
      return input.access.canReadRestricted === true;
    }
    return input.access.canReadRestricted !== false;
  });
}

function resolveReportGroup(input: {
  review: HrPerformanceReviewRecord;
  cycle: HrPerCycleInput;
  groupBy: HrPerReportGroupBy;
}) {
  switch (input.groupBy) {
    case "employee":
      return { key: input.review.employeeId, label: input.review.employeeDisplayName };
    case "manager":
      return {
        key: input.review.managerEmployeeId ?? "unassigned",
        label: input.review.managerDisplayName ?? "Unassigned",
      };
    case "department":
      return { key: input.review.departmentId, label: input.review.departmentName };
    case "legal_entity":
      return { key: input.review.legalEntityCode, label: input.review.legalEntityCode };
    case "cycle":
      return { key: input.cycle.id, label: input.cycle.name };
    case "rating": {
      const rating = input.review.outcome?.finalRating;
      return {
        key: rating == null ? "unrated" : String(rating),
        label: rating == null ? "Unrated" : formatRatingLabel(rating).label,
      };
    }
    case "completion_status":
      return { key: input.review.status, label: input.review.status };
    case "period":
      return {
        key: `${input.cycle.periodStart}:${input.cycle.periodEnd}`,
        label: `${input.cycle.periodStart} to ${input.cycle.periodEnd}`,
      };
    default:
      return { key: input.review.departmentId, label: input.review.departmentName };
  }
}

export function buildPerformanceReportRows(input: {
  cycles: readonly HrPerCycleInput[];
  reviews: readonly HrPerformanceReviewRecord[];
  filter: HrPerformanceReportFilter;
  now?: string;
}): HrPerformanceReportRow[] {
  const cycleById = new Map(input.cycles.map((cycle) => [cycle.id, cycle]));
  const nowDate = input.now ? Date.parse(input.now) : Date.now();
  const grouped = new Map<
    string,
    {
      groupKey: string;
      groupLabel: string;
      reviews: HrPerformanceReviewRecord[];
    }
  >();

  for (const review of input.reviews) {
    const cycle = cycleById.get(review.cycleId);
    if (!cycle) continue;

    if (input.filter.employeeId && review.employeeId !== input.filter.employeeId) {
      continue;
    }
    if (
      input.filter.managerEmployeeId &&
      review.managerEmployeeId !== input.filter.managerEmployeeId
    ) {
      continue;
    }
    if (input.filter.departmentId && review.departmentId !== input.filter.departmentId) {
      continue;
    }
    if (
      input.filter.legalEntityCode &&
      review.legalEntityCode !== input.filter.legalEntityCode
    ) {
      continue;
    }
    if (input.filter.cycleId && review.cycleId !== input.filter.cycleId) {
      continue;
    }
    if (input.filter.rating && review.outcome?.finalRating !== input.filter.rating) {
      continue;
    }
    if (
      input.filter.completionStatus &&
      review.status !== input.filter.completionStatus
    ) {
      continue;
    }
    if (
      input.filter.periodStart &&
      Date.parse(cycle.periodStart) < Date.parse(input.filter.periodStart)
    ) {
      continue;
    }
    if (
      input.filter.periodEnd &&
      Date.parse(cycle.periodEnd) > Date.parse(input.filter.periodEnd)
    ) {
      continue;
    }

    const group = resolveReportGroup({
      review,
      cycle,
      groupBy: input.filter.groupBy,
    });
    const bucket = grouped.get(group.key) ?? {
      groupKey: group.key,
      groupLabel: group.label,
      reviews: [],
    };
    bucket.reviews.push(review);
    grouped.set(group.key, bucket);
  }

  return [...grouped.values()].map((bucket) => {
    const finalized = bucket.reviews.filter(
      (review) => review.status === "finalized" || review.status === "acknowledged",
    );
    const ratings = finalized
      .map((review) => review.outcome?.finalRating)
      .filter((rating): rating is number => rating != null);

    return {
      id: `${input.filter.groupBy}:${bucket.groupKey}`,
      groupBy: input.filter.groupBy,
      groupKey: bucket.groupKey,
      groupLabel: bucket.groupLabel,
      reviewCount: bucket.reviews.length,
      finalizedCount: finalized.length,
      overdueCount: bucket.reviews.filter((review) => {
        const cycle = cycleById.get(review.cycleId);
        return (
          cycle != null &&
          Date.parse(cycle.submissionDeadline) < nowDate &&
          review.status !== "finalized" &&
          review.status !== "acknowledged"
        );
      }).length,
      averageFinalRating:
        ratings.length === 0
          ? null
          : Number(
              (
                ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
              ).toFixed(2),
            ),
    };
  });
}

export function buildPerformanceReportCsv(
  rows: readonly HrPerformanceReportRow[],
): string {
  const header = [
    "group_by",
    "group_key",
    "group_label",
    "review_count",
    "finalized_count",
    "overdue_count",
    "average_final_rating",
  ].join(",");

  const body = rows.map((row) =>
    [
      row.groupBy,
      row.groupKey,
      row.groupLabel,
      row.reviewCount,
      row.finalizedCount,
      row.overdueCount,
      row.averageFinalRating ?? "",
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [header, ...body].join("\n");
}

export function emitPerformanceAuditEvent(input: {
  organizationId: string;
  reviewId?: string;
  action: HrTalentPerformanceAuditAction;
  actorId: string;
  occurredAt: string;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
}): HrPerformanceAuditEvent {
  return {
    id: `${input.organizationId}:${input.action}:${input.occurredAt}:${input.reviewId ?? "org"}`,
    organizationId: input.organizationId,
    reviewId: input.reviewId,
    action: input.action,
    actorId: input.actorId,
    occurredAt: input.occurredAt,
    summary: input.summary,
    metadata: input.metadata ?? {},
  };
}

function seedCycle(organizationId: string): HrPerCycleInput {
  return createHrPerformanceCycle({
    id: "cycle-2026-annual",
    organizationId,
    name: "2026 Annual Performance Review",
    reviewType: "annual",
    periodStart: "2026-01-01",
    periodEnd: "2026-12-31",
    reviewStartDate: "2026-11-01",
    submissionDeadline: "2026-11-30",
    approvalDeadline: "2026-12-10",
    finalizationDate: "2026-12-20",
    status: "self_assessment",
    eligibility: {
      employmentStatuses: ["active"],
      minTenureDays: 90,
      departmentIds: [],
      grades: [],
      roleIds: [],
      legalEntityCodes: [],
      employeeCategories: ["full_time", "part_time"],
    },
    ratingScaleId: "default-five-point",
    requiresGoalApproval: true,
    requiresHrReview: true,
    calibrationEnabled: true,
    weightedScoringEnabled: true,
    mandatorySections: [
      "goals",
      "self_assessment",
      "manager_evaluation",
      "competency_assessment",
      "kpi_assessment",
      "meeting",
      "hr_review",
      "calibration",
    ],
  });
}

function seedEmployees(): HrPerEmployeeProfileInput[] {
  return [
    {
      employeeId: "emp-001",
      employeeDisplayName: "Alex Chen",
      employmentStatus: "active",
      hireDate: "2024-02-01",
      departmentId: "dept-product",
      departmentName: "Product",
      grade: "G6",
      roleId: "product-manager",
      legalEntityCode: "MY01",
      employeeCategory: "full_time",
      managerEmployeeId: "mgr-001",
    },
    {
      employeeId: "emp-002",
      employeeDisplayName: "Jordan Lee",
      employmentStatus: "active",
      hireDate: "2025-01-15",
      departmentId: "dept-operations",
      departmentName: "Operations",
      grade: "G5",
      roleId: "operations-lead",
      legalEntityCode: "MY01",
      employeeCategory: "full_time",
      managerEmployeeId: "mgr-001",
    },
    {
      employeeId: "mgr-001",
      employeeDisplayName: "Priya Raman",
      employmentStatus: "active",
      hireDate: "2022-08-01",
      departmentId: "dept-product",
      departmentName: "Product",
      grade: "G8",
      roleId: "director",
      legalEntityCode: "MY01",
      employeeCategory: "full_time",
      managerEmployeeId: null,
    },
  ];
}

function seedReview(cycle: HrPerCycleInput, employees: HrPerEmployeeProfileInput[]) {
  const [review] = assignEligibleEmployeesToPerformanceCycle({
    cycle,
    employees,
    asOfDate: "2026-11-01",
  });
  if (!review) {
    throw new Error("Performance seed must create at least one review.");
  }

  const goals = [
    createPerformanceGoal({
      id: "goal-revenue-quality",
      reviewId: review.id,
      employeeId: review.employeeId,
      title: "Improve release quality",
      target: "Reduce escaped defects by 20%",
      weight: 50,
      dueDate: "2026-10-31",
      progressPercent: 100,
      achievementResult: 110,
      status: "completed",
      createdByRole: "employee",
      managerApprovedAt: "2026-03-15T00:00:00.000Z",
    }),
    createPerformanceGoal({
      id: "goal-cycle-time",
      reviewId: review.id,
      employeeId: review.employeeId,
      title: "Shorten planning cycle",
      target: "Reduce quarterly planning cycle time by 15%",
      weight: 50,
      dueDate: "2026-09-30",
      progressPercent: 90,
      achievementResult: 95,
      status: "in_progress",
      createdByRole: "manager",
      managerApprovedAt: "2026-03-15T00:00:00.000Z",
    }),
  ];

  return {
    ...review,
    status: "finalized" as const,
    goals,
    selfAssessment: {
      selfRating: 4,
      comments: "Delivered key release improvements and owned stakeholder follow-up.",
      submittedAt: "2026-11-20T08:00:00.000Z",
    },
    managerEvaluation: {
      managerRating: 4,
      comments: "Strong outcomes with reliable cross-functional leadership.",
      performanceSummary: "Exceeded quality goals and is ready for broader scope.",
      recommendations: ["development", "promotion", "compensation_review"],
      submittedAt: "2026-12-02T08:00:00.000Z",
    },
    competencyAssessments: [
      { id: "competency-leadership", weight: 60, rating: 4 },
      { id: "competency-execution", weight: 40, rating: 4.5 },
    ],
    kpiAssessments: [
      {
        id: "kpi-quality",
        weight: 100,
        rating: 4.5,
        target: "20% escaped defect reduction",
        result: "24% reduction",
        achievementPercent: 120,
      },
    ],
    meeting: {
      discussionDate: "2026-12-05",
      notes: "Discussed promotion readiness and next cycle scope.",
    },
    hrReviewSubmittedAt: "2026-12-07T08:00:00.000Z",
    calibrationReference: "calibration-panel-2026-q4",
    approvalWorkflow: review.approvalWorkflow.map((step) => ({
      ...step,
      status: "approved" as const,
      decidedAt: "2026-12-08T08:00:00.000Z",
    })),
    outcome: {
      reviewId: review.id,
      finalRating: 4,
      performanceCategory: "exceeds_expectations",
      promotionRecommended: true,
      compensationReviewRecommended: true,
      performanceImprovementRequired: false,
      developmentActions: ["advanced leadership coaching"],
      finalizedAt: "2026-12-12T08:00:00.000Z",
    },
    finalizedAt: "2026-12-12T08:00:00.000Z",
    lockedAt: "2026-12-12T08:00:00.000Z",
  } satisfies HrPerformanceReviewRecord;
}

export function createSeedHrPerformanceStore(
  organizationId: string,
): HrPerformanceStore {
  const cycle = seedCycle(organizationId);
  const employees = seedEmployees();
  const review = seedReview(cycle, employees);

  return {
    cycles: [cycle],
    employees,
    reviews: [review],
    notifications: buildPerformanceNotifications({
      review,
      event: "finalized",
      hrRecipientIds: ["hr-001"],
      sentAt: "2026-12-12T08:01:00.000Z",
    }),
    auditEvents: [
      emitPerformanceAuditEvent({
        organizationId,
        reviewId: review.id,
        action: hrTalentPerformanceAuditActions.outcome.finalize,
        actorId: "hr-001",
        occurredAt: "2026-12-12T08:00:00.000Z",
        summary: "Finalized annual performance review.",
        metadata: { finalRating: 4 },
      }),
    ],
  };
}

export function getHrPerformanceStore(organizationId: string) {
  const existing = stores.get(organizationId);
  if (existing) {
    return existing;
  }

  const seeded = createSeedHrPerformanceStore(organizationId);
  stores.set(organizationId, seeded);
  return seeded;
}

export function resetHrPerformanceStoreForTest(organizationId: string) {
  stores.set(organizationId, createSeedHrPerformanceStore(organizationId));
}

export function listPerformanceCyclesFromStore(organizationId: string) {
  return [...getHrPerformanceStore(organizationId).cycles];
}

export function listPerformanceReviewsFromStore(organizationId: string) {
  return [...getHrPerformanceStore(organizationId).reviews];
}

export function listPerformanceAuditEventsFromStore(organizationId: string) {
  return [...getHrPerformanceStore(organizationId).auditEvents];
}

export function createPerformanceReviewCycleInStore(input: HrPerCycleInput) {
  const cycle = createHrPerformanceCycle(input);
  const store = getHrPerformanceStore(cycle.organizationId);
  store.cycles = [...store.cycles, cycle];
  store.auditEvents = [
    ...store.auditEvents,
    emitPerformanceAuditEvent({
      organizationId: cycle.organizationId,
      action: hrTalentPerformanceAuditActions.cycle.create,
      actorId: "system",
      occurredAt: `${dateOnly(cycle.reviewStartDate)}T00:00:00.000Z`,
      summary: `Created performance review cycle ${cycle.name}.`,
      metadata: { cycleId: cycle.id },
    }),
  ];
  return cycle;
}

export function assignEligibleEmployeesToCycleInStore(input: {
  organizationId: string;
  cycleId: string;
  asOfDate?: string;
}) {
  const store = getHrPerformanceStore(input.organizationId);
  const cycle = store.cycles.find((candidate) => candidate.id === input.cycleId);
  if (!cycle) {
    throw new Error(`Performance cycle not found: ${input.cycleId}`);
  }

  const reviews = assignEligibleEmployeesToPerformanceCycle({
    cycle,
    employees: store.employees,
    asOfDate: input.asOfDate,
  });
  const existingIds = new Set(store.reviews.map((review) => review.id));
  const newReviews = reviews.filter((review) => !existingIds.has(review.id));
  store.reviews = [...store.reviews, ...newReviews];
  store.auditEvents = [
    ...store.auditEvents,
    emitPerformanceAuditEvent({
      organizationId: input.organizationId,
      action: hrTalentPerformanceAuditActions.cycle.assignEligible,
      actorId: "system",
      occurredAt: new Date().toISOString(),
      summary: `Assigned ${newReviews.length} eligible employees to ${cycle.name}.`,
      metadata: { cycleId: cycle.id, assignedCount: newReviews.length },
    }),
  ];
  return newReviews;
}
