import "server-only"

import { canUseErpPermissionForCurrentOrg } from "@afenda/platform/erp/rbac.server"

import type { PayrollSurfaceCapabilities } from "./payroll-capabilities.shared"

export type { PayrollSurfaceCapabilities } from "./payroll-capabilities.shared"

/** ERP RBAC flags for the payroll overview and console mutations. */
export async function resolvePayrollSurfaceCapabilities(): Promise<PayrollSurfaceCapabilities> {
  const [canSearch, canCreate, canUpdate, canAudit] = await Promise.all([
    canUseErpPermissionForCurrentOrg({
      module: "hrm",
      object: "payroll",
      function: "search",
    }),
    canUseErpPermissionForCurrentOrg({
      module: "hrm",
      object: "payroll",
      function: "create",
    }),
    canUseErpPermissionForCurrentOrg({
      module: "hrm",
      object: "payroll",
      function: "update",
    }),
    canUseErpPermissionForCurrentOrg({
      module: "hrm",
      object: "payroll",
      function: "audit",
    }),
  ])

  return { canSearch, canCreate, canUpdate, canAudit }
}
