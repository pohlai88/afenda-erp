import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type SuccessionSurfaceAccess = {
  readonly canEnter: boolean
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canAudit: boolean
  readonly canViewAssessments: boolean
}

export async function resolveSuccessionSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<SuccessionSurfaceAccess> {
  const [canRead, canSearch, canManage, canAudit, canCreate] = await Promise.all([
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "succession",
        function: "read",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "succession",
        function: "search",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "succession",
        function: "update",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "succession",
        function: "audit",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "succession",
        function: "create",
      },
    }),
  ])

  const canReadOrg = canRead || canSearch || canManage || canAudit || canCreate

  return {
    canEnter: canReadOrg,
    canRead: canReadOrg,
    canManage: canManage || canCreate,
    canAudit,
    canViewAssessments: canReadOrg,
  }
}
