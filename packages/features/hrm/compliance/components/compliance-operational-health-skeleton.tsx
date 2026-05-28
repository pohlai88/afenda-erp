import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Skeleton } from "@afenda/ui/skeleton"
import { getTranslations } from "next-intl/server"

const OPERATIONAL_HEALTH_COUNTER_SKELETONS = [
  "queued",
  "submitted",
  "acknowledged",
  "failed",
  "attention",
] as const

export async function ComplianceOperationalHealthSkeleton() {
  const t = await getTranslations("Erp.Hrm.compliance.operationalHealth")
  return (
    <Card size="sm" aria-busy="true" aria-label={t("loadingAria")}>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {OPERATIONAL_HEALTH_COUNTER_SKELETONS.map((counter) => (
            <CounterSkeleton key={counter} />
          ))}
        </div>
        <Skeleton className="h-3 w-72 max-w-full" />
      </CardContent>
    </Card>
  )
}

function CounterSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card px-3 py-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-12" />
    </div>
  )
}
