import "server-only"

/**
 * Legacy compat barrel – was ../_core/server.
 *
 * Server-only cross-cutting guards shared across all HRM sub-modules.
 */
export { assertOptionalHrmPlacementFkBelongsToOrg } from "./cross-cutting/hrm-org-fk.server"
