import { appBrandName, getAppShellSkeletonNavItemIds } from "@afenda/kernel";
import { Skeleton } from "@afenda/ui/skeleton";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";
import Link from "next/link";

type RouteStateProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

export function RouteStatePanel({
  title,
  description,
  action,
}: RouteStateProps) {
  return (
    <main className="flex min-h-full items-center justify-center px-surface-2xl py-16">
      <div className="w-full max-w-lg rounded-panel border border-line bg-surface-strong p-8 shadow-elevation-1">
        <div className="type-caption uppercase tracking-wide text-muted">
          {appBrandName}
        </div>
        <h1 className="mt-3 type-section-title font-semibold text-foreground">{title}</h1>
        <p className="mt-3 type-body leading-6 text-muted">{description}</p>
        {action ? (
          action.href ? (
            <Link
              className="mt-surface-2xl inline-flex rounded-section border border-line bg-surface px-surface-lg py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
              href={action.href}
            >
              {action.label}
            </Link>
          ) : (
            <button
              className="mt-surface-2xl inline-flex rounded-section border border-line bg-surface px-surface-lg py-2 type-body font-medium text-foreground transition hover:border-slate-300 hover:bg-slate-50"
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          )
        ) : null}
      </div>
    </main>
  );
}

function SystemAdminListSectionPlaceholder() {
  return (
    <div
      className={cn(
        ui.radius.panel,
        "border border-line bg-card p-4",
      )}
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-surface-lg h-48 w-full" />
    </div>
  );
}

export function SystemAdminSectionSkeleton() {
  return (
    <div
      className="flex flex-col gap-surface-2xl"
      aria-busy="true"
      aria-label="Loading system admin"
    >
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton
            className="h-9 w-24 rounded-control"
            key={`system-admin-nav-${index}`}
          />
        ))}
      </div>
      <SystemAdminListSectionPlaceholder />
    </div>
  );
}

export function SystemAdminHubSkeleton() {
  return (
    <div
      className="flex flex-col gap-surface-2xl"
      aria-busy="true"
      aria-label="Loading system admin hub"
    >
      <Skeleton className="h-28 w-full rounded-panel" />
      <div className="@container grid gap-3 @md:grid-cols-3 @lg:grid-cols-4">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            className={cn(ui.radius.panel, "border border-line bg-card p-4")}
            key={`system-admin-stat-${index}`}
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="@container grid gap-surface-lg @md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className={cn(ui.radius.panel, "border border-line bg-card p-4")}
            key={`system-admin-link-${index}`}
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-3 h-12 w-full" />
          </div>
        ))}
      </div>
      <SystemAdminListSectionPlaceholder />
    </div>
  );
}

export function SystemAdminAuditPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-surface-2xl"
      aria-busy="true"
      aria-label="Loading audit viewer"
    >
      <Skeleton className="h-24 w-full rounded-panel" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton
            className="h-9 w-28 rounded-control"
            key={`system-admin-audit-filter-${index}`}
          />
        ))}
      </div>
      <SystemAdminListSectionPlaceholder />
      <SystemAdminListSectionPlaceholder />
    </div>
  );
}

export function HrCompliancePageSkeleton() {
  return (
    <div
      className="@container flex flex-col gap-surface-2xl"
      aria-busy="true"
      aria-label="Loading HR compliance"
    >
      <Skeleton className="h-20 w-full max-w-2xl rounded-panel" />
      {Array.from({ length: 10 }, (_, index) => (
        <SystemAdminListSectionPlaceholder
          key={`hr-compliance-list-${index}`}
        />
      ))}
    </div>
  );
}

export function SystemAdminLynxPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-surface-2xl"
      aria-busy="true"
      aria-label="Loading Lynx governance"
    >
      <Skeleton className="h-24 w-full rounded-panel" />
      {Array.from({ length: 5 }, (_, index) => (
        <SystemAdminListSectionPlaceholder
          key={`system-admin-lynx-section-${index}`}
        />
      ))}
      <Skeleton className="h-40 w-full rounded-panel" />
    </div>
  );
}

export function AppShellSkeleton() {
  const navigationSkeletonItems = getAppShellSkeletonNavItemIds();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-line bg-surface-strong px-surface-2xl py-surface-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-surface-lg">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 animate-pulse rounded bg-line" />
            <div className="h-5 w-48 animate-pulse rounded bg-line" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-section bg-line" />
        </div>
      </div>
      <div className="@container mx-auto grid max-w-7xl gap-surface-2xl px-surface-2xl py-surface-3xl @lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-surface-lg">
          <div className="h-40 animate-pulse rounded-section border border-line bg-surface" />
          <div className="flex flex-col gap-2">
            {navigationSkeletonItems.map((item) => (
              <div
                className="h-10 animate-pulse rounded-section bg-line"
                key={item}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-surface-lg">
          <div className="h-32 animate-pulse rounded-section border border-line bg-surface" />
          <div className="h-64 animate-pulse rounded-section border border-line bg-surface" />
        </div>
      </div>
    </div>
  );
}
