import "server-only";

import {
  createChart,
  createChartDatum,
  createChartSeries,
  createCompactStatItem,
  createList,
  createNumberStatItem,
  createPercentageStatItem,
  createStatGroup,
  createStatusColumn,
  createTextColumn,
  withStatComparison,
  withStatDisplay,
} from "@afenda/metadata-ui";

import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";

const ADVANCED_ANALYTICS_CHART_DATA = [
  {
    signal: "Cycle time",
    baseline: 72,
    current: 64,
  },
  {
    signal: "Exception aging",
    baseline: 38,
    current: 31,
  },
  {
    signal: "Review coverage",
    baseline: 81,
    current: 88,
  },
  {
    signal: "Release readiness",
    baseline: 69,
    current: 76,
  },
] as const satisfies readonly Record<string, string | number>[];

export const METADATA_UI_ADVANCED_ANALYTICS_ROWS = [
  {
    id: "metadata-ui.playground.advanced.analytics.signal.cycle-time",
    signalLabel: "Cycle time",
    signalBand: "Operational",
    currentValue: "64",
    baselineValue: "72",
    trendLabel: "Improving",
    description: "Static cycle-time signal for advanced analytics preview.",
  },
  {
    id: "metadata-ui.playground.advanced.analytics.signal.exception-aging",
    signalLabel: "Exception aging",
    signalBand: "Exception",
    currentValue: "31",
    baselineValue: "38",
    trendLabel: "Improving",
    description: "Static exception-aging signal without ERP workflow reads.",
  },
  {
    id: "metadata-ui.playground.advanced.analytics.signal.review-coverage",
    signalLabel: "Review coverage",
    signalBand: "Review",
    currentValue: "88",
    baselineValue: "81",
    trendLabel: "Rising",
    description: "Static review-coverage signal for renderer density checks.",
  },
  {
    id: "metadata-ui.playground.advanced.analytics.signal.release-readiness",
    signalLabel: "Release readiness",
    signalBand: "Planning",
    currentValue: "76",
    baselineValue: "69",
    trendLabel: "Rising",
    description: "Static release-readiness signal for planning analytics.",
  },
] as const satisfies readonly Record<string, unknown>[];

export function createMetadataUiAdvancedAnalyticsStats() {
  return createStatGroup({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsStatsMetadata,
    title: "Advanced operational analytics",
    description:
      "Static non-financial analytics for ERP-like signal review.",
    dataNature: "operational",
    items: [
      withStatDisplay(
        withStatComparison(
          createNumberStatItem({
            key: "metadata-ui.playground.advanced.analytics.stat.signals",
            label: "Signals",
            value: METADATA_UI_ADVANCED_ANALYTICS_ROWS.length,
            description: "Operational signals in the static analytics window.",
          }),
          {
            label: "Baseline",
            value: "4",
            direction: "flat",
            explanation: "The analytics surface keeps a fixed signal window.",
          },
        ),
        {
          animation: "off",
          iconKey: "activity",
          progress: {
            value: METADATA_UI_ADVANCED_ANALYTICS_ROWS.length,
            max: 4,
            label: "Signal coverage",
          },
        },
      ),
      withStatDisplay(
        createCompactStatItem({
          key: "metadata-ui.playground.advanced.analytics.stat.review-coverage",
          label: "Coverage",
          value: "88",
          description: "Static review coverage percentage-like signal.",
        }),
        {
          animation: "off",
          iconKey: "scan-search",
        },
      ),
      withStatDisplay(
        createPercentageStatItem({
          key: "metadata-ui.playground.advanced.analytics.stat.ready",
          label: "Static",
          value: 1,
          description: "No request-bound analytics APIs or live metrics.",
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

export function createMetadataUiAdvancedAnalyticsChart() {
  return createChart({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsChartMetadata,
    title: "Advanced analytics signals",
    description:
      "Static non-financial signal comparison for analytics renderer review.",
    kind: "composed",
    categoryKey: "signal",
    xAxis: {
      key: "signal",
      label: "Signal",
      format: "custom",
    },
    yAxis: {
      key: "current",
      label: "Signal value",
      format: "number",
    },
    series: [
      createChartSeries({
        key: "metadata-ui.playground.advanced.analytics.chart.series.baseline",
        label: "Baseline",
        valueKey: "baseline",
        tone: "neutral",
        format: "number",
        color: "var(--chart-3)",
      }),
      createChartSeries({
        key: "metadata-ui.playground.advanced.analytics.chart.series.current",
        label: "Current",
        valueKey: "current",
        tone: "positive",
        format: "number",
        color: "var(--chart-2)",
      }),
    ],
    data: ADVANCED_ANALYTICS_CHART_DATA.map(createChartDatum),
    display: {
      height: 280,
      legend: "bottom",
      tooltip: {
        mode: "compact",
        labelKey: "signal",
        valueFormat: "number",
        showIndicators: true,
      },
      reducedMotion: "always-static",
      tableFallbackLabel: "Advanced analytics signal data",
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-analytics-chart",
    },
  });
}

export function createMetadataUiAdvancedAnalyticsList() {
  return createList({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.advancedAnalyticsListMetadata,
    title: "Advanced analytics trend table",
    description:
      "Static analytics rows for non-financial signal inspection.",
    rowKey: "id",
    density: "comfortable",
    selectionMode: "none",
    columns: [
      createTextColumn({
        key: "metadata-ui.playground.advanced.analytics.list.column.signal",
        field: "signalLabel",
        label: "Signal",
        width: {
          min: 180,
          ideal: 220,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.analytics.list.column.band",
        field: "signalBand",
        label: "Band",
        width: {
          min: 128,
          ideal: 148,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.analytics.list.column.current",
        field: "currentValue",
        label: "Current",
        align: "end",
        width: {
          min: 112,
          ideal: 128,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.analytics.list.column.baseline",
        field: "baselineValue",
        label: "Baseline",
        align: "end",
        width: {
          min: 112,
          ideal: 128,
        },
      }),
      createStatusColumn({
        key: "metadata-ui.playground.advanced.analytics.list.column.trend",
        field: "trendLabel",
        label: "Trend",
        width: {
          min: 128,
          ideal: 144,
        },
      }),
      createTextColumn({
        key: "metadata-ui.playground.advanced.analytics.list.column.description",
        field: "description",
        label: "Description",
        width: {
          min: 260,
          ideal: 420,
        },
      }),
    ],
    pagination: {
      enabled: false,
      pageSize: 25,
      pageSizeOptions: [25],
    },
    virtualization: {
      enabled: false,
      rowEstimate: 48,
      overscan: 2,
      maxHeight: 360,
    },
    diagnostics: {
      testId: "metadata-ui-playground-advanced-analytics-list",
    },
  });
}
