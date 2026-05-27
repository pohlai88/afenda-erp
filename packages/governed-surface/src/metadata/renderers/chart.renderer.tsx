import type { Route } from "next"

import Link from "next/link"

import { Button } from "@afenda/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedEmpty } from "../../client"
import {
  parseGovernedChartConfiguration,
  type ChartAction,
  type ChartDataNature,
} from "../../schemas/chart.schema"

import type { GovernedComponentRendererDiagnostics } from "../registry"
import { ChartRendererBody } from "./chart-renderer-body.client"

const DATA_NATURE_CLASS: Record<ChartDataNature, string> = {
  "time-series": "@container min-h-[14rem]",
  categorical: "@container min-h-[14rem]",
}

export type ChartRendererProps = {
  configuration: unknown
  diagnostics?: GovernedComponentRendererDiagnostics
}

function ChartHeaderAction({
  action,
}: {
  action: Pick<ChartAction, "label" | "href" | "actionId">
}) {
  if (action.href) {
    return (
      <Button key={action.label} variant="outline" size="sm" asChild>
        <Link href={action.href as Route} prefetch={false}>
          {action.label}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      key={action.actionId ?? action.label}
      type="button"
      variant="outline"
      size="sm"
      disabled
    >
      {action.label}
    </Button>
  )
}

export function ChartRenderer({
  configuration,
  diagnostics = "user",
}: ChartRendererProps) {
  const parsed = parseGovernedChartConfiguration(configuration)

  if (!parsed.success) {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: "Chart unavailable",
          description:
            diagnostics === "operator"
              ? "The chart configuration failed validation."
              : "This chart could not be loaded safely.",
        }}
      />
    )
  }

  const { actions, dataNature, description, drilldownHref, title } = parsed.data
  const headerActions: Array<Pick<ChartAction, "label" | "href" | "actionId">> =
    [
      ...(actions ?? []),
      ...(drilldownHref ? [{ href: drilldownHref, label: "View detail" }] : []),
    ]
  const hasHeader = Boolean(title || description || headerActions.length)

  return (
    <section
      aria-label={title ?? "Chart"}
      className={DATA_NATURE_CLASS[dataNature]}
    >
      <Card>
        {hasHeader ? (
          <CardHeader className="pb-2">
            {title ? (
              <CardTitle className="text-base">{title}</CardTitle>
            ) : null}
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
            {headerActions.length ? (
              <CardAction className="flex flex-wrap justify-end gap-1">
                {headerActions.map((action) => (
                  <ChartHeaderAction
                    key={action.href ?? action.actionId ?? action.label}
                    action={action}
                  />
                ))}
              </CardAction>
            ) : null}
          </CardHeader>
        ) : null}
        <CardContent className={hasHeader ? "pt-0" : undefined}>
          <ChartRendererBody configuration={parsed.data} />
        </CardContent>
      </Card>
    </section>
  )
}
