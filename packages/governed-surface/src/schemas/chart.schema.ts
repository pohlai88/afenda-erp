import { z } from "zod"

import type { SchemaStability } from "./_stability.shared"

import { emptyStateSchema } from "./list-surface.schema"
import { governedSurfaceChromeSchema } from "./surface-chrome.schema"

export const GOVERNED_CHART_CONFIGURATION_SCHEMA_ID =
  "governed.chart.configuration" as const

export const GOVERNED_CHART_CONFIGURATION_SCHEMA_STABILITY: SchemaStability =
  "beta"

export const chartDataNatureSchema = z.enum(["time-series", "categorical"])
export type ChartDataNature = z.infer<typeof chartDataNatureSchema>

export const governedChartKindSchema = z.enum([
  "bar",
  "line",
  "area",
  "heatmap",
  "stacked-bar",
  "combo",
])

export const chartPointSchema = z
  .object({
    x: z.string().trim().min(1),
    y: z.number().finite(),
  })
  .strict()

export const chartSeriesSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    color: z.string().trim().min(1).optional(),
    points: z.array(chartPointSchema).min(1),
    /** For `combo` charts — bar vs line role per series. */
    role: z.enum(["bar", "line"]).optional(),
  })
  .strict()

export const chartHeatmapCellSchema = z
  .object({
    date: z.string().trim().min(1),
    value: z.number().finite(),
    label: z.string().trim().min(1).optional(),
  })
  .strict()

export const chartHeatmapSchema = z
  .object({
    cells: z.array(chartHeatmapCellSchema).min(1),
    valueLabel: z.string().trim().min(1).optional(),
  })
  .strict()

export const chartReferenceBandSchema = z
  .object({
    yMin: z.number().finite(),
    yMax: z.number().finite(),
    label: z.string().trim().min(1).optional(),
  })
  .strict()

export const chartActionSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    href: z.string().trim().min(1).optional(),
    actionId: z.string().trim().min(1).optional(),
  })
  .strict()

export const chartAnnotationSchema = z
  .object({
    label: z.string().trim().min(1),
    x: z.string().trim().min(1).optional(),
    y: z.number().finite().optional(),
    tone: z.enum(["default", "positive", "attention", "critical"]).optional(),
  })
  .strict()

const governedChartConfigurationCoreSchema = z
  .object({
    dataNature: chartDataNatureSchema,
    chartKind: governedChartKindSchema,
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    drilldownHref: z.string().trim().min(1).optional(),
    actions: z.array(chartActionSchema).optional(),
    series: z.array(chartSeriesSchema).optional(),
    heatmap: chartHeatmapSchema.optional(),
    empty: emptyStateSchema.optional(),
    referenceBand: chartReferenceBandSchema.optional(),
    referenceBands: z.array(chartReferenceBandSchema).optional(),
    annotations: z.array(chartAnnotationSchema).optional(),
    interaction: z.enum(["none", "brush"]).default("none"),
    chrome: governedSurfaceChromeSchema.optional(),
  })
  .strict()
  .superRefine((config, ctx) => {
    if (config.chartKind === "heatmap") {
      if (!config.heatmap?.cells.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["heatmap", "cells"],
          message: 'chartKind "heatmap" requires heatmap.cells.',
        })
      }
      return
    }

    if (!config.series?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["series"],
        message: `chartKind "${config.chartKind}" requires at least one series.`,
      })
      return
    }

    const seen = new Set<string>()
    for (const [index, series] of config.series.entries()) {
      if (seen.has(series.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Series ids must be unique.",
          path: ["series", index, "id"],
        })
      }
      seen.add(series.id)
    }
  })

export const governedChartConfigurationSchema =
  governedChartConfigurationCoreSchema.transform((config) => ({
    ...config,
    referenceBands:
      config.referenceBands ??
      (config.referenceBand ? [config.referenceBand] : undefined),
  }))

export type GovernedChartKind = z.infer<typeof governedChartKindSchema>
export type ChartPoint = z.infer<typeof chartPointSchema>
export type ChartSeries = z.infer<typeof chartSeriesSchema>
export type ChartHeatmapCell = z.infer<typeof chartHeatmapCellSchema>
export type ChartReferenceBand = z.infer<typeof chartReferenceBandSchema>
export type ChartAction = z.infer<typeof chartActionSchema>
export type ChartAnnotation = z.infer<typeof chartAnnotationSchema>

export type GovernedChartConfiguration = z.infer<
  typeof governedChartConfigurationSchema
>

export type GovernedChartConfigurationInput = z.input<
  typeof governedChartConfigurationSchema
>

export function parseGovernedChartConfiguration(raw: unknown) {
  return governedChartConfigurationSchema.safeParse(raw)
}
