"use client";

import { useTranslations } from "../i18n/governed-surface-copy.client";
import { parseGovernedKanbanBoardConfiguration } from "../client";
import type { GovernedKanbanBoardConfigurationInput } from "../client";

import { GovernedEmpty } from "./governed-empty";
import { KanbanBoardView } from "../metadata/renderers/kanban-board-view";

export type GovernedKanbanReadOnlyBoardProps = {
  configuration: GovernedKanbanBoardConfigurationInput;
  surfaceKey?: string;
  showOperatorDiagnostics?: boolean;
};

/**
 * Client bridge for `interactionMode: "read-only"` kanban boards.
 * Use inside `GovernedKanbanFooterSection` for RSC section chrome.
 */
export function GovernedKanbanReadOnlyBoard({
  configuration,
  surfaceKey,
  showOperatorDiagnostics = false,
}: GovernedKanbanReadOnlyBoardProps) {
  const t = useTranslations("Erp.GovernedSurface.kanban");
  const parsed = parseGovernedKanbanBoardConfiguration(configuration);

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
      />
    );
  }

  return <KanbanBoardView board={parsed.data} surfaceKey={surfaceKey} />;
}
