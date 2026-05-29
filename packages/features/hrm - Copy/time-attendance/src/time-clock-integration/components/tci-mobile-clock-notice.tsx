import { getTranslations } from "next-intl/server"

import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import Link from "next/link"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

/**
 * HRM-TCI-002 mobile clocks — owned by Geolocation when the org surface is enabled.
 */
export async function TimeClockMobileClockNotice({
  orgSlug,
  enabled,
}: {
  orgSlug: string
  enabled: boolean
}) {
  if (!enabled) return null

  const t = await getTranslations("Erp.Hrm.timeClock.devices")
  const geoHref = organizationHrmPath(orgSlug, "geolocation")

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("mobileClockNoticeTitle")}</CardTitle>
        <CardDescription>{t("mobileClockNoticeDescription")}</CardDescription>
      </CardHeader>
      <p className="px-6 pb-4 text-sm">
        <Link
          href={geoHref}
          className="font-medium text-primary underline-offset-4 hover:underline"
          prefetch={false}
        >
          {t("mobileClockNoticeLink")}
        </Link>
      </p>
    </Card>
  )
}
