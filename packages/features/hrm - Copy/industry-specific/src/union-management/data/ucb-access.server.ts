import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

export type UcbSurfaceAccess = {
  readonly canEnter: boolean
  readonly canRead: boolean
  readonly canManage: boolean
  readonly canAudit: boolean
  readonly canViewMembership: boolean
  readonly canViewGrievance: boolean
  readonly canViewPayrollLane: boolean
}

export async function resolveUcbSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<UcbSurfaceAccess> {
  const permission = {
    module: "hrm" as const,
    object: "union_collective_bargaining" as const,
  }

  const [canRead, canSearch, canManage, canAudit, canCreate] =
    await Promise.all([
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: { ...permission, function: "read" },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: { ...permission, function: "search" },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: { ...permission, function: "update" },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: { ...permission, function: "audit" },
      }),
      canUseErpPermission({
        organizationId: input.organizationId,
        userId: input.userId,
        permission: { ...permission, function: "create" },
      }),
    ])

  const canReadOrg = canRead || canSearch || canManage || canAudit || canCreate

  return {
    canEnter: canReadOrg,
    canRead: canReadOrg,
    canManage: canManage || canCreate,
    canAudit,
    canViewMembership: canReadOrg,
    canViewGrievance: canReadOrg,
    canViewPayrollLane: canRead || canAudit || canManage,
  }
}
