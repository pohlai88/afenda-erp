import { GovernedComponentSkeleton } from "@afenda/governed-surface/metadata"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Skeleton } from "@afenda/ui/skeleton"

const KPI_STAT_KEYS = [
  "active-devices",
  "active-mappings",
  "pending-exceptions",
  "failed-sync",
  "punches-today",
  "missing-punch-days",
  "duplicate-punch-inbox",
  "abnormal-punch-days",
  "abnormal-punch-inbox",
  "shift-evaluated-today",
  "lam-exposed-today",
  "work-hour-days-today",
  "payroll-ready-days-today",
  "correction-queue-open",
] as const

function ModulePageHeaderSkeleton() {
  return (
    <header className="flex flex-col gap-surface-xs" aria-hidden="true">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-4 w-full max-w-2xl" />
    </header>
  )
}

export function TimeClockKpiSectionSkeleton() {
  return (
    <Card size="sm" aria-hidden="true">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-5 w-24" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <section className="@container" data-testid="time-clock-loading-kpi">
          <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-4">
            {KPI_STAT_KEYS.map((key) => (
              <Skeleton key={key} className="h-24 rounded-xl" />
            ))}
          </div>
        </section>
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export function TimeClockListSectionSkeleton({
  withHeaderAction = false,
}: {
  readonly withHeaderAction?: boolean
}) {
  return (
    <Card size="sm" className="border-solid border-border" aria-hidden="true">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-5 w-36" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-3 w-full max-w-xl" />
        </CardDescription>
        {withHeaderAction ? (
          <CardAction>
            <Skeleton className="h-8 w-32 rounded-md" />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedComponentSkeleton rendererId="list-surface" />
      </CardContent>
    </Card>
  )
}

function TimeClockSectionGroupSkeleton({
  listCount,
  withHeaderActionIndices = [],
}: {
  readonly listCount: number
  readonly withHeaderActionIndices?: readonly number[]
}) {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-full max-w-lg" />
      </div>
      <div className="flex flex-col gap-6">
        {Array.from({ length: listCount }, (_, index) => (
          <TimeClockListSectionSkeleton
            key={`time-clock-list-skeleton-${listCount}-${index}`}
            withHeaderAction={withHeaderActionIndices.includes(index)}
          />
        ))}
      </div>
    </div>
  )
}

function TimeClockReportSectionSkeleton() {
  return (
    <Card size="sm" className="border-solid border-border" aria-hidden="true">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-5 w-40" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-3 w-full max-w-lg" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-full max-w-md rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </CardContent>
    </Card>
  )
}

/**
 * Route `loading.tsx` + page Suspense fallback — mirrors `TimeClockPage` section
 * groups (KPI → setup → capture → quality → downstream → operations → admin).
 */
export function TimeClockPageLoading() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-live="polite"
      data-testid="time-clock-page-loading"
    >
      <ModulePageHeaderSkeleton />
      <TimeClockKpiSectionSkeleton />
      <TimeClockSectionGroupSkeleton
        listCount={2}
        withHeaderActionIndices={[0, 1]}
      />
      <TimeClockSectionGroupSkeleton listCount={4} />
      <TimeClockSectionGroupSkeleton listCount={5} />
      <TimeClockSectionGroupSkeleton listCount={3} />
      <TimeClockSectionGroupSkeleton listCount={2} />
      <div className="flex flex-col gap-4" aria-hidden="true">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
        <div className="flex flex-col gap-6">
          <TimeClockListSectionSkeleton />
          <TimeClockReportSectionSkeleton />
        </div>
      </div>
    </div>
  )
}
