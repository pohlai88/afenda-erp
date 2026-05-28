import { notFound } from "next/navigation"

import { getOrgTenantContext } from "@afenda/platform/auth"
import { listEffectiveErpPermissionsForUser } from "@afenda/platform/erp/rbac.server"
import {
  HrmCapabilityAccessDenied,
  HrmCapabilityPlaceholderPage,
} from "../../_core/app"
import {
  getHrmCapabilityForSegment,
  isAllowedHrmAppsSubsegment,
} from "../../_core/shared"

/** Registered HRM capability segments without a dedicated route file. */
export async function HrmSegmentCapabilityRoutePage({
  segment,
}: {
  segment: string
}) {
  if (!isAllowedHrmAppsSubsegment(segment)) {
    notFound()
  }

  const capability = getHrmCapabilityForSegment(segment)
  if (!capability) {
    notFound()
  }

  const { organizationId, userId } = await getOrgTenantContext()
  const permissions = await listEffectiveErpPermissionsForUser({
    organizationId,
    userId,
  })
  if (!permissions.includes(capability.requiredPermission)) {
    return <HrmCapabilityAccessDenied />
  }

  return <HrmCapabilityPlaceholderPage segment={segment} />
}
