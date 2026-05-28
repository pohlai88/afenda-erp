import { Suspense, type ReactNode } from "react"

import {
  TimeClockKpiSectionSkeleton,
  TimeClockListSectionSkeleton,
} from "./time-clock-page-loading"

type TimeClockStreamSlotProps = {
  readonly children: ReactNode
  readonly variant?: "kpi" | "list" | "list-with-action"
}

export function TimeClockStreamSlot({
  children,
  variant = "list",
}: TimeClockStreamSlotProps) {
  const fallback =
    variant === "kpi" ? (
      <TimeClockKpiSectionSkeleton />
    ) : (
      <TimeClockListSectionSkeleton
        withHeaderAction={variant === "list-with-action"}
      />
    )

  return <Suspense fallback={fallback}>{children}</Suspense>
}
