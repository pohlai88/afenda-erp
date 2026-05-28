import { Card, CardContent, CardHeader } from "@afenda/ui/card"
import { Skeleton } from "@afenda/ui/skeleton"

const DEFAULT_ROW_COUNT = 4

type CompliancePanelSkeletonProps = {
  rows?: number
}

export function CompliancePanelSkeleton({
  rows = DEFAULT_ROW_COUNT,
}: CompliancePanelSkeletonProps) {
  return (
    <Card size="sm" aria-busy="true">
      <CardHeader className="flex flex-col gap-2">
        <Skeleton className="h-5 w-48 max-w-full" />
        <Skeleton className="h-3 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: rows }, (_, row) => (
          <div
            key={row}
            className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
          >
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
