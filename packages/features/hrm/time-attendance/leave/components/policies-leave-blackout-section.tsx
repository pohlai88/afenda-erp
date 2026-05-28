import { getTranslations } from "next-intl/server"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { requireOrgSession } from "@afenda/platform/auth"

import { buildLeaveBlackoutListSurfaceConfiguration } from "../data/leave-blackout-list-surface.server"
import { listActiveLeaveBlackoutsForOrg } from "../data/leave-blackout.queries.server"
import { listAllLeaveTypesForOrg } from "../data/leave-policy.queries.server"

import { PoliciesLeaveBlackoutCreateDialog } from "./policies-leave-blackout-create-dialog.client"
import { PoliciesLeaveBlackoutTrailingCell } from "./policies-leave-blackout-trailing-cell.client"

type PoliciesLeaveBlackoutSectionProps = {
  isAdmin: boolean
}

export async function PoliciesLeaveBlackoutSection({
  isAdmin,
}: PoliciesLeaveBlackoutSectionProps) {
  const [orgSession, t] = await Promise.all([
    requireOrgSession(),
    getTranslations("Erp.Hrm.policies"),
  ])
  const [rows, leaveTypes] = await Promise.all([
    listActiveLeaveBlackoutsForOrg(orgSession.organizationId),
    listAllLeaveTypesForOrg(orgSession.organizationId),
  ])

  const activeLeaveTypes = leaveTypes.filter((lt) => lt.archivedAt === null)
  const leaveTypeById = new Map(activeLeaveTypes.map((lt) => [lt.id, lt.code]))

  const listConfiguration = buildLeaveBlackoutListSurfaceConfiguration(
    rows,
    {
      empty: t("blackout.empty"),
      colName: t("blackout.colName"),
      colPeriod: t("blackout.colPeriod"),
      colLeaveType: t("blackout.colLeaveType"),
      archiveLabel: t("blackout.archive"),
    },
    {
      canArchive: isAdmin,
      leaveTypeLabel: (leaveTypeId) =>
        leaveTypeId
          ? (leaveTypeById.get(leaveTypeId) ?? leaveTypeId)
          : t("blackout.allLeaveTypes"),
    }
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("blackout.title")}</CardTitle>
        <CardDescription>{t("blackout.description")}</CardDescription>
        {isAdmin ? (
          <CardAction>
            <PoliciesLeaveBlackoutCreateDialog
              leaveTypes={activeLeaveTypes.map((lt) => ({
                id: lt.id,
                code: lt.code,
              }))}
            />
          </CardAction>
        ) : null}
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title={t("blackout.title")}
        description={t("blackout.description")}
        listConfiguration={listConfiguration}
        surfaceKey="hrm:leave-blackout"
        trailingColumn={
          isAdmin
            ? {
                header: t("blackout.colActions"),
                Cell: PoliciesLeaveBlackoutTrailingCell,
              }
            : undefined
        }
      />
    </Card>
  )
}
