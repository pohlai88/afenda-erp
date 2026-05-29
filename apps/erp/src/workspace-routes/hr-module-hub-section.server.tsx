import { hrRoutePaths } from "@/lib/hr-route.shared";
import { loadModuleWorkspaceSession } from "@/workspace-routes/workspace-route-cache";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";

export async function HrModuleHubSection() {
  const { moduleDefinition, organization } = await loadModuleWorkspaceSession({
    moduleId: "hr",
  });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={moduleDefinition.label}
        description={moduleDefinition.summary}
        aside={
          <div className="type-caption uppercase tracking-wide text-muted">
            {organization.slug}
          </div>
        }
      />
      <SectionPanel
        title="Workforce"
        description="Slice 1 foundation — employee directory backed by hr_employees schema."
      >
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.employees}
          >
            Employee directory
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.departments}
          >
            Departments
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.positions}
          >
            Positions
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.lifecycle}
          >
            Lifecycle
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.onboarding}
          >
            Onboarding
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.documents}
          >
            Document vault
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.offboarding}
          >
            Offboarding
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.compliance}
          >
            Compliance
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.leave}
          >
            Leave
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.attendance}
          >
            Attendance
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.overtime}
          >
            Overtime
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.shifts}
          >
            Shifts
          </Link>
          <Link
            className="rounded-control border border-line bg-surface-strong px-3 py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
            href={hrRoutePaths.orgChart}
          >
            Org chart
          </Link>
        </div>
      </SectionPanel>
    </div>
  );
}
