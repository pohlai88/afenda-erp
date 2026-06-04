import { GovernedEmpty } from "./gov-governed-empty";
import {
  GOVERNED_KANBAN_BOARD_SCHEMA_ID,
  parseGovernedKanbanBoardConfiguration,
} from "./gov-kanban-board-schema";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";

import type { RendererProps } from "./gov-governed-renderer-dispatch";
import type { GovernedComponentRendererDiagnostics } from "./gov-registry";

import { KanbanBoardView } from "./gov-kanban-board-view";

/** Declares container boundary for lint coverage; geometry lives in KanbanBoardView. */
const KANBAN_RENDERER_SHELL_CLASS = "@container min-w-0";

export type KanbanBoardRendererProps = RendererProps & {
  diagnostics?: GovernedComponentRendererDiagnostics;
};

export function KanbanBoardRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: KanbanBoardRendererProps) {
  const resolvedComponentKey = componentKey ?? sectionKey ?? surfaceKey ?? "kanban-board";
  const parsed = parseGovernedKanbanBoardConfiguration(configuration);

  if (!parsed.success) {
    const partialCopy =
      configuration &&
      typeof configuration === "object" &&
      "copy" in configuration &&
      configuration.copy &&
      typeof configuration.copy === "object"
        ? configuration.copy
        : undefined;

    const title =
      partialCopy &&
      "invalidTitle" in partialCopy &&
      typeof partialCopy.invalidTitle === "string"
        ? partialCopy.invalidTitle
        : "This board is unavailable";

    const description =
      diagnostics === "operator"
        ? `${GOVERNED_KANBAN_BOARD_SCHEMA_ID} failed validation.`
        : partialCopy &&
            "invalidDescription" in partialCopy &&
            typeof partialCopy.invalidDescription === "string"
          ? partialCopy.invalidDescription
          : "The board configuration failed validation. Contact your administrator if this persists.";

    return (
      <div className={KANBAN_RENDERER_SHELL_CLASS}>
        <GovernedEmpty
          model={{
            variant: "error",
            title,
            description,
            emptyId: "kanban-board-parse-error",
          }}
          surfaceKey={surfaceKey}
          sectionKey={sectionKey}
          componentKey={resolvedComponentKey}
          renderState="invalid"
        />
      </div>
    );
  }

  if (parsed.data.interactionMode === "footer-actions") {
    const description =
      diagnostics === "operator"
        ? `${GOVERNED_KANBAN_BOARD_SCHEMA_ID}: use GovernedKanbanFooterBoard + renderCardFooter (not GovernedComponentRenderer).`
        : "Stage actions are configured in the domain module footer bridge, not this renderer path.";

    return (
      <div className={KANBAN_RENDERER_SHELL_CLASS}>
        <GovernedEmpty
          model={{
            variant: "muted",
            title: parsed.data.copy.boardAriaLabel,
            description,
            emptyId: "kanban-board-footer-actions-unavailable",
          }}
          surfaceKey={surfaceKey}
          sectionKey={sectionKey}
          componentKey={resolvedComponentKey}
        />
      </div>
    );
  }

  if (parsed.data.interactionMode === "drag-reorder") {
    const description =
      diagnostics === "operator"
        ? `${GOVERNED_KANBAN_BOARD_SCHEMA_ID}: use GovernedKanbanDragBoard + onCardMove (not GovernedComponentRenderer).`
        : "Drag reorder is configured in the domain module drag bridge, not this renderer path.";

    return (
      <div className={KANBAN_RENDERER_SHELL_CLASS}>
        <GovernedEmpty
          model={{
            variant: "muted",
            title: parsed.data.copy.boardAriaLabel,
            description,
            emptyId: "kanban-board-drag-unavailable",
          }}
          surfaceKey={surfaceKey}
          sectionKey={sectionKey}
          componentKey={resolvedComponentKey}
        />
      </div>
    );
  }

  return (
    <div
      className={KANBAN_RENDERER_SHELL_CLASS}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("kanban-board-renderer", resolvedComponentKey),
        componentType: "governed:kanban-board",
      })}
    >
      <KanbanBoardView
        board={parsed.data}
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={resolvedComponentKey}
      />
    </div>
  );
}
