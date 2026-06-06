import {
  METADATA_UI_ACTION_BAR_SCHEMA_ID,
  METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID,
  METADATA_UI_AUDIT_PANEL_SCHEMA_ID,
  METADATA_UI_CHART_SCHEMA_ID,
  METADATA_UI_DETAIL_TABS_SCHEMA_ID,
  METADATA_UI_FORM_SCHEMA_ID,
  METADATA_UI_KANBAN_SCHEMA_ID,
  METADATA_UI_LIST_SCHEMA_ID,
  METADATA_UI_MULTI_STEP_FORM_SCHEMA_ID,
  METADATA_UI_PAGE_HEADER_SCHEMA_ID,
  METADATA_UI_SCORECARD_FORM_SCHEMA_ID,
  METADATA_UI_STAT_SCHEMA_ID,
  createSurfacePageHeader,
} from "@afenda/metadata-ui";
import {
  createMetadataUiRendererContext,
  type MetadataUiRenderableSectionStackItem,
} from "@afenda/metadata-ui/server";

import { createMetadataUiPlaygroundActionBar } from "./action-bar.fixture";
import {
  METADATA_UI_ADVANCED_OPERATIONS_RENDER_ROWS,
  createMetadataUiAdvancedOperationsActionBar,
  createMetadataUiAdvancedOperationsList,
} from "./advanced-operations.fixture";
import {
  METADATA_UI_ADVANCED_ANALYTICS_ROWS,
  createMetadataUiAdvancedAnalyticsChart,
  createMetadataUiAdvancedAnalyticsList,
  createMetadataUiAdvancedAnalyticsStats,
} from "./advanced-analytics.fixture";
import {
  METADATA_UI_ADVANCED_OVERVIEW_ROWS,
  createMetadataUiAdvancedOverviewChart,
  createMetadataUiAdvancedOverviewScenarioList,
  createMetadataUiAdvancedOverviewStats,
} from "./advanced-overview.fixture";
import {
  createMetadataUiAdvancedPlanningBoard,
  createMetadataUiAdvancedPlanningTimeline,
} from "./advanced-planning.fixture";
import {
  METADATA_UI_ADVANCED_RECORD_RELATED_ROWS,
  createMetadataUiAdvancedRecordAuditPanel,
  createMetadataUiAdvancedRecordDetailTabs,
  createMetadataUiAdvancedRecordRelatedList,
  createMetadataUiAdvancedRecordTimeline,
} from "./advanced-record.fixture";
import {
  METADATA_UI_ADVANCED_STATE_MATRIX_ROWS,
  createMetadataUiAdvancedStateMatrixList,
} from "./advanced-state.fixture";
import {
  METADATA_UI_ADVANCED_TABLE_LAB_RENDER_ROWS,
  createMetadataUiAdvancedTableLabList,
} from "./advanced-table.fixture";
import {
  createMetadataUiAdvancedWorkflowMultiStepForm,
  createMetadataUiAdvancedWorkflowScorecardForm,
} from "./advanced-workflow.fixture";
import { createMetadataUiPlaygroundAuditPanel } from "./audit-panel.fixture";
import { createMetadataUiPlaygroundChart } from "./chart.fixture";
import {
  METADATA_UI_PLAYGROUND_FIXTURE_IDS,
  METADATA_UI_PLAYGROUND_ROUTE,
} from "./constants.fixture";
import { createMetadataUiPlaygroundDetailTabs } from "./detail-tabs.fixture";
import { createMetadataUiPlaygroundForm } from "./form.fixture";
import { createMetadataUiPlaygroundKanban } from "./kanban.fixture";
import {
  METADATA_UI_PLAYGROUND_LIST_ROWS,
  createMetadataUiPlaygroundDenseList,
} from "./list.fixture";
import { createMetadataUiPlaygroundMultiStepForm } from "./multi-step-form.fixture";
import { createMetadataUiPlaygroundScorecardForm } from "./scorecard-form.fixture";
import { METADATA_UI_PLAYGROUND_SAMPLE_COPY } from "./sample-vocabulary.fixture";
import { createMetadataUiPlaygroundStats } from "./stat.fixture";
import { createMetadataUiPlaygroundTimeline } from "./timeline.fixture";
import type { MetadataUiAdvancedPatternKind } from "./advanced-seed-types.fixture";

export type MetadataUiPlaygroundPatternKey =
  | "overview"
  | MetadataUiAdvancedPatternKind;

export const METADATA_UI_PLAYGROUND_PATTERN_KEYS = [
  "overview",
  "operations-list",
  "tanstack-table",
  "record-detail",
  "workflow-form",
  "planning-board",
  "analytics",
  "state-matrix",
] as const satisfies readonly MetadataUiPlaygroundPatternKey[];

const METADATA_UI_PLAYGROUND_ALWAYS_VISIBLE_SECTION_IDS = new Set<string>([
  METADATA_UI_PLAYGROUND_FIXTURE_IDS.pageHeaderSection,
]);

const METADATA_UI_PLAYGROUND_SECTION_IDS_BY_PATTERN = {
  overview: [
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewStatsSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewChartSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewListSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.rendererGalleryHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.actionBarSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.statSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.listSection,
  ],
  "operations-list": [
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsActionBarSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsListSection,
  ],
  "tanstack-table": [
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabSection,
  ],
  "record-detail": [
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordDetailTabsSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordRelatedListSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordAuditPanelSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordTimelineSection,
  ],
  "workflow-form": [
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowMultiStepSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowScorecardSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.inputSurfacesHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.formSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.scorecardFormSection,
  ],
  "planning-board": [
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningBoardSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningTimelineSection,
  ],
  analytics: [
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsStatsSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsChartSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsListSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.analyticalAuditHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.chartSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.timelineSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.auditPanelSection,
  ],
  "state-matrix": [
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateCoverageHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.interactionHeaderSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.multiStepFormSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.kanbanSection,
    METADATA_UI_PLAYGROUND_FIXTURE_IDS.detailTabsSection,
  ],
} as const satisfies Record<MetadataUiPlaygroundPatternKey, readonly string[]>;

type MetadataUiPlaygroundGroupHeaderInput = Readonly<{
  sectionId: string;
  metadataKey: string;
  eyebrow: string;
  title: string;
  description: string;
  badgeLabel: string;
}>;

function createMetadataUiPlaygroundGroupHeaderSection({
  sectionId,
  metadataKey,
  eyebrow,
  title,
  description,
  badgeLabel,
}: MetadataUiPlaygroundGroupHeaderInput) {
  return {
    id: sectionId,
    kind: "page-header" as const,
    title,
    description,
    schemaId: METADATA_UI_PAGE_HEADER_SCHEMA_ID,
    rendererId: "metadata-ui.renderer.page-header",
    metadata: {
      ...createSurfacePageHeader({
        key: metadataKey,
        eyebrow,
        title,
        description,
      }),
      badges: [
        {
          key: `${metadataKey}.badge`,
          label: badgeLabel,
          tone: "neutral",
        },
      ],
    },
  };
}

function createMetadataUiPlaygroundScenarioMarker(
  sectionId: string,
  markerId: string,
) {
  return {
    id: markerId,
    "data-metadata-ui-kind": "page-header",
    "data-metadata-ui-component": `${sectionId}.marker`,
    "data-metadata-ui-section": sectionId,
    "data-metadata-ui-renderer": "metadata-ui.renderer.page-header",
    "data-testid": `${sectionId}.marker`,
  } as const;
}

export function createMetadataUiPlaygroundStack(): readonly MetadataUiRenderableSectionStackItem[] {
  const pageHeader = createSurfacePageHeader({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.pageHeaderMetadata,
    eyebrow: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appEyebrow,
    title: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
    description: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appDescription,
  });

  return [
    {
      order: 10,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.pageHeaderSection,
        kind: "page-header",
        title: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
        description: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appDescription,
        schemaId: METADATA_UI_PAGE_HEADER_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.page-header",
        metadata: {
          ...pageHeader,
          breadcrumbs: [
            {
              key: "metadata-ui.playground.breadcrumb",
              label: METADATA_UI_PLAYGROUND_SAMPLE_COPY.appTitle,
              href: METADATA_UI_PLAYGROUND_ROUTE,
              current: true,
            },
          ],
          badges: [
            {
              key: "metadata-ui.playground.badge",
              label: "Developer only",
              tone: "info",
            },
          ],
        },
      },
    },
    {
      order: 12,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewHeaderMetadata,
        eyebrow: "Advanced pattern",
        title: "Advanced overview",
        description:
          "Seeded ERP-like scenario inventory rendered with stat, chart, and list metadata.",
        badgeLabel: "Slice 04",
      }),
    },
    {
      order: 13,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewStatsSection,
        kind: "stat",
        title: "Advanced pattern inventory",
        description:
          "Static advanced playground scenario counts and seed readiness.",
        schemaId: METADATA_UI_STAT_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.stat",
        metadata: createMetadataUiAdvancedOverviewStats(),
      },
    },
    {
      order: 14,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewChartSection,
        kind: "chart",
        title: "Advanced seed distribution",
        description:
          "Static non-financial chart data for the advanced overview.",
        schemaId: METADATA_UI_CHART_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.chart",
        metadata: createMetadataUiAdvancedOverviewChart(),
      },
    },
    {
      order: 15,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewListSection,
        kind: "list",
        title: "Advanced scenario index",
        description: "Seeded scenario catalog for slice-by-slice delivery.",
        schemaId: METADATA_UI_LIST_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.list",
        metadata: createMetadataUiAdvancedOverviewScenarioList(),
      },
    },
    {
      order: 16,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsHeaderMetadata,
        eyebrow: "Advanced pattern",
        title: "Operations command surface",
        description:
          "Approval-like command previews, permission-disabled actions, and current-window operation rows.",
        badgeLabel: "Slice 06",
      }),
    },
    {
      order: 17,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsActionBarSection,
        kind: "action-bar",
        title: "Operations command preview",
        description:
          "Static action metadata for command preview without ERP writes.",
        schemaId: METADATA_UI_ACTION_BAR_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.action-bar",
        metadata: createMetadataUiAdvancedOperationsActionBar(),
      },
    },
    {
      order: 18,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsListSection,
        kind: "list",
        title: "Operations command surface",
        description:
          "Current-window operation rows with inert row and trailing command previews.",
        schemaId: METADATA_UI_LIST_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.list",
        metadata: createMetadataUiAdvancedOperationsList(),
      },
    },
    {
      order: 19,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordHeaderMetadata,
        eyebrow: "Advanced pattern",
        title: "Record detail",
        description:
          "Record-centric detail tabs, related operations, audit trail, and approval-like timeline.",
        badgeLabel: "Slice 07",
      }),
    },
    {
      order: 20,
      span: "third",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordDetailTabsSection,
        kind: "detail-tabs",
        title: "Advanced record detail tabs",
        description: "Static tabs for related rows, audit, and timeline.",
        schemaId: METADATA_UI_DETAIL_TABS_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.detail-tabs",
        metadata: createMetadataUiAdvancedRecordDetailTabs(),
      },
    },
    {
      order: 21,
      span: "two-thirds",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordRelatedListSection,
        kind: "list",
        title: "Related operation rows",
        description: "Static related rows for the advanced record detail.",
        schemaId: METADATA_UI_LIST_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.list",
        metadata: createMetadataUiAdvancedRecordRelatedList(),
      },
    },
    {
      order: 22,
      span: "half",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordAuditPanelSection,
        kind: "audit-panel",
        title: "Advanced record audit trail",
        description: "Static audit events for record detail review.",
        schemaId: METADATA_UI_AUDIT_PANEL_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.audit-panel",
        metadata: createMetadataUiAdvancedRecordAuditPanel(),
      },
    },
    {
      order: 23,
      span: "half",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordTimelineSection,
        kind: "approval-timeline",
        title: "Advanced record timeline",
        description: "Static approval-like timeline for record detail review.",
        schemaId: METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.approval-timeline",
        metadata: createMetadataUiAdvancedRecordTimeline(),
      },
    },
    {
      order: 24,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowHeaderMetadata,
        eyebrow: "Advanced pattern",
        title: "Forms and workflow",
        description:
          "Advanced multi-step workflow and scorecard metadata with complete, invalid, blocked, and read-only states.",
        badgeLabel: "Slice 08",
      }),
    },
    {
      order: 25,
      span: "half",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowMultiStepSection,
        kind: "multi-step-form",
        title: "Advanced workflow form",
        description:
          "Seeded workflow steps with validation and blocked publish state.",
        schemaId: METADATA_UI_MULTI_STEP_FORM_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.multi-step-form",
        metadata: createMetadataUiAdvancedWorkflowMultiStepForm(),
      },
    },
    {
      order: 26,
      span: "half",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowScorecardSection,
        kind: "scorecard-form",
        title: "Advanced workflow scorecard",
        description:
          "Static scorecard criteria for advanced workflow readiness.",
        schemaId: METADATA_UI_SCORECARD_FORM_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.scorecard-form",
        metadata: createMetadataUiAdvancedWorkflowScorecardForm(),
      },
    },
    {
      order: 27,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningHeaderMetadata,
        eyebrow: "Advanced pattern",
        title: "Planning board",
        description:
          "ERP-like planning board and timeline metadata for movement preview without mutation.",
        badgeLabel: "Slice 09",
      }),
    },
    {
      order: 28,
      span: "two-thirds",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningBoardSection,
        kind: "kanban",
        title: "Advanced planning board",
        description:
          "Seeded kanban planning lanes with static movement intents and blocked release-ready state.",
        schemaId: METADATA_UI_KANBAN_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.kanban",
        metadata: createMetadataUiAdvancedPlanningBoard(),
      },
    },
    {
      order: 29,
      span: "third",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningTimelineSection,
        kind: "approval-timeline",
        title: "Advanced planning timeline",
        description:
          "Static timeline for planning intake, capacity review, blocked exception, and release preview.",
        schemaId: METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.approval-timeline",
        metadata: createMetadataUiAdvancedPlanningTimeline(),
      },
    },
    {
      order: 30,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsHeaderMetadata,
        eyebrow: "Advanced pattern",
        title: "Operational analytics",
        description:
          "Non-financial KPI, chart, and signal table metadata for ERP-like analytics review.",
        badgeLabel: "Advanced",
      }),
    },
    {
      order: 31,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsStatsSection,
        kind: "stat",
        title: "Advanced operational analytics",
        description:
          "Static non-financial analytics summary for signal review.",
        schemaId: METADATA_UI_STAT_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.stat",
        metadata: createMetadataUiAdvancedAnalyticsStats(),
      },
    },
    {
      order: 32,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsChartSection,
        kind: "chart",
        title: "Advanced analytics signals",
        description:
          "Static non-financial signal comparison chart.",
        schemaId: METADATA_UI_CHART_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.chart",
        metadata: createMetadataUiAdvancedAnalyticsChart(),
      },
    },
    {
      order: 33,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsListSection,
        kind: "list",
        title: "Advanced analytics trend table",
        description:
          "Static analytics rows for non-financial signal inspection.",
        schemaId: METADATA_UI_LIST_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.list",
        metadata: createMetadataUiAdvancedAnalyticsList(),
      },
    },
    {
      order: 34,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabHeaderMetadata,
        eyebrow: "Advanced pattern",
        title: "TanStack table lab",
        description:
          "Metadata-driven list scenario for sorting, filtering, selection, density, and inert actions.",
        badgeLabel: "Slice 05",
      }),
    },
    {
      order: 35,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabSection,
        kind: "list",
        title: "TanStack table lab",
        description:
          "Advanced metadata list exercising the TanStack-backed renderer model.",
        schemaId: METADATA_UI_LIST_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.list",
        metadata: createMetadataUiAdvancedTableLabList(),
      },
    },
    {
      order: 40,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId: METADATA_UI_PLAYGROUND_FIXTURE_IDS.rendererGalleryHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.rendererGalleryHeaderMetadata,
        eyebrow: "Renderer family",
        title: "Basic renderer gallery",
        description:
          "Core renderer previews for action, stat, and dense list surfaces.",
        badgeLabel: "Slice 03",
      }),
    },
    {
      order: 41,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.actionBarSection,
        kind: "action-bar",
        title: "Action bar preview",
        description: "Static actions with disabled and overflow states.",
        schemaId: METADATA_UI_ACTION_BAR_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.action-bar",
        metadata: createMetadataUiPlaygroundActionBar(),
      },
    },
    {
      order: 42,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.statSection,
        kind: "stat",
        title: "Stat card preview",
        description: "Compact deterministic values for renderer review.",
        schemaId: METADATA_UI_STAT_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.stat",
        metadata: createMetadataUiPlaygroundStats(),
      },
    },
    {
      order: 43,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.listSection,
        kind: "list",
        title: "Dense list preview",
        description: "Current-window rows with toolbar and row actions.",
        schemaId: METADATA_UI_LIST_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.list",
        metadata: createMetadataUiPlaygroundDenseList(),
      },
    },
    {
      order: 44,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId: METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateCoverageHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateCoverageHeaderMetadata,
        eyebrow: "Renderer family",
        title: "State coverage",
        description:
          "Ready, loading, empty, forbidden, and error renderer states.",
        badgeLabel: "Slice 04",
      }),
    },
    {
      order: 45,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateSection,
        kind: "list",
        title: "Metadata state matrix",
        description:
          "Ready, loading, empty, forbidden, and error states rendered from static state seed rows.",
        schemaId: METADATA_UI_LIST_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.list",
        metadata: createMetadataUiAdvancedStateMatrixList(),
      },
    },
    {
      order: 46,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId: METADATA_UI_PLAYGROUND_FIXTURE_IDS.inputSurfacesHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.inputSurfacesHeaderMetadata,
        eyebrow: "Renderer family",
        title: "Input surfaces",
        description:
          "Read-only form and scorecard metadata with static validation display.",
        badgeLabel: "Slice 05",
      }),
    },
    {
      order: 47,
      span: "half",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.formSection,
        kind: "form",
        title: "Form preview",
        description:
          "Read-only and validation-display fields without submit behavior.",
        schemaId: METADATA_UI_FORM_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.form",
        metadata: createMetadataUiPlaygroundForm(),
      },
    },
    {
      order: 48,
      span: "half",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.scorecardFormSection,
        kind: "scorecard-form",
        title: "Scorecard form preview",
        description:
          "Static scorecard criteria with invalid and blocked states.",
        schemaId: METADATA_UI_SCORECARD_FORM_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.scorecard-form",
        metadata: createMetadataUiPlaygroundScorecardForm(),
      },
    },
    {
      order: 49,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.analyticalAuditHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.analyticalAuditHeaderMetadata,
        eyebrow: "Renderer family",
        title: "Analytical and audit surfaces",
        description:
          "Chart, approval timeline, and audit-panel previews with static fixtures.",
        badgeLabel: "Slice 06",
      }),
    },
    {
      order: 50,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.chartSection,
        kind: "chart",
        title: "Chart preview",
        description:
          "Static non-financial analytical metadata for renderer review.",
        schemaId: METADATA_UI_CHART_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.chart",
        metadata: createMetadataUiPlaygroundChart(),
      },
    },
    {
      order: 51,
      span: "half",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.timelineSection,
        kind: "approval-timeline",
        title: "Approval timeline preview",
        description:
          "Static approval-like steps without ERP workflow behavior.",
        schemaId: METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.approval-timeline",
        metadata: createMetadataUiPlaygroundTimeline(),
      },
    },
    {
      order: 52,
      span: "half",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.auditPanelSection,
        kind: "audit-panel",
        title: "Audit panel preview",
        description:
          "Static audit-like events without ERP event-store reads.",
        schemaId: METADATA_UI_AUDIT_PANEL_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.audit-panel",
        metadata: createMetadataUiPlaygroundAuditPanel(),
      },
    },
    {
      order: 53,
      span: "full",
      section: createMetadataUiPlaygroundGroupHeaderSection({
        sectionId: METADATA_UI_PLAYGROUND_FIXTURE_IDS.interactionHeaderSection,
        metadataKey:
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.interactionHeaderMetadata,
        eyebrow: "Renderer family",
        title: "Interaction surfaces",
        description:
          "Multi-step, kanban, and detail-tab renderer previews with host-owned behavior.",
        badgeLabel: "Stabilized",
      }),
    },
    {
      order: 54,
      span: "third",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.multiStepFormSection,
        kind: "multi-step-form",
        title: "Multi-step form preview",
        description:
          "Static step metadata with active, invalid, complete, and blocked states.",
        schemaId: METADATA_UI_MULTI_STEP_FORM_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.multi-step-form",
        metadata: createMetadataUiPlaygroundMultiStepForm(),
      },
    },
    {
      order: 55,
      span: "two-thirds",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.kanbanSection,
        kind: "kanban",
        title: "Kanban preview",
        description:
          "Static board metadata with draggable intent and disabled transitions.",
        schemaId: METADATA_UI_KANBAN_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.kanban",
        metadata: createMetadataUiPlaygroundKanban(),
      },
    },
    {
      order: 56,
      span: "full",
      section: {
        id: METADATA_UI_PLAYGROUND_FIXTURE_IDS.detailTabsSection,
        kind: "detail-tabs",
        title: "Detail tabs preview",
        description: "Static tabs referencing existing renderer section keys.",
        schemaId: METADATA_UI_DETAIL_TABS_SCHEMA_ID,
        rendererId: "metadata-ui.renderer.detail-tabs",
        metadata: createMetadataUiPlaygroundDetailTabs(),
      },
    },
  ] as const;
}

function getMetadataUiStackItemSectionId(
  item: MetadataUiRenderableSectionStackItem,
): string | undefined {
  const section = item.section;

  if (typeof section === "object" && section && "id" in section) {
    return String(section.id);
  }

  return undefined;
}

export function isMetadataUiPlaygroundPatternKey(
  value: string,
): value is MetadataUiPlaygroundPatternKey {
  return METADATA_UI_PLAYGROUND_PATTERN_KEYS.some((pattern) => pattern === value);
}

export function createMetadataUiPlaygroundStackForPattern(
  pattern: MetadataUiPlaygroundPatternKey,
): readonly MetadataUiRenderableSectionStackItem[] {
  const patternSectionIds = new Set<string>(
    METADATA_UI_PLAYGROUND_SECTION_IDS_BY_PATTERN[pattern],
  );

  return createMetadataUiPlaygroundStack().filter((item) => {
    const sectionId = getMetadataUiStackItemSectionId(item);

    if (!sectionId) {
      return false;
    }

    return (
      METADATA_UI_PLAYGROUND_ALWAYS_VISIBLE_SECTION_IDS.has(sectionId) ||
      patternSectionIds.has(sectionId)
    );
  });
}

export function createMetadataUiPlaygroundRenderContext() {
  return createMetadataUiRendererContext({
    domAttributesBySectionKey: {
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewHeaderSection]:
        createMetadataUiPlaygroundScenarioMarker(
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewHeaderSection,
          "overview",
        ),
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsHeaderSection]:
        createMetadataUiPlaygroundScenarioMarker(
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsHeaderSection,
          "operations-list",
        ),
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabHeaderSection]:
        createMetadataUiPlaygroundScenarioMarker(
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabHeaderSection,
          "tanstack-table",
        ),
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordHeaderSection]:
        createMetadataUiPlaygroundScenarioMarker(
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordHeaderSection,
          "record-detail",
        ),
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowHeaderSection]:
        createMetadataUiPlaygroundScenarioMarker(
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedWorkflowHeaderSection,
          "workflow-form",
        ),
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningHeaderSection]:
        createMetadataUiPlaygroundScenarioMarker(
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedPlanningHeaderSection,
          "planning-board",
        ),
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsHeaderSection]:
        createMetadataUiPlaygroundScenarioMarker(
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsHeaderSection,
          "analytics",
        ),
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateCoverageHeaderSection]:
        createMetadataUiPlaygroundScenarioMarker(
          METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateCoverageHeaderSection,
          "state-matrix",
        ),
    },
    rowsBySectionKey: {
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewListSection]:
        METADATA_UI_ADVANCED_OVERVIEW_ROWS,
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOperationsListSection]:
        METADATA_UI_ADVANCED_OPERATIONS_RENDER_ROWS,
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedRecordRelatedListSection]:
        METADATA_UI_ADVANCED_RECORD_RELATED_ROWS,
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsListSection]:
        METADATA_UI_ADVANCED_ANALYTICS_ROWS,
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedTableLabSection]:
        METADATA_UI_ADVANCED_TABLE_LAB_RENDER_ROWS,
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.stateSection]:
        METADATA_UI_ADVANCED_STATE_MATRIX_ROWS,
      [METADATA_UI_PLAYGROUND_FIXTURE_IDS.listSection]:
        METADATA_UI_PLAYGROUND_LIST_ROWS,
    },
  });
}
