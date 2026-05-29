import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type FhcSurfaceAccess = {
  readonly canEnter: boolean
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canVerify: boolean
  readonly canAudit: boolean
}

export async function resolveFhcSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<FhcSurfaceAccess> {
  const [canRead, canSearch, canManage, canVerify, canAudit] =
    await Promise.all([
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "food_handler_compliance",
          function: "read",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "food_handler_compliance",
          function: "search",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "food_handler_compliance",
          function: "update",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "food_handler_compliance",
          function: "audit",
        },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: {
          module: "hrm",
          object: "food_handler_compliance",
          function: "audit",
        },
      }),
    ])

  const canReadOrg = canRead || canSearch || canManage || canAudit

  return {
    canEnter: canReadOrg,
    canRead: canReadOrg,
    canManage,
    canVerify: canVerify || canManage,
    canAudit,
  }
}
