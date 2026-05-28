import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Button } from "@afenda/ui/button"
import Link from "next/link"
import { organizationHrmPath } from "../../../_core/shared"

type PoliciesWorkingPatternSectionProps = {
  orgSlug: string
}

export async function PoliciesWorkingPatternSection({
  orgSlug,
}: PoliciesWorkingPatternSectionProps) {
  const t = await getTranslations("Erp.Hrm.policies")
  const attendanceHref = organizationHrmPath(orgSlug, "attendance")

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("workingPattern.title")}</CardTitle>
        <CardDescription>{t("workingPattern.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {t("workingPattern.body")}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href={attendanceHref}>
            {t("workingPattern.openAttendance")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
