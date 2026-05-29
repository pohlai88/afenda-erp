import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Skeleton } from "@afenda/ui/skeleton"

const BUREAU_RELIABILITY_SKELETON_ROWS = ["kwsp", "perkeso", "lhdn"] as const

export async function BureauReliabilityCardSkeleton() {
  const t = await getTranslations("Erp.Hrm.compliance.bureauReliability")
  return (
    <Card size="sm" aria-busy="true">
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <CardDescription>
          <Skeleton className="h-3 w-72 max-w-full" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-1 text-sm">
            <tbody>
              {BUREAU_RELIABILITY_SKELETON_ROWS.map((row) => (
                <tr key={row} className="rounded-md bg-card/50">
                  <td className="px-2 py-2">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-2 py-2">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Skeleton className="ml-auto h-4 w-10" />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Skeleton className="ml-auto h-4 w-12" />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Skeleton className="ml-auto h-4 w-12" />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Skeleton className="ml-auto h-4 w-14" />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Skeleton className="ml-auto h-4 w-12" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Skeleton className="h-3 w-48" />
      </CardContent>
    </Card>
  )
}
