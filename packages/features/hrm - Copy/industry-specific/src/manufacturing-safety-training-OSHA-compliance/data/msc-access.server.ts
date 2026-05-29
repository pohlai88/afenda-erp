import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type MscSurfaceAccess = {
  readonly canEnter: boolean
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canReport: boolean
  readonly canAudit: boolean
}

export async function resolveMscSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<MscSurfaceAccess> {
  const [canRead, canSearch, canManage, canAudit] = await Promise.all([
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "manufacturing_safety",
        function: "read",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "manufacturing_safety",
        function: "search",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "manufacturing_safety",
        function: "update",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "manufacturing_safety",
        function: "audit",
      },
    }),
  ])

  const canReadOrg = canRead || canSearch || canManage || canAudit

  return {
    canEnter: canReadOrg,
    canRead: canReadOrg,
    canManage,
    canReport: canManage || canAudit,
    canAudit,
  }
}
