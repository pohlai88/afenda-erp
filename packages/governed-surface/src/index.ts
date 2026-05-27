export {
  GOVERNED_METADATA_SCHEMA_VERSION,
  governedMetadataSchemaVersionSchema,
  type GovernedMetadataSchemaVersion,
} from "./schemas/schema-version.shared";

export {
  erpPermissionRequirementSchema,
  type ErpPermissionRequirement,
} from "./schemas/erp-permission-requirement.schema";

export {
  actionDescriptorSchema,
  parseActionDescriptorData,
  type ActionDescriptor,
} from "./schemas/action.schema";

export {
  emptyStateSchema,
  listCellKindSchema,
  listColumnSchema,
  listSurfaceSchema,
  parseEmptyStateData,
  parseListSurfaceData,
  type EmptyState,
  type ListCellKind,
  type ListColumn,
  type ListSurface,
} from "./schemas/list-surface.schema";

export {
  listSurfaceRendererConfigurationSchema,
  parseListSurfaceRendererConfiguration,
  type ListSurfacePresentation,
  type ListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfigurationInput,
  type ListSurfaceRendererConfigurationResolvedInput,
  type ListSurfaceRow,
  type ListSurfaceRowDecisionLedger,
  type ListSurfaceRowTone,
} from "./schemas/list-surface-renderer.schema";

export {
  listSurfaceToolbarSchema,
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
  listSurfaceRowTrailingActionSchema,
  parseListSurfaceRowTrailingAction,
  type ListSurfaceRowTrailingAction,
} from "./schemas/list-surface-row-trailing-action.schema";

export {
  parseStatCardConfiguration,
  statCardConfigurationSchema,
  type StatCardConfiguration,
  type StatCardConfigurationInput,
  type StatCardConfigurationResolvedInput,
  type StatCardDataNature,
  type StatCardDensity,
  type StatCardIcon,
  type StatCardItem,
  type StatCardTone,
} from "./schemas/stat-card.schema";

export {
  isListPresentationProfileId,
  isStatPresentationProfileId,
  listPresentationProfileIdSchema,
  presentationProfileIdSchema,
  statPresentationProfileIdSchema,
  type ListPresentationProfileId,
  type PresentationProfileId,
  type StatPresentationProfileId,
} from "./schemas/presentation-profile.schema";

export {
  GOVERNED_LIST_PRESENTATION_PROFILES,
  GOVERNED_STAT_PRESENTATION_PROFILES,
} from "./profiles/governed-presentation-profiles";

export {
  resolveGovernedListPresentation,
  resolveGovernedStatPresentation,
  type ResolveGovernedListPresentationInput,
  type ResolveGovernedStatPresentationInput,
} from "./resolvers/resolve-governed-presentation";

export {
  buildGovernedListSurface,
  type BuildGovernedListSurfaceInput,
} from "./builders/build-governed-list-surface";

export {
  buildGovernedListExportToolbarPresentation,
  buildGovernedWorkbenchFocusSearchPresentation,
  governedWorkbenchFocusPresentationPatch,
  matchesGovernedWorkbenchFocus,
  mergeGovernedListToolbarPresentation,
  type GovernedWorkbenchFocusSearchInput,
} from "./builders/governed-list-toolbar.shared";

export { listSurfaceHeader } from "./builders/list-surface-header.shared";

export {
  buildGovernedStatGrid,
  type BuildGovernedStatGridInput,
} from "./builders/build-governed-stat-grid";

export {
  buildKanbanWorkflowFromColumnTransitions,
  indexKanbanWorkflowTransitions,
  isKanbanTransitionAllowed,
  kanbanTransitionId,
  validateKanbanCardTransitions,
} from "./kanban-workflow.shared";

export {
  buildKanbanOutgoingTransitionHints,
  isKanbanCardTransitionRenderable,
  kanbanCardTransitionHidden,
  resolveKanbanCardTransition,
  type KanbanOutgoingTransitionTargetInput,
  type ResolveKanbanCardTransitionInput,
} from "./kanban-card-transition.shared";

export {
  buildKanbanCardMovePayload,
  isKanbanCardDraggable,
  resolveKanbanCardDropState,
  type KanbanCardDropState,
  type KanbanCardMovePayload,
} from "./kanban-card-drop.shared";

export {
  isListSurfaceTrailingActionRenderable,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ResolveListSurfaceRowTrailingActionInput,
} from "./list-surface-trailing-action.shared";

export {
  buildGovernedListSurfaceDataAttributes,
  buildGovernedListSurfaceRenderFingerprint,
  governedListSectionAnchorHref,
  governedListSectionDomId,
  governedListRowTestId,
  governedListSectionTestId,
  governedListSurfaceTestId,
  summarizeListSurfaceTrailingActions,
  type GovernedListSurfaceDataAttributes,
  type GovernedListSurfaceRenderLogFields,
  type GovernedListSurfaceRenderState,
  type GovernedListSurfaceTrailingSummary,
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
  resolveFormFieldRuleState,
  type FormFieldRuleState,
  type FormRuleValues,
} from "./form-rules.evaluate.shared";

export { migrateGovernedConfiguration } from "./migrate-governed-configuration.shared";

export {
  governedKanbanBoardTestId,
  governedKanbanCardTestId,
  resolveKanbanBoardDomProps,
  governedKanbanSectionTestId,
} from "./kanban-surface-identity.shared";
