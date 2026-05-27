"use client"

import { useTranslations } from "../i18n/governed-surface-copy.client"

import { KanbanBoardDragView } from "../metadata/renderers/kanban-board-drag-view.client"

import {
  parseGovernedKanbanBoardConfiguration,
  type GovernedKanbanBoardConfigurationInput,
  type KanbanCardMovePayload,
} from "../client"

import { GovernedEmpty } from "./governed-empty"

export type GovernedKanbanDragBoardProps = {
  configuration: GovernedKanbanBoardConfigurationInput
  surfaceKey?: string
  onCardMove: (payload: KanbanCardMovePayload) => void
  isMovePending?: boolean
  pendingCardId?: string | null
  showOperatorDiagnostics?: boolean
}

/**
 * Client bridge for `interactionMode: "drag-reorder"` kanban boards.
 * Domain modules own mutations via `onCardMove` — the kernel never writes state.
 */
export function GovernedKanbanDragBoard({
  configuration,
  surfaceKey,
  onCardMove,
  isMovePending = false,
  pendingCardId = null,
  showOperatorDiagnostics = false,
}: GovernedKanbanDragBoardProps) {
  const t = useTranslations("Erp.GovernedSurface.kanban")
  const parsed = parseGovernedKanbanBoardConfiguration(configuration)

  if (!parsed.success) {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: t("invalidConfigTitle"),
          description: showOperatorDiagnostics
            ? t("invalidConfigDescriptionOperator")
            : t("invalidConfigDescription"),
        }}
      />
    )
  }

  if (parsed.data.interactionMode !== "drag-reorder") {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: t("invalidConfigTitle"),
          description: t("invalidInteractionModeDrag"),
        }}
      />
    )
  }

  return (
    <KanbanBoardDragView
      board={parsed.data}
      surfaceKey={surfaceKey}
      onCardMove={onCardMove}
      isMovePending={isMovePending}
      pendingCardId={pendingCardId}
    />
  )
}
