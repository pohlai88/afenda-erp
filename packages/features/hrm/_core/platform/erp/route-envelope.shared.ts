/**
 * Route action envelope helpers — standard response shapes for HRM Server Actions.
 */

export type RouteEnvelopeSuccess<T> = {
  readonly ok: true
  readonly data: T
}

export type RouteEnvelopeFailure = {
  readonly ok: false
  readonly error: string
  readonly code?: string
}

export type RouteEnvelope<T> = RouteEnvelopeSuccess<T> | RouteEnvelopeFailure

export function routeOk<T>(data: T): RouteEnvelopeSuccess<T> {
  return { ok: true, data }
}

export function routeFail(
  error: string,
  code?: string,
): RouteEnvelopeFailure {
  return { ok: false, error, ...(code ? { code } : {}) }
}
