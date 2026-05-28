/**
 * Legacy compat barrel – was ../_core/shared.
 *
 * Re-exports isomorphic types, routing helpers, and shared form-state
 * shapes that every HRM sub-module references. Keep this file server-and-
 * client-safe (no server-only imports).
 */
export * from "./routing/constants"
export * from "./routing/hrm-apps-path.shared"
export * from "./contracts/types"
export * from "./shared/hrm-employee-list-surface-rows.shared"
export * from "./shared/employee-records-field-key.shared"
