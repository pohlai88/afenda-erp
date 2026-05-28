import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { listRwsPayrollScheduleReferences } from "../data/rws-integration.server"
import { buildRwsPayrollReferencesListSurfaceConfiguration } from "../data/rws-surface-builders.server"
import { RWS_LIST_SURFACE_IDS } from "../data/rws-surface-metadata.shared"

export async function RwsPayrollReferencesSection({
  organizationId,
  rangeStart,
  rangeEnd,
}: {
  organizationId: string
  rangeStart: string
  rangeEnd: string
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")

  let rows: Awaited<ReturnType<typeof listRwsPayrollScheduleReferences>>
  try {
    rows = await listRwsPayrollScheduleReferences({
      organizationId,
      rangeStart,
      rangeEnd,
    })
  } catch (err) {
    logUnexpectedServerError("rws-payroll-references: query failed", err, {
      organizationId,
    })
    return (
      <Card size="sm" data-testid="rws-payroll-references-section">
        <CardHeader>
          <CardTitle>{t("payrollReferencesTitle")}</CardTitle>
          <CardDescription>
            {t("payrollReferencesDescription", { rangeStart, rangeEnd })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternBListSection
            layout="embedded"
            title=""
            listConfiguration={buildRwsPayrollReferencesListSurfaceConfiguration(
              [],
              {
                empty: t("payrollReferencesEmpty"),
                colEmployee: t("colEmployeeId"),
                colDate: t("colDate"),
                colShift: t("colShift"),
                colMinutes: t("colScheduledMinutes"),
                colHoliday: t("colHolidayBehavior"),
                formatMinutes: (minutes) => `${minutes} min`,
              }
            )}
            surfaceKey={`${RWS_LIST_SURFACE_IDS.payrollReferences}:error`}
            loadError={{
              variant: "error",
              title: t("payrollReferencesLoadFailed"),
            }}
          />
        </CardContent>
      </Card>
    )
  }

  const listConfiguration = buildRwsPayrollReferencesListSurfaceConfiguration(
    rows,
    {
      empty: t("payrollReferencesEmpty"),
      colEmployee: t("colEmployeeId"),
      colDate: t("colDate"),
      colShift: t("colShift"),
      colMinutes: t("colScheduledMinutes"),
      colHoliday: t("colHolidayBehavior"),
      formatMinutes: (minutes) => `${minutes} min`,
    }
  )

  return (
    <Card size="sm" data-testid="rws-payroll-references-section">
      <CardHeader>
        <CardTitle>{t("payrollReferencesTitle")}</CardTitle>
        <CardDescription>
          {t("payrollReferencesDescription", { rangeStart, rangeEnd })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={RWS_LIST_SURFACE_IDS.payrollReferences}
        />
      </CardContent>
    </Card>
  )
}
