/**
 * CRUD-SAP audit action builder.
 *
 * Produces canonical dot-separated audit strings:
 *   buildCrudSapAuditAction({ area:"erp", module:"hrm", object:"employee", verb:"create" })
 *   → "erp.hrm.employee.create"
 */

export type CrudSapVerb =
  | "create"
  | "update"
  | "deprecate"
  | "delete"
  | "audit"
  | "export"
  | "import"
  | "approve"
  | "reject"
  | "submit"
  | "cancel"
  | "archive"
  | "restore"
  | "lock"
  | "unlock"
  | "close"
  | "reopen"
  | string

export type CrudSapAuditActionInput = {
  readonly area: string
  readonly module: string
  readonly object: string
  readonly verb: CrudSapVerb
}

/**
 * Builds a canonical, stable, dot-joined audit action key for structured audit logs.
 * All non-alphanumeric segments are coerced to underscores for consistency.
 */
export function buildCrudSapAuditAction(
  input: CrudSapAuditActionInput,
): string {
  const sanitize = (s: string) => s.replace(/[^a-z0-9._]/gi, "_").toLowerCase()
  return [input.area, input.module, input.object, input.verb]
    .map(sanitize)
    .join(".")
}
