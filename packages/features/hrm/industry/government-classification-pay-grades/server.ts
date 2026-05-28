import "server-only"

import { requireOrgSession } from "@afenda/platform/auth"

export {
  resolveGpgSurfaceAccess,
  type GpgSurfaceAccess,
} from "./data/gpg-access.server"

export {
  getGpgPayrollCompensationSnapshot,
  getGpgGradeMovementRefForLifecycle,
  type GpgPayrollCompensationSnapshot,
  type GpgGradeMovementLifecycleRef,
} from "./data/gpg-integration.server"

import { getGpgPayrollCompensationSnapshot } from "./data/gpg-integration.server"

/** HRM-GPG-026 — payroll snapshot read with iam audit when org session is available. */
export async function readGpgPayrollCompensationSnapshotForOrg(input: {
  employeeId: string
  asOfDate: string
}) {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session
  return getGpgPayrollCompensationSnapshot({
    organizationId,
    employeeId: input.employeeId,
    asOfDate: input.asOfDate,
    audit: {
      actorUserId: userId,
      actorSessionId: sessionId,
    },
  })
}

export { revalidateGpgSurfaces } from "./data/gpg-revalidate.server"
