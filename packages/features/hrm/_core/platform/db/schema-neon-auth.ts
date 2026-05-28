/**
 * Neon Auth schema type stubs.
 *
 * These provide the type shapes expected by HRM code that reads Neon Auth
 * user metadata. Actual Neon Auth tables are managed by the @neondatabase/auth
 * SDK and live outside the Drizzle migration boundary.
 */

export type NeonAuthUser = {
  readonly id: string
  readonly email: string
  readonly name?: string | null
  readonly imageUrl?: string | null
  readonly createdAt: Date
}
