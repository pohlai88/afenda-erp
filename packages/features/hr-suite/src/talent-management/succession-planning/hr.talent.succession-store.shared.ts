import {
  type HrSuccessionReadinessLevel,
  type HrSuccessionReportGroupBy,
  type HrSuccessionRiskLevel,
} from "./hr.talent.succession-constants.shared";
import {
  hrSuccessionCalibrationReviewSchema,
  hrSuccessionCompetencyGapSchema,
  hrSuccessionCriticalRoleSchema,
  hrSuccessionDevelopmentPlanSchema,
  hrSuccessionLifecycleRecommendationSchema,
  hrSuccessionNotificationSchema,
  hrSuccessionReplacementPlanSchema,
  hrSuccessionReviewCycleSchema,
  hrSuccessionSuccessorNominationSchema,
  hrSuccessionTalentPoolSchema,
  type HrSuccessionCalibrationReviewInput,
  type HrSuccessionCompetencyGapInput,
  type HrSuccessionCriticalRoleInput,
  type HrSuccessionDevelopmentPlanInput,
  type HrSuccessionLifecycleRecommendationInput,
  type HrSuccessionNotificationInput,
  type HrSuccessionReplacementPlanInput,
  type HrSuccessionReviewCycleInput,
  type HrSuccessionSuccessorNominationInput,
  type HrSuccessionTalentPoolInput,
} from "./hr.talent.succession.schema";
import {
  hrTalentSuccessionAuditActions,
  type HrTalentSuccessionAuditAction,
} from "./hr.talent.succession.event";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_NOW = "2026-05-31T08:00:00.000Z";

export type HrSuccessionBenchStrengthRow = {
  id: string;
  groupBy: HrSuccessionReportGroupBy;
  groupKey: string;
  groupLabel: string;
  criticalRoleCount: number;
  successorCount: number;
  readyNowCount: number;
  readyWithinOneYearCount: number;
  weakCoverageCount: number;
  noReadySuccessorCount: number;
  continuityScore: number;
  riskLevel: HrSuccessionRiskLevel;
};

export type HrSuccessionReportRow = HrSuccessionBenchStrengthRow & {
  highRiskCount: number;
  averageBenchStrength: number;
};

export type HrSuccessionAuditEvent = {
  id: string;
  organizationId: string;
  action: HrTalentSuccessionAuditAction;
  actorId: string;
  targetId: string;
  targetType: string;
  occurredAt: string;
  summary: string;
  metadata: Record<string, string | number | boolean | null>;
};

export type HrSuccessionStore = {
  reviewCycles: HrSuccessionReviewCycleInput[];
  criticalRoles: HrSuccessionCriticalRoleInput[];
  successors: HrSuccessionSuccessorNominationInput[];
  competencyGaps: HrSuccessionCompetencyGapInput[];
  developmentPlans: HrSuccessionDevelopmentPlanInput[];
  talentPools: HrSuccessionTalentPoolInput[];
  calibrationReviews: HrSuccessionCalibrationReviewInput[];
  replacementPlans: HrSuccessionReplacementPlanInput[];
  notifications: HrSuccessionNotificationInput[];
  lifecycleRecommendations: HrSuccessionLifecycleRecommendationInput[];
  auditEvents: HrSuccessionAuditEvent[];
};

export type HrSuccessionAccessContext = {
  role: "hr" | "manager" | "leader" | "executive" | "auditor";
  visibleEmployeeIds?: readonly string[] | null;
  canReadRestricted?: boolean;
  canReadAudit?: boolean;
  canExposeLifecycle?: boolean;
};

const stores = new Map<string, HrSuccessionStore>();

function nowIso() {
  return DEFAULT_NOW;
}

function daysUntil(date: string, now = nowIso()) {
  return Math.ceil((Date.parse(date) - Date.parse(now)) / DAY_MS);
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cloneStore(store: HrSuccessionStore): HrSuccessionStore {
  return {
    reviewCycles: [...store.reviewCycles],
    criticalRoles: [...store.criticalRoles],
    successors: store.successors.map((row) => ({
      ...row,
      competencyGapIds: [...row.competencyGapIds],
      performanceReference: row.performanceReference
        ? {
            ...row.performanceReference,
            managerRecommendationKinds: [
              ...row.performanceReference.managerRecommendationKinds,
            ],
          }
        : null,
      potentialAssessment: { ...row.potentialAssessment },
    })),
    competencyGaps: [...store.competencyGaps],
    developmentPlans: store.developmentPlans.map((row) => ({
      ...row,
      actions: row.actions.map((action) => ({ ...action })),
    })),
    talentPools: store.talentPools.map((row) => ({
      ...row,
      members: row.members.map((member) => ({ ...member })),
    })),
    calibrationReviews: [...store.calibrationReviews],
    replacementPlans: [...store.replacementPlans],
    notifications: [...store.notifications],
    lifecycleRecommendations: [...store.lifecycleRecommendations],
    auditEvents: [...store.auditEvents],
  };
}

function isReadySoon(readinessLevel: HrSuccessionReadinessLevel) {
  return (
    readinessLevel === "ready_now" || readinessLevel === "ready_within_1_year"
  );
}

function riskScore(value: HrSuccessionRiskLevel) {
  if (value === "critical") return 4;
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

function riskFromScore(score: number): HrSuccessionRiskLevel {
  if (score >= 4) return "critical";
  if (score >= 3) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function createHrSuccessionCriticalRole(
  input: HrSuccessionCriticalRoleInput,
): HrSuccessionCriticalRoleInput {
  return hrSuccessionCriticalRoleSchema.parse(input);
}

export function nominateHrSuccessionSuccessor(
  input: HrSuccessionSuccessorNominationInput,
): HrSuccessionSuccessorNominationInput {
  return hrSuccessionSuccessorNominationSchema.parse(input);
}

export function recordHrSuccessionReadinessAssessment(input: {
  nomination: HrSuccessionSuccessorNominationInput;
  readinessLevel: HrSuccessionReadinessLevel;
  readinessScore: number;
  assessedAt?: string;
}) {
  return hrSuccessionSuccessorNominationSchema.parse({
    ...input.nomination,
    readinessLevel: input.readinessLevel,
    readinessScore: input.readinessScore,
    readinessAssessedAt: input.assessedAt ?? nowIso(),
  });
}

export function recordHrSuccessionCalibrationReview(
  input: HrSuccessionCalibrationReviewInput,
): HrSuccessionCalibrationReviewInput {
  return hrSuccessionCalibrationReviewSchema.parse(input);
}

export function calculateHrSuccessionBenchStrength(input: {
  criticalRole: HrSuccessionCriticalRoleInput;
  successors: readonly HrSuccessionSuccessorNominationInput[];
}): HrSuccessionBenchStrengthRow {
  const readyNowCount = input.successors.filter(
    (successor) => successor.readinessLevel === "ready_now",
  ).length;
  const readyWithinOneYearCount = input.successors.filter((successor) =>
    isReadySoon(successor.readinessLevel),
  ).length;
  const successorCount = input.successors.length;
  const noReadySuccessor = readyNowCount === 0;
  const weakCoverage =
    successorCount < 2 ||
    readyWithinOneYearCount < 2 ||
    !input.successors.some((successor) => successor.successorType === "primary");
  const continuityScore = Math.max(
    0,
    Math.min(
      100,
      readyNowCount * 35 +
        readyWithinOneYearCount * 20 +
        successorCount * 8 -
        riskScore(input.criticalRole.vacancyRisk) * 7 -
        (input.criticalRole.replacementDifficulty === "hard" ? 8 : 0),
    ),
  );

  const riskLevel = classifyHrSuccessionRisk({
    criticalRole: input.criticalRole,
    successors: input.successors,
    continuityScore,
  });

  return {
    id: `role:${input.criticalRole.id}`,
    groupBy: "role",
    groupKey: input.criticalRole.id,
    groupLabel: input.criticalRole.roleTitle,
    criticalRoleCount: 1,
    successorCount,
    readyNowCount,
    readyWithinOneYearCount,
    weakCoverageCount: weakCoverage ? 1 : 0,
    noReadySuccessorCount: noReadySuccessor ? 1 : 0,
    continuityScore,
    riskLevel,
  };
}

export function classifyHrSuccessionRisk(input: {
  criticalRole: HrSuccessionCriticalRoleInput;
  successors: readonly HrSuccessionSuccessorNominationInput[];
  continuityScore?: number;
}): HrSuccessionRiskLevel {
  const readySoonCount = input.successors.filter((successor) =>
    isReadySoon(successor.readinessLevel),
  ).length;
  const maxRetentionRisk = Math.max(
    1,
    ...input.successors.map((successor) => riskScore(successor.retentionRisk)),
  );
  const continuityScore =
    input.continuityScore ??
    Math.max(0, readySoonCount * 25 + input.successors.length * 10);
  const noReadySuccessor = !input.successors.some(
    (successor) => successor.readinessLevel === "ready_now",
  );

  if (
    input.criticalRole.vacancyRisk === "critical" ||
    (noReadySuccessor && maxRetentionRisk >= 3) ||
    continuityScore < 30
  ) {
    return "critical";
  }

  if (
    input.criticalRole.vacancyRisk === "high" ||
    readySoonCount < 2 ||
    maxRetentionRisk >= 3 ||
    continuityScore < 55
  ) {
    return "high";
  }

  if (
    input.criticalRole.vacancyRisk === "medium" ||
    input.criticalRole.replacementDifficulty === "hard" ||
    continuityScore < 75
  ) {
    return "medium";
  }

  return "low";
}

export function buildHrSuccessionBenchStrengthRows(input: {
  store: Pick<HrSuccessionStore, "criticalRoles" | "successors">;
  groupBy: HrSuccessionReportGroupBy;
}): HrSuccessionBenchStrengthRow[] {
  const byGroup = new Map<string, HrSuccessionBenchStrengthRow>();

  for (const role of input.store.criticalRoles) {
    const roleSuccessors = input.store.successors.filter(
      (successor) => successor.criticalRoleId === role.id,
    );
    const roleRow = calculateHrSuccessionBenchStrength({
      criticalRole: role,
      successors: roleSuccessors,
    });
    const [groupKey, groupLabel] = resolveHrSuccessionReportGroup({
      role,
      successors: roleSuccessors,
      roleRow,
      groupBy: input.groupBy,
    });
    const existing = byGroup.get(groupKey);
    const merged = existing
      ? mergeBenchRows(existing, roleRow, groupKey, groupLabel, input.groupBy)
      : {
          ...roleRow,
          id: `${input.groupBy}:${groupKey}`,
          groupBy: input.groupBy,
          groupKey,
          groupLabel,
        };
    byGroup.set(groupKey, merged);
  }

  return [...byGroup.values()].map((row) => ({
    ...row,
    continuityScore: Math.round(row.continuityScore / row.criticalRoleCount),
    riskLevel: riskFromScore(riskScore(row.riskLevel)),
  }));
}

function mergeBenchRows(
  existing: HrSuccessionBenchStrengthRow,
  next: HrSuccessionBenchStrengthRow,
  groupKey: string,
  groupLabel: string,
  groupBy: HrSuccessionReportGroupBy,
): HrSuccessionBenchStrengthRow {
  const highestRisk = riskFromScore(
    Math.max(riskScore(existing.riskLevel), riskScore(next.riskLevel)),
  );
  return {
    id: `${groupBy}:${groupKey}`,
    groupBy,
    groupKey,
    groupLabel,
    criticalRoleCount: existing.criticalRoleCount + next.criticalRoleCount,
    successorCount: existing.successorCount + next.successorCount,
    readyNowCount: existing.readyNowCount + next.readyNowCount,
    readyWithinOneYearCount:
      existing.readyWithinOneYearCount + next.readyWithinOneYearCount,
    weakCoverageCount: existing.weakCoverageCount + next.weakCoverageCount,
    noReadySuccessorCount:
      existing.noReadySuccessorCount + next.noReadySuccessorCount,
    continuityScore: existing.continuityScore + next.continuityScore,
    riskLevel: highestRisk,
  };
}

function resolveHrSuccessionReportGroup(input: {
  role: HrSuccessionCriticalRoleInput;
  successors: readonly HrSuccessionSuccessorNominationInput[];
  roleRow: HrSuccessionBenchStrengthRow;
  groupBy: HrSuccessionReportGroupBy;
}): readonly [string, string] {
  switch (input.groupBy) {
    case "role":
      return [input.role.id, input.role.roleTitle];
    case "department":
      return [input.role.departmentId, input.role.departmentName];
    case "job_family":
      return [input.role.jobFamily, input.role.jobFamily];
    case "legal_entity":
      return [input.role.legalEntityCode, input.role.legalEntityCode];
    case "leadership_level":
      return [
        input.role.leadershipLevel,
        formatEnumLabel(input.role.leadershipLevel),
      ];
    case "readiness": {
      const bestReadiness =
        input.successors.find(
          (successor) => successor.readinessLevel === "ready_now",
        )?.readinessLevel ??
        input.successors.find((successor) =>
          isReadySoon(successor.readinessLevel),
        )?.readinessLevel ??
        "future_potential";
      return [bestReadiness, formatEnumLabel(bestReadiness)];
    }
    case "risk":
      return [input.roleRow.riskLevel, formatEnumLabel(input.roleRow.riskLevel)];
    case "bench_strength": {
      const bucket =
        input.roleRow.continuityScore >= 75
          ? "strong"
          : input.roleRow.continuityScore >= 50
            ? "moderate"
            : "weak";
      return [bucket, formatEnumLabel(bucket)];
    }
  }
}

export function buildHrSuccessionReportRows(input: {
  store: Pick<HrSuccessionStore, "criticalRoles" | "successors">;
  groupBy: HrSuccessionReportGroupBy;
}): HrSuccessionReportRow[] {
  return buildHrSuccessionBenchStrengthRows(input).map((row) => ({
    ...row,
    highRiskCount:
      row.riskLevel === "critical" || row.riskLevel === "high" ? 1 : 0,
    averageBenchStrength: row.continuityScore,
  }));
}

export function buildHrSuccessionNotifications(input: {
  store: Pick<
    HrSuccessionStore,
    "criticalRoles" | "successors" | "developmentPlans"
  >;
  now?: string;
}): HrSuccessionNotificationInput[] {
  const sentAt = input.now ?? nowIso();
  const rows: HrSuccessionNotificationInput[] = [];

  for (const role of input.store.criticalRoles) {
    const successors = input.store.successors.filter(
      (successor) => successor.criticalRoleId === role.id,
    );
    const bench = calculateHrSuccessionBenchStrength({
      criticalRole: role,
      successors,
    });
    if (bench.noReadySuccessorCount > 0) {
      rows.push(
        hrSuccessionNotificationSchema.parse({
          id: `${role.id}:missing-ready-successor`,
          organizationId: role.organizationId,
          criticalRoleId: role.id,
          type: "missing_successor",
          title: `${role.roleTitle} has no ready successor`,
          recipientRole: "hr",
          recipientId: "hr-talent-ops",
          severity: bench.riskLevel,
          dueDate: role.nextReviewDueAt,
          sentAt,
        }),
      );
    }
    if (daysUntil(role.nextReviewDueAt, sentAt) < 0) {
      rows.push(
        hrSuccessionNotificationSchema.parse({
          id: `${role.id}:overdue-review`,
          organizationId: role.organizationId,
          criticalRoleId: role.id,
          type: "overdue_review",
          title: `${role.roleTitle} succession review is overdue`,
          recipientRole: "leader",
          recipientId: "leadership-committee",
          severity: "high",
          dueDate: role.nextReviewDueAt,
          sentAt,
        }),
      );
    }
  }

  for (const plan of input.store.developmentPlans) {
    if (plan.actions.some((action) => action.status === "overdue")) {
      const nomination = input.store.successors.find(
        (successor) => successor.id === plan.successorNominationId,
      );
      rows.push(
        hrSuccessionNotificationSchema.parse({
          id: `${plan.id}:development-gap`,
          organizationId: plan.organizationId,
          criticalRoleId: nomination?.criticalRoleId ?? plan.targetRoleId,
          type: "development_gap",
          title: `${plan.employeeDisplayName} has overdue successor development actions`,
          recipientRole: "manager",
          recipientId: nomination?.managerEmployeeId ?? "manager-unassigned",
          severity: "medium",
          dueDate: plan.actions.find((action) => action.status === "overdue")
            ?.dueDate,
          sentAt,
        }),
      );
    }
  }

  return rows;
}

export function listApprovedSuccessionRecommendationsForLifecycle(input: {
  store: HrSuccessionStore;
  authorized: boolean;
  limit?: number;
}) {
  if (!input.authorized) {
    return [] as HrSuccessionLifecycleRecommendationInput[];
  }
  return input.store.lifecycleRecommendations
    .filter((recommendation) => Boolean(recommendation.approvedAt))
    .slice(0, input.limit ?? 25);
}

export function listHrSuccessionRiskExposures(input: {
  store: HrSuccessionStore;
  authorized: boolean;
  limit?: number;
}) {
  if (!input.authorized) {
    return [] as Array<{
      organizationId: string;
      criticalRoleId: string;
      roleTitle: string;
      departmentId: string;
      departmentName: string;
      riskLevel: HrSuccessionRiskLevel;
      noReadySuccessor: boolean;
      weakCoverage: boolean;
    }>;
  }

  return input.store.criticalRoles
    .map((role) => {
      const bench = calculateHrSuccessionBenchStrength({
        criticalRole: role,
        successors: input.store.successors.filter(
          (successor) => successor.criticalRoleId === role.id,
        ),
      });
      return {
        organizationId: role.organizationId,
        criticalRoleId: role.id,
        roleTitle: role.roleTitle,
        departmentId: role.departmentId,
        departmentName: role.departmentName,
        riskLevel: bench.riskLevel,
        noReadySuccessor: bench.noReadySuccessorCount > 0,
        weakCoverage: bench.weakCoverageCount > 0,
      };
    })
    .slice(0, input.limit ?? 25);
}

export function filterHrSuccessionRecordsForAccess(input: {
  store: HrSuccessionStore;
  access: HrSuccessionAccessContext;
}): HrSuccessionStore {
  const cloned = cloneStore(input.store);
  const visibleEmployeeIds = input.access.visibleEmployeeIds;
  const unrestricted =
    visibleEmployeeIds == null ||
    ["hr", "leader", "executive", "auditor"].includes(input.access.role);
  const employeeVisible = (employeeId: string | null) => {
    if (unrestricted) {
      return true;
    }
    return employeeId != null && visibleEmployeeIds.includes(employeeId);
  };

  const criticalRoleIds = new Set(
    cloned.criticalRoles
      .filter((role) => employeeVisible(role.incumbentEmployeeId))
      .map((role) => role.id),
  );
  const visibleSuccessors = cloned.successors.filter(
    (successor) =>
      criticalRoleIds.has(successor.criticalRoleId) ||
      employeeVisible(successor.employeeId) ||
      employeeVisible(successor.managerEmployeeId),
  );
  for (const successor of visibleSuccessors) {
    criticalRoleIds.add(successor.criticalRoleId);
  }
  const successorIds = new Set(visibleSuccessors.map((successor) => successor.id));

  const successors = visibleSuccessors.map((successor) =>
    input.access.canReadRestricted
      ? successor
      : {
          ...successor,
          performanceReference: null,
          retentionRisk: "medium" as const,
          potentialAssessment: {
            ...successor.potentialAssessment,
            leadershipPotentialScore: 0,
            learningAgilityScore: 0,
            businessImpactScore: 0,
            growthCapacityScore: 0,
          },
        },
  );

  return {
    reviewCycles: cloned.reviewCycles,
    criticalRoles: cloned.criticalRoles.filter((role) =>
      criticalRoleIds.has(role.id),
    ),
    successors,
    competencyGaps: cloned.competencyGaps.filter((gap) =>
      successorIds.has(gap.successorNominationId),
    ),
    developmentPlans: cloned.developmentPlans.filter((plan) =>
      successorIds.has(plan.successorNominationId),
    ),
    talentPools: cloned.talentPools.map((pool) => ({
      ...pool,
      members: pool.members.filter((member) => employeeVisible(member.employeeId)),
    })),
    calibrationReviews: cloned.calibrationReviews.filter((review) =>
      successorIds.has(review.successorNominationId),
    ),
    replacementPlans: cloned.replacementPlans.filter((plan) =>
      criticalRoleIds.has(plan.criticalRoleId),
    ),
    notifications: cloned.notifications.filter((notification) =>
      criticalRoleIds.has(notification.criticalRoleId),
    ),
    lifecycleRecommendations: input.access.canExposeLifecycle
      ? cloned.lifecycleRecommendations.filter((recommendation) =>
          successorIds.has(recommendation.successorNominationId),
        )
      : [],
    auditEvents: input.access.canReadAudit ? cloned.auditEvents : [],
  };
}

export function emitHrSuccessionAuditEvent(input: {
  store: HrSuccessionStore;
  organizationId: string;
  action: HrTalentSuccessionAuditAction;
  actorId: string;
  targetId: string;
  targetType: string;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
  occurredAt?: string;
}): HrSuccessionAuditEvent {
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
  } satisfies HrSuccessionAuditEvent;
  input.store.auditEvents = [...input.store.auditEvents, event];
  return event;
}

function createCycle(organizationId: string) {
  return hrSuccessionReviewCycleSchema.parse({
    id: "suc-cycle-2026-h1",
    organizationId,
    name: "2026 H1 Leadership Continuity Review",
    periodStart: "2026-01-01",
    periodEnd: "2026-06-30",
    status: "in_review",
    nextReviewDueAt: "2026-06-30",
  });
}

function createRoleSeed(
  organizationId: string,
): HrSuccessionCriticalRoleInput[] {
  const base = {
    organizationId,
    reviewCycleId: "suc-cycle-2026-h1",
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  return [
    {
      ...base,
      id: "suc-role-coo",
      roleCode: "EXEC-COO",
      roleTitle: "Chief Operating Officer",
      orgUnitId: "org-exec",
      orgUnitName: "Executive Office",
      departmentId: "dept-operations",
      departmentName: "Operations",
      legalEntityCode: "MY01",
      positionId: "pos-coo",
      jobFamily: "Operations Leadership",
      grade: "E2",
      incumbentEmployeeId: "emp-coo",
      incumbentDisplayName: "Amelia Tan",
      businessImpact: "critical",
      leadershipLevel: "executive",
      vacancyRisk: "high",
      replacementDifficulty: "hard",
      nextReviewDueAt: "2026-06-30",
    },
    {
      ...base,
      id: "suc-role-vp-eng",
      roleCode: "ENG-VP",
      roleTitle: "VP Engineering",
      orgUnitId: "org-product-tech",
      orgUnitName: "Product & Technology",
      departmentId: "dept-engineering",
      departmentName: "Engineering",
      legalEntityCode: "MY01",
      positionId: "pos-vp-eng",
      jobFamily: "Engineering Leadership",
      grade: "E1",
      incumbentEmployeeId: "emp-vp-eng",
      incumbentDisplayName: "Noah Ibrahim",
      businessImpact: "critical",
      leadershipLevel: "senior_leadership",
      vacancyRisk: "critical",
      replacementDifficulty: "hard",
      nextReviewDueAt: "2026-04-30",
    },
    {
      ...base,
      id: "suc-role-head-risk",
      roleCode: "RISK-HEAD",
      roleTitle: "Head of Risk & Compliance",
      orgUnitId: "org-governance",
      orgUnitName: "Governance",
      departmentId: "dept-risk",
      departmentName: "Risk",
      legalEntityCode: "MY01",
      positionId: "pos-head-risk",
      jobFamily: "Risk Leadership",
      grade: "G9",
      incumbentEmployeeId: "emp-risk-head",
      incumbentDisplayName: "Lina Gomez",
      businessImpact: "high",
      leadershipLevel: "people_leader",
      vacancyRisk: "medium",
      replacementDifficulty: "moderate",
      nextReviewDueAt: "2026-07-31",
    },
  ].map((role) => hrSuccessionCriticalRoleSchema.parse(role));
}

function createSuccessorSeed(
  organizationId: string,
): HrSuccessionSuccessorNominationInput[] {
  const performanceReference = {
    appraisalId: "perf-review-alex-2026",
    reviewCycleId: "cycle-2026-annual",
    reviewPeriod: "2026 Annual",
    finalRatingLabel: "Exceeds expectations",
    performanceOutcomeCode: "exceeds_expectations",
    managerRecommendationKinds: ["promotion", "development"],
  };
  return [
    {
      id: "suc-nom-alex-coo",
      organizationId,
      criticalRoleId: "suc-role-coo",
      employeeId: "emp-alex",
      employeeDisplayName: "Alex Chen",
      currentRoleTitle: "Senior Operations Director",
      managerEmployeeId: "emp-coo",
      successorType: "primary",
      readinessLevel: "ready_now",
      readinessScore: 92,
      readinessAssessedAt: nowIso(),
      performanceReference,
      potentialAssessment: {
        potentialLevel: "exceptional",
        leadershipPotentialScore: 94,
        learningAgilityScore: 90,
        businessImpactScore: 93,
        growthCapacityScore: 91,
        assessedByUserId: "user-hrbp-001",
        assessedAt: nowIso(),
      },
      gridEnabled: true,
      gridCell: "star",
      retentionRisk: "medium",
      competencyGapIds: ["gap-alex-strategy"],
      developmentPlanId: "dev-alex-coo",
      nominatedByUserId: "user-hrbp-001",
      nominatedAt: nowIso(),
      approvedAt: "2026-05-20T08:00:00.000Z",
    },
    {
      id: "suc-nom-priya-coo",
      organizationId,
      criticalRoleId: "suc-role-coo",
      employeeId: "emp-priya",
      employeeDisplayName: "Priya Raman",
      currentRoleTitle: "Director, Product Operations",
      managerEmployeeId: "emp-coo",
      successorType: "secondary",
      readinessLevel: "ready_within_1_year",
      readinessScore: 82,
      readinessAssessedAt: nowIso(),
      performanceReference: {
        ...performanceReference,
        appraisalId: "perf-review-priya-2026",
        finalRatingLabel: "Meets expectations",
        performanceOutcomeCode: "meets_expectations",
      },
      potentialAssessment: {
        potentialLevel: "high",
        leadershipPotentialScore: 84,
        learningAgilityScore: 86,
        businessImpactScore: 80,
        growthCapacityScore: 83,
        assessedByUserId: "user-hrbp-001",
        assessedAt: nowIso(),
      },
      gridEnabled: true,
      gridCell: "high_potential",
      retentionRisk: "low",
      competencyGapIds: ["gap-priya-enterprise"],
      developmentPlanId: "dev-priya-coo",
      nominatedByUserId: "user-hrbp-001",
      nominatedAt: nowIso(),
      approvedAt: null,
    },
    {
      id: "suc-nom-maya-vp-eng",
      organizationId,
      criticalRoleId: "suc-role-vp-eng",
      employeeId: "emp-maya",
      employeeDisplayName: "Maya Singh",
      currentRoleTitle: "Engineering Director",
      managerEmployeeId: "emp-vp-eng",
      successorType: "long_term",
      readinessLevel: "future_potential",
      readinessScore: 58,
      readinessAssessedAt: nowIso(),
      performanceReference: null,
      potentialAssessment: {
        potentialLevel: "high",
        leadershipPotentialScore: 78,
        learningAgilityScore: 88,
        businessImpactScore: 70,
        growthCapacityScore: 86,
        assessedByUserId: "user-hrbp-002",
        assessedAt: nowIso(),
      },
      gridEnabled: true,
      gridCell: "developing",
      retentionRisk: "high",
      competencyGapIds: ["gap-maya-enterprise", "gap-maya-financials"],
      developmentPlanId: "dev-maya-vp-eng",
      nominatedByUserId: "user-hrbp-002",
      nominatedAt: nowIso(),
      approvedAt: null,
    },
    {
      id: "suc-nom-omar-risk",
      organizationId,
      criticalRoleId: "suc-role-head-risk",
      employeeId: "emp-omar",
      employeeDisplayName: "Omar Hassan",
      currentRoleTitle: "Compliance Manager",
      managerEmployeeId: "emp-risk-head",
      successorType: "emergency",
      readinessLevel: "ready_2_3_years",
      readinessScore: 64,
      readinessAssessedAt: nowIso(),
      performanceReference: null,
      potentialAssessment: {
        potentialLevel: "solid",
        leadershipPotentialScore: 70,
        learningAgilityScore: 72,
        businessImpactScore: 68,
        growthCapacityScore: 70,
        assessedByUserId: "user-hrbp-003",
        assessedAt: nowIso(),
      },
      gridEnabled: false,
      gridCell: null,
      retentionRisk: "medium",
      competencyGapIds: ["gap-omar-board"],
      developmentPlanId: "dev-omar-risk",
      nominatedByUserId: "user-hrbp-003",
      nominatedAt: nowIso(),
      approvedAt: null,
    },
  ].map((successor) => hrSuccessionSuccessorNominationSchema.parse(successor));
}

function createGapSeed(
  organizationId: string,
): HrSuccessionCompetencyGapInput[] {
  const gaps = [
    {
      id: "gap-alex-strategy",
      criticalRoleId: "suc-role-coo",
      successorNominationId: "suc-nom-alex-coo",
      employeeId: "emp-alex",
      employeeDisplayName: "Alex Chen",
      competencyName: "Strategic portfolio governance",
      requiredLevel: "expert",
      currentLevel: "advanced",
      severity: "medium",
      developmentPriority: 2,
    },
    {
      id: "gap-priya-enterprise",
      criticalRoleId: "suc-role-coo",
      successorNominationId: "suc-nom-priya-coo",
      employeeId: "emp-priya",
      employeeDisplayName: "Priya Raman",
      competencyName: "Enterprise operating cadence",
      requiredLevel: "expert",
      currentLevel: "proficient",
      severity: "high",
      developmentPriority: 1,
    },
    {
      id: "gap-maya-enterprise",
      criticalRoleId: "suc-role-vp-eng",
      successorNominationId: "suc-nom-maya-vp-eng",
      employeeId: "emp-maya",
      employeeDisplayName: "Maya Singh",
      competencyName: "Enterprise architecture leadership",
      requiredLevel: "expert",
      currentLevel: "developing",
      severity: "critical",
      developmentPriority: 1,
    },
    {
      id: "gap-maya-financials",
      criticalRoleId: "suc-role-vp-eng",
      successorNominationId: "suc-nom-maya-vp-eng",
      employeeId: "emp-maya",
      employeeDisplayName: "Maya Singh",
      competencyName: "Engineering financial stewardship",
      requiredLevel: "advanced",
      currentLevel: "developing",
      severity: "high",
      developmentPriority: 2,
    },
    {
      id: "gap-omar-board",
      criticalRoleId: "suc-role-head-risk",
      successorNominationId: "suc-nom-omar-risk",
      employeeId: "emp-omar",
      employeeDisplayName: "Omar Hassan",
      competencyName: "Board risk communication",
      requiredLevel: "expert",
      currentLevel: "competent",
      severity: "medium",
      developmentPriority: 3,
    },
  ] as const;

  return gaps.map((gap) =>
    hrSuccessionCompetencyGapSchema.parse({
      ...gap,
      organizationId,
      competencyCode: gap.id.toUpperCase(),
      recommendedActions: ["mentoring", "stretch assignment"],
    }),
  );
}

function createDevelopmentPlanSeed(
  organizationId: string,
): HrSuccessionDevelopmentPlanInput[] {
  return [
    {
      id: "dev-alex-coo",
      organizationId,
      successorNominationId: "suc-nom-alex-coo",
      employeeId: "emp-alex",
      employeeDisplayName: "Alex Chen",
      targetRoleId: "suc-role-coo",
      targetRoleTitle: "Chief Operating Officer",
      planCode: "SUC-DEV-ALEX",
      planTitle: "Enterprise operations exposure",
      status: "in_progress",
      progressPercent: 72,
      careerPathReferenceId: "career-readiness-alex-coo",
      updatedAt: nowIso(),
      actions: [
        {
          id: "dev-alex-action-board",
          kind: "leadership_exposure",
          title: "Quarterly board operations narrative",
          ownerUserId: "user-mentor-coo",
          dueDate: "2026-06-15",
          progressPercent: 80,
          status: "in_progress",
          linkedLearningRef: null,
        },
        {
          id: "dev-alex-action-coach",
          kind: "coaching",
          title: "Executive presence coaching",
          ownerUserId: "user-coach-001",
          dueDate: "2026-07-30",
          progressPercent: 65,
          status: "in_progress",
          linkedLearningRef: "lms-exec-presence",
        },
      ],
    },
    {
      id: "dev-maya-vp-eng",
      organizationId,
      successorNominationId: "suc-nom-maya-vp-eng",
      employeeId: "emp-maya",
      employeeDisplayName: "Maya Singh",
      targetRoleId: "suc-role-vp-eng",
      targetRoleTitle: "VP Engineering",
      planCode: "SUC-DEV-MAYA",
      planTitle: "VP Engineering readiness bridge",
      status: "overdue",
      progressPercent: 35,
      careerPathReferenceId: "career-readiness-maya-vp-eng",
      updatedAt: nowIso(),
      actions: [
        {
          id: "dev-maya-action-finance",
          kind: "training",
          title: "Engineering finance fundamentals",
          ownerUserId: "user-lms-admin",
          dueDate: "2026-04-15",
          progressPercent: 20,
          status: "overdue",
          linkedLearningRef: "lms-eng-finance",
        },
        {
          id: "dev-maya-action-stretch",
          kind: "stretch_assignment",
          title: "Own platform investment review",
          ownerUserId: "emp-vp-eng",
          dueDate: "2026-08-30",
          progressPercent: 30,
          status: "in_progress",
          linkedLearningRef: null,
        },
      ],
    },
    {
      id: "dev-omar-risk",
      organizationId,
      successorNominationId: "suc-nom-omar-risk",
      employeeId: "emp-omar",
      employeeDisplayName: "Omar Hassan",
      targetRoleId: "suc-role-head-risk",
      targetRoleTitle: "Head of Risk & Compliance",
      planCode: "SUC-DEV-OMAR",
      planTitle: "Risk leadership acceleration",
      status: "not_started",
      progressPercent: 0,
      careerPathReferenceId: "career-readiness-omar-risk",
      updatedAt: nowIso(),
      actions: [
        {
          id: "dev-omar-action-mentor",
          kind: "mentoring",
          title: "Board committee shadowing",
          ownerUserId: "emp-risk-head",
          dueDate: "2026-09-30",
          progressPercent: 0,
          status: "not_started",
          linkedLearningRef: null,
        },
      ],
    },
  ].map((plan) => hrSuccessionDevelopmentPlanSchema.parse(plan));
}

export function createHrSuccessionSampleStore(
  organizationId = "org_afenda_demo",
): HrSuccessionStore {
  const reviewCycle = createCycle(organizationId);
  const criticalRoles = createRoleSeed(organizationId);
  const successors = createSuccessorSeed(organizationId);
  const competencyGaps = createGapSeed(organizationId);
  const developmentPlans = createDevelopmentPlanSeed(organizationId);
  const talentPools = [
    hrSuccessionTalentPoolSchema.parse({
      id: "pool-high-potential-2026",
      organizationId,
      name: "2026 high-potential leadership pool",
      poolType: "high_potential",
      ownerUserId: "user-hrbp-001",
      reviewCycleId: reviewCycle.id,
      members: successors.slice(0, 3).map((successor) => ({
        employeeId: successor.employeeId,
        employeeDisplayName: successor.employeeDisplayName,
        readinessLevel: successor.readinessLevel,
        potentialLevel: successor.potentialAssessment.potentialLevel,
        jobFamily:
          criticalRoles.find((role) => role.id === successor.criticalRoleId)
            ?.jobFamily ?? "Leadership",
        leadershipLevel:
          criticalRoles.find((role) => role.id === successor.criticalRoleId)
            ?.leadershipLevel ?? "people_leader",
      })),
      fairnessReviewRef: "fairness-review-2026-h1",
      biasRiskIndicator: "medium",
      updatedAt: nowIso(),
    }),
    hrSuccessionTalentPoolSchema.parse({
      id: "pool-specialist-risk",
      organizationId,
      name: "Specialist risk succession pool",
      poolType: "specialist",
      ownerUserId: "user-hrbp-003",
      reviewCycleId: reviewCycle.id,
      members: [
        {
          employeeId: "emp-omar",
          employeeDisplayName: "Omar Hassan",
          readinessLevel: "ready_2_3_years",
          potentialLevel: "solid",
          jobFamily: "Risk Leadership",
          leadershipLevel: "specialist",
        },
      ],
      fairnessReviewRef: null,
      biasRiskIndicator: "low",
      updatedAt: nowIso(),
    }),
  ];
  const calibrationReviews = [
    hrSuccessionCalibrationReviewSchema.parse({
      id: "cal-suc-alex-coo",
      organizationId,
      reviewCycleId: reviewCycle.id,
      criticalRoleId: "suc-role-coo",
      successorNominationId: "suc-nom-alex-coo",
      reviewerRole: "leadership_committee",
      outcome: "approved",
      comments: "Ready now with board exposure action retained.",
      decisionReference: "talent-committee-2026-05-20",
      reviewedByUserId: "user-chro",
      reviewedAt: "2026-05-20T08:00:00.000Z",
    }),
    hrSuccessionCalibrationReviewSchema.parse({
      id: "cal-suc-maya-vp-eng",
      organizationId,
      reviewCycleId: reviewCycle.id,
      criticalRoleId: "suc-role-vp-eng",
      successorNominationId: "suc-nom-maya-vp-eng",
      reviewerRole: "hr",
      outcome: "approved_with_development",
      comments: "Retain as long-term successor; close finance and enterprise gaps.",
      decisionReference: "talent-committee-2026-05-21",
      reviewedByUserId: "user-hrbp-002",
      reviewedAt: "2026-05-21T08:00:00.000Z",
    }),
  ];
  const replacementPlans = [
    hrSuccessionReplacementPlanSchema.parse({
      id: "replacement-coo-emergency",
      organizationId,
      criticalRoleId: "suc-role-coo",
      planType: "emergency",
      successorNominationId: "suc-nom-alex-coo",
      interimOwnerEmployeeId: "emp-priya",
      plannedEffectiveDate: null,
      contingencyNotes: "Alex acts immediately; Priya covers product operations.",
      approvedAt: "2026-05-20T08:00:00.000Z",
    }),
    hrSuccessionReplacementPlanSchema.parse({
      id: "replacement-coo-planned",
      organizationId,
      criticalRoleId: "suc-role-coo",
      planType: "planned",
      successorNominationId: "suc-nom-priya-coo",
      interimOwnerEmployeeId: null,
      plannedEffectiveDate: "2027-01-01",
      contingencyNotes: "Targeted planned move after remaining enterprise exposure.",
      approvedAt: null,
    }),
  ];
  const lifecycleRecommendations = [
    hrSuccessionLifecycleRecommendationSchema.parse({
      id: "life-rec-alex-coo",
      organizationId,
      criticalRoleId: "suc-role-coo",
      successorNominationId: "suc-nom-alex-coo",
      employeeId: "emp-alex",
      employeeDisplayName: "Alex Chen",
      targetRoleTitle: "Chief Operating Officer",
      movementType: "promotion",
      approvalReference: "talent-committee-2026-05-20",
      lifecycleReference: null,
      approvedAt: "2026-05-20T08:00:00.000Z",
    }),
  ];
  const store: HrSuccessionStore = {
    reviewCycles: [reviewCycle],
    criticalRoles,
    successors,
    competencyGaps,
    developmentPlans,
    talentPools,
    calibrationReviews,
    replacementPlans,
    notifications: [],
    lifecycleRecommendations,
    auditEvents: [],
  };
  store.notifications = buildHrSuccessionNotifications({ store });

  for (const [action, targetId, targetType, summary] of [
    [
      hrTalentSuccessionAuditActions.criticalRole.setup,
      "suc-role-coo",
      "critical_role",
      "Critical role setup completed",
    ],
    [
      hrTalentSuccessionAuditActions.successor.nominate,
      "suc-nom-alex-coo",
      "successor",
      "Successor nomination recorded",
    ],
    [
      hrTalentSuccessionAuditActions.successor.readinessAssess,
      "suc-nom-alex-coo",
      "readiness",
      "Readiness assessment recorded",
    ],
    [
      hrTalentSuccessionAuditActions.calibration.review,
      "cal-suc-alex-coo",
      "calibration",
      "Calibration review recorded",
    ],
    [
      hrTalentSuccessionAuditActions.development.reference,
      "dev-alex-coo",
      "development_plan",
      "Development plan reference linked",
    ],
    [
      hrTalentSuccessionAuditActions.review.cycle,
      reviewCycle.id,
      "review_cycle",
      "Succession review cycle opened",
    ],
    [
      hrTalentSuccessionAuditActions.review.approve,
      "cal-suc-alex-coo",
      "review",
      "Succession review approved",
    ],
    [
      hrTalentSuccessionAuditActions.decision.approveRecommendation,
      "life-rec-alex-coo",
      "succession_decision",
      "Succession recommendation approved",
    ],
  ] as const) {
    emitHrSuccessionAuditEvent({
      store,
      organizationId,
      action,
      actorId: "user-hrbp-001",
      targetId,
      targetType,
      summary,
      metadata: {
        reviewCycleId: reviewCycle.id,
      },
    });
  }

  return store;
}

export function getHrSuccessionStore(organizationId: string) {
  const existing = stores.get(organizationId);
  if (existing) {
    return existing;
  }
  const seeded = createHrSuccessionSampleStore(organizationId);
  stores.set(organizationId, seeded);
  return seeded;
}

export function resetHrSuccessionStoreForTests(organizationId: string) {
  const seeded = createHrSuccessionSampleStore(organizationId);
  stores.set(organizationId, seeded);
  return seeded;
}
