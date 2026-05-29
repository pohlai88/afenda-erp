import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type LmsSurfaceAccess = {
  readonly canEnter: boolean
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canAudit: boolean
  readonly canViewEmployeeOverview: boolean
  readonly canViewManagerOverview: boolean
  readonly canViewHrOverview: boolean
  readonly canExportReports: boolean
  readonly canViewLearningHistory: boolean
}

export async function resolveLmsSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<LmsSurfaceAccess> {
  const [canRead, canSearch, canManage, canAudit] = await Promise.all([
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "lms",
        function: "read",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "lms",
        function: "search",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "lms",
        function: "update",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "lms",
        function: "audit",
      },
    }),
  ])

  const canReadOrg = canRead || canSearch || canManage || canAudit

  return {
    canEnter: canReadOrg,
    canRead: canReadOrg,
    canManage,
    canAudit,
    canViewEmployeeOverview: canReadOrg,
    canViewManagerOverview: canReadOrg || canManage,
    canViewHrOverview: canManage || canAudit,
    canExportReports: canManage || canAudit,
    canViewLearningHistory: canReadOrg,
  }
}
