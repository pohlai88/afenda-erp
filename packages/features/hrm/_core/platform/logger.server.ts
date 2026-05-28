import "server-only"

/**
 * Server-side logger shim — wraps console.error with structured context for
 * unexpected errors, matching the legacy `@afenda/platform/logger.server` API.
 */

export type UnexpectedServerErrorContext = {
  readonly module?: string
  readonly operation?: string
  readonly organizationId?: string
  readonly [key: string]: unknown
}

/**
 * Logs an unexpected server error with structured context.
 * In production, this would forward to an observability sink (e.g. Datadog/Sentry).
 */
export function logUnexpectedServerError(
  error: unknown,
  context?: UnexpectedServerErrorContext,
): void {
  const ctx = context ?? {}
  console.error("[hrm:unexpected-error]", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...ctx,
  })
}
