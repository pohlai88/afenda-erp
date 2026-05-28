import { Suspense } from "react"
import { HrmShellAccessDenied } from "../../../_core/registry"

import { getTranslations } from "next-intl/server"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Skeleton } from "@afenda/ui/skeleton"
import { requireOrgSession } from "@afenda/platform/auth"
import { resolveLeaveSurfaceAccess } from "../data/leave-access.server"
import type { LeaveSurfaceAccess } from "../data/leave-access.server"
import {
  listActiveEmployeeChoicesForLeave,
  listActiveLeaveTypesForOrg,
} from "../data/leave-request.queries.server"
import type { LeaveListUrlState } from "../data/leave-list-url-state.shared"

import { LeaveAbsenceCalendar } from "./leave-absence-calendar"
import { LeaveApplyDialog } from "./leave-apply-dialog"
import { LeaveMyPanel } from "./leave-my-panel"
import { LeavePendingInbox } from "./leave-pending-inbox"
import { LeaveRecentTable } from "./leave-recent-table"
import { LeaveExportReportButton } from "./leave-export-report-button.client"

/**
 * Leave management surface. The page stays server-first and splits the
 * domain into self-service, approval, and visibility sections while all
 * authority remains inside Server Components and Server Actions.
 */
export type LeavePageProps = {
  orgSlug: string
  access?: LeaveSurfaceAccess
  /** When the route already resolved tenant context, pass org id to avoid a second session read. */
  organizationId?: string
  userId?: string
  listUrlState?: LeaveListUrlState
  workbenchFocus?: string | null
}

export async function LeavePage({
  orgSlug,
  access: accessFromRoute,
  organizationId: organizationIdFromRoute,
  userId: userIdFromRoute,
  listUrlState,
  workbenchFocus = null,
}: LeavePageProps) {
  let organizationId: string
  let userId: string | undefined = userIdFromRoute
  let leaveAccess: LeaveSurfaceAccess

  if (accessFromRoute && organizationIdFromRoute) {
    organizationId = organizationIdFromRoute
    leaveAccess = accessFromRoute
  } else {
    const session = await requireOrgSession()
    organizationId = session.organizationId
    userId = session.userId
    leaveAccess =
      accessFromRoute ??
      (await resolveLeaveSurfaceAccess({
        organizationId: session.organizationId,
        userId: session.userId,
      }))
  }

  if (!leaveAccess.canEnter) {
    const t = await getTranslations("Erp.Hrm.leave")

    return <HrmShellAccessDenied surface={t("pageTitle")} />
  }

  const [t, employees, leaveTypes] = await Promise.all([
    getTranslations("Erp.Hrm.leave"),
    leaveAccess.canManage
      ? listActiveEmployeeChoicesForLeave(organizationId)
      : Promise.resolve([]),
    listActiveLeaveTypesForOrg(organizationId),
  ])

  const canApplyOnBehalf =
    leaveAccess.canManage && employees.length > 0 && leaveTypes.length > 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ModulePageHeader
          eyebrow={t("eyebrow")}
          title={t("pageTitle")}
          description={t("pageDescription")}
        />
        {leaveAccess.canManage ? <LeaveExportReportButton /> : null}
      </div>

      {leaveAccess.canManage && employees.length === 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("noEmployeesTitle")}</CardTitle>
            <CardDescription>{t("noEmployeesBody")}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {leaveAccess.canManage &&
      employees.length > 0 &&
      leaveTypes.length === 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("noLeaveTypesTitle")}</CardTitle>
            <CardDescription>{t("noLeaveTypesBody")}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("myLeaveTitle")}</CardTitle>
          <CardDescription>{t("myLeaveDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LeaveSectionSkeleton />}>
            <LeaveMyPanel leaveTypes={leaveTypes} />
          </Suspense>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("inboxTitle")}</CardTitle>
          <CardDescription>{t("inboxDescription")}</CardDescription>
          {canApplyOnBehalf ? (
            <CardAction>
              <LeaveApplyDialog
                orgSlug={orgSlug}
                employees={employees}
                leaveTypes={leaveTypes}
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LeaveSectionSkeleton />}>
            <LeavePendingInbox
              orgSlug={orgSlug}
              canApproveAll={leaveAccess.canManage}
              organizationId={organizationId}
              userId={userId}
              listUrlState={
                listUrlState ?? {
                  focus: workbenchFocus,
                  pendingType: null,
                  pendingSort: null,
                }
              }
            />
          </Suspense>
        </CardContent>
      </Card>

      {leaveAccess.canManage ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("recentTitle")}</CardTitle>
            <CardDescription>{t("recentDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LeaveSectionSkeleton />}>
              <LeaveRecentTable
                orgSlug={orgSlug}
                isAdmin={leaveAccess.canManage}
              />
            </Suspense>
          </CardContent>
        </Card>
      ) : null}

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("absenceTitle")}</CardTitle>
          <CardDescription>{t("absenceDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LeaveSectionSkeleton />}>
            <LeaveAbsenceCalendar />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function LeaveSectionSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}
