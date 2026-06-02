"use client";

import { useMemo } from "react";

import { useTranslations } from "../i18n/governed-surface-copy.client";
import {
  parseGovernedKanbanBoardConfiguration,
  type GovernedKanbanBoardConfigurationInput,
} from "../client";

import { KanbanBoardView } from "../metadata/renderers/kanban-board-view";
import { GovernedEmpty } from "./governed-empty";

export type GovernedKanbanReadOnlyBoardProps = {
  configuration: GovernedKanbanBoardConfigurationInput;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  showOperatorDiagnostics?: boolean;
};

/**
 * Client bridge for `interactionMode: "read-only"` kanban boards.
 * Use inside `GovernedKanbanFooterSection` for RSC section chrome.
 */
export function GovernedKanbanReadOnlyBoard({
  configuration,
  surfaceKey,
  sectionKey,
  componentKey,
  showOperatorDiagnostics = false,
}: GovernedKanbanReadOnlyBoardProps) {
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

  if (parsed.data.interactionMode !== "read-only") {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: t("invalidConfigTitle"),
          description: t("invalidInteractionModeReadOnly"),
          emptyId: "kanban-invalid-interaction-mode-read-only",
        }}
        testId="governed-kanban-invalid-interaction-mode-read-only"
      />
    );
  }

  return (
    <KanbanBoardView
      board={parsed.data}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey}
    />
  );
}
