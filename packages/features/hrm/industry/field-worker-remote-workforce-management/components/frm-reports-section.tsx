import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { FrmExportReportButton } from "./frm-export-report-button.client"

export async function FrmReportsSection({ canAudit }: { canAudit: boolean }) {
  const t = await getTranslations("Erp.Hrm.fieldWorkforce")

  return (
    <Card size="sm" data-testid="frm-reports-section">
      <CardHeader>
        <CardTitle>{t("reportsTitle")}</CardTitle>
        <CardDescription>{t("reportsDescription")}</CardDescription>
        {canAudit ? (
          <CardAction>
            <FrmExportReportButton />
          </CardAction>
        ) : null}
      </CardHeader>
    </Card>
  )
}
