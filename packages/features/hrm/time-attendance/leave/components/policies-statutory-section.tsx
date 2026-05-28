import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { requireOrgSession } from "@afenda/platform/auth"

import { isoDateOnlyToUtcDate } from "../../../_core/governance"
import {
  listLegalEntityPayrollConfigs,
  resolveRulePack,
} from "../../../payroll/server"
import {
  buildStatutoryHolidayListSurfaceConfiguration,
  type StatutoryHolidayListRow,
} from "../data/statutory-holiday-list-surface.server"

export async function PoliciesStatutorySection() {
  const [orgSession, t] = await Promise.all([
    requireOrgSession(),
    getTranslations("Erp.Hrm.policies"),
  ])

  const configs = await listLegalEntityPayrollConfigs(orgSession.organizationId)
  const countryCode =
    configs[0]?.payrollCountryCode?.toUpperCase() ??
    configs[0]?.countryCode?.toUpperCase() ??
    "MY"

  const year = new Date().getUTCFullYear()
  let rows: StatutoryHolidayListRow[] = []
  let packVersion = "—"
  let packError: string | null = null

  try {
    const pack = resolveRulePack(
      countryCode,
      isoDateOnlyToUtcDate(`${year}-01-01`)
    )
    packVersion = pack.version
    rows = pack.publicHolidays(year, []).map((h) => ({
      id: h.date,
      date: h.date,
      name: h.nameKey,
    }))
  } catch {
    packError = t("statutory.unsupportedCountry", { country: countryCode })
  }

  const listConfiguration = buildStatutoryHolidayListSurfaceConfiguration(
    rows,
    {
      empty: t("statutory.empty"),
      colDate: t("statutory.colDate"),
      colName: t("statutory.colName"),
    }
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("statutory.title")}</CardTitle>
        <CardDescription>
          {t("statutory.description", {
            country: countryCode,
            version: packVersion,
          })}
        </CardDescription>
      </CardHeader>
      {packError ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{packError}</p>
        </CardContent>
      ) : (
        <>
          <GovernedPatternCListSection
            layout="embedded"
            title={t("statutory.title")}
            description={t("statutory.description", {
              country: countryCode,
              version: packVersion,
            })}
            listConfiguration={listConfiguration}
            surfaceKey="hrm:statutory-holidays"
          />
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {t("statutory.readOnlyHint")}
            </p>
          </CardContent>
        </>
      )}
    </Card>
  )
}
