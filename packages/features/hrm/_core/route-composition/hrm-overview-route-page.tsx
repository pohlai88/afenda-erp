import { redirect } from "next/navigation"

import { getOrgTenantContext } from "@afenda/platform/auth"
import { listEffectiveErpPermissionsForUser } from "@afenda/platform/erp/rbac.server"
import {
  HrmOverviewAccessDenied,
  HrmOverviewPage,
} from "../../_core/app"
import {
  HRM_CAPABILITIES,
  organizationHrmPath,
} from "../../_core/shared"
import { resolveLeaveSurfaceAccess } from "../../time-attendance/server"

/** `/apps/hrm` landing — RBAC gate + overview or leave fallback. */
export async function HrmOverviewRoutePage({ orgSlug }: { orgSlug: string }) {
  const { organizationId, userId } = await getOrgTenantContext()
  const permissions = await listEffectiveErpPermissionsForUser({
    organizationId,
    userId,
  })
  const hasHrmCapability = HRM_CAPABILITIES.some((capability) =>
    permissions.includes(capability.requiredPermission)
  )
  if (!hasHrmCapability) {
    const leaveAccess = await resolveLeaveSurfaceAccess({
      organizationId,
      userId,
    })
    if (leaveAccess.canEnter) {
      redirect(organizationHrmPath(orgSlug, "leave"))
    }

    return <HrmOverviewAccessDenied />
  }
  return <HrmOverviewPage orgSlug={orgSlug} />
}
