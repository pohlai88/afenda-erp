/**
 * 7W1H audit metadata structure.
 *
 * Encodes Who, What, When, Where, Why, How, Which (object), and Outcome
 * into a structured audit payload for compliance-grade audit trails.
 */

export type Audit7W1HEntry = {
  readonly who: string
  readonly what: string
  readonly when: string
  readonly where?: string
  readonly why?: string
  readonly how?: string
  readonly which?: string
  readonly outcome: "success" | "failure" | "partial"
  readonly meta?: Record<string, unknown>
}

/**
 * Constructs an audit 7W1H payload with defaults for optional fields.
 */
export function build7W1HAuditEntry(
  input: Omit<Audit7W1HEntry, "when"> & { when?: string },
): Audit7W1HEntry {
  return {
    ...input,
    when: input.when ?? new Date().toISOString(),
    outcome: input.outcome,
  }
}
