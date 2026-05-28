import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"
import type { OrgSession } from "@afenda/platform/auth"

import { findLeaveEmployeeForUser } from "../../../time-attendance/server"
import { requireHrmOrgTenantFromForm } from "../../../_core/governance"
import { hrmActionFailure } from "../../../_core/governance"

import { LMS_ERP_PERMISSION } from "./lms-action-guard.server"
import type { LmsMutationFormState } from "./lms.types.shared"

export async function requireLmsLearnerOrManageForm(
  formData: FormData
): Promise<
  | {
      ok: true
      session: OrgSession
      orgSlug: string
      employeeId: string | null
      canManage: boolean
    }
  | { ok: false; response: LmsMutationFormState }
> {
  const tenant = await requireHrmOrgTenantFromForm(formData)
  if (!tenant.ok) return { ok: false, response: tenant.response }

  const organizationId = tenant.session.organizationId
  const userId = tenant.session.userId

  const [canManage, canCreate, canRead] = await Promise.all([
    canUseErpPermission({
      organizationId,
      userId,
      permission: { ...LMS_ERP_PERMISSION, function: "update" },
    }),
    canUseErpPermission({
      organizationId,
      userId,
      permission: { ...LMS_ERP_PERMISSION, function: "create" },
    }),
    canUseErpPermission({
      organizationId,
      userId,
      permission: { ...LMS_ERP_PERMISSION, function: "read" },
    }),
  ])

  if (!canRead && !canCreate && !canManage) {
    return {
      ok: false,
      response: hrmActionFailure({
        form: "Learning management access required.",
      }),
    }
  }

  const linked = await findLeaveEmployeeForUser(organizationId, userId)

  if (!canManage && !canCreate && !linked) {
    return {
      ok: false,
      response: hrmActionFailure({
        form: "No employee profile is linked to your account for this organization.",
      }),
    }
  }

  return {
    ok: true,
    session: tenant.session,
    orgSlug: tenant.orgSlug,
    employeeId: linked?.id ?? null,
    canManage,
  }
}
