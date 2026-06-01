import {
  diagnosticsDataAttributes,
  type GovernedDiagnosticsDataAttributes,
} from "./utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
  type GovernedIdentityAttributes,
} from "./utils/governed-identity.shared";

export type GovernedKanbanBoardRenderState = "empty" | "ready" | "invalid";

/** Stable section test id for Pattern K kanban surfaces (Pattern C parity). */
export function governedKanbanSectionTestId(surfaceKey: string): string {
  return governedTestId("kanban-section", surfaceKey);
}

export function governedKanbanBoardTestId(surfaceKey: string): string {
  return governedTestId("kanban-board", surfaceKey);
}

export function governedKanbanCardTestId(
  surfaceKey: string,
  cardId: string,
): string {
  return governedTestId("kanban-card", `${surfaceKey}:${cardId}`);
}

export function governedKanbanTransitionTestId(transitionId: string): string {
  return governedTestId("kanban-transition", transitionId);
}

const DEFAULT_KANBAN_BOARD_TEST_ID = "governed:kanban-board:unknown" as const;

export type GovernedKanbanBoardLegacyDataAttributes = {
  "data-governed-surface-key"?: string;
};

export type GovernedKanbanBoardDataAttributes = GovernedKanbanBoardLegacyDataAttributes &
  GovernedIdentityAttributes &
  GovernedDiagnosticsDataAttributes;

export function buildKanbanBoardDataAttributes(input: {
  surfaceKey?: string;
  sectionKey?: string;
  state: GovernedKanbanBoardRenderState;
}): GovernedKanbanBoardDataAttributes {
  const legacy: GovernedKanbanBoardLegacyDataAttributes = input.surfaceKey
    ? { "data-governed-surface-key": input.surfaceKey }
    : {};

  const canonical = {
    ...governedIdentityAttributes({
      surfaceKey: input.surfaceKey,
      sectionKey: input.sectionKey ?? input.surfaceKey,
      componentKey: input.surfaceKey,
    }),
    ...diagnosticsDataAttributes({
      state: input.state,
      testId: input.surfaceKey
        ? governedKanbanBoardTestId(input.surfaceKey)
        : DEFAULT_KANBAN_BOARD_TEST_ID,
    }),
  };

  return { ...legacy, ...canonical };
}

export type GovernedKanbanSectionDataAttributes = GovernedKanbanBoardLegacyDataAttributes &
  GovernedIdentityAttributes &
  GovernedDiagnosticsDataAttributes;

export function buildKanbanSectionDataAttributes(input: {
  surfaceKey: string;
  state: GovernedKanbanBoardRenderState;
  testId?: string;
}): GovernedKanbanSectionDataAttributes {
  return {
    ...(input.surfaceKey
      ? { "data-governed-surface-key": input.surfaceKey }
      : {}),
    ...governedIdentityAttributes({
      surfaceKey: input.surfaceKey,
      sectionKey: input.surfaceKey,
      componentKey: input.surfaceKey,
    }),
    ...diagnosticsDataAttributes({
      state: input.state,
      testId: input.testId ?? governedKanbanSectionTestId(input.surfaceKey),
    }),
  };
}

/** Legacy board dom props — prefer `buildKanbanBoardDataAttributes`. */
export function resolveKanbanBoardDomProps(
  surfaceKey?: string,
  state: GovernedKanbanBoardRenderState = "ready",
): GovernedKanbanBoardDataAttributes {
  return buildKanbanBoardDataAttributes({ surfaceKey, state });
}
