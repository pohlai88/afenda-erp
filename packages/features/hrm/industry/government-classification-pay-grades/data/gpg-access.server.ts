import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type GpgSurfaceAccess = {
  readonly canEnter: boolean
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canAudit: boolean
}

export async function resolveGpgSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<GpgSurfaceAccess> {
  const [canRead, canSearch, canManage, canAudit] = await Promise.all([
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "government_pay_grade",
        function: "read",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "government_pay_grade",
        function: "search",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "government_pay_grade",
        function: "update",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "government_pay_grade",
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
  }
}
