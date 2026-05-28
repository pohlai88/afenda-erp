import "server-only"

import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { TCI_DEVICE_ADMIN_PERMISSION } from "../tci-device-admin-access.shared"
import {
  TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION,
  TCI_CORRECTION_LAM_PERMISSION,
} from "../tci-correction-access.shared"

export type TimeClockSurfaceAccess = {
  readonly canEnter: boolean
  readonly canManageDevices: boolean
  readonly canManageMappings: boolean
  readonly canDecideExceptions: boolean
  readonly canCorrectAttendance: boolean
  readonly canIngest: boolean
  readonly canRead: boolean
  readonly canAudit: boolean
}

export async function resolveTimeClockSurfaceAccess(input: {
  organizationId: string
  userId: string
}): Promise<TimeClockSurfaceAccess> {
  const [
    canSearch,
    canRead,
    canManageDevice,
    canManageMapping,
    canDecideException,
    canIngest,
    canAudit,
    canCorrectAttendance,
  ] = await Promise.all([
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "time_clock",
        function: "search",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "time_clock",
        function: "read",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: TCI_DEVICE_ADMIN_PERMISSION,
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "time_clock_mapping",
        function: "update",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION,
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "time_clock_punch",
        function: "update",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: {
        module: "hrm",
        object: "time_clock",
        function: "audit",
      },
    }),
    canUseErpPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permission: TCI_CORRECTION_LAM_PERMISSION,
    }),
  ])

  const canReadOrg = canSearch || canRead || canManageDevice || canAudit

  return {
    canEnter: canReadOrg || canManageMapping || canIngest,
    canManageDevices: canManageDevice,
    canManageMappings: canManageMapping,
    canDecideExceptions: canDecideException,
    canCorrectAttendance,
    canIngest,
    canRead: canReadOrg,
    canAudit,
  }
}
