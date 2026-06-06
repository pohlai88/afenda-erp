import "server-only";

import { METADATA_UI_PLAYGROUND_FIXED_INSTANT } from "./constants.fixture";
import {
  METADATA_UI_PLAYGROUND_SAMPLE_COPY,
  METADATA_UI_PLAYGROUND_SAMPLE_LABELS,
} from "./sample-vocabulary.fixture";
import type {
  MetadataUiAdvancedNavigationGroup,
  MetadataUiAdvancedOperationsRow,
  MetadataUiAdvancedPatternId,
  MetadataUiAdvancedPlanningCardSeed,
  MetadataUiAdvancedRecordSeed,
  MetadataUiAdvancedScenario,
  MetadataUiAdvancedSeedCatalog,
  MetadataUiAdvancedStateSeed,
  MetadataUiAdvancedTableLabRow,
  MetadataUiAdvancedWorkflowStepSeed,
} from "./advanced-seed-types.fixture";

export const METADATA_UI_ADVANCED_PATTERN_SCENARIOS = [
  {
    id: "metadata-ui.playground.advanced.overview.coverage-index",
    kind: "overview",
    title: "Advanced coverage index",
    description:
      "Renderer inventory, certification state, and scenario index for the advanced playground.",
    navigationLabel: "Overview",
    sectionKeys: [
      "metadata-ui.playground.advanced.overview.section.kpi-band",
      "metadata-ui.playground.advanced.overview.section.renderer-index",
    ],
  },
  {
    id: "metadata-ui.playground.advanced.operations-list.work-queue",
    kind: "operations-list",
    title: "Operations work queue",
    description:
      "Dense ERP-like work queue with governed row actions and review bands.",
    navigationLabel: "Operations",
    sectionKeys: [
      "metadata-ui.playground.advanced.operations-list.section.work-queue",
      "metadata-ui.playground.advanced.operations-list.section.command-band",
    ],
  },
  {
    id: "metadata-ui.playground.advanced.tanstack-table.table-lab",
    kind: "tanstack-table",
    title: "TanStack table lab",
    description:
      "Metadata-driven table scenario for sorting, filtering, selection, and trailing actions.",
    navigationLabel: "Table Lab",
    sectionKeys: [
      "metadata-ui.playground.advanced.tanstack-table.section.windowed-list",
      "metadata-ui.playground.advanced.tanstack-table.section.filter-summary",
    ],
  },
  {
    id: "metadata-ui.playground.advanced.record-detail.sample-record",
    kind: "record-detail",
    title: "Record detail",
    description:
      "Record-centric detail tabs with related records, audit events, and timeline context.",
    navigationLabel: "Records",
    sectionKeys: [
      "metadata-ui.playground.advanced.record-detail.section.tabs",
      "metadata-ui.playground.advanced.record-detail.section.audit",
    ],
  },
  {
    id: "metadata-ui.playground.advanced.workflow-form.review-flow",
    kind: "workflow-form",
    title: "Workflow form",
    description:
      "Multi-step form and scorecard scenario with complete, invalid, and blocked states.",
    navigationLabel: "Forms",
    sectionKeys: [
      "metadata-ui.playground.advanced.workflow-form.section.steps",
      "metadata-ui.playground.advanced.workflow-form.section.scorecard",
    ],
  },
  {
    id: "metadata-ui.playground.advanced.planning-board.capacity-board",
    kind: "planning-board",
    title: "Planning board",
    description:
      "Kanban and planning timeline seeds for movement intent without mutation behavior.",
    navigationLabel: "Planning",
    sectionKeys: [
      "metadata-ui.playground.advanced.planning-board.section.kanban",
      "metadata-ui.playground.advanced.planning-board.section.timeline",
    ],
  },
  {
    id: "metadata-ui.playground.advanced.analytics.operational-signals",
    kind: "analytics",
    title: "Operational analytics",
    description:
      "Non-financial KPI and chart patterns using neutral operational signals.",
    navigationLabel: "Analytics",
    sectionKeys: [
      "metadata-ui.playground.advanced.analytics.section.kpis",
      "metadata-ui.playground.advanced.analytics.section.chart",
    ],
  },
  {
    id: "metadata-ui.playground.advanced.state-matrix.renderer-states",
    kind: "state-matrix",
    title: "Renderer state matrix",
    description:
      "Metadata-only target for ready, loading, empty, forbidden, and error states.",
    navigationLabel: "States",
    sectionKeys: [
      "metadata-ui.playground.advanced.state-matrix.section.state-grid",
    ],
  },
] as const satisfies readonly MetadataUiAdvancedScenario[];

const SCENARIO_IDS = {
  overview: "metadata-ui.playground.advanced.overview.coverage-index",
  operations: "metadata-ui.playground.advanced.operations-list.work-queue",
  tableLab: "metadata-ui.playground.advanced.tanstack-table.table-lab",
  recordDetail: "metadata-ui.playground.advanced.record-detail.sample-record",
  workflowForm: "metadata-ui.playground.advanced.workflow-form.review-flow",
  planningBoard: "metadata-ui.playground.advanced.planning-board.capacity-board",
  analytics: "metadata-ui.playground.advanced.analytics.operational-signals",
  stateMatrix: "metadata-ui.playground.advanced.state-matrix.renderer-states",
} as const satisfies Record<string, MetadataUiAdvancedPatternId>;

export const METADATA_UI_ADVANCED_NAVIGATION_GROUPS = [
  {
    id: "metadata-ui.playground.advanced.seed.navigation-group.overview",
    label: "Overview",
    description: "Coverage and certification scenarios.",
    scenarioIds: [SCENARIO_IDS.overview],
  },
  {
    id: "metadata-ui.playground.advanced.seed.navigation-group.operations",
    label: "Operations",
    description: "Work queues, table lab, and command surfaces.",
    scenarioIds: [SCENARIO_IDS.operations, SCENARIO_IDS.tableLab],
  },
  {
    id: "metadata-ui.playground.advanced.seed.navigation-group.records",
    label: "Records",
    description: "Record detail, workflow, planning, and audit patterns.",
    scenarioIds: [
      SCENARIO_IDS.recordDetail,
      SCENARIO_IDS.workflowForm,
      SCENARIO_IDS.planningBoard,
    ],
  },
  {
    id: "metadata-ui.playground.advanced.seed.navigation-group.inspection",
    label: "Inspection",
    description: "Analytics and renderer state matrix scenarios.",
    scenarioIds: [SCENARIO_IDS.analytics, SCENARIO_IDS.stateMatrix],
  },
] as const satisfies readonly MetadataUiAdvancedNavigationGroup[];

export const METADATA_UI_ADVANCED_OPERATIONS_ROWS = [
  {
    kind: "operations-row",
    id: "metadata-ui.playground.advanced.seed.operation.intake-review",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} A-100`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} North`,
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_COPY.operatorName,
    status: "review",
    priority: "high",
    reviewBand: "elevated",
    permissionBand: "available",
    updatedAt: METADATA_UI_PLAYGROUND_FIXED_INSTANT,
  },
  {
    kind: "operations-row",
    id: "metadata-ui.playground.advanced.seed.operation.exception-check",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} B-200`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} East`,
    ownerLabel: "Sample Reviewer",
    status: "blocked",
    priority: "normal",
    reviewBand: "restricted",
    permissionBand: "disabled",
    updatedAt: "2026-01-01T09:00:00.000Z",
  },
  {
    kind: "operations-row",
    id: "metadata-ui.playground.advanced.seed.operation.ready-window",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} C-300`,
    locationLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleLocation} West`,
    ownerLabel: "Sample Coordinator",
    status: "ready",
    priority: "low",
    reviewBand: "standard",
    permissionBand: "available",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
] as const satisfies readonly MetadataUiAdvancedOperationsRow[];

export const METADATA_UI_ADVANCED_TABLE_LAB_ROWS = [
  {
    kind: "table-lab-row",
    id: "metadata-ui.playground.advanced.seed.table-row.selection-ready",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleApproval} 01`,
    queueLabel: "Sample Queue Alpha",
    status: "ready",
    sortBucket: 10,
    filterTags: ["ready", "selectable"],
    canSelect: true,
    trailingActionState: "available",
  },
  {
    kind: "table-lab-row",
    id: "metadata-ui.playground.advanced.seed.table-row.permission-disabled",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleApproval} 02`,
    queueLabel: "Sample Queue Beta",
    status: "review",
    sortBucket: 20,
    filterTags: ["review", "permission"],
    canSelect: false,
    trailingActionState: "disabled",
  },
  {
    kind: "table-lab-row",
    id: "metadata-ui.playground.advanced.seed.table-row.hidden-action",
    recordLabel: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleApproval} 03`,
    queueLabel: "Sample Queue Gamma",
    status: "complete",
    sortBucket: 30,
    filterTags: ["complete"],
    canSelect: true,
    trailingActionState: "hidden",
  },
] as const satisfies readonly MetadataUiAdvancedTableLabRow[];

export const METADATA_UI_ADVANCED_RECORDS = [
  {
    kind: "record",
    id: "metadata-ui.playground.advanced.seed.record.primary",
    title: `${METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleRecord} Detail`,
    subtitle: "Static record for detail-tab and audit renderer scenarios.",
    ownerLabel: METADATA_UI_PLAYGROUND_SAMPLE_LABELS.sampleOperator,
    status: "review",
    auditEventIds: [
      "metadata-ui.playground.advanced.seed.audit-event.created",
      "metadata-ui.playground.advanced.seed.audit-event.reviewed",
    ],
  },
] as const satisfies readonly MetadataUiAdvancedRecordSeed[];

export const METADATA_UI_ADVANCED_WORKFLOW_STEPS = [
  {
    kind: "workflow-step",
    id: "metadata-ui.playground.advanced.seed.workflow-step.prepare",
    label: "Prepare sample record",
    status: "complete",
    fieldKeys: ["recordLabel", "locationLabel"],
  },
  {
    kind: "workflow-step",
    id: "metadata-ui.playground.advanced.seed.workflow-step.review",
    label: "Review sample signals",
    status: "review",
    fieldKeys: ["reviewBand", "permissionBand"],
  },
  {
    kind: "workflow-step",
    id: "metadata-ui.playground.advanced.seed.workflow-step.publish",
    label: "Publish renderer snapshot",
    status: "blocked",
    fieldKeys: ["staticOnlyReason"],
  },
] as const satisfies readonly MetadataUiAdvancedWorkflowStepSeed[];

export const METADATA_UI_ADVANCED_PLANNING_CARDS = [
  {
    kind: "planning-card",
    id: "metadata-ui.playground.advanced.seed.planning-card.intake",
    lane: "intake",
    title: "Sample planning intake",
    status: "review",
    priority: "normal",
  },
  {
    kind: "planning-card",
    id: "metadata-ui.playground.advanced.seed.planning-card.review",
    lane: "review",
    title: "Sample capacity review",
    status: "blocked",
    priority: "high",
  },
  {
    kind: "planning-card",
    id: "metadata-ui.playground.advanced.seed.planning-card.ready",
    lane: "ready",
    title: "Sample release-ready work",
    status: "ready",
    priority: "low",
  },
] as const satisfies readonly MetadataUiAdvancedPlanningCardSeed[];

export const METADATA_UI_ADVANCED_STATE_SEEDS = [
  {
    kind: "state",
    id: "metadata-ui.playground.advanced.seed.state.ready",
    state: "ready",
    title: "Ready",
    description: "Static metadata is available for renderer preview.",
  },
  {
    kind: "state",
    id: "metadata-ui.playground.advanced.seed.state.loading",
    state: "loading",
    title: "Loading",
    description: "Static loading metadata for skeleton renderer coverage.",
  },
  {
    kind: "state",
    id: "metadata-ui.playground.advanced.seed.state.empty",
    state: "empty",
    title: "Empty",
    description: "No sample rows are present in this deterministic window.",
  },
  {
    kind: "state",
    id: "metadata-ui.playground.advanced.seed.state.forbidden",
    state: "forbidden",
    title: "Forbidden",
    description: "Permission-denied metadata without reading real auth state.",
  },
  {
    kind: "state",
    id: "metadata-ui.playground.advanced.seed.state.error",
    state: "error",
    title: "Error",
    description: "Recoverable renderer error metadata without throwing.",
  },
] as const satisfies readonly MetadataUiAdvancedStateSeed[];

export const METADATA_UI_ADVANCED_SEED_CATALOG = {
  generatedAt: METADATA_UI_PLAYGROUND_FIXED_INSTANT,
  scenarios: METADATA_UI_ADVANCED_PATTERN_SCENARIOS,
  navigationGroups: METADATA_UI_ADVANCED_NAVIGATION_GROUPS,
  operationsRows: METADATA_UI_ADVANCED_OPERATIONS_ROWS,
  tableLabRows: METADATA_UI_ADVANCED_TABLE_LAB_ROWS,
  records: METADATA_UI_ADVANCED_RECORDS,
  workflowSteps: METADATA_UI_ADVANCED_WORKFLOW_STEPS,
  planningCards: METADATA_UI_ADVANCED_PLANNING_CARDS,
  states: METADATA_UI_ADVANCED_STATE_SEEDS,
} as const satisfies MetadataUiAdvancedSeedCatalog;
