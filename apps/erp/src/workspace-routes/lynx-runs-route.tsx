import type { LynxRunLedgerFilters } from "@afenda/db";
import {
  buildLynxRunFilterSearchParams,
  parseLynxRunFilters,
} from "@/lib/api/lynx-run-filters";
import { formDefault } from "@/workspace-routes/lynx-runs-route.shared";
import {
  LynxRunsLedgerSection,
  LynxRunsMonitorSection,
  LynxRunsObservabilityListsSection,
  LynxRunsRepresentativeFailuresSection,
  LynxRunsStatsSection,
} from "@/workspace-routes/lynx-runs-route.sections.server";
import {
  GovernedListSectionSkeleton,
  GovernedStatSectionSkeleton,
} from "@/workspace-routes/workspace-section-skeletons";
import { Button, Input, NativeSelect, NativeSelectOption, SectionPanel } from "@afenda/ui";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

const LYNX_RUNS_EXPORT_TRIGGER_ID = "lynx-runs-export-link";

type LynxRunsRoutePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function LynxRunsFiltersPanel({ filters }: { filters: LynxRunLedgerFilters }) {
  return (
    <SectionPanel
      title="Advanced filters"
      description="Filter runs by operational state, Vercel route, workflow, model, tool, prompt, and start window."
    >
      <form className="@container grid gap-3 @md:grid-cols-3" method="get">
        <label className="grid gap-2 type-body font-medium text-foreground">
          Search
          <Input
            defaultValue={formDefault(filters.search)}
            name="q"
            placeholder="Prompt summary"
          />
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Status
          <NativeSelect
            className="w-full"
            defaultValue={formDefault(filters.status)}
            name="status"
          >
            <NativeSelectOption value="">Any status</NativeSelectOption>
            <NativeSelectOption value="started">Started</NativeSelectOption>
            <NativeSelectOption value="completed">Completed</NativeSelectOption>
            <NativeSelectOption value="failed">Failed</NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Route
          <NativeSelect
            className="w-full"
            defaultValue={formDefault(filters.route)}
            name="route"
          >
            <NativeSelectOption value="">Any route</NativeSelectOption>
            <NativeSelectOption value="/api/lynx/operator">
              Operator
            </NativeSelectOption>
            <NativeSelectOption value="/api/lynx/truth-search">
              Truth Retrieval
            </NativeSelectOption>
            <NativeSelectOption value="/api/cron/lynx-outcomes">
              Outcome sweep
            </NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Workflow
          <Input
            defaultValue={formDefault(filters.workflowId)}
            name="workflowId"
            placeholder="workflow id"
          />
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Model
          <Input
            defaultValue={formDefault(filters.model)}
            name="model"
            placeholder="provider/model"
          />
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Tool
          <Input
            defaultValue={formDefault(filters.toolName)}
            name="toolName"
            placeholder="tool name"
          />
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Provider
          <Input
            defaultValue={formDefault(filters.provider)}
            name="provider"
            placeholder="gateway provider"
          />
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Origin
          <NativeSelect
            className="w-full"
            defaultValue={formDefault(filters.origin)}
            name="origin"
          >
            <NativeSelectOption value="">Any origin</NativeSelectOption>
            <NativeSelectOption value="proactive-outcome-sweep">
              Proactive outcome sweep
            </NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Monitor status
          <NativeSelect
            className="w-full"
            defaultValue={formDefault(filters.monitorStatus)}
            name="monitorStatus"
          >
            <NativeSelectOption value="">Any monitor status</NativeSelectOption>
            <NativeSelectOption value="healthy">Healthy</NativeSelectOption>
            <NativeSelectOption value="watch">Watch</NativeSelectOption>
            <NativeSelectOption value="blocked">Blocked</NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Severity
          <NativeSelect
            className="w-full"
            defaultValue={formDefault(filters.severity)}
            name="severity"
          >
            <NativeSelectOption value="">Any severity</NativeSelectOption>
            <NativeSelectOption value="info">Info</NativeSelectOption>
            <NativeSelectOption value="review">Review</NativeSelectOption>
            <NativeSelectOption value="critical">Critical</NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          Quality
          <NativeSelect
            className="w-full"
            defaultValue={formDefault(filters.qualityGate)}
            name="qualityGate"
          >
            <NativeSelectOption value="">Any quality gate</NativeSelectOption>
            <NativeSelectOption value="unsupported">
              Unsupported claims
            </NativeSelectOption>
            <NativeSelectOption value="lowCitationPrecision">
              Low citation precision
            </NativeSelectOption>
            <NativeSelectOption value="failedQualityGate">
              Failed gate
            </NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          From
          <Input
            defaultValue={
              filters.startedFrom
                ? filters.startedFrom.toISOString().slice(0, 10)
                : ""
            }
            name="from"
            type="date"
          />
        </label>
        <label className="grid gap-2 type-body font-medium text-foreground">
          To
          <Input
            defaultValue={
              filters.startedTo ? filters.startedTo.toISOString().slice(0, 10) : ""
            }
            name="to"
            type="date"
          />
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit">Apply filters</Button>
          <Button asChild variant="ghost">
            <Link href="/lynx/runs">Reset</Link>
          </Button>
        </div>
      </form>
    </SectionPanel>
  );
}

function lynxRunsFilterSection(
  searchParams: LynxRunsRoutePageProps["searchParams"],
  render: (filters: LynxRunLedgerFilters) => ReactNode,
) {
  return searchParams.then((resolved) => render(parseLynxRunFilters(resolved)));
}

export function LynxRunsRoutePage({ searchParams }: LynxRunsRoutePageProps) {
  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        eyebrow="Lynx run management"
        headingLevel={1}
        title="Run console"
        description="Filter, inspect, replay, and export tenant-scoped Lynx runs."
        aside={
          <div className="flex flex-wrap justify-end gap-2">
            <Suspense
              fallback={
                <Button disabled variant="outline">
                  Export CSV
                </Button>
              }
            >
              {lynxRunsFilterSection(searchParams, (filters) => {
                const filterParams = buildLynxRunFilterSearchParams({ filters });
                const exportHref = `/api/lynx/runs/export${
                  filterParams.size > 0 ? `?${filterParams.toString()}` : ""
                }`;

                return (
                  <Button
                    asChild
                    id={LYNX_RUNS_EXPORT_TRIGGER_ID}
                    variant="outline"
                  >
                    <Link href={exportHref}>Export CSV</Link>
                  </Button>
                );
              })}
            </Suspense>
            <Button asChild variant="ghost">
              <Link href="/lynx">Back to console</Link>
            </Button>
          </div>
        }
      >
        <Suspense fallback={<GovernedStatSectionSkeleton statCount={3} />}>
          {lynxRunsFilterSection(searchParams, (filters) => (
            <LynxRunsStatsSection filters={filters} />
          ))}
        </Suspense>
      </SectionPanel>

      <Suspense
        fallback={
          <SectionPanel title="Advanced filters" description="Loading filters…" />
        }
      >
        {lynxRunsFilterSection(searchParams, (filters) => (
          <LynxRunsFiltersPanel filters={filters} />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton tall rows={8} />}>
        {lynxRunsFilterSection(searchParams, (filters) => (
          <LynxRunsLedgerSection
            exportTriggerElementId={LYNX_RUNS_EXPORT_TRIGGER_ID}
            filters={filters}
          />
        ))}
      </Suspense>

      <Suspense
        fallback={
          <>
            <GovernedListSectionSkeleton />
            <GovernedListSectionSkeleton />
            <GovernedListSectionSkeleton />
            <GovernedListSectionSkeleton />
          </>
        }
      >
        {lynxRunsFilterSection(searchParams, (filters) => (
          <LynxRunsObservabilityListsSection filters={filters} />
        ))}
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={4} />}>
        <LynxRunsMonitorSection />
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={5} />}>
        <LynxRunsRepresentativeFailuresSection />
      </Suspense>
    </div>
  );
}
