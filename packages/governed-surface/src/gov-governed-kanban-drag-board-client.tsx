"use client";

import { useMemo } from "react";

import { useTranslations } from "../i18n/governed-surface-copy.client";
import { KanbanBoardDragView } from "../metadata/renderers/kanban-board-drag-view.client";

import {
  parseGovernedKanbanBoardConfiguration,
  type GovernedKanbanBoardConfigurationInput,
  type KanbanCardMovePayload,
} from "./client";

import { GovernedEmpty } from "./governed-empty";

export type GovernedKanbanDragBoardProps = {
  configuration: GovernedKanbanBoardConfigurationInput;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  onCardMove: (payload: KanbanCardMovePayload) => void | Promise<void>;
  isMovePending?: boolean;
  pendingCardId?: string | null;
  showOperatorDiagnostics?: boolean;
};

/**
 * Client bridge for `interactionMode: "drag-reorder"` kanban boards.
 * Domain modules own mutations via `onCardMove` — the kernel never writes state.
 */
export function GovernedKanbanDragBoard({
  configuration,
  surfaceKey,
  sectionKey,
  componentKey,
  onCardMove,
  isMovePending = false,
  pendingCardId = null,
  showOperatorDiagnostics = false,
}: GovernedKanbanDragBoardProps) {
  const t = useTranslations("Erp.GovernedSurface.kanban");

  const parsed = useMemo(
    () => parseGovernedKanbanBoardConfiguration(configuration),
    [configuration],
  );

  if (!parsed.success) {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: t("invalidConfigTitle"),
          description: showOperatorDiagnostics
            ? t("invalidConfigDescriptionOperator")
            : t("invalidConfigDescription"),
          emptyId: "kanban-invalid-config",
        }}
        testId="governed-kanban-invalid-config"
      />
    );
  }

  if (parsed.data.interactionMode !== "drag-reorder") {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: t("invalidConfigTitle"),
          description: t("invalidInteractionModeDrag"),
          emptyId: "kanban-invalid-interaction-mode-drag",
        }}
        testId="governed-kanban-invalid-interaction-mode-drag"
      />
    );
  }

  return (
    <KanbanBoardDragView
      board={parsed.data}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey}
      onCardMove={onCardMove}
      isMovePending={isMovePending}
      pendingCardId={pendingCardId}
    />
  );
}
