import "server-only";

import {
  createChart,
  createChartDatum,
  createChartSeries,
  createCompactStatItem,
  createContainsFilter,
  createList,
  createNumberStatItem,
  createPercentageStatItem,
  createStatGroup,
  createStatusColumn,
  createTextColumn,
  withStatComparison,
  withStatDisplay,
} from "@afenda/metadata-ui";

import {
  METADATA_UI_ADVANCED_NAVIGATION_GROUPS,
  METADATA_UI_ADVANCED_OPERATIONS_ROWS,
  METADATA_UI_ADVANCED_PATTERN_SCENARIOS,
  METADATA_UI_ADVANCED_SEED_CATALOG,
} from "./advanced-seed.fixture";
import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";

const ADVANCED_OVERVIEW_CHART_DATA = [
  {
    scenarioGroup: "Navigation",
    readyCount: METADATA_UI_ADVANCED_NAVIGATION_GROUPS.length,
  },
  {
    scenarioGroup: "Scenarios",
    readyCount: METADATA_UI_ADVANCED_PATTERN_SCENARIOS.length,
  },
  {
    scenarioGroup: "Operations",
    readyCount: METADATA_UI_ADVANCED_OPERATIONS_ROWS.length,
  },
  {
    scenarioGroup: "States",
    readyCount: METADATA_UI_ADVANCED_SEED_CATALOG.states.length,
  },
] as const satisfies readonly Record<string, string | number>[];

export const METADATA_UI_ADVANCED_OVERVIEW_ROWS =
  METADATA_UI_ADVANCED_PATTERN_SCENARIOS.map((scenario) => ({
    id: scenario.id,
    scenarioLabel: scenario.navigationLabel,
    patternKind: scenario.kind,
    sectionCount: scenario.sectionKeys.length,
    statusLabel: "Seeded",
    description: scenario.description,
  })) as readonly Record<string, unknown>[];

export function createMetadataUiAdvancedOverviewStats() {
  return createStatGroup({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewStatsMetadata,
    title: "Advanced pattern inventory",
    description:
      "Static scenario counts sourced from the advanced seed catalog.",
    dataNature: "snapshot-summary",
    items: [
      withStatDisplay(
        withStatComparison(
          createNumberStatItem({
            key: "metadata-ui.playground.advanced.overview.stat.scenarios",
            label: "Scenarios",
            value: METADATA_UI_ADVANCED_PATTERN_SCENARIOS.length,
            description: "Advanced pattern scenarios ready for slice work.",
          }),
          {
            label: "Target",
            value: "8",
            direction: "flat",
            explanation: "All planned advanced scenario categories are seeded.",
          },
        ),
        {
          animation: "off",
          iconKey: "layout-grid",
          progress: {
            value: METADATA_UI_ADVANCED_PATTERN_SCENARIOS.length,
            max: 8,
            label: "Scenario coverage",
          },
        },
      ),
      withStatDisplay(
        createCompactStatItem({
          key: "metadata-ui.playground.advanced.overview.stat.groups",
          label: "Nav groups",
          value: METADATA_UI_ADVANCED_NAVIGATION_GROUPS.length,
          description: "Static AppShell groups generated from seeds.",
        }),
        {
          animation: "off",
          iconKey: "list",
        },
      ),
      withStatDisplay(
        createPercentageStatItem({
          key: "metadata-ui.playground.advanced.overview.stat.seeded",
          label: "Seeded",
          value: 1,
          description: "No request-bound APIs or runtime generated values.",
        }),
        {
          animation: "off",
          maximumFractionDigits: 0,
          iconKey: "shield-check",
        },
      ),
    ],
  });
}

export function createMetadataUiAdvancedOverviewChart() {
  return createChart({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewChartMetadata,
    title: "Advanced seed distribution",
    description:
      "Static non-financial distribution of seeded scenario families.",
    kind: "bar",
    categoryKey: "scenarioGroup",
    xAxis: {
      key: "scenarioGroup",
      label: "Scenario group",
      format: "custom",
    },
    yAxis: {
      key: "readyCount",
      label: "Ready count",
      format: "number",
    },
    series: [
      createChartSeries({
        key: "metadata-ui.playground.advanced.overview.chart.series.ready-count",
        label: "Ready count",
        valueKey: "readyCount",
        tone: "positive",
        format: "number",
        color: "var(--chart-2)",
      }),
    ],
    data: ADVANCED_OVERVIEW_CHART_DATA.map(createChartDatum),
    display: {
      height: 260,
      legend: "bottom",
      tooltip: {
        mode: "compact",
        labelKey: "scenarioGroup",
        valueFormat: "number",
        showIndicators: true,
      },
      reducedMotion: "always-static",
      tableFallbackLabel: "Advanced seed distribution data",
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-overview-chart",
    },
  });
}

export function createMetadataUiAdvancedOverviewScenarioList() {
  return createList({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedOverviewListMetadata,
    title: "Advanced scenario index",
    description:
      "Seeded scenario catalog for the slice-by-slice advanced playground.",
    rowKey: "id",
    density: "comfortable",
    selectionMode: "none",
    columns: [
      createTextColumn({
        key: "metadata-ui.playground.advanced.overview.list.column.scenario",
        field: "scenarioLabel",
        label: "Scenario",
        filterable: true,
        width: {
          min: 180,
          ideal: 220,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.overview.list.column.kind",
        field: "patternKind",
        label: "Pattern",
        width: {
          min: 160,
          ideal: 190,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.overview.list.column.status",
        field: "statusLabel",
        label: "Status",
        width: {
          min: 112,
          ideal: 128,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.overview.list.column.sections",
        field: "sectionCount",
        label: "Sections",
        align: "end",
        width: {
          min: 112,
          ideal: 124,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.overview.list.column.description",
        field: "description",
        label: "Description",
        width: {
          min: 280,
          ideal: 420,
        },
      }),
    ],
    filters: [
      createContainsFilter({
        key: "metadata-ui.playground.advanced.overview.list.filter.seeded",
        field: "statusLabel",
        label: "Seeded scenarios",
        value: "Seeded",
        locked: true,
      }),
    ],
    pagination: {
      enabled: true,
      pageSize: 8,
      pageSizeOptions: [8],
    },
    virtualization: {
      enabled: false,
      rowEstimate: 44,
      overscan: 2,
      maxHeight: 440,
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-overview-list",
    },
  });
}
