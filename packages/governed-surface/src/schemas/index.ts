/**
 * Narrow schema/parser door — import `@afenda/governed-surface/schemas` for builders and tests.
 * without pulling presentation profiles or kanban helpers (ADR-0030 barrel thin).
 */
export type { SchemaStability } from "./_stability.shared";

export {
  SCHEMA_STABILITY as PAGE_HEADER_SCHEMA_STABILITY,
  pageHeaderSchema,
  parsePageHeaderData,
  type PageHeader,
} from "./page-header.schema";

export {
  erpPermissionRequirementSchema,
  type ErpPermissionRequirement,
} from "./erp-permission-requirement.schema";

export {
  SCHEMA_STABILITY as LIST_SURFACE_SCHEMA_STABILITY,
  emptyStateSchema,
  listColumnSchema,
  listSurfaceSchema,
  parseEmptyStateData,
  parseListSurfaceData,
  type EmptyState,
  type ListColumn,
  type ListSurface,
} from "./list-surface.schema";

export {
  SCHEMA_STABILITY as ACTION_DESCRIPTOR_SCHEMA_STABILITY,
  actionDescriptorSchema,
  parseActionDescriptorData,
  type ActionDescriptor,
} from "./action.schema";

export {
  SCHEMA_STABILITY as AUDIT_PANEL_SCHEMA_STABILITY,
  auditPanelRowSchema,
  auditPanelSchema,
  parseAuditPanelData,
  type AuditPanelModel,
  type AuditPanelRow,
} from "./audit-panel.schema";

export {
  SCHEMA_STABILITY as DETAIL_TABS_SCHEMA_STABILITY,
  governedDetailTabsSchema,
  parseGovernedDetailTabsData,
  type GovernedDetailSection,
  type GovernedDetailTabKind,
  type GovernedDetailTabsInput,
  type GovernedDetailTabsModel,
  type GovernedRevisionEntry,
} from "./detail-tabs.schema";

export {
  SCHEMA_STABILITY as STAT_CARD_SCHEMA_STABILITY,
  parseStatCardConfiguration,
  statCardConfigurationSchema,
  statCardDataNatureSchema,
  statCardDensitySchema,
  type StatCardConfiguration,
  type StatCardConfigurationInput,
  type StatCardConfigurationResolvedInput,
  type StatCardDataNature,
  type StatCardDensity,
  type StatCardIcon,
  type StatCardItem,
  type StatCardTone,
} from "./stat-card.schema";

export {
  GOVERNED_PRESENTATION_PROFILE_IDS,
  isListPresentationProfileId,
  isStatPresentationProfileId,
  listPresentationProfileIdSchema,
  presentationProfileIdSchema,
  statPresentationProfileIdSchema,
  type ListPresentationProfileId,
  type PresentationProfileId,
  type StatPresentationProfileId,
} from "./presentation-profile.schema";

export {
  SCHEMA_STABILITY as LIST_SURFACE_RENDERER_SCHEMA_STABILITY,
  listSurfaceRendererConfigurationSchema,
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfigurationInput,
  type ListSurfaceRendererConfigurationResolvedInput,
  type ListSurfacePresentation,
  type ListSurfaceRow,
  type ListSurfaceRowDecisionLedger,
  type ListSurfaceRowTone,
} from "./list-surface-renderer.schema";

export {
  listSurfaceToolbarSchema,
  type ListSurfaceToolbarBulkAction,
  type ListSurfaceToolbarExport,
  type ListSurfaceToolbarFilter,
  type ListSurfaceToolbarFilterOption,
  type ListSurfaceToolbarSavedView,
  type ListSurfaceToolbarSavedViewItem,
  type ListSurfaceToolbarSearch,
  type ListSurfaceToolbarSort,
  type ListSurfaceToolbarSortOption,
  type ListSurfaceToolbar,
} from "./list-surface-toolbar.schema";

export {
  GOVERNED_CHART_CONFIGURATION_SCHEMA_ID,
  GOVERNED_CHART_CONFIGURATION_SCHEMA_STABILITY,
  chartActionSchema,
  chartAnnotationSchema,
  chartDataNatureSchema,
  chartHeatmapSchema,
  chartReferenceBandSchema,
  chartSeriesSchema,
  governedChartConfigurationSchema,
  governedChartKindSchema,
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
} from "./chart.schema";

export {
  GOVERNED_APPROVAL_TIMELINE_SCHEMA_ID,
  GOVERNED_APPROVAL_TIMELINE_SCHEMA_STABILITY,
  approvalTimelineDataNatureSchema,
  approvalTimelineStepSchema,
  approvalTimelineStepStatusSchema,
  governedApprovalTimelineConfigurationSchema,
  parseGovernedApprovalTimelineConfiguration,
  type ApprovalTimelineDataNature,
  type ApprovalTimelineStep,
  type ApprovalTimelineStepStatus,
  type GovernedApprovalTimelineConfiguration,
  type GovernedApprovalTimelineConfigurationInput,
} from "./approval-timeline.schema";

export {
  GOVERNED_WORKBENCH_SEARCH_PARAM_KEYS,
  type GovernedWorkbenchSearchParamKey,
} from "./workbench-search-params.shared";

export {
  GOVERNED_KANBAN_BOARD_SCHEMA_ID,
  GOVERNED_KANBAN_BOARD_SCHEMA_STABILITY,
  governedKanbanBoardConfigurationSchema,
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
} from "./kanban-board.schema";

export {
  SCHEMA_STABILITY as LIST_SURFACE_ROW_TRAILING_ACTION_SCHEMA_STABILITY,
  listSurfaceRowTrailingActionSchema,
  parseListSurfaceRowTrailingAction,
  type ListSurfaceRowTrailingAction,
} from "./list-surface-row-trailing-action.schema";

export {
  GOVERNED_COMPONENT_SCHEMA_ID,
  GOVERNED_COMPONENT_SCHEMA_STABILITY,
  governedComponentDiscriminatedSchema,
  governedComponentTypeSchema,
  parseGovernedComponentData,
  type GovernedComponent,
  type GovernedComponentType,
} from "./component.schema";

export {
  EMPTY_GOVERNED_COMPONENT_REGISTRY,
  SCHEMA_STABILITY as GOVERNED_COMPONENT_REGISTRY_SCHEMA_STABILITY,
  governedComponentRegistrySchema,
  parseGovernedComponentRegistryData,
  type GovernedComponentRegistry,
} from "./component-registry.schema";

export {
  FORM_EVENTS,
  SCHEMA_STABILITY as EVENT_HANDLER_SCHEMA_STABILITY,
  eventHandlerMetadataSchema,
  formEventIdSchema,
  parseEventHandlerMetadata,
  type EventHandlerMetadata,
  type FormEventId,
} from "./events.shared";

export {
  type ActionFieldErrors,
  type ActionResult,
  actionFailure,
  actionSuccess,
  assertFormActionResult,
  isActionFailure,
  isActionResultSuccess,
  toVoidFormAction,
  zodActionFailure,
} from "./action-result.shared";

export {
  assertGovernedSurfaceInput,
  tryGovernedSurfaceInput,
  type GovernedSurfaceInputAssertion,
  type GovernedSurfaceInputAssertionError,
} from "./dev-assert.shared";

export {
  GOVERNED_METADATA_SCHEMA_VERSION,
  governedMetadataSchemaVersionSchema,
  type GovernedMetadataSchemaVersion,
} from "./schema-version.shared";

export {
  GOVERNED_FORM_RULES_SCHEMA_ID,
  GOVERNED_FORM_RULES_SCHEMA_STABILITY,
  formRuleConditionSchema,
  formRuleEffectSchema,
  formRuleFieldConditionSchema,
  formRuleSchema,
  parseFormRuleData,
  type FormRule,
  type FormRuleCondition,
  type FormRuleEffect,
  type FormRuleFieldCondition,
} from "./form-rules.schema";

export {
  GOVERNED_MULTI_STEP_FORM_SCHEMA_ID,
  GOVERNED_MULTI_STEP_FORM_SCHEMA_STABILITY,
  governedMultiStepFormConfigurationSchema,
  parseGovernedMultiStepFormConfiguration,
  type GovernedFormField,
  type GovernedFormFieldKind,
  type GovernedFormFieldOption,
  type GovernedFormStep,
  type GovernedMultiStepFormConfiguration,
  type GovernedMultiStepFormConfigurationInput,
  type MultiStepFormDataNature,
} from "./multi-step-form.schema";

export {
  SCHEMA_STABILITY as LIST_TRAILING_CELL_CONTEXT_SCHEMA_STABILITY,
  governedListTrailingCellContextSchema,
  parseGovernedListTrailingCellContext,
  type GovernedListTrailingCellContext,
} from "./list-trailing-cell-context.schema";
