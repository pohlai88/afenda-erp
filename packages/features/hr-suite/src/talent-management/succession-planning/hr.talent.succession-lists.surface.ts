import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import {
  buildHrSuiteListSearchToolbar,
  buildHrSuiteOperationalListSurface,
  type HrSuiteListSurfaceProfile,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import { hrTalentSuccessionReadPermission } from "./hr.talent.succession.contract";
import {
  hrSuccessionCriticalRoleDetailRoutePath,
  hrSuccessionSuccessorDetailRoutePath,
} from "./hr.talent.succession-route.contract";
import {
  hrSuccessionAuditTrailSearchParam,
  hrSuccessionBenchStrengthSearchParam,
  hrSuccessionCalibrationReviewsSearchParam,
  hrSuccessionCompetencyGapsSearchParam,
  hrSuccessionCriticalRolesSearchParam,
  hrSuccessionDevelopmentPlansSearchParam,
  hrSuccessionLifecycleRecommendationsSearchParam,
  hrSuccessionNotificationsSearchParam,
  hrSuccessionReplacementPlansSearchParam,
  hrSuccessionReportsSearchParam,
  hrSuccessionSuccessorsSearchParam,
  hrSuccessionTalentPoolsSearchParam,
  type HrSuccessionListSurfaceKey,
} from "./hr.talent.succession-search-params.parse.shared";
import type {
  HrSuccessionAuditEvent,
  HrSuccessionBenchStrengthRow,
  HrSuccessionReportRow,
} from "./hr.talent.succession-store.shared";
import type {
  HrSuccessionCalibrationReviewInput,
  HrSuccessionCompetencyGapInput,
  HrSuccessionCriticalRoleInput,
  HrSuccessionDevelopmentPlanInput,
  HrSuccessionLifecycleRecommendationInput,
  HrSuccessionNotificationInput,
  HrSuccessionReplacementPlanInput,
  HrSuccessionSuccessorNominationInput,
  HrSuccessionTalentPoolInput,
} from "./hr.talent.succession.schema";
import { HR_SUCCESSION_LIST_SURFACE_COLUMNS_BY_KEY } from "./hr.talent.succession-surface-metadata.shared";
import { hrSuccessionUiCopy } from "./hr.talent.succession-ui.copy.shared";

type SuccessionListColumn =
  ListSurfaceRendererConfigurationInput["columns"][number];
type SuccessionListRow = ListSurfaceRendererConfigurationInput["rows"][number];

type SuccessionWindow<T> = {
  rows: readonly T[];
  pageSize?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  nextCursor?: string;
};

function formatEnumLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "Not scheduled";
}

function buildSuccessionListSurface<T>(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  primaryColumnId: string;
  searchParam: string;
  searchValue?: string;
  searchPlaceholder: string;
  headerTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: SuccessionListColumn[];
  window: SuccessionWindow<T>;
  rows: SuccessionListRow[];
  presentationProfile?: Extract<
    HrSuiteListSurfaceProfile,
    "erp-operational-table" | "erp-exception-table" | "erp-analytical-table" | "erp-audit-ledger"
  >;
}) {
  return buildHrSuiteOperationalListSurface({
    primaryColumnId: input.primaryColumnId,
    readPermission: hrTalentSuccessionReadPermission,
    ...(input.presentationProfile ? { profile: input.presentationProfile } : {}),
    searchToolbar: buildHrSuiteListSearchToolbar({
      param: input.searchParam,
      label: "Search",
      placeholder: input.searchPlaceholder,
      ...(input.searchValue === undefined ? {} : { value: input.searchValue }),
    }),
    window: {
      pageSize: input.window.pageSize ?? Math.max(input.rows.length, 25),
      totalCount: input.window.totalCount ?? input.rows.length,
      hasNextPage: input.window.hasNextPage ?? false,
      ...(input.window.nextCursor
        ? { nextCursor: input.window.nextCursor }
        : {}),
    },
    surface: {
      headerTitle: input.headerTitle,
      columnsId: HR_SUCCESSION_LIST_SURFACE_COLUMNS_BY_KEY[input.surfaceKey],
      rowKey: "id",
      emptyTitle: input.emptyTitle,
      emptyDescription: input.emptyDescription,
    },
    columns: input.columns,
    rows: input.rows,
  });
}

export function buildHrSuccessionCriticalRolesListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionCriticalRoleInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.criticalRoles;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "roleTitle",
    searchParam: hrSuccessionCriticalRolesSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search critical roles",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "roleTitle", header: "Role", priority: "primary", cellKind: { kind: "text" } },
      { id: "departmentName", header: "Department", cellKind: { kind: "text" } },
      { id: "jobFamily", header: "Job family", cellKind: { kind: "text" } },
      { id: "grade", header: "Grade", cellKind: { kind: "text" } },
      { id: "incumbent", header: "Incumbent", cellKind: { kind: "text" } },
      { id: "businessImpact", header: "Impact", cellKind: { kind: "badge", tone: "default" } },
      { id: "vacancyRisk", header: "Vacancy risk", cellKind: { kind: "badge", tone: "default" } },
      { id: "nextReviewDueAt", header: "Next review", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: hrSuccessionCriticalRoleDetailRoutePath(row.id),
      rowTone:
        row.vacancyRisk === "critical" || row.vacancyRisk === "high"
          ? "attention"
          : undefined,
      cells: {
        roleTitle: row.roleTitle,
        departmentName: row.departmentName,
        jobFamily: row.jobFamily,
        grade: row.grade,
        incumbent: row.incumbentDisplayName ?? "Vacant",
        businessImpact: formatEnumLabel(row.businessImpact),
        vacancyRisk: formatEnumLabel(row.vacancyRisk),
        nextReviewDueAt: formatDate(row.nextReviewDueAt),
      },
    })),
  });
}

export function buildHrSuccessionSuccessorsListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionSuccessorNominationInput[];
  criticalRoles: readonly HrSuccessionCriticalRoleInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.successors;
  const roles = new Map(input.criticalRoles.map((role) => [role.id, role]));
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "employeeDisplayName",
    searchParam: hrSuccessionSuccessorsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search successors",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "employeeDisplayName", header: "Successor", priority: "primary", cellKind: { kind: "text" } },
      { id: "targetRole", header: "Target role", cellKind: { kind: "text" } },
      { id: "successorType", header: "Type", cellKind: { kind: "badge", tone: "default" } },
      { id: "readinessLevel", header: "Readiness", cellKind: { kind: "badge", tone: "default" } },
      { id: "performance", header: "Performance", cellKind: { kind: "text" } },
      { id: "potential", header: "Potential", cellKind: { kind: "badge", tone: "default" } },
      { id: "gridCell", header: "Grid", cellKind: { kind: "badge", tone: "default" } },
      { id: "retentionRisk", header: "Retention", cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowHref: hrSuccessionSuccessorDetailRoutePath(row.id),
      rowTone:
        row.readinessLevel === "future_potential" || row.retentionRisk === "high"
          ? "attention"
          : undefined,
      cells: {
        employeeDisplayName: row.employeeDisplayName,
        targetRole: roles.get(row.criticalRoleId)?.roleTitle ?? row.criticalRoleId,
        successorType: formatEnumLabel(row.successorType),
        readinessLevel: formatEnumLabel(row.readinessLevel),
        performance:
          row.performanceReference?.finalRatingLabel ?? "Restricted or not recorded",
        potential: formatEnumLabel(row.potentialAssessment.potentialLevel),
        gridCell: row.gridEnabled ? formatEnumLabel(row.gridCell) : "Disabled",
        retentionRisk: formatEnumLabel(row.retentionRisk),
      },
    })),
  });
}

export function buildHrSuccessionCompetencyGapsListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionCompetencyGapInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.competencyGaps;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "competencyName",
    searchParam: hrSuccessionCompetencyGapsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search competency gaps",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-exception-table",
    columns: [
      { id: "competencyName", header: "Competency", priority: "primary", cellKind: { kind: "text" } },
      { id: "employeeDisplayName", header: "Successor", cellKind: { kind: "text" } },
      { id: "requiredLevel", header: "Required", cellKind: { kind: "text" } },
      { id: "currentLevel", header: "Current", cellKind: { kind: "text" } },
      { id: "severity", header: "Severity", cellKind: { kind: "badge", tone: "default" } },
      { id: "developmentPriority", header: "Priority", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone:
        row.severity === "critical" || row.severity === "high"
          ? "attention"
          : undefined,
      cells: {
        competencyName: row.competencyName,
        employeeDisplayName: row.employeeDisplayName,
        requiredLevel: row.requiredLevel,
        currentLevel: row.currentLevel,
        severity: formatEnumLabel(row.severity),
        developmentPriority: row.developmentPriority,
      },
    })),
  });
}

export function buildHrSuccessionDevelopmentPlansListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionDevelopmentPlanInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.developmentPlans;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "planTitle",
    searchParam: hrSuccessionDevelopmentPlansSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search development plans",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-exception-table",
    columns: [
      { id: "planTitle", header: "Plan", priority: "primary", cellKind: { kind: "text" } },
      { id: "employeeDisplayName", header: "Successor", cellKind: { kind: "text" } },
      { id: "targetRoleTitle", header: "Target role", cellKind: { kind: "text" } },
      { id: "actions", header: "Actions", cellKind: { kind: "text" } },
      { id: "progress", header: "Progress", cellKind: { kind: "text" } },
      { id: "status", header: "Status", cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone: row.status === "overdue" || row.status === "blocked" ? "attention" : undefined,
      cells: {
        planTitle: row.planTitle,
        employeeDisplayName: row.employeeDisplayName,
        targetRoleTitle: row.targetRoleTitle,
        actions: row.actions.map((action) => formatEnumLabel(action.kind)).join(", "),
        progress: `${row.progressPercent}%`,
        status: formatEnumLabel(row.status),
      },
    })),
  });
}

export function buildHrSuccessionTalentPoolsListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionTalentPoolInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.talentPools;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "name",
    searchParam: hrSuccessionTalentPoolsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search talent pools",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "name", header: "Pool", priority: "primary", cellKind: { kind: "text" } },
      { id: "poolType", header: "Type", cellKind: { kind: "badge", tone: "default" } },
      { id: "memberCount", header: "Members", cellKind: { kind: "text" } },
      { id: "ownerUserId", header: "Owner", cellKind: { kind: "text" } },
      { id: "fairnessReviewRef", header: "Fairness review", cellKind: { kind: "text" } },
      { id: "biasRiskIndicator", header: "Bias risk", cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        name: row.name,
        poolType: formatEnumLabel(row.poolType),
        memberCount: row.members.length,
        ownerUserId: row.ownerUserId,
        fairnessReviewRef: row.fairnessReviewRef ?? "Not linked",
        biasRiskIndicator: formatEnumLabel(row.biasRiskIndicator),
      },
    })),
  });
}

export function buildHrSuccessionCalibrationReviewsListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionCalibrationReviewInput[];
  criticalRoles: readonly HrSuccessionCriticalRoleInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.calibrationReviews;
  const roles = new Map(input.criticalRoles.map((role) => [role.id, role]));
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "decisionReference",
    searchParam: hrSuccessionCalibrationReviewsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search calibration reviews",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "decisionReference", header: "Decision", priority: "primary", cellKind: { kind: "text" } },
      { id: "role", header: "Role", cellKind: { kind: "text" } },
      { id: "reviewerRole", header: "Reviewer", cellKind: { kind: "badge", tone: "default" } },
      { id: "outcome", header: "Outcome", cellKind: { kind: "badge", tone: "default" } },
      { id: "comments", header: "Comments", cellKind: { kind: "text" } },
      { id: "reviewedAt", header: "Reviewed", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        decisionReference: row.decisionReference,
        role: roles.get(row.criticalRoleId)?.roleTitle ?? row.criticalRoleId,
        reviewerRole: formatEnumLabel(row.reviewerRole),
        outcome: formatEnumLabel(row.outcome),
        comments: row.comments,
        reviewedAt: formatDate(row.reviewedAt),
      },
    })),
  });
}

export function buildHrSuccessionBenchStrengthListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionBenchStrengthRow[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.benchStrength;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "groupLabel",
    searchParam: hrSuccessionBenchStrengthSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search bench strength",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-analytical-table",
    columns: [
      { id: "groupLabel", header: "Group", priority: "primary", cellKind: { kind: "text" } },
      { id: "criticalRoleCount", header: "Roles", cellKind: { kind: "text" } },
      { id: "readyNowCount", header: "Ready now", cellKind: { kind: "text" } },
      { id: "readyWithinOneYearCount", header: "Ready <=1y", cellKind: { kind: "text" } },
      { id: "weakCoverageCount", header: "Weak", cellKind: { kind: "text" } },
      { id: "continuityScore", header: "Score", cellKind: { kind: "text" } },
      { id: "riskLevel", header: "Risk", cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone:
        row.riskLevel === "critical" || row.weakCoverageCount > 0
          ? "attention"
          : undefined,
      cells: {
        groupLabel: row.groupLabel,
        criticalRoleCount: row.criticalRoleCount,
        readyNowCount: row.readyNowCount,
        readyWithinOneYearCount: row.readyWithinOneYearCount,
        weakCoverageCount: row.weakCoverageCount,
        continuityScore: `${row.continuityScore}%`,
        riskLevel: formatEnumLabel(row.riskLevel),
      },
    })),
  });
}

export function buildHrSuccessionReplacementPlansListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionReplacementPlanInput[];
  criticalRoles: readonly HrSuccessionCriticalRoleInput[];
  successors: readonly HrSuccessionSuccessorNominationInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.replacementPlans;
  const roles = new Map(input.criticalRoles.map((role) => [role.id, role]));
  const successors = new Map(input.successors.map((row) => [row.id, row]));
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "role",
    searchParam: hrSuccessionReplacementPlansSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search replacement plans",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "role", header: "Role", priority: "primary", cellKind: { kind: "text" } },
      { id: "planType", header: "Type", cellKind: { kind: "badge", tone: "default" } },
      { id: "successor", header: "Successor", cellKind: { kind: "text" } },
      { id: "interimOwner", header: "Interim owner", cellKind: { kind: "text" } },
      { id: "plannedEffectiveDate", header: "Effective", cellKind: { kind: "text" } },
      { id: "approvedAt", header: "Approved", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        role: roles.get(row.criticalRoleId)?.roleTitle ?? row.criticalRoleId,
        planType: formatEnumLabel(row.planType),
        successor: row.successorNominationId
          ? successors.get(row.successorNominationId)?.employeeDisplayName ??
            row.successorNominationId
          : "Not assigned",
        interimOwner: row.interimOwnerEmployeeId ?? "Not assigned",
        plannedEffectiveDate: formatDate(row.plannedEffectiveDate),
        approvedAt: formatDate(row.approvedAt),
      },
    })),
  });
}

export function buildHrSuccessionNotificationsListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionNotificationInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.notifications;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "title",
    searchParam: hrSuccessionNotificationsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search notifications",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-exception-table",
    columns: [
      { id: "title", header: "Notification", priority: "primary", cellKind: { kind: "text" } },
      { id: "type", header: "Type", cellKind: { kind: "badge", tone: "default" } },
      { id: "recipient", header: "Recipient", cellKind: { kind: "text" } },
      { id: "severity", header: "Severity", cellKind: { kind: "badge", tone: "default" } },
      { id: "dueDate", header: "Due", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      rowTone: row.severity === "critical" || row.severity === "high" ? "attention" : undefined,
      cells: {
        title: row.title,
        type: formatEnumLabel(row.type),
        recipient: `${formatEnumLabel(row.recipientRole)} ${row.recipientId}`,
        severity: formatEnumLabel(row.severity),
        dueDate: formatDate(row.dueDate),
      },
    })),
  });
}

export function buildHrSuccessionLifecycleRecommendationsListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionLifecycleRecommendationInput[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.lifecycle;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "employeeDisplayName",
    searchParam: hrSuccessionLifecycleRecommendationsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search lifecycle recommendations",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    columns: [
      { id: "employeeDisplayName", header: "Employee", priority: "primary", cellKind: { kind: "text" } },
      { id: "targetRoleTitle", header: "Target role", cellKind: { kind: "text" } },
      { id: "movementType", header: "Movement", cellKind: { kind: "badge", tone: "default" } },
      { id: "approvalReference", header: "Approval", cellKind: { kind: "text" } },
      { id: "lifecycleReference", header: "Lifecycle ref", cellKind: { kind: "text" } },
      { id: "approvedAt", header: "Approved", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        employeeDisplayName: row.employeeDisplayName,
        targetRoleTitle: row.targetRoleTitle,
        movementType: formatEnumLabel(row.movementType),
        approvalReference: row.approvalReference,
        lifecycleReference: row.lifecycleReference ?? "Ready to initiate",
        approvedAt: formatDate(row.approvedAt),
      },
    })),
  });
}

export function buildHrSuccessionReportsListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionReportRow[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.reports;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "groupLabel",
    searchParam: hrSuccessionReportsSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search report rows",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-analytical-table",
    columns: [
      { id: "groupLabel", header: "Group", priority: "primary", cellKind: { kind: "text" } },
      { id: "criticalRoleCount", header: "Roles", cellKind: { kind: "text" } },
      { id: "noReadySuccessorCount", header: "No ready", cellKind: { kind: "text" } },
      { id: "weakCoverageCount", header: "Weak", cellKind: { kind: "text" } },
      { id: "highRiskCount", header: "High risk", cellKind: { kind: "text" } },
      { id: "averageBenchStrength", header: "Bench", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        groupLabel: row.groupLabel,
        criticalRoleCount: row.criticalRoleCount,
        noReadySuccessorCount: row.noReadySuccessorCount,
        weakCoverageCount: row.weakCoverageCount,
        highRiskCount: row.highRiskCount,
        averageBenchStrength: `${row.averageBenchStrength}%`,
      },
    })),
  });
}

export function buildHrSuccessionAuditTrailListSurface(input: {
  surfaceKey: HrSuccessionListSurfaceKey;
  rows: readonly HrSuccessionAuditEvent[];
  searchValue?: string;
}) {
  const copy = hrSuccessionUiCopy.audit;
  return buildSuccessionListSurface({
    surfaceKey: input.surfaceKey,
    primaryColumnId: "summary",
    searchParam: hrSuccessionAuditTrailSearchParam,
    searchValue: input.searchValue,
    searchPlaceholder: "Search audit events",
    headerTitle: copy.surfaceHeaderTitle,
    emptyTitle: copy.emptyTitle,
    emptyDescription: copy.emptyDescription,
    window: { rows: input.rows },
    presentationProfile: "erp-audit-ledger",
    columns: [
      { id: "summary", header: "Summary", priority: "primary", cellKind: { kind: "text" } },
      { id: "action", header: "Action", cellKind: { kind: "text" } },
      { id: "actorId", header: "Actor", cellKind: { kind: "text" } },
      { id: "targetType", header: "Target", cellKind: { kind: "badge", tone: "default" } },
      { id: "occurredAt", header: "Occurred", cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        summary: row.summary,
        action: row.action,
        actorId: row.actorId,
        targetType: formatEnumLabel(row.targetType),
        occurredAt: formatDate(row.occurredAt),
      },
    })),
  });
}
