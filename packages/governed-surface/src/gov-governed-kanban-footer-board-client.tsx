"use client";

import { useMemo, type ReactNode } from "react";

import { useTranslations } from "../i18n/governed-surface-copy.client";
import { KanbanBoardView } from "../metadata/renderers/kanban-board-view";

import {
  parseGovernedKanbanBoardConfiguration,
  type GovernedKanbanBoardConfigurationInput,
  type KanbanCard,
} from "./client";

import { GovernedEmpty } from "./governed-empty";

export type GovernedKanbanFooterBoardProps = {
  configuration: GovernedKanbanBoardConfigurationInput;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  renderCardFooter?: (card: KanbanCard) => ReactNode;
  showOperatorDiagnostics?: boolean;
};

/**
 * Client bridge for `interactionMode: "footer-actions"` kanban boards.
 * Domain modules supply Server Action forms via `renderCardFooter`.
 */
export function GovernedKanbanFooterBoard({
  configuration,
  surfaceKey,
  sectionKey,
  componentKey,
  renderCardFooter,
  showOperatorDiagnostics = false,
}: GovernedKanbanFooterBoardProps) {
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

  if (parsed.data.interactionMode !== "footer-actions") {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: t("invalidConfigTitle"),
          description: t("invalidInteractionMode"),
          emptyId: "kanban-invalid-interaction-mode-footer",
        }}
        testId="governed-kanban-invalid-interaction-mode-footer"
      />
    );
  }

  return (
    <KanbanBoardView
      board={parsed.data}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey}
      renderCardFooter={renderCardFooter}
    />
  );
}
