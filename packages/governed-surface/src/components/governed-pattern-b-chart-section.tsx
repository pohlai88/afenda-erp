import "server-only"

import type { ReactNode } from "react"
import { GovernedComponentRenderer } from "../metadata/index"
import { logUnexpectedServerError } from "../adapters/logger.server"
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy"

import type { EmptyState } from "../schemas/list-surface.schema"
import {
  parseGovernedChartConfiguration,
  type GovernedChartConfigurationInput,
} from "../schemas/chart.schema"
import { GovernedEmpty } from "./governed-empty"
import {
  GovernedSurfaceSectionCard,
  type GovernedSurfaceSectionCardBody,
} from "./governed-surface-section-card"

export type GovernedPatternBChartSectionLayout = "card" | "embedded"

export type GovernedPatternBChartSectionProps = {
  title: string
  description?: string
  surfaceKey: string
  chartConfiguration: GovernedChartConfigurationInput
  layout?: GovernedPatternBChartSectionLayout
  loadError?: EmptyState
  forbidden?: EmptyState
  invalid?: EmptyState
  headerSlot?: ReactNode
  headerAction?: ReactNode
  className?: string
  cardClassName?: string
  contentClassName?: string
}

export function governedChartSectionTestId(surfaceKey: string): string {
  return `governed-chart-section:${surfaceKey}`
}

function renderChartBody(body: GovernedSurfaceSectionCardBody) {
  if (body.state === "forbidden" || body.state === "invalid") {
    return <GovernedEmpty model={body.model} />
  }
  return body.children
}

type RenderSectionShellInput = {
  layout: GovernedPatternBChartSectionLayout
  className?: string
  sectionTestId: string
  headerSlot?: ReactNode
  title: string
  description?: string
  headerAction?: ReactNode
  body: GovernedSurfaceSectionCardBody
  cardClassName?: string
  contentClassName?: string
}

function renderSectionShell({
  layout,
  className,
  sectionTestId,
  headerSlot,
  title,
  description,
  headerAction,
  body,
  cardClassName,
  contentClassName,
}: RenderSectionShellInput) {
  const chartBody = renderChartBody(body)

  if (layout === "embedded") {
    return (
      <div className={className} data-testid={sectionTestId}>
        {headerSlot}
        <div className={contentClassName}>{chartBody}</div>
      </div>
    )
  }

  return (
    <div className={className} data-testid={sectionTestId}>
      {headerSlot}
      <GovernedSurfaceSectionCard
        title={title}
        description={description}
        body={body}
        headerAction={headerAction}
        className={cardClassName}
        contentClassName={contentClassName}
      />
    </div>
  )
}

export async function GovernedPatternBChartSection({
  title,
  description,
  surfaceKey,
  chartConfiguration,
  layout = "card",
  loadError,
  forbidden,
  invalid,
  headerSlot,
  headerAction,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternBChartSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp")
  const sectionTestId = governedChartSectionTestId(surfaceKey)

  const shellInput = {
    layout,
    className,
    sectionTestId,
    headerSlot,
    title,
    description,
    headerAction,
    cardClassName,
    contentClassName,
  }

  const invalidModel: EmptyState = invalid ?? {
    variant: "error",
    title: t("GovernedSurface.invalidConfigTitle"),
    description: t("GovernedSurface.invalidConfigDescription"),
  }

  if (loadError) {
    const body: GovernedSurfaceSectionCardBody = {
      state: "invalid",
      model: loadError,
    }
    return renderSectionShell({ ...shellInput, body })
  }

  if (forbidden) {
    return renderSectionShell({
      ...shellInput,
      body: { state: "forbidden", model: forbidden },
    })
  }

  const parsed = parseGovernedChartConfiguration(chartConfiguration)
  let body: GovernedSurfaceSectionCardBody

  if (!parsed.success) {
    logUnexpectedServerError(
      "GovernedPatternBChartSection invalid chart configuration",
      parsed.error,
      { surfaceKey }
    )
    body = { state: "invalid", model: invalidModel }
  } else {
    body = {
      state: "ready",
      children: (
        <GovernedComponentRenderer
          surfaceKey={surfaceKey}
          component={{
            type: "governed:chart",
            serverType: "governed:chart",
            configuration: parsed.data,
          }}
        />
      ),
    }
  }

  return renderSectionShell({ ...shellInput, body })
}
