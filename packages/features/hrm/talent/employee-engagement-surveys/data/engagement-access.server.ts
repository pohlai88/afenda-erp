import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type EmployeeEngagementSurfaceAccess = {
  canEnter: boolean
  canManage: boolean
  canReadOrg: boolean
  /** HRM-ENG-031 — `erp.hrm.employee_engagement.create` */
  canCreate: boolean
  /** HRM-ENG-031 — schedule/revert/config save (`update`) */
  canSchedule: boolean
  /** HRM-ENG-029–030 — generate/refresh analytics snapshot (`update`) */
  canGenerateAnalytics: boolean
  /** HRM-ENG-030 — CSV export (`audit`) */
  canExportAnalytics: boolean
}

export async function resolveEmployeeEngagementSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<EmployeeEngagementSurfaceAccess> {
  const [canSearch, canRead, canManage, canCreate, canExportAnalytics] =
    await Promise.all([
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "employee_engagement",
          function: "search",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "employee_engagement",
          function: "read",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "employee_engagement",
          function: "update",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "employee_engagement",
          function: "create",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "employee_engagement",
          function: "audit",
        },
      }),
    ])

  const canReadOrg = canSearch || canRead || canManage

  return {
    canEnter: canReadOrg,
    canManage,
    canReadOrg,
    canCreate,
    canSchedule: canManage,
    canGenerateAnalytics: canManage,
    canExportAnalytics,
  }
}
