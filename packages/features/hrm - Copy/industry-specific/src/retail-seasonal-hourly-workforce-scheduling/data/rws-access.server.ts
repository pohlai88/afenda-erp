import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type RwsSurfaceAccess = {
  readonly canEnter: boolean
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canAudit: boolean
  readonly canViewLaborCost: boolean
}

export async function resolveRwsSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<RwsSurfaceAccess> {
  const [canRead, canSearch, canManage, canAudit, canViewLaborCost] =
    await Promise.all([
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "retail_schedule",
          function: "read",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "retail_schedule",
          function: "search",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "retail_schedule",
          function: "update",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "retail_schedule",
          function: "audit",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "retail_schedule",
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
    canViewLaborCost: canViewLaborCost || canManage,
  }
}
