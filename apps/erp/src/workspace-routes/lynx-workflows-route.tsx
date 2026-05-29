import { parseLynxWorkflowSessionFilters } from "@/workspace-routes/lynx-workflows-route.shared";
import { LynxWorkflowSessionsListSection } from "@/workspace-routes/lynx-workflows-route.sections.server";
import {
  GovernedListSectionSkeleton,
} from "@/workspace-routes/workspace-section-skeletons";
import { Button, SectionPanel } from "@afenda/ui";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

type LynxWorkflowsRoutePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function lynxWorkflowFilterSection(
  searchParams: LynxWorkflowsRoutePageProps["searchParams"],
  render: (
    filters: ReturnType<typeof parseLynxWorkflowSessionFilters>,
  ) => ReactNode,
) {
  return searchParams.then((resolved) =>
    render(parseLynxWorkflowSessionFilters(resolved)),
  );
}

export function LynxWorkflowsRoutePage({
  searchParams,
}: LynxWorkflowsRoutePageProps) {
  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        eyebrow="Lynx workflow management"
        headingLevel={1}
        title="Workflow sessions"
        description="Resume active and paused Lynx workflows with tenant-scoped run history."
        aside={
          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/lynx/runs">Open run console</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/lynx">Back to console</Link>
            </Button>
          </div>
        }
      />

      <Suspense fallback={<GovernedListSectionSkeleton rows={8} tall />}>
        {lynxWorkflowFilterSection(searchParams, (filters) => (
          <LynxWorkflowSessionsListSection filters={filters} />
        ))}
      </Suspense>
    </div>
  );
}
