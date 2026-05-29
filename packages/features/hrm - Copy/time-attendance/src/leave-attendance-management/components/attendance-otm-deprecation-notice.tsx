import { getTranslations } from "next-intl/server"

import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"
import Link from "next/link"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

type AttendanceOtmDeprecationNoticeProps = {
  orgSlug: string
}

export async function AttendanceOtmDeprecationNotice({
  orgSlug,
}: AttendanceOtmDeprecationNoticeProps) {
  const t = await getTranslations("Erp.Hrm.attendance")
  const overtimeHref = organizationHrmPath(orgSlug, "overtime")

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("otmDeprecationTitle")}</CardTitle>
        <CardDescription>{t("otmDeprecationBody")}</CardDescription>
      </CardHeader>
      <p className="px-6 pb-4 text-sm">
        <Link
          href={overtimeHref}
          className="font-medium text-primary underline-offset-4 hover:underline"
          prefetch={false}
        >
          {t("otmDeprecationLink")}
        </Link>
      </p>
    </Card>
  )
}
