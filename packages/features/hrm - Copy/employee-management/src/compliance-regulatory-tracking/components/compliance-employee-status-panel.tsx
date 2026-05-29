import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listComplianceOverviewRowsForOrg } from "../data/compliance-overview.queries.server"

import { ComplianceEmployeeStatusListSection } from "./compliance-employee-status-list-section"

type ComplianceEmployeeStatusPanelProps = {
  readonly organizationId: string
  readonly orgSlug: string
}

export async function ComplianceEmployeeStatusPanel({
  organizationId,
  orgSlug,
}: ComplianceEmployeeStatusPanelProps) {
  const [t, rows] = await Promise.all([
    getTranslations("Erp.Hrm.compliance.employeeStatus"),
    listComplianceOverviewRowsForOrg(organizationId),
  ])
  const topRows = rows.slice(0, 12)

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-base">{t("panelTitle")}</CardTitle>
        <CardDescription>{t("panelDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ComplianceEmployeeStatusListSection
          orgSlug={orgSlug}
          rows={topRows}
          labels={{
            groupLabel: t("groupLabel"),
            summaryLabel: t("summaryLabel"),
            summaryEmployeeCount: (count) =>
              t("summaryEmployeeCount", { count }),
            summaryAttentionCount: (count) =>
              t("summaryAttentionCount", { count }),
            summaryOpenCount: (count) => t("summaryOpenCount", { count }),
          }}
        />
      </CardContent>
    </Card>
  )
}
