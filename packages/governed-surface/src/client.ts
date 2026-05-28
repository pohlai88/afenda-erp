/**
 * Client-safe door for governed-surface — components, Zod schemas, and pure helpers.
 * Do not import `@afenda/governed-surface` (index) from Client Components;
 * it re-exports server-only RSC sections that pull auth and Next request APIs.
 */
export {
  GovernedDataTableClient,
  type GovernedDataTableClientProps,
} from "./components/governed-data-table.client";

export {
  GovernedTrailingActionSlot,
  type GovernedTrailingActionSlotProps,
} from "./components/governed-trailing-action-slot.client";

export { GovernedMetadataTrailingCell } from "./components/governed-metadata-trailing-cell.client";

export {
  GOVERNED_LIST_TRAILING_CELL_REGISTRY,
  resolveGovernedTrailingColumn,
  type GovernedListTrailingCellId,
} from "./components/governed-list-trailing-cell-registry.client";

export type {
  GovernedListTrailingCellProps,
  GovernedPatternCTrailingColumnSpec,
} from "./governed-pattern-c-trailing-column.shared";

export {
  GovernedKanbanFooterBoard,
  type GovernedKanbanFooterBoardProps,
} from "./components/governed-kanban-footer-board.client";

export {
  GovernedKanbanDragBoard,
  type GovernedKanbanDragBoardProps,
} from "./components/governed-kanban-drag-board.client";

export {
  GovernedKanbanTransitionHint,
  type GovernedKanbanTransitionHintProps,
} from "./components/governed-kanban-transition-hint.client";

export {
  GovernedKanbanReadOnlyBoard,
  type GovernedKanbanReadOnlyBoardProps,
} from "./components/governed-kanban-read-only-board.client";

export {
  GovernedEmpty,
  type GovernedEmptyProps,
} from "./components/governed-empty";

export {
  GovernedSection,
  type GovernedSectionProps,
} from "./components/governed-section";

export {
  ActionFormErrors,
  type ActionFormErrorsProps,
} from "./components/action-form-errors";

export {
  isListSurfaceTrailingActionRenderable,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ResolveListSurfaceRowTrailingActionInput,
} from "./list-surface-trailing-action.shared";

export {
  buildGovernedListSurfaceDataAttributes,
  governedListRowTestId,
  governedListSurfaceTestId,
} from "./list-surface-identity.shared";

export {
  DEFAULT_GOVERNED_LIST_TOOLBAR_RESET_PARAMS,
  buildGovernedListToolbarCanonicalHref,
  buildGovernedListToolbarClearHref,
  buildGovernedListToolbarParamHref,
  buildGovernedListToolbarSavedViewItems,
  governedListToolbarOwnedParams,
  governedListToolbarResetParams,
  type GovernedListSavedViewItem,
  type GovernedListSavedViewSource,
} from "./list-surface-toolbar-url.shared";

export {
  evaluateFormRuleCondition,
  isFormRuleEffectVisible,
  resolveFormFieldRuleState,
  type FormFieldRuleState,
  type FormRuleValues,
} from "./form-rules.evaluate.shared";

export type { ListSurfaceRowTrailingAction } from "./schemas/list-surface-row-trailing-action.schema";

export type {
  ListSurfacePresentation,
  ListSurfaceRow,
  ListSurfaceRowDecisionLedger,
  ListSurfaceRowTone,
} from "./schemas/list-surface-renderer.schema";

export {
  parseGovernedChartConfiguration,
  type ChartAction,
  type ChartAnnotation,
  type ChartDataNature,
  type ChartHeatmapCell,
  type ChartPoint,
  type ChartReferenceBand,
  type ChartSeries,
  type GovernedChartConfiguration,
  type GovernedChartConfigurationInput,
  type GovernedChartKind,
} from "./schemas/chart.schema";

export {
  parseGovernedApprovalTimelineConfiguration,
  type ApprovalTimelineDataNature,
  type ApprovalTimelineStep,
  type ApprovalTimelineStepStatus,
  type GovernedApprovalTimelineConfiguration,
  type GovernedApprovalTimelineConfigurationInput,
} from "./schemas/approval-timeline.schema";

export {
  type ListSurfaceToolbar,
  type ListSurfaceToolbarBulkAction,
  type ListSurfaceToolbarExport,
  type ListSurfaceToolbarFilter,
  type ListSurfaceToolbarFilterOption,
  type ListSurfaceToolbarSavedView,
  type ListSurfaceToolbarSavedViewItem,
  type ListSurfaceToolbarSearch,
  type ListSurfaceToolbarSort,
  type ListSurfaceToolbarSortOption,
} from "./schemas/list-surface-toolbar.schema";

export {
  parseGovernedKanbanBoardConfiguration,
  type GovernedKanbanBoardConfiguration,
  type GovernedKanbanBoardConfigurationInput,
  type KanbanBadgeTone,
  type KanbanBoardCopy,
  type KanbanCard,
  type KanbanCardTransitionAvailability,
  type KanbanColumn,
  type KanbanInteractionMode,
  type KanbanWorkflowTransition,
} from "./schemas/kanban-board.schema";

export {
  buildKanbanCardMovePayload,
  isKanbanCardDraggable,
  resolveKanbanCardDropState,
  type KanbanCardDropState,
  type KanbanCardMovePayload,
} from "./kanban-card-drop.shared";

export {
  buildKanbanOutgoingTransitionHints,
  isKanbanCardTransitionRenderable,
  kanbanCardTransitionHidden,
  resolveKanbanCardTransition,
  type KanbanOutgoingTransitionTargetInput,
  type ResolveKanbanCardTransitionInput,
} from "./kanban-card-transition.shared";

export {
  governedKanbanBoardTestId,
  governedKanbanCardTestId,
  governedKanbanSectionTestId,
  resolveKanbanBoardDomProps,
} from "./kanban-surface-identity.shared";

export {
  governedComponentDiscriminatedSchema,
  governedComponentTypeSchema,
  parseGovernedComponentData,
  type GovernedComponent,
  type GovernedComponentType,
} from "./schemas/component.schema";
