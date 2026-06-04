import type { Route } from "next";

import Link from "next/link";

import { Button } from "@afenda/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card";
import { GovernedEmpty } from "./gov-governed-empty";
import { resolveGovernedServerAction } from "./gov-server-actions-shared";
import {
  parseGovernedChartConfiguration,
  type ChartAction,
  type ChartDataNature,
} from "./gov-chart-schema";
import { governedParseErrorCopy } from "./gov-governed-renderer-copy-shared";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";

import type { GovernedComponentRendererDiagnostics } from "./gov-registry";
import { ActionBarActionForm } from "./gov-action-bar-action-client";
import { ChartRendererBody } from "./gov-chart-renderer-body-client";

const DATA_NATURE_CLASS: Record<ChartDataNature, string> = {
  "time-series": "@container min-h-[14rem]", // audit-ds: ignore no-arbitrary-value — chart minimum height contract
  categorical: "@container min-h-[14rem]", // audit-ds: ignore no-arbitrary-value — chart minimum height contract
};

export type ChartRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

function ChartHeaderAction({
  action,
}: {
  action: Pick<ChartAction, "id" | "label" | "href" | "actionId">;
}) {
  if (action.href) {
    return (
      <Button key={action.label} variant="outline" size="sm" asChild>
        <Link href={action.href as Route} prefetch={false}>
          {action.label}
        </Link>
      </Button>
    );
  }

  if (action.actionId) {
    return (
      <ActionBarActionForm
        action={{
          id: action.actionId,
          label: action.label,
          intent: "default",
        }}
        serverAction={resolveGovernedServerAction(action.actionId)}
      />
    );
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
  );
}

export function ChartRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: ChartRendererProps) {
  const parsed = parseGovernedChartConfiguration(configuration);

  if (!parsed.success) {
    const copy = governedParseErrorCopy(diagnostics, "chart");
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
        }}
      />
    );
  }

  const { actions, dataNature, description, drilldownHref, title } =
    parsed.data;
  const resolvedComponentKey = componentKey ?? sectionKey ?? surfaceKey ?? "chart";
  const headerActions: Array<
    Pick<ChartAction, "id" | "label" | "href" | "actionId">
  > =
    [
      ...(actions ?? []),
      ...(drilldownHref
        ? [{ id: "chart-drilldown", href: drilldownHref, label: "View detail" }]
        : []),
    ];
  const hasHeader = Boolean(title || description || headerActions.length);

  return (
    <section
      aria-label={title ?? "Chart"}
      className={DATA_NATURE_CLASS[dataNature]}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("chart", resolvedComponentKey),
      })}
    >
      <Card>
        {hasHeader ? (
          <CardHeader className="pb-2">
            {title ? (
              <CardTitle>{title}</CardTitle>
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
  );
}
