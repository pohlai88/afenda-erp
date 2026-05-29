import "server-only"

import {
  buildGovernedListSurface,
  buildGovernedStatGrid,
  buildKanbanWorkflowFromColumnTransitions,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type GovernedKanbanBoardConfigurationInput,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"

import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import {
  RECRUITMENT_READ_PERMISSION,
  recruitmentListHeader,
} from "./recruitment-list-surface.shared"
import type {
  ApplicationPipelineRow,
  JobRequisitionRow,
} from "./recruitment.queries.server"
import {
  HRM_APPLICATION_STAGES,
  type HrmApplicationStage,
} from "../schemas/recruitment.schema"
import { APPLICATION_STAGE_TRANSITIONS } from "./recruitment-workflow.shared"

type RecruitmentPipelineCopy = {
  openRequisitions: string
  activeApplications: string
  interviewsQueued: string
  offersInFlight: string
}

export function buildRecruitmentPipelineStatConfiguration(input: {
  openRequisitionCount: number
  activeApplicationCount: number
  interviewQueueCount: number
  offerInFlightCount: number
  copy: RecruitmentPipelineCopy
}): StatCardConfigurationInput {
  return buildGovernedStatGrid({
    presentationProfile: "erp-executive-summary",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: input.copy.openRequisitions,
        value: String(input.openRequisitionCount),
        delta: "Published roles",
        tone: "default",
      },
      {
        label: input.copy.activeApplications,
        value: String(input.activeApplicationCount),
        delta: "In pipeline",
        tone: "attention",
      },
      {
        label: input.copy.interviewsQueued,
        value: String(input.interviewQueueCount),
        delta: "Scheduled or pending",
        tone: "default",
      },
      {
        label: input.copy.offersInFlight,
        value: String(input.offerInFlightCount),
        delta: "Draft through sent",
        tone: "positive",
      },
    ],
  })
}

type RequisitionsListCopy = {
  empty: string
  colTitle: string
  colDepartment: string
  colHeadcount: string
  colStatus: string
}

export function buildRecruitmentRequisitionsListSurfaceConfiguration(
  rows: readonly JobRequisitionRow[],
  orgSlug: string,
  copy: RequisitionsListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: { tableDensity: "comfortable" },
    requiresErpPermission: RECRUITMENT_READ_PERMISSION,
    surface: {
      header: recruitmentListHeader("hrm-recruitment-requisitions"),
      columnsId: "hrm-recruitment-requisitions",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      { id: "title", header: copy.colTitle },
      { id: "department", header: copy.colDepartment },
      { id: "headcount", header: copy.colHeadcount, align: "end" },
      { id: "status", header: copy.colStatus, align: "center" },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      linkColumnId: "title",
      rowHref: organizationHrmPath(orgSlug, "recruitment"),
      cells: {
        title: row.title,
        department: row.departmentName ?? "—",
        headcount: row.headcount,
        status: row.status,
      },
    })),
  })
}

type ApplicationsListCopy = {
  empty: string
  colCandidate: string
  colRole: string
  colStage: string
}

function formatStageLabel(stage: HrmApplicationStage): string {
  return stage.replaceAll("_", " ")
}

function shortUserId(value: string | null): string | null {
  if (!value) return null
  return value.length <= 12 ? value : `${value.slice(0, 8)}...`
}

function formatStageDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function applicationCardTone(
  row: ApplicationPipelineRow
): "default" | "positive" | "attention" | "critical" {
  if (row.stage === "hired" || row.stage === "offer") return "positive"
  if (row.stage === "rejected" || row.stage === "withdrawn") return "critical"
  if (
    row.stage === "interview" ||
    row.stage === "assessment" ||
    row.screeningOutcome === "manual_review"
  ) {
    return "attention"
  }
  return "default"
}

function applicationNextActionLabel(row: ApplicationPipelineRow): string {
  switch (row.stage) {
    case "applied":
      return "Next: screen"
    case "screening":
      return row.screeningOutcome === "manual_review"
        ? "Blocked: manual review"
        : "Next: shortlist"
    case "shortlisted":
      return "Next: interview"
    case "interview":
      return "Next: scorecard"
    case "assessment":
      return "Next: assessment decision"
    case "offer":
      return "Next: offer response"
    case "hired":
      return "Converted"
    case "rejected":
    case "withdrawn":
    case "archived":
      return "Closed"
  }
}

function applicationMetadataChips(row: ApplicationPipelineRow) {
  const chips: Array<{
    label: string
    tone?: "default" | "positive" | "attention" | "critical"
  }> = []
  const actor = shortUserId(row.updatedByUserId ?? row.createdByUserId)

  if (actor) {
    chips.push({ label: `Actor: ${actor}` })
  }
  chips.push({ label: `Updated: ${formatStageDate(row.updatedAt)}` })
  chips.push({
    label: row.candidateResumeUrl ? "Evidence: resume" : "Evidence: profile",
    tone: row.candidateResumeUrl ? "positive" : "default",
  })
  if (row.candidateEmail) {
    chips.push({ label: "Contact ready", tone: "positive" })
  }
  if (row.screeningOutcome) {
    chips.push({
      label: `Screening: ${row.screeningOutcome.replaceAll("_", " ")}`,
      tone:
        row.screeningOutcome === "failed"
          ? "critical"
          : row.screeningOutcome === "manual_review"
            ? "attention"
            : row.screeningOutcome === "passed"
              ? "positive"
              : "default",
    })
  }
  chips.push({
    label: applicationNextActionLabel(row),
    tone: applicationCardTone(row),
  })

  return chips
}

export function buildRecruitmentApplicationsListSurfaceConfiguration(
  rows: readonly ApplicationPipelineRow[],
  orgSlug: string,
  copy: ApplicationsListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: { tableDensity: "comfortable" },
    requiresErpPermission: RECRUITMENT_READ_PERMISSION,
    surface: {
      header: recruitmentListHeader("hrm-recruitment-applications"),
      columnsId: "hrm-recruitment-applications",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: copy.empty,
      },
    },
    columns: [
      { id: "candidate", header: copy.colCandidate },
      { id: "role", header: copy.colRole },
      { id: "stage", header: copy.colStage },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      linkColumnId: "candidate",
      rowHref: organizationHrmPath(orgSlug, "recruitment"),
      cells: {
        candidate: row.candidateName,
        role: row.requisitionTitle,
        stage: formatStageLabel(row.stage),
      },
    })),
  })
}

type PipelineKanbanCopy = {
  boardAriaLabel: string
  stageLabels: Record<HrmApplicationStage, string>
  pipelineEmpty: string
  interviewCount: (count: number) => string
  convertedEmployee: string
}

export function buildRecruitmentPipelineKanbanConfiguration(
  rows: readonly ApplicationPipelineRow[],
  interviewCounts: ReadonlyMap<string, number>,
  copy: PipelineKanbanCopy
): GovernedKanbanBoardConfigurationInput {
  const columns = HRM_APPLICATION_STAGES.map((stage) => ({
    id: stage,
    label: copy.stageLabels[stage],
    badgeTone:
      stage === "offer" || stage === "hired"
        ? ("positive" as const)
        : stage === "rejected" || stage === "withdrawn"
          ? ("critical" as const)
          : stage === "interview" || stage === "assessment"
            ? ("attention" as const)
            : undefined,
  }))

  return {
    dataNature: "kanban",
    interactionMode: "footer-actions",
    requiresErpPermission: RECRUITMENT_READ_PERMISSION,
    copy: {
      boardAriaLabel: copy.boardAriaLabel,
      emptyColumn: copy.pipelineEmpty,
    },
    workflow: buildKanbanWorkflowFromColumnTransitions(
      APPLICATION_STAGE_TRANSITIONS
    ),
    columns,
    columnOrder: [...HRM_APPLICATION_STAGES],
    cards: rows.map((row) => {
      const interviewN = interviewCounts.get(row.id) ?? 0
      const badges: string[] = []
      if (interviewN > 0) {
        badges.push(copy.interviewCount(interviewN))
      }
      if (row.convertedEmployeeId) {
        badges.push(`${copy.convertedEmployee}: ${row.convertedEmployeeId}`)
      }
      return {
        id: row.id,
        columnId: row.stage,
        title: row.candidateName,
        subtitle: row.requisitionTitle,
        tone: applicationCardTone(row),
        badges: badges.length > 0 ? badges : undefined,
        metadataChips: applicationMetadataChips(row),
      }
    }),
  }
}
