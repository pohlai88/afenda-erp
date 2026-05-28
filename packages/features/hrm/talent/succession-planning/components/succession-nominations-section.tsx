import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listEmployeesForOrganization } from "../../../employees/server"
import { listSuccessionCriticalRoleChoicesForOrg } from "../data/succession-critical-roles.server"
import { listSuccessionNominationsForOrg } from "../data/succession-nominations.server"
import { buildSuccessionNominationsListSurfaceConfiguration } from "../data/succession-surface-builders.server"
import { SUCCESSION_LIST_SURFACE_IDS } from "../data/succession-surface-metadata.shared"
import { SuccessionNominationFormDialog } from "./succession-nomination-form.client"
import { SuccessionNominationReadinessTrailingCell } from "./succession-nomination-readiness-trailing-cell.client"

export async function SuccessionNominationsSection({
  organizationId,
  orgSlug,
  canManage,
}: {
  organizationId: string
  orgSlug: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.successionPlanning")
  const [rows, roleChoices, employees] = await Promise.all([
    listSuccessionNominationsForOrg(organizationId),
    listSuccessionCriticalRoleChoicesForOrg(organizationId),
    listEmployeesForOrganization(organizationId),
  ])

  const employeeChoices = employees.map((employee) => ({
    id: employee.id,
    label: `${employee.employeeNumber} — ${employee.legalName}`,
  }))

  const listConfiguration = buildSuccessionNominationsListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("nominationsEmpty"),
      colRole: t("colRole"),
      colCandidate: t("colCandidate"),
      colType: t("colSuccessorType"),
      colReadiness: t("colReadiness"),
      colStatus: t("colStatus"),
      trailingActionLabel: t("updateReadinessAction"),
      canManage,
    }
  )

  return (
    <Card
      size="sm"
      id="succession-nominations-section"
      data-testid="succession-nominations-section"
    >
      <CardHeader>
        <CardTitle>{t("nominationsTitle")}</CardTitle>
        <CardDescription>{t("nominationsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <SuccessionNominationFormDialog
              roleChoices={roleChoices}
              employeeChoices={employeeChoices}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <GovernedPatternCListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={SUCCESSION_LIST_SURFACE_IDS.nominations}
          trailingColumn={
            canManage
              ? {
                  header: t("colActions"),
                  Cell: SuccessionNominationReadinessTrailingCell,
                }
              : undefined
          }
          data-testid={`governed-list-section:${SUCCESSION_LIST_SURFACE_IDS.nominations}`}
        />
      </CardContent>
    </Card>
  )
}
