import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type FrmSurfaceAccess = {
  readonly canEnter: boolean
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canManageTravel: boolean
  readonly canManagePerDiem: boolean
  readonly canAudit: boolean
}

export async function resolveFrmSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<FrmSurfaceAccess> {
  const [canRead, canSearch, canManage, canAudit] = await Promise.all([
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "field_workforce",
        function: "read",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "field_workforce",
        function: "search",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "field_workforce",
        function: "update",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "field_workforce",
        function: "audit",
      },
    }),
  ])

  const canReadOrg = canRead || canSearch || canManage || canAudit

  return {
    canEnter: canReadOrg,
    canRead: canReadOrg,
    canManage,
    canManageTravel: canManage,
    canManagePerDiem: canManage,
    canAudit,
  }
}
