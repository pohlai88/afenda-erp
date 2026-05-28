import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { getOrganizationSlugById } from "@afenda/platform/auth/org-slug.server"

import { buildPayrollRunListSurfaceConfiguration } from "../data/payroll-run-list-surface.server"
import type { PayrollConsoleRun } from "../data/payroll-console-view.shared"

type PayrollRunListSectionProps = {
  organizationId: string
  runs: readonly PayrollConsoleRun[]
}

export async function PayrollRunListSection({
  organizationId,
  runs,
}: PayrollRunListSectionProps) {
  const t = await getTranslations("Erp.Hrm.payroll")
  const orgSlug = (await getOrganizationSlugById(organizationId)) ?? ""

  const listConfiguration = buildPayrollRunListSurfaceConfiguration(
    runs,
    orgSlug,
    {
      empty: t("noRuns"),
      colEmployee: t("colEmployee"),
      colState: t("colState"),
      colGrossPay: t("colGrossPay"),
      colNetPay: t("colNetPay"),
      colEmployerCost: t("colEmployerCost"),
      stateLabelFor: (state) => state,
      issuesLabel: (count) => t("hasIssues", { count }),
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:payroll:runs"
      resolveConfiguredPermission={false}
    />
  )
}
