import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { listEmployeesForOrganization } from "@afenda/feature-hrm-employee-management/server"
import { listSuccessionTalentPoolsForOrg } from "../data/succession-pools.server"
import { buildSuccessionTalentPoolsListSurfaceConfiguration } from "../data/succession-surface-builders.server"
import { SUCCESSION_LIST_SURFACE_IDS } from "../data/succession-surface-metadata.shared"
import {
  SuccessionPoolMemberForm,
  SuccessionTalentPoolFormDialog,
} from "./succession-pool-form.client"

export async function SuccessionPoolsSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const t = await getTranslations("Erp.Hrm.successionPlanning")
  const [rows, employees] = await Promise.all([
    listSuccessionTalentPoolsForOrg(organizationId),
    listEmployeesForOrganization(organizationId),
  ])

  const employeeChoices = employees.map((employee) => ({
    id: employee.id,
    label: `${employee.employeeNumber} — ${employee.legalName}`,
  }))

  const listConfiguration = buildSuccessionTalentPoolsListSurfaceConfiguration(rows, {
    empty: t("talentPoolsEmpty"),
    colCode: t("colCode"),
    colName: t("colName"),
    colKind: t("colPoolKind"),
    colMembers: t("colMembers"),
  })

  return (
    <Card size="sm" id="succession-pools-section" data-testid="succession-pools-section">
      <CardHeader>
        <CardTitle>{t("talentPoolsTitle")}</CardTitle>
        <CardDescription>{t("talentPoolsDescription")}</CardDescription>
        {canManage ? (
          <CardAction>
            <SuccessionTalentPoolFormDialog />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className={canManage ? "pb-0" : undefined}>
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={SUCCESSION_LIST_SURFACE_IDS.talentPools}
          data-testid={`governed-list-section:${SUCCESSION_LIST_SURFACE_IDS.talentPools}`}
        />
      </CardContent>
      {canManage ? (
        <CardContent>
          <SuccessionPoolMemberForm pools={rows} employeeChoices={employeeChoices} />
        </CardContent>
      ) : null}
    </Card>
  )
}
