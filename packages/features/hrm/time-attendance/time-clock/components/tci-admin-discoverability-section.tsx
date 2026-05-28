import { getTranslations } from "next-intl/server"

import { organizationSystemAdminPath } from "@afenda/feature-system-admin"
import Link from "next/link"
import { getSiteUrl } from "@afenda/platform/site"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

type TimeClockAdminDiscoverabilitySectionProps = {
  orgSlug: string
  locale: string
}

export async function TimeClockAdminDiscoverabilitySection({
  orgSlug,
  locale,
}: TimeClockAdminDiscoverabilitySectionProps) {
  const t = await getTranslations("Erp.Hrm.timeClock.adminDiscoverability")
  const origin = getSiteUrl()
  const ingestPath = `/${locale}/api/erp/hrm/time-clock/ingest`
  const ingestUrl = `${origin}${ingestPath}`
  const importsHref = organizationSystemAdminPath(orgSlug, "integrations")

  return (
    <div
      className="grid gap-4 md:grid-cols-2"
      data-testid="time-clock-admin-discoverability"
    >
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("importTitle")}</CardTitle>
          <CardDescription>{t("importDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={importsHref}
            prefetch={false}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("importLink")}
          </Link>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("ingestTitle")}</CardTitle>
          <CardDescription>{t("ingestDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-xs break-all text-muted-foreground">
            {ingestUrl}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
