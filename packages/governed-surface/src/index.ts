/**
 * Neutral shared API — schemas, builders, server actions, identity helpers.
 * Safe from server or client; no React client boundary.
 */
export {
  GOVERNED_METADATA_SCHEMA_VERSION,
  governedMetadataSchemaVersionSchema,
  type GovernedMetadataSchemaVersion,
} from "./gov-schema-version-shared";

export {
  ERP_FUNCTIONS,
  type ErpFunction,
  type ErpPermissionTuple,
} from "./gov-erp-permission-shared";

export {
  erpPermissionRequirementSchema,
  type ErpPermissionRequirement,
} from "./gov-erp-permission-requirement-schema";

export { resolveErpCapabilityForPermission } from "./erp-permission-capability.shared";

export {
  actionDescriptorSchema,
  parseActionDescriptorData,
  type ActionDescriptor,
} from "./gov-action-schema";

export {
  GOVERNED_ACTION_ID_FIELD,
  GOVERNED_CONFIRM_FIELD,
  GOVERNED_FORM_ID_FIELD,
  GOVERNED_SELECTED_ROW_ID_FIELD,
  GOVERNED_STEP_UP_TOKEN_FIELD,
  clearGovernedServerActionRegistryForTest,
  getGovernedSelectedRowIds,
  getGovernedServerActionRegistration,
  getGovernedServerActionRegistry,
  registerGovernedBulkServerAction,
  registerGovernedGuardedServerAction,
  registerGovernedPolicyBulkServerAction,
  registerGovernedPolicyServerAction,
  registerGovernedServerAction,
  resolveGovernedBulkServerAction,
  resolveGovernedServerAction,
  setGovernedServerActionAuditSinkForTest,
  validateGovernedServerActionPolicySubmission,
  validateGovernedServerActionSubmission,
  withGovernedServerActionPolicyGuard,
  withGovernedServerActionSubmissionGuard,
  type GovernedServerActionAuditEvent,
  type GovernedServerActionAuditMetadata,
  type GovernedServerActionAuditSink,
  type GovernedServerActionAuditStage,
  type GovernedServerActionHandler,
  type GovernedServerActionPolicyExpectation,
  type GovernedServerActionRegistration,
  type GovernedServerActionRegistry,
  type GovernedServerActionStepUpVerifier,
  type GovernedServerActionSubmissionExpectation,
} from "./gov-server-actions-shared";

export {
  GOVERNED_ACTION_BAR_CONFIGURATION_SCHEMA_ID,
  GOVERNED_ACTION_BAR_CONFIGURATION_SCHEMA_STABILITY,
  actionBarDataNatureSchema,
  governedActionBarConfigurationSchema,
  parseGovernedActionBarConfiguration,
  type ActionBarDataNature,
  type GovernedActionBarConfiguration,
  type GovernedActionBarConfigurationInput,
} from "./gov-action-bar-schema";

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
} from "./gov-list-surface-schema";

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
} from "./gov-list-surface-renderer-schema";

export {
  listSurfaceToolbarSchema,
  type ListSurfaceToolbar,
  type ListSurfaceToolbarActionConfirm,
  type ListSurfaceToolbarBulkAction,
  type ListSurfaceToolbarExport,
  type ListSurfaceToolbarFilter,
  type ListSurfaceToolbarFilterOption,
  type ListSurfaceToolbarSavedView,
  type ListSurfaceToolbarSavedViewItem,
  type ListSurfaceToolbarSearch,
  type ListSurfaceToolbarSort,
  type ListSurfaceToolbarSortOption,
} from "./gov-list-surface-toolbar-schema";

export {
  listSurfaceRowTrailingActionSchema,
  parseListSurfaceRowTrailingAction,
  type ListSurfaceRowTrailingAction,
} from "./gov-list-surface-row-trailing-action-schema";

export {
  parseStatCardConfiguration,
  statCardConfigurationSchema,
  type StatCardComparison,
  type StatCardConfiguration,
  type StatCardConfigurationInput,
  type StatCardConfigurationResolvedInput,
  type StatCardDataNature,
  type StatCardDensity,
  type StatCardIcon,
  type StatCardItem,
  type StatCardProgress,
  type StatCardSparkPoint,
  type StatCardTone,
} from "./gov-stat-card-schema";

export {
  chartPresentationProfileIdSchema,
  isChartPresentationProfileId,
  isListPresentationProfileId,
  isStatPresentationProfileId,
  listPresentationProfileIdSchema,
  presentationProfileIdSchema,
  statPresentationProfileIdSchema,
  type ChartPresentationProfileId,
  type ListPresentationProfileId,
  type PresentationProfileId,
  type StatPresentationProfileId,
} from "./gov-presentation-profile-schema";

export {
  GOVERNED_CHART_PRESENTATION_PROFILES,
  GOVERNED_LIST_PRESENTATION_PROFILES,
  GOVERNED_STAT_PRESENTATION_PROFILES,
} from "./gov-governed-presentation-profiles";

export {
  GOVERNED_STAT_GRID_CLASS,
  GOVERNED_STAT_TILE_SKELETON_CLASS,
} from "./stat-card-layout.shared";

export {
  resolveGovernedChartPresentation,
  resolveGovernedListPresentation,
  resolveGovernedStatPresentation,
  type GovernedChartPresentationResolved,
  type ResolveGovernedChartPresentationInput,
  type ResolveGovernedListPresentationInput,
  type ResolveGovernedStatPresentationInput,
} from "./gov-resolve-governed-presentation";

export {
  buildGovernedListSurface,
  type BuildGovernedListSurfaceInput,
} from "./gov-build-governed-list-surface";

export {
  buildGovernedListExportToolbarPresentation,
  buildGovernedWorkbenchFocusSearchPresentation,
  governedWorkbenchFocusPresentationPatch,
  matchesGovernedWorkbenchFocus,
  mergeGovernedListToolbarPresentation,
  type GovernedWorkbenchFocusSearchInput,
} from "./gov-governed-list-toolbar-shared";

export { listSurfaceHeader } from "./gov-list-surface-header-shared";

export {
  buildGovernedStatGrid,
  type BuildGovernedStatGridInput,
} from "./gov-build-governed-stat-grid";

export {
  buildGovernedChartSurface,
  type BuildGovernedChartSurfaceInput,
} from "./gov-build-governed-chart-surface";

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
} from "./gov-chart-schema";

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
} from "./gov-approval-timeline-schema";

export {
  GOVERNED_MULTI_STEP_FORM_SCHEMA_ID,
  GOVERNED_MULTI_STEP_FORM_SCHEMA_STABILITY,
  governedFormFieldKindSchema,
  governedFormFieldOptionSchema,
  governedFormFieldSchema,
  governedFormStepSchema,
  governedMultiStepFormConfigurationSchema,
  multiStepFormDataNatureSchema,
  parseGovernedMultiStepFormConfiguration,
  type GovernedFormField,
  type GovernedFormFieldKind,
  type GovernedFormFieldOption,
  type GovernedFormStep,
  type GovernedMultiStepFormConfiguration,
  type GovernedMultiStepFormConfigurationInput,
  type MultiStepFormDataNature,
} from "./gov-multi-step-form-schema";

export {
  GOVERNED_SCORECARD_FORM_SCHEMA_ID,
  GOVERNED_SCORECARD_FORM_SCHEMA_STABILITY,
  governedScorecardFormConfigurationSchema,
  parseGovernedScorecardFormConfiguration,
  scorecardCriterionSchema,
  scorecardFormDataNatureSchema,
  type GovernedScorecardFormConfiguration,
  type GovernedScorecardFormConfigurationInput,
  type ScorecardCriterion,
  type ScorecardFormDataNature,
} from "./gov-scorecard-form-schema";

export {
  GOVERNED_SECTION_CONFIGURATION_SCHEMA_ID,
  GOVERNED_SECTION_CONFIGURATION_SCHEMA_STABILITY,
  governedSectionConfigurationSchema,
  parseGovernedSectionConfiguration,
  type GovernedSectionConfiguration,
  type GovernedSectionConfigurationInput,
} from "./gov-section-schema";

export {
  GOVERNED_STACK_CONFIGURATION_SCHEMA_ID,
  GOVERNED_STACK_CONFIGURATION_SCHEMA_STABILITY,
  governedStackBentoTemplateSchema,
  governedStackConfigurationSchema,
  governedStackDirectionSchema,
  parseGovernedStackConfiguration,
  type GovernedStackConfiguration,
  type GovernedStackConfigurationInput,
  type GovernedStackDirection,
} from "./gov-stack-schema";

export {
  GOVERNED_SURFACE_CHROME_SCHEMA_ID,
  GOVERNED_SURFACE_CHROME_SCHEMA_STABILITY,
  governedSurfaceChromeSchema,
  governedSurfaceDensitySchema,
  governedSurfaceElevationSchema,
  governedSurfaceMaterialSchema,
  parseGovernedSurfaceChromeData,
  type GovernedSurfaceChrome,
  type GovernedSurfaceChromeInput,
  type GovernedSurfaceDensity,
  type GovernedSurfaceElevation,
  type GovernedSurfaceMaterial,
} from "./gov-surface-chrome-schema";

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
  diagnosticsDataAttributes,
  type GovernedDiagnostics,
  type GovernedDiagnosticsDataAttributes,
  type GovernedRenderableState,
} from "./gov-governed-diagnostics-shared";

export {
  governedDescriptionId,
  governedHeadingId,
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
  type GovernedIdentity,
  type GovernedIdentityAttributes,
} from "./gov-governed-identity-shared";

export {
  GovernedHeading,
  type GovernedHeadingLevel,
  type GovernedHeadingProps,
  type GovernedHeadingVariant,
} from "./gov-governed-heading-shared";

export { asGovernedRoute, isGovernedRoute } from "./gov-governed-safe-route";

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
