/**
 * Governed render state taxonomy.
 *
 * `invalid` — developer/configuration/schema problem (bad metadata, parse failure).
 * `error`   — runtime failure (query timeout, server action failure, I/O exception).
 */
export type GovernedRenderableState =
  | "loading"
  | "error"
  | "forbidden"
  | "invalid"
  | "empty"
  | "ready";

/** Known ERP data classifications for observability tags. */
export type GovernedDataNatureTag =
  | "audit-trail"
  | "operational-list"
  | "exception-list"
  | "kpi"
  | "forecast"
  | "timeline"
  | "table"
  | "document-lines"
  | (string & {});
