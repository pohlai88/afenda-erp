import "server-only"

import {
  buildGovernedListSurface,
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceHeader,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"

import type { EngagementAnalyticsSnapshot } from "../schemas/engagement-analytics.shared"
import type { EngagementCycleHistoryRow } from "./engagement-analytics.server"

import type { EngagementAudienceSegmentPreviewRow } from "../schemas/engagement-audience.shared"
import type {
  EngagementCompletionTrackingRow,
  EngagementConfigurableSurveyListRow,
  EngagementDraftSurveyListRow,
  EngagementImprovementActionListRow,
  EngagementTemplateListRow,
  EngagementTemplateQuestionListRow,
} from "../schemas/engagement-query.shared"

const EMPLOYEE_ENGAGEMENT_READ_PERMISSION = {
  module: "hrm" as const,
  object: "employee_engagement" as const,
  function: "read" as const,
}

import { engagementAnalyticsExportTriggerId } from "../engagement-export-toolbar.shared"

function comparisonFromDelta(
  delta: number | null,
  priorValue: string,
  label: string
) {
  if (delta == null) return undefined
  return {
    priorValue,
    label,
    direction:
      delta > 0
        ? ("up" as const)
        : delta < 0
          ? ("down" as const)
          : ("flat" as const),
  }
}

function badgeColumn(id: string, header: string) {
  return {
    id,
    header,
    cellKind: { kind: "badge" as const, tone: "default" as const },
  }
}

const dateColumn = (id: string, header: string) => ({
  id,
  header,
  cellKind: { kind: "date" as const },
})

export function buildEngagementTemplatesListSurfaceConfiguration(
  rows: readonly EngagementTemplateListRow[],
  copy: {
    readonly empty: string
    readonly colCode: string
    readonly colName: string
    readonly colState: string
    readonly colQuestions: string
    readonly colUpdated: string
    formatState: (state: EngagementTemplateListRow["state"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader("hrm-employee-engagement-templates"),
      columnsId: "hrm-employee-engagement-templates",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      badgeColumn("state", copy.colState),
      { id: "questions", header: copy.colQuestions },
      dateColumn("updated", copy.colUpdated),
    ],
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: row.state === "draft" ? "attention" : "default",
      cells: {
        code: row.code,
        name: row.name,
        state: copy.formatState(row.state),
        questions: String(row.questionCount),
        updated: row.updatedAt.toISOString().slice(0, 10),
      },
    })),
  })
}

export function buildEngagementTemplateQuestionsListSurfaceConfiguration(
  rows: readonly EngagementTemplateQuestionListRow[],
  copy: {
    readonly empty: string
    readonly colTemplate: string
    readonly colOrder: string
    readonly colType: string
    readonly colCategory: string
    readonly colPrompt: string
    formatQuestionType: (
      type: EngagementTemplateQuestionListRow["questionType"]
    ) => string
    formatCategory: (
      category: EngagementTemplateQuestionListRow["category"]
    ) => string
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: { title: "hrm-employee-engagement-template-questions" },
      columnsId: "hrm-employee-engagement-template-questions",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "template", header: copy.colTemplate },
      { id: "order", header: copy.colOrder },
      badgeColumn("type", copy.colType),
      badgeColumn("category", copy.colCategory),
      { id: "prompt", header: copy.colPrompt },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        template: `${row.templateCode} — ${row.templateName}`,
        order: String(row.sortOrder),
        type: copy.formatQuestionType(row.questionType),
        category: copy.formatCategory(row.category),
        prompt: row.prompt,
      },
    })),
  })
}

export function buildEngagementDraftSurveysListSurfaceConfiguration(
  rows: readonly EngagementDraftSurveyListRow[],
  copy: {
    readonly empty: string
    readonly colTitle: string
    readonly colType: string
    readonly colTemplate: string
    readonly colQuestions: string
    readonly colUpdated: string
    formatSurveyType: (
      type: EngagementDraftSurveyListRow["surveyType"]
    ) => string
    formatState: (state: EngagementDraftSurveyListRow["state"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: { title: "hrm-employee-engagement-surveys-draft" },
      columnsId: "hrm-employee-engagement-surveys-draft",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      badgeColumn("type", copy.colType),
      { id: "template", header: copy.colTemplate },
      { id: "questions", header: copy.colQuestions },
      dateColumn("updated", copy.colUpdated),
    ],
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: row.state === "draft" ? "attention" : "default",
      cells: {
        title: row.title,
        type: copy.formatSurveyType(row.surveyType),
        template: row.templateCode ?? "—",
        questions: String(row.questionCount),
        updated: row.updatedAt.toISOString().slice(0, 10),
      },
    })),
  })
}

export function buildEngagementConfigurableSurveysListSurfaceConfiguration(
  rows: readonly EngagementConfigurableSurveyListRow[],
  copy: {
    readonly empty: string
    readonly colTitle: string
    readonly colType: string
    readonly colState: string
    readonly colAudience: string
    readonly colWindow: string
    readonly colQuestions: string
    formatSurveyType: (
      type: EngagementConfigurableSurveyListRow["surveyType"]
    ) => string
    formatState: (state: EngagementConfigurableSurveyListRow["state"]) => string
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: { title: "hrm-employee-engagement-surveys-configurable" },
      columnsId: "hrm-employee-engagement-surveys-configurable",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      badgeColumn("type", copy.colType),
      badgeColumn("state", copy.colState),
      { id: "audience", header: copy.colAudience },
      { id: "window", header: copy.colWindow },
      { id: "questions", header: copy.colQuestions },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      rowTone: row.state === "scheduled" ? "attention" : "default",
      cells: {
        title: row.title,
        type: copy.formatSurveyType(row.surveyType),
        state: copy.formatState(row.state),
        audience:
          row.resolvedAudienceCount == null
            ? "—"
            : String(row.resolvedAudienceCount),
        window:
          row.openAt && row.closeAt
            ? `${row.openAt.toISOString().slice(0, 10)} → ${row.closeAt.toISOString().slice(0, 10)}`
            : "—",
        questions: String(row.questionCount),
      },
    })),
  })
}

export function buildEngagementAudienceSegmentPreviewListSurfaceConfiguration(
  rows: readonly EngagementAudienceSegmentPreviewRow[],
  copy: {
    readonly empty: string
    readonly colSegment: string
    readonly colCount: string
    readonly colSuppressed: string
    formatSuppressed: (suppressed: boolean) => string
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: { title: "hrm-employee-engagement-audience-segments" },
      columnsId: "hrm-employee-engagement-audience-segments",
      rowKey: "segmentId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "segment", header: copy.colSegment },
      { id: "count", header: copy.colCount },
      badgeColumn("suppressed", copy.colSuppressed),
    ],
    rows: rows.map((row) => ({
      id: `${row.dimension}:${row.segmentId}`,
      rowTone: row.suppressed ? "attention" : "default",
      cells: {
        segment: row.label,
        count: String(row.responseCount),
        suppressed: copy.formatSuppressed(row.suppressed),
      },
    })),
  })
}

export function buildEngagementCompletionTrackingListSurfaceConfiguration(
  rows: readonly EngagementCompletionTrackingRow[],
  copy: {
    readonly empty: string
    readonly colParticipant: string
    readonly colInvitation: string
    readonly colResponse: string
    readonly colSubmitted: string
    readonly resendLabel: string
    readonly resendDisabledReason: string
    formatInvitationState: (
      state: EngagementCompletionTrackingRow["invitationState"]
    ) => string
    formatResponseState: (
      state: EngagementCompletionTrackingRow["responseState"]
    ) => string
  },
  context: { canManage: boolean; surveyPublished: boolean }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader("hrm:employee-engagement:completion-tracking"),
      columnsId: "hrm:employee-engagement:completion-tracking",
      rowKey: "invitationId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "participant", header: copy.colParticipant },
      badgeColumn("invitation", copy.colInvitation),
      badgeColumn("response", copy.colResponse),
      { id: "submitted", header: copy.colSubmitted },
    ],
    rows: rows.map((row) => ({
      id: row.invitationId,
      rowTone: row.invitationState === "pending" ? "attention" : "default",
      cells: {
        participant: row.participantLabel,
        invitation: copy.formatInvitationState(row.invitationState),
        response: copy.formatResponseState(row.responseState),
        submitted: row.submittedAt
          ? row.submittedAt.toISOString().slice(0, 10)
          : "—",
      },
      trailingAction: resolveListSurfaceRowTrailingAction({
        visible: row.invitationState === "pending" && context.surveyPublished,
        allowed: context.canManage,
        disabledReason: copy.resendDisabledReason,
        descriptor: {
          id: "hrm.employee_engagement.invitation.resend",
          label: copy.resendLabel,
          intent: "default",
        },
      }),
    })),
  })
}

export function buildEngagementImprovementActionsListSurfaceConfiguration(
  rows: readonly EngagementImprovementActionListRow[],
  copy: {
    readonly empty: string
    readonly colTitle: string
    readonly colOwner: string
    readonly colDue: string
    readonly colPriority: string
    readonly colStatus: string
    readonly colCategory: string
    readonly colUpdated: string
    readonly startLabel: string
    readonly completeLabel: string
    readonly readOnlyReason: string
    formatStatus: (
      status: EngagementImprovementActionListRow["status"]
    ) => string
    formatPriority: (priority: string | null) => string
    formatDue: (dueDate: string | null, isOverdue: boolean) => string
  },
  context: { canManage: boolean }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: listSurfaceHeader("hrm:employee-engagement:improvement-actions"),
      columnsId: "hrm:employee-engagement:improvement-actions",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "owner", header: copy.colOwner },
      { id: "due", header: copy.colDue },
      badgeColumn("priority", copy.colPriority),
      badgeColumn("status", copy.colStatus),
      { id: "category", header: copy.colCategory },
      { id: "updated", header: copy.colUpdated },
    ],
    rows: rows.map((row) => {
      const canStart = row.status === "open" && context.canManage
      const canComplete = row.status === "in_progress" && context.canManage

      return {
        id: row.id,
        rowTone: row.isOverdue ? "attention" : "default",
        cells: {
          title: row.title,
          owner: row.ownerLabel ?? "—",
          due: copy.formatDue(row.dueDate, row.isOverdue),
          priority: copy.formatPriority(row.priority),
          status: copy.formatStatus(row.status),
          category: row.category ?? "—",
          updated: row.updatedAt.toISOString().slice(0, 10),
        },
        trailingAction: canComplete
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
              descriptor: {
                id: "hrm.employee_engagement.improvement_action.complete",
                label: copy.completeLabel,
                intent: "default",
              },
            })
          : canStart
            ? resolveListSurfaceRowTrailingAction({
                visible: true,
                allowed: true,
                descriptor: {
                  id: "hrm.employee_engagement.improvement_action.start",
                  label: copy.startLabel,
                  intent: "default",
                },
              })
            : resolveListSurfaceRowTrailingAction({
                visible: false,
                allowed: false,
                disabledReason: copy.readOnlyReason,
                descriptor: {
                  id: "hrm.employee_engagement.improvement_action.readonly",
                  label: copy.completeLabel,
                  intent: "default",
                },
              }),
      }
    }),
  })
}

export const ENGAGEMENT_DASHBOARD_SURFACE_KEY =
  "hrm:employee-engagement:overview" as const

export const ENGAGEMENT_SEGMENT_SCORES_SURFACE_KEY =
  "hrm:employee-engagement:segment-scores" as const

export const ENGAGEMENT_CYCLE_HISTORY_SURFACE_KEY =
  "hrm:employee-engagement:cycle-history" as const

export const ENGAGEMENT_CATEGORY_SCORES_SURFACE_KEY =
  "hrm:employee-engagement:category-scores" as const

type EngagementSegmentDimension =
  | "department"
  | "location"
  | "manager"
  | "grade"
  | "tenure"
  | "employmentType"
  | "workerCategory"

export function buildEngagementOverviewStatConfiguration(
  snapshot: EngagementAnalyticsSnapshot,
  copy: {
    engagementIndex: string
    satisfactionIndex: string
    enps: string
    responseRate: string
    promoters: string
    trendEngagement: string
    trendEnps: string
    trendUnavailable: string
    formatDelta: (delta: number | null) => string
    trendTone: (delta: number | null) => "default" | "positive" | "attention"
    comparisonLabel: string
  }
): StatCardConfigurationInput {
  const trend = snapshot.trend
  const priorEngagement =
    snapshot.benchmark.priorEngagementIndex != null
      ? String(snapshot.benchmark.priorEngagementIndex)
      : (trend?.priorCycleLabel ?? "—")
  const priorEnps =
    snapshot.benchmark.priorEnps != null
      ? String(snapshot.benchmark.priorEnps)
      : "—"

  return buildGovernedStatGrid({
    presentationProfile: "erp-kpi-grid",
    dataNature: "kpi",
    stats: [
      {
        label: copy.engagementIndex,
        value:
          snapshot.engagementIndex == null
            ? "—"
            : String(snapshot.engagementIndex),
        delta: trend
          ? copy.formatDelta(trend.engagementIndexDelta)
          : copy.trendUnavailable,
        comparison: trend
          ? comparisonFromDelta(
              trend.engagementIndexDelta,
              priorEngagement,
              copy.comparisonLabel
            )
          : undefined,
        tone: trend ? copy.trendTone(trend.engagementIndexDelta) : "default",
        icon: "activity",
        href: "#engagement-category-scores-section",
      },
      {
        label: copy.satisfactionIndex,
        value:
          snapshot.satisfactionIndex == null
            ? "—"
            : String(snapshot.satisfactionIndex),
        delta: `${snapshot.submittedCount} responses`,
        tone: "default",
        icon: "users",
      },
      {
        label: copy.enps,
        value: snapshot.enps == null ? "—" : String(snapshot.enps),
        delta: trend ? copy.formatDelta(trend.enpsDelta) : copy.promoters,
        comparison: trend
          ? comparisonFromDelta(
              trend.enpsDelta,
              priorEnps,
              copy.comparisonLabel
            )
          : undefined,
        tone: trend ? copy.trendTone(trend.enpsDelta) : "default",
        icon: "alert",
      },
      {
        label: copy.responseRate,
        value: `${snapshot.responseRatePercent}%`,
        delta: trend
          ? copy.formatDelta(trend.responseRateDelta)
          : `${snapshot.invitedCount} invited`,
        comparison: trend
          ? comparisonFromDelta(
              trend.responseRateDelta,
              trend.priorCycleLabel ?? "—",
              copy.comparisonLabel
            )
          : undefined,
        tone: "default",
        icon: "calendar",
      },
    ],
  })
}

export function buildEngagementSegmentScoresListSurfaceConfiguration(
  snapshot: EngagementAnalyticsSnapshot,
  copy: {
    readonly empty: string
    readonly colDimension: string
    readonly colSegment: string
    readonly colAverage: string
    readonly colResponses: string
    readonly colRisk: string
    readonly colSuppressed: string
    formatDimension: (dimension: EngagementSegmentDimension) => string
    riskYes: string
    riskNo: string
    suppressedYes: string
    suppressedNo: string
    exportReportLabel?: string
    surveyId?: string
  }
): ListSurfaceRendererConfigurationInput {
  type SegmentRow = {
    id: string
    dimension: EngagementSegmentDimension
    label: string
    average: string
    responseCount: number
    riskFlag: boolean
    suppressed: boolean
  }

  type SegmentScoreRow =
    EngagementAnalyticsSnapshot["segmentScores"]["department"][number]

  const segmentDimensionEntries: Array<
    [EngagementSegmentDimension, readonly SegmentScoreRow[]]
  > = [
    ["department", snapshot.segmentScores.department],
    ["location", snapshot.segmentScores.location],
    ["manager", snapshot.segmentScores.manager],
    ["grade", snapshot.segmentScores.grade],
    ["tenure", snapshot.segmentScores.tenure],
    ["employmentType", snapshot.segmentScores.employmentType],
    ["workerCategory", snapshot.segmentScores.workerCategory],
  ]

  const flatRows: SegmentRow[] = segmentDimensionEntries.flatMap(
    ([dimension, rows]) =>
      rows.map((row) => ({
        id: `${dimension}:${row.segmentKey}`,
        dimension,
        label: row.label,
        average: row.average == null ? "—" : String(row.average),
        responseCount: row.responseCount,
        riskFlag: row.riskFlag,
        suppressed: row.suppressed,
      }))
  )

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    presentation:
      copy.exportReportLabel && copy.surveyId
        ? {
            toolbar: {
              export: {
                actionId: "erp.hrm.employee_engagement.analytics.export",
                label: copy.exportReportLabel,
                formats: ["csv"],
                triggerElementId: engagementAnalyticsExportTriggerId(
                  copy.surveyId
                ),
              },
            },
          }
        : undefined,
    surface: {
      header: { title: ENGAGEMENT_SEGMENT_SCORES_SURFACE_KEY },
      columnsId: ENGAGEMENT_SEGMENT_SCORES_SURFACE_KEY,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "dimension", header: copy.colDimension },
      { id: "segment", header: copy.colSegment },
      { id: "average", header: copy.colAverage },
      { id: "responses", header: copy.colResponses },
      badgeColumn("risk", copy.colRisk),
      { id: "suppressed", header: copy.colSuppressed },
    ],
    rows: flatRows.map((row) => ({
      id: row.id,
      rowTone: row.riskFlag
        ? "critical"
        : row.suppressed
          ? "attention"
          : "default",
      cells: {
        dimension: copy.formatDimension(row.dimension),
        segment: row.label,
        average: row.average,
        responses: String(row.responseCount),
        risk: row.riskFlag ? copy.riskYes : copy.riskNo,
        suppressed: row.suppressed ? copy.suppressedYes : copy.suppressedNo,
      },
    })),
  })
}

export function buildEngagementCategoryScoresListSurfaceConfiguration(
  snapshot: EngagementAnalyticsSnapshot,
  copy: {
    readonly empty: string
    readonly colCategory: string
    readonly colAverage: string
    readonly colResponses: string
    readonly colSuppressed: string
    suppressedYes: string
    suppressedNo: string
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: { title: ENGAGEMENT_CATEGORY_SCORES_SURFACE_KEY },
      columnsId: ENGAGEMENT_CATEGORY_SCORES_SURFACE_KEY,
      rowKey: "category",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "category", header: copy.colCategory },
      { id: "average", header: copy.colAverage },
      { id: "responses", header: copy.colResponses },
      { id: "suppressed", header: copy.colSuppressed },
    ],
    rows: snapshot.categoryAverages.map((row) => ({
      id: row.category,
      cells: {
        category: row.category,
        average: row.average == null ? "—" : String(row.average),
        responses: String(row.responseCount),
        suppressed: row.suppressed ? copy.suppressedYes : copy.suppressedNo,
      },
    })),
  })
}

export function buildEngagementCycleHistoryListSurfaceConfiguration(
  rows: readonly EngagementCycleHistoryRow[],
  copy: {
    readonly empty: string
    readonly colTitle: string
    readonly colCycle: string
    readonly colState: string
    readonly colClosed: string
    readonly colEngagement: string
    readonly colEnps: string
    readonly colGenerated: string
    formatState: (state: string) => string
  }
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: EMPLOYEE_ENGAGEMENT_READ_PERMISSION,
    surface: {
      header: { title: ENGAGEMENT_CYCLE_HISTORY_SURFACE_KEY },
      columnsId: ENGAGEMENT_CYCLE_HISTORY_SURFACE_KEY,
      rowKey: "surveyId",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "cycle", header: copy.colCycle },
      badgeColumn("state", copy.colState),
      { id: "closed", header: copy.colClosed },
      { id: "engagement", header: copy.colEngagement },
      { id: "enps", header: copy.colEnps },
      { id: "generated", header: copy.colGenerated },
    ],
    rows: rows.map((row) => ({
      id: row.surveyId,
      cells: {
        title: row.title,
        cycle: row.cycleLabel ?? row.cycleKey ?? "—",
        state: copy.formatState(row.state),
        closed: row.closedAt ? row.closedAt.toISOString().slice(0, 10) : "—",
        engagement:
          row.engagementIndex == null ? "—" : String(row.engagementIndex),
        enps: row.enps == null ? "—" : String(row.enps),
        generated: row.analyticsGeneratedAt
          ? row.analyticsGeneratedAt.toISOString().slice(0, 10)
          : "—",
      },
    })),
  })
}
