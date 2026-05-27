import "server-only"

import type { ReactNode } from "react"
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy"

import { GovernedComponentRenderer } from "../metadata/index"
import { logUnexpectedServerError } from "../adapters/logger.server"

import type { EmptyState } from "../schemas/list-surface.schema"
import {
  parseStatCardConfiguration,
  type StatCardConfigurationInput,
} from "../schemas/stat-card.schema"
import { GovernedEmpty } from "./governed-empty"
import {
  GovernedSurfaceSectionCard,
  type GovernedSurfaceSectionCardBody,
} from "./governed-surface-section-card"

export type GovernedPatternBStatSectionLayout = "card" | "embedded"

export type GovernedPatternBStatGroup = {
  /** Stable id for `data-testid` on the group wrapper (e.g. `registry`). */
  groupKey: string
  /** Optional subgroup label above the stat-card renderer. */
  label?: string
  configuration: StatCardConfigurationInput
}

export type GovernedPatternBStatSectionProps = {
  title: string
  description?: string
  surfaceKey: string
  statGroups: ReadonlyArray<GovernedPatternBStatGroup>
  layout?: GovernedPatternBStatSectionLayout
  loadError?: EmptyState
  forbidden?: EmptyState
  invalid?: EmptyState
  headerSlot?: ReactNode
  headerAction?: ReactNode
  className?: string
  cardClassName?: string
  contentClassName?: string
}

export function governedStatSectionTestId(surfaceKey: string): string {
  return `governed-stat-section:${surfaceKey}`
}

function renderStatBody(body: GovernedSurfaceSectionCardBody) {
  if (body.state === "forbidden" || body.state === "invalid") {
    return <GovernedEmpty model={body.model} />
  }
  return body.children
}

type RenderSectionShellInput = {
  layout: GovernedPatternBStatSectionLayout
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
  const statBody = renderStatBody(body)

  if (layout === "embedded") {
    return (
      <div className={className} data-testid={sectionTestId}>
        {headerSlot}
        <div className={contentClassName}>{statBody}</div>
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

export async function GovernedPatternBStatSection({
  title,
  description,
  surfaceKey,
  statGroups,
  layout = "card",
  loadError,
  forbidden,
  invalid,
  headerSlot,
  headerAction,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternBStatSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp")
  const sectionTestId = governedStatSectionTestId(surfaceKey)

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

  const parsedGroups = statGroups.map((group) => ({
    group,
    parsed: parseStatCardConfiguration(group.configuration),
  }))

  const firstInvalid = parsedGroups.find((entry) => !entry.parsed.success)
  let body: GovernedSurfaceSectionCardBody

  if (firstInvalid) {
    logUnexpectedServerError(
      "GovernedPatternBStatSection invalid stat configuration",
      firstInvalid.parsed.error,
      { surfaceKey, groupKey: firstInvalid.group.groupKey }
    )
    body = { state: "invalid", model: invalidModel }
  } else if (parsedGroups.length === 0) {
    body = { state: "invalid", model: invalidModel }
  } else {
    body = {
      state: "ready",
      children: (
        <div className="flex flex-col gap-4">
          {parsedGroups.map(({ group, parsed }) => {
            if (!parsed.success) {
              return null
            }
            return (
              <section
                key={group.groupKey}
                className="flex flex-col gap-2"
                data-testid={`governed-stat-group:${surfaceKey}:${group.groupKey}`}
              >
                {group.label ? (
                  <p className="text-sm font-medium text-muted-foreground">
                    {group.label}
                  </p>
                ) : null}
                <GovernedComponentRenderer
                  component={{
                    type: "governed:stat-card",
                    serverType: "governed:stat-card",
                    configuration: parsed.data,
                  }}
                  surfaceKey={surfaceKey}
                />
              </section>
            )
          })}
        </div>
      ),
    }
  }

  return renderSectionShell({ ...shellInput, body })
}
