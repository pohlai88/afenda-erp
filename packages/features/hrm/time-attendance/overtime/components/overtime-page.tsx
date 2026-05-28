import { getTranslations } from "next-intl/server"

import { ModulePageHeader } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { HrmAccessDeniedMessage } from "../../../_core/registry"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"
import { requireOrgSession } from "@afenda/platform/auth"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import {
  resolveOtmSurfaceAccess,
  type OtmSurfaceAccess,
} from "../data/otm-access.server"
import {
  findOtmEmployeeForUser,
  listActiveEmployeeChoicesForOtm,
  listActiveOtmTypes,
} from "../data/otm.queries.server"
import { OtmApprovedPayrollSection } from "./otm-approved-payroll-section"
import { OtmAttendanceReconcileSection } from "./otm-attendance-reconcile-section"
import { OtmApprovalRoutesSection } from "./otm-approval-routes-section"
import { OtmEligibilitySection } from "./otm-eligibility-section"
import { OtmMyRequestsSection } from "./otm-my-requests-section"
import { OtmOrgRequestsSection } from "./otm-org-requests-section"
import { OtmPayrollReadySection } from "./otm-payroll-ready-section"
import { OtmExceptionInbox } from "./otm-exception-inbox"
import { OtmPendingInbox } from "./otm-pending-inbox"
import { OtmPolicySection } from "./otm-policy-section"
import { OtmRateRulesSection } from "./otm-rate-rules-section"
import { OtmReportSection } from "./otm-report-section"
import { OtmTypesSection } from "./otm-types-section"
import { OtmRequestForm } from "./otm-request-form"

type OvertimePageProps = {
  orgSlug: string
  access?: OtmSurfaceAccess
  organizationId?: string
  userId?: string
  workbenchFocus?: string | null
}

export async function OvertimePage({
  orgSlug,
  access: accessProp,
  organizationId: organizationIdProp,
  userId: userIdProp,
  workbenchFocus = null,
}: OvertimePageProps) {
  const orgSession =
    organizationIdProp && userIdProp
      ? { organizationId: organizationIdProp, userId: userIdProp }
      : await requireOrgSession()

  const { organizationId, userId } = orgSession

  const access =
    accessProp ?? (await resolveOtmSurfaceAccess({ organizationId, userId }))

  const t = await getTranslations("Erp.Hrm.overtime")

  if (!access.canEnter) {
    return (
      <HrmAccessDeniedMessage
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
      />
    )
  }

  const [employeesResult, overtimeTypes, selfEmployee, canApproveAll] =
    await Promise.all([
      access.canManage
        ? listActiveEmployeeChoicesForOtm(organizationId).then(
            (value) => ({ ok: true as const, value }),
            (error) => ({ ok: false as const, error })
          )
        : Promise.resolve({ ok: true as const, value: [] }),
      listActiveOtmTypes(organizationId),
      access.hasSelfServiceEmployee
        ? findOtmEmployeeForUser(organizationId, userId)
        : Promise.resolve(null),
      canUseErpPermission({
        organizationId,
        userId,
        permission: {
          module: "hrm",
          object: "overtime",
          function: "update",
        },
      }),
    ])

  if (!employeesResult.ok) {
    logUnexpectedServerError(
      "overtime-page: employees query failed",
      employeesResult.error,
      { organizationId }
    )
  }

  const employees = employeesResult.ok ? employeesResult.value : []

  return (
    <div className="flex flex-col gap-6 p-6">
      <ModulePageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      {access.hasSelfServiceEmployee && selfEmployee ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">
              {t("selfRequestTitle")}
            </CardTitle>
            <CardDescription>{t("selfRequestDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <OtmRequestForm
              employees={[]}
              overtimeTypes={overtimeTypes}
              mode="self"
              defaultEmployeeId={selfEmployee.id}
            />
          </CardContent>
        </Card>
      ) : null}

      {access.canManage ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">
              {t("onBehalfTitle")}
            </CardTitle>
            <CardDescription>{t("onBehalfDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("noEmployees")}
              </p>
            ) : (
              <OtmRequestForm
                employees={employees}
                overtimeTypes={overtimeTypes}
                mode="on_behalf"
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      {access.hasSelfServiceEmployee && selfEmployee ? (
        <OtmMyRequestsSection
          organizationId={organizationId}
          employeeId={selfEmployee.id}
        />
      ) : null}

      {access.canManage ? (
        <>
          <OtmTypesSection types={overtimeTypes} canManage={access.canManage} />
          <OtmEligibilitySection
            organizationId={organizationId}
            overtimeTypes={overtimeTypes}
            canManage={access.canManage}
          />
          <OtmApprovalRoutesSection
            organizationId={organizationId}
            canManage={access.canManage}
          />
          <OtmPolicySection
            organizationId={organizationId}
            canManage={access.canManage}
          />
          <OtmRateRulesSection
            organizationId={organizationId}
            overtimeTypes={overtimeTypes}
            canManage={access.canManage}
          />
        </>
      ) : null}

      {access.canReadOrg ? (
        <>
          {canApproveAll ? (
            <OtmExceptionInbox
              organizationId={organizationId}
              orgSlug={orgSlug}
              workbenchFocus={workbenchFocus}
            />
          ) : null}
          <OtmPendingInbox
            organizationId={organizationId}
            orgSlug={orgSlug}
            userId={userId}
            canApproveAll={canApproveAll}
            workbenchFocus={workbenchFocus}
          />
          <OtmOrgRequestsSection
            organizationId={organizationId}
            orgSlug={orgSlug}
          />
          <OtmApprovedPayrollSection
            organizationId={organizationId}
            orgSlug={orgSlug}
          />
          <OtmPayrollReadySection
            organizationId={organizationId}
            orgSlug={orgSlug}
          />
          <OtmReportSection organizationId={organizationId} orgSlug={orgSlug} />
          <OtmAttendanceReconcileSection
            organizationId={organizationId}
            orgSlug={orgSlug}
          />
        </>
      ) : null}
    </div>
  )
}
