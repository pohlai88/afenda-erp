import "server-only"

/**
 * OpenTelemetry span helpers — wraps a callable with a named span when
 * the OTel tracer is available, passthrough otherwise.
 */

type SpanOptions = {
  readonly attributes?: Record<string, string | number | boolean>
}

/**
 * Wraps an async callable in an OTel span when tracing is configured.
 * In environments without OTel, runs the callable directly.
 */
export async function withOtelSpan<T>(
  name: string,
  fn: () => Promise<T>,
  _options?: SpanOptions,
): Promise<T> {
  // Non-critical: OTel not yet wired in this deployment — passthrough.
  return fn()
}
