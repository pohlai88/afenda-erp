import { getTranslations } from "next-intl/server"

import Link from "next/link"
import type { Route } from "next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Button } from "@afenda/ui/button"
import { SftSwapPendingSection } from "@afenda/feature-hrm-time-attendance/server"

type RwsSwapsSectionProps = {
  orgSlug: string
  organizationId: string
  canManage: boolean
}

export async function RwsSwapsSection({
  orgSlug,
  organizationId,
  canManage,
}: RwsSwapsSectionProps) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")

  return (
    <div
      id="rws-swaps-section"
      data-testid="rws-swaps-section"
      className="flex flex-col gap-4"
    >
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("swapsTitle")}</CardTitle>
          <CardDescription>{t("swapsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/o/${orgSlug}/apps/hrm/shift-scheduling` as Route}
              prefetch={false}
            >
              {t("openShiftScheduling")}
            </Link>
          </Button>
        </CardContent>
      </Card>
      {canManage ? (
        <SftSwapPendingSection
          orgSlug={orgSlug}
          organizationId={organizationId}
          canManage={canManage}
        />
      ) : null}
    </div>
  )
}
