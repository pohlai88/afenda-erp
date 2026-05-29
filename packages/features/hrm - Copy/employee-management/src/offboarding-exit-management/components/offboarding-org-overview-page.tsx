import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { requireOrgSession } from "@afenda/platform/auth"

import { buildOffboardingOverviewListSurfaceConfiguration } from "../data/offboarding-list-surface.server"
import { listOffboardingInstancesForOrgOverview } from "../data/offboarding-org-overview.queries.server"
import type { OffboardingSurfaceCapabilities } from "../data/offboarding-capabilities.shared"
import { OffboardingOverviewTrailingCell } from "./offboarding-list-trailing-cells.client"

type OffboardingOrgOverviewPageProps = {
  orgSlug: string
  capabilities: OffboardingSurfaceCapabilities
}

export async function OffboardingOrgOverviewPage({
  orgSlug,
  capabilities,
}: OffboardingOrgOverviewPageProps) {
  const { organizationId } = await requireOrgSession()
  const [t, rows] = await Promise.all([
    getTranslations("Erp.Hrm.offboarding"),
    listOffboardingInstancesForOrgOverview(organizationId),
  ])
  const listConfiguration = buildOffboardingOverviewListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      title: t("overviewTitle"),
      description: t("overviewDescription"),
      empty: t("overviewEmpty"),
      colEmployee: t("colEmployee"),
      colExitType: t("colExitType"),
      colStatus: t("colStatus"),
      colLastWorking: t("colLastWorking"),
      colTasks: t("colTasks"),
      colSettlement: t("colSettlement"),
      emptyValue: t("emptyValue"),
      taskCounts: ({ pending, overdue }) =>
        t("taskCounts", { pending, overdue }),
    }
  )
  return (
    <GovernedPatternCListSection
      title={t("overviewTitle")}
      description={t("overviewDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:offboarding:overview"
      cardClassName="mt-0"
      forbidden={{
        variant: "forbidden",
        title: t("forbiddenTitle"),
        description: t("forbiddenDescription"),
      }}
      invalid={{
        variant: "error",
        title: t("overviewLoadFailed"),
      }}
      trailingColumn={{
        header: t("colActions"),
        Cell: OffboardingOverviewTrailingCell,
        context: {
          orgSlug,
          capabilities,
          rows: rows.map((row) => ({
            id: row.id,
            employeeId: row.employeeId,
            status: row.status,
          })),
        },
      }}
    />
  )
}
