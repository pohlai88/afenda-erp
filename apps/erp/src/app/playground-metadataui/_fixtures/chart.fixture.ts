import {
  createChart,
  createChartDatum,
  createChartSeries,
} from "@afenda/metadata-ui";

import { METADATA_UI_PLAYGROUND_FIXTURE_IDS } from "./constants.fixture";

const coverageHeatmapData = [
  {
    sampleSlot: "Slot A",
    sampleBand: "Ready",
    coverageScore: 82,
  },
  {
    sampleSlot: "Slot A",
    sampleBand: "Review",
    coverageScore: 64,
  },
  {
    sampleSlot: "Slot B",
    sampleBand: "Ready",
    coverageScore: 76,
  },
  {
    sampleSlot: "Slot B",
    sampleBand: "Review",
    coverageScore: 58,
  },
  {
    sampleSlot: "Slot C",
    sampleBand: "Ready",
    coverageScore: 91,
  },
  {
    sampleSlot: "Slot C",
    sampleBand: "Review",
    coverageScore: 47,
  },
];

export function createMetadataUiPlaygroundChart() {
  return createChart({
    key: METADATA_UI_PLAYGROUND_FIXTURE_IDS.chartMetadata,
    title: "Chart preview",
    description:
      "Static non-financial heatmap data for analytical renderer review.",
    kind: "heatmap",
    categoryKey: "sampleSlot",
    xAxis: {
      key: "sampleSlot",
      label: "Sample slot",
      format: "custom",
    },
    yAxis: {
      key: "coverageScore",
      label: "Coverage score",
      format: "number",
    },
    series: [
      createChartSeries({
        key: "metadata-ui.playground.chart.series.coverage-score",
        label: "Coverage score",
        valueKey: "coverageScore",
        tone: "info",
        format: "number",
        color: "var(--chart-1)",
      }),
    ],
    data: coverageHeatmapData.map(createChartDatum),
    display: {
      height: 280,
      legend: "bottom",
      tooltip: {
        mode: "compact",
        labelKey: "sampleSlot",
        valueFormat: "number",
        showIndicators: true,
      },
      reducedMotion: "always-static",
      tableFallbackLabel: "Sample chart coverage data",
    },
    heatmap: {
      xKey: "sampleSlot",
      yKey: "sampleBand",
      valueKey: "coverageScore",
      showValues: true,
    },
    annotations: [
      {
        key: "metadata-ui.playground.chart.annotation.review-band",
        label: "Chart preview coverage band",
        description: "Static annotation for chart metadata review.",
        datumKey: "sampleBand",
        tone: "info",
      },
    ],
    referenceBands: [
      {
        key: "metadata-ui.playground.chart.reference.target",
        label: "Sample target band",
        axis: "y",
        from: 60,
        to: 90,
        tone: "positive",
      },
    ],
    diagnostics: {
      testId: "metadata-ui-playground-chart",
    },
  });
}
