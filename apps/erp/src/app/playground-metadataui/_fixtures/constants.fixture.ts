export const METADATA_UI_PLAYGROUND_ROUTE = "/playground-metadataui" as const;

export const METADATA_UI_PLAYGROUND_FIXED_INSTANT =
  "2026-01-01T08:00:00.000Z" as const;

export const METADATA_UI_PLAYGROUND_FIXTURE_IDS = {
  stack: "metadata-ui.playground.stack",
  pageHeaderSection: "metadata-ui.playground.page-header",
  pageHeaderMetadata: "metadata-ui.playground.header",
  rendererGalleryHeaderSection:
    "metadata-ui.playground.group.renderer-gallery",
  rendererGalleryHeaderMetadata:
    "metadata-ui.playground.group.renderer-gallery.header",
  stateCoverageHeaderSection:
    "metadata-ui.playground.group.state-coverage",
  stateCoverageHeaderMetadata:
    "metadata-ui.playground.group.state-coverage.header",
  inputSurfacesHeaderSection:
    "metadata-ui.playground.group.input-surfaces",
  inputSurfacesHeaderMetadata:
    "metadata-ui.playground.group.input-surfaces.header",
  analyticalAuditHeaderSection:
    "metadata-ui.playground.group.analytical-audit",
  analyticalAuditHeaderMetadata:
    "metadata-ui.playground.group.analytical-audit.header",
  interactionHeaderSection:
    "metadata-ui.playground.group.interaction-surfaces",
  interactionHeaderMetadata:
    "metadata-ui.playground.group.interaction-surfaces.header",
  actionBarSection: "metadata-ui.playground.action-bar",
  actionBarMetadata: "metadata-ui.playground.actions",
  statSection: "metadata-ui.playground.stat",
  statMetadata: "metadata-ui.playground.stat-summary",
  listSection: "metadata-ui.playground.list",
  listMetadata: "metadata-ui.playground.dense-list",
  stateSection: "metadata-ui.playground.state-coverage",
  readyState: "metadata-ui.playground.state.ready",
  loadingState: "metadata-ui.playground.state.loading",
  emptyState: "metadata-ui.playground.state.empty",
  forbiddenState: "metadata-ui.playground.state.forbidden",
  errorState: "metadata-ui.playground.state.error",
  formSection: "metadata-ui.playground.form",
  formMetadata: "metadata-ui.playground.form.review",
  formFieldRecord: "metadata-ui.playground.form.field.record",
  formFieldLocation: "metadata-ui.playground.form.field.location",
  formFieldStatus: "metadata-ui.playground.form.field.status",
  formFieldNotes: "metadata-ui.playground.form.field.notes",
  scorecardFormSection: "metadata-ui.playground.scorecard-form",
  scorecardFormMetadata: "metadata-ui.playground.scorecard.review",
  scorecardCriterionCompleteness:
    "metadata-ui.playground.scorecard.criterion.completeness",
  scorecardCriterionClarity:
    "metadata-ui.playground.scorecard.criterion.clarity",
  scorecardCriterionReadiness:
    "metadata-ui.playground.scorecard.criterion.readiness",
  chartSection: "metadata-ui.playground.chart",
  chartMetadata: "metadata-ui.playground.chart.coverage-heatmap",
  timelineSection: "metadata-ui.playground.approval-timeline",
  timelineMetadata: "metadata-ui.playground.timeline.approval",
  timelineStepPrepared: "metadata-ui.playground.timeline.step.prepared",
  timelineStepReview: "metadata-ui.playground.timeline.step.review",
  timelineStepBlocked: "metadata-ui.playground.timeline.step.blocked",
  auditPanelSection: "metadata-ui.playground.audit-panel",
  auditPanelMetadata: "metadata-ui.playground.audit-panel.events",
  auditEventCreated: "metadata-ui.playground.audit.event.created",
  auditEventReviewed: "metadata-ui.playground.audit.event.reviewed",
  auditEventBlocked: "metadata-ui.playground.audit.event.blocked",
  multiStepFormSection: "metadata-ui.playground.multi-step-form",
  multiStepFormMetadata: "metadata-ui.playground.multi-step-form.review",
  multiStepFormStepPrepare: "metadata-ui.playground.multi-step-form.prepare",
  multiStepFormStepValidate: "metadata-ui.playground.multi-step-form.validate",
  multiStepFormStepPublish: "metadata-ui.playground.multi-step-form.publish",
  kanbanSection: "metadata-ui.playground.kanban",
  kanbanMetadata: "metadata-ui.playground.kanban.board",
  detailTabsSection: "metadata-ui.playground.detail-tabs",
  detailTabsMetadata: "metadata-ui.playground.detail-tabs.set",
  advancedOverviewHeaderSection:
    "metadata-ui.playground.advanced.overview.header",
  advancedOverviewHeaderMetadata:
    "metadata-ui.playground.advanced.overview.header.metadata",
  advancedOverviewStatsSection:
    "metadata-ui.playground.advanced.overview.stats",
  advancedOverviewStatsMetadata:
    "metadata-ui.playground.advanced.overview.stats.metadata",
  advancedOverviewChartSection:
    "metadata-ui.playground.advanced.overview.chart",
  advancedOverviewChartMetadata:
    "metadata-ui.playground.advanced.overview.chart.metadata",
  advancedOverviewListSection:
    "metadata-ui.playground.advanced.overview.list",
  advancedOverviewListMetadata:
    "metadata-ui.playground.advanced.overview.list.metadata",
  advancedTableLabHeaderSection:
    "metadata-ui.playground.advanced.table-lab.header",
  advancedTableLabHeaderMetadata:
    "metadata-ui.playground.advanced.table-lab.header.metadata",
  advancedTableLabSection:
    "metadata-ui.playground.advanced.table-lab.list",
  advancedTableLabMetadata:
    "metadata-ui.playground.advanced.table-lab.list.metadata",
  advancedOperationsHeaderSection:
    "metadata-ui.playground.advanced.operations.header",
  advancedOperationsHeaderMetadata:
    "metadata-ui.playground.advanced.operations.header.metadata",
  advancedOperationsActionBarSection:
    "metadata-ui.playground.advanced.operations.action-bar",
  advancedOperationsActionBarMetadata:
    "metadata-ui.playground.advanced.operations.action-bar.metadata",
  advancedOperationsListSection:
    "metadata-ui.playground.advanced.operations.list",
  advancedOperationsListMetadata:
    "metadata-ui.playground.advanced.operations.list.metadata",
  advancedRecordHeaderSection:
    "metadata-ui.playground.advanced.record.header",
  advancedRecordHeaderMetadata:
    "metadata-ui.playground.advanced.record.header.metadata",
  advancedRecordDetailTabsSection:
    "metadata-ui.playground.advanced.record.detail-tabs",
  advancedRecordDetailTabsMetadata:
    "metadata-ui.playground.advanced.record.detail-tabs.metadata",
  advancedRecordRelatedListSection:
    "metadata-ui.playground.advanced.record.related-list",
  advancedRecordRelatedListMetadata:
    "metadata-ui.playground.advanced.record.related-list.metadata",
  advancedRecordAuditPanelSection:
    "metadata-ui.playground.advanced.record.audit-panel",
  advancedRecordAuditPanelMetadata:
    "metadata-ui.playground.advanced.record.audit-panel.metadata",
  advancedRecordTimelineSection:
    "metadata-ui.playground.advanced.record.timeline",
  advancedRecordTimelineMetadata:
    "metadata-ui.playground.advanced.record.timeline.metadata",
  advancedWorkflowHeaderSection:
    "metadata-ui.playground.advanced.workflow.header",
  advancedWorkflowHeaderMetadata:
    "metadata-ui.playground.advanced.workflow.header.metadata",
  advancedWorkflowMultiStepSection:
    "metadata-ui.playground.advanced.workflow.multi-step",
  advancedWorkflowMultiStepMetadata:
    "metadata-ui.playground.advanced.workflow.multi-step.metadata",
  advancedWorkflowScorecardSection:
    "metadata-ui.playground.advanced.workflow.scorecard",
  advancedWorkflowScorecardMetadata:
    "metadata-ui.playground.advanced.workflow.scorecard.metadata",
  advancedPlanningHeaderSection:
    "metadata-ui.playground.advanced.planning.header",
  advancedPlanningHeaderMetadata:
    "metadata-ui.playground.advanced.planning.header.metadata",
  advancedPlanningBoardSection:
    "metadata-ui.playground.advanced.planning.board",
  advancedPlanningBoardMetadata:
    "metadata-ui.playground.advanced.planning.board.metadata",
  advancedPlanningTimelineSection:
    "metadata-ui.playground.advanced.planning.timeline",
  advancedPlanningTimelineMetadata:
    "metadata-ui.playground.advanced.planning.timeline.metadata",
  advancedAnalyticsHeaderSection:
    "metadata-ui.playground.advanced.analytics.header",
  advancedAnalyticsHeaderMetadata:
    "metadata-ui.playground.advanced.analytics.header.metadata",
  advancedAnalyticsStatsSection:
    "metadata-ui.playground.advanced.analytics.stats",
  advancedAnalyticsStatsMetadata:
    "metadata-ui.playground.advanced.analytics.stats.metadata",
  advancedAnalyticsChartSection:
    "metadata-ui.playground.advanced.analytics.chart",
  advancedAnalyticsChartMetadata:
    "metadata-ui.playground.advanced.analytics.chart.metadata",
  advancedAnalyticsListSection:
    "metadata-ui.playground.advanced.analytics.list",
  advancedAnalyticsListMetadata:
    "metadata-ui.playground.advanced.analytics.list.metadata",
} as const;

export const METADATA_UI_PLAYGROUND_FIXTURE_TIMESTAMPS = {
  baseline: METADATA_UI_PLAYGROUND_FIXED_INSTANT,
  reviewWindowStart: "2026-01-01T09:00:00.000Z",
  reviewWindowEnd: "2026-01-01T17:00:00.000Z",
} as const;
