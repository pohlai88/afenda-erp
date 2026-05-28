import "server-only"

import {
  buildKanbanWorkflowFromColumnTransitions,
  resolveKanbanCardTransition,
  type GovernedKanbanBoardConfigurationInput,
} from "@afenda/governed-surface"

import { isClaimCancellable } from "./claim-helpers.shared"
import type { ClaimRow } from "./claim.queries.server"
import {
  CLAIM_KANBAN_COLUMN_IDS,
  CLAIM_KANBAN_COLUMN_TRANSITIONS,
  type ClaimKanbanColumnId,
} from "./claim-kanban-workflow.shared"

const COLUMN_BADGE_TONE: Partial<
  Record<ClaimKanbanColumnId, "default" | "positive" | "attention" | "critical">
> = {
  submitted: "attention",
  returned: "attention",
  approved: "positive",
  rejected: "critical",
  cancelled: "critical",
  paid: "positive",
}

type ClaimKanbanCopy = {
  boardAriaLabel: string
  emptyColumn: string
  columnLabels: Record<ClaimKanbanColumnId, string>
  evidenceCount: (count: number) => string
  underReview: string
}

type ClaimKanbanDragCopy = ClaimKanbanCopy & {
  dragHandleAriaLabel: string
  cancelTransitionLabel: string
  dragDisabledUseInbox: string
  dragDisabledNotCancellable: string
}

function shortActorId(value: string | null): string | null {
  if (!value) return null
  return value.length <= 12 ? value : `${value.slice(0, 8)}...`
}

function formatDateChip(
  label: string,
  value: Date | string | null
): string | null {
  if (!value) return null
  const date =
    typeof value === "string" ? value : value.toISOString().slice(0, 10)
  return `${label}: ${date}`
}

function claimCardTone(
  state: ClaimKanbanColumnId
): "default" | "positive" | "attention" | "critical" {
  return COLUMN_BADGE_TONE[state] ?? "default"
}

function claimCurrentActor(row: ClaimRow): string | null {
  if (row.paidAt) return shortActorId(row.decidedByUserId)
  if (row.decidedAt) return shortActorId(row.decidedByUserId)
  if (row.submittedAt) return shortActorId(row.submittedByUserId)
  return null
}

type ClaimKanbanCardRow = ClaimRow & { state: ClaimKanbanColumnId }

function claimNextActionLabel(row: ClaimKanbanCardRow): string {
  switch (row.state) {
    case "submitted":
      return row.currentApprovalId ? "Next: decision" : "Next: triage"
    case "returned":
      return "Next: employee update"
    case "approved":
      return "Next: payroll"
    case "paid":
      return "Settled"
    case "rejected":
    case "cancelled":
      return "Closed"
    default:
      return "Next: review"
  }
}

function claimKanbanMetadataChips(
  row: ClaimKanbanCardRow,
  copy: ClaimKanbanCopy
) {
  const chips: Array<{
    label: string
    tone?: "default" | "positive" | "attention" | "critical"
  }> = []
  const actor = claimCurrentActor(row)
  const missingEvidence =
    (row.requiresEvidence || row.policyEvidenceRequired === true) &&
    row.evidenceCount === 0

  if (actor) {
    chips.push({ label: `Actor: ${actor}` })
  }
  const submitted = formatDateChip("Submitted", row.submittedAt)
  if (submitted) {
    chips.push({ label: submitted })
  } else {
    const claimDate = formatDateChip("Claim date", row.claimDate)
    if (claimDate) chips.push({ label: claimDate })
  }
  if (row.evidenceCount > 0) {
    chips.push({
      label: copy.evidenceCount(row.evidenceCount),
      tone: "positive",
    })
  } else if (missingEvidence) {
    chips.push({ label: "Blocked: evidence missing", tone: "critical" })
  }
  if (row.rejectedReason) {
    chips.push({ label: "Reason captured", tone: "critical" })
  }
  chips.push({
    label: claimNextActionLabel(row),
    tone: missingEvidence ? "critical" : claimCardTone(row.state),
  })

  return chips
}

function mapClaimRowsToKanbanCards(
  rows: readonly ClaimRow[],
  copy: ClaimKanbanCopy
) {
  return rows
    .filter((row): row is ClaimRow & { state: ClaimKanbanColumnId } =>
      (CLAIM_KANBAN_COLUMN_IDS as readonly string[]).includes(row.state)
    )
    .map((row) => {
      const badges: string[] = []
      if (row.evidenceCount > 0) {
        badges.push(copy.evidenceCount(row.evidenceCount))
      }
      if (row.state === "submitted" && row.currentApprovalId) {
        badges.push(copy.underReview)
      }

      return {
        id: row.id,
        columnId: row.state,
        title: row.employeeFullName ?? row.employeeNumber ?? row.employeeId,
        subtitle: [
          row.claimNumber,
          row.claimTypeCode,
          `${row.amount} ${row.currency}`,
        ]
          .filter(Boolean)
          .join(" · "),
        tone: claimCardTone(row.state),
        badges: badges.length > 0 ? badges : undefined,
        metadataChips: claimKanbanMetadataChips(row, copy),
      }
    })
}

function buildClaimKanbanDragTransitions(
  fromColumnId: ClaimKanbanColumnId,
  canCancel: boolean,
  copy: ClaimKanbanDragCopy
) {
  const targets = CLAIM_KANBAN_COLUMN_TRANSITIONS[fromColumnId]

  return targets.map((toColumnId) => {
    if (toColumnId === "cancelled") {
      return resolveKanbanCardTransition({
        fromColumnId,
        toColumnId,
        label: copy.cancelTransitionLabel,
        allowed: canCancel,
        disabledReason: canCancel ? undefined : copy.dragDisabledNotCancellable,
      })
    }

    return resolveKanbanCardTransition({
      fromColumnId,
      toColumnId,
      label: copy.columnLabels[toColumnId],
      allowed: false,
      disabledReason: copy.dragDisabledUseInbox,
    })
  })
}

export function buildClaimKanbanConfiguration(
  rows: readonly ClaimRow[],
  copy: ClaimKanbanCopy
): GovernedKanbanBoardConfigurationInput {
  const columns = CLAIM_KANBAN_COLUMN_IDS.map((id) => ({
    id,
    label: copy.columnLabels[id],
    badgeTone: COLUMN_BADGE_TONE[id],
  }))

  return {
    dataNature: "kanban",
    interactionMode: "footer-actions",
    requiresErpPermission: {
      module: "hrm",
      object: "claim",
      function: "read",
    },
    copy: {
      boardAriaLabel: copy.boardAriaLabel,
      emptyColumn: copy.emptyColumn,
    },
    workflow: buildKanbanWorkflowFromColumnTransitions(
      CLAIM_KANBAN_COLUMN_TRANSITIONS
    ),
    columns,
    columnOrder: [...CLAIM_KANBAN_COLUMN_IDS],
    cards: mapClaimRowsToKanbanCards(rows, copy),
  }
}

export function buildClaimKanbanDragConfiguration(
  rows: readonly ClaimRow[],
  copy: ClaimKanbanDragCopy
): GovernedKanbanBoardConfigurationInput {
  const columns = CLAIM_KANBAN_COLUMN_IDS.map((id) => ({
    id,
    label: copy.columnLabels[id],
    badgeTone: COLUMN_BADGE_TONE[id],
  }))

  const baseCards = mapClaimRowsToKanbanCards(rows, copy)

  return {
    dataNature: "kanban",
    interactionMode: "drag-reorder",
    requiresErpPermission: {
      module: "hrm",
      object: "claim",
      function: "update",
    },
    copy: {
      boardAriaLabel: copy.boardAriaLabel,
      emptyColumn: copy.emptyColumn,
      dragHandleAriaLabel: copy.dragHandleAriaLabel,
    },
    workflow: buildKanbanWorkflowFromColumnTransitions(
      CLAIM_KANBAN_COLUMN_TRANSITIONS
    ),
    columns,
    columnOrder: [...CLAIM_KANBAN_COLUMN_IDS],
    cards: baseCards.map((card) => ({
      ...card,
      availableTransitions: buildClaimKanbanDragTransitions(
        card.columnId as ClaimKanbanColumnId,
        isClaimCancellable(card.columnId),
        copy
      ),
    })),
  }
}
