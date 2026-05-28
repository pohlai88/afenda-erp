/**
 * ERP RBAC shared helpers — permission key construction.
 *
 * Permission key format: "{module}.{object}.{function}"
 * e.g. "hrm.employee.search", "hrm.leave.approve"
 */

export type ErpPermissionKeyInput = {
  readonly module: string
  readonly object: string
  readonly function: string
}

/**
 * Builds a canonical ERP permission key used in role definitions and authorization guards.
 */
export function buildErpPermissionKey(input: ErpPermissionKeyInput): string {
  return `${input.module}.${input.object}.${input.function}`
}
