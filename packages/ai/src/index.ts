/**
 * @afenda/ai — provider-agnostic agent, tool, and governance layer.
 *
 * Explicit buckets follow packages/_scaffold/feature (ARCH-1002 §8):
 * actions · components · contracts · data · events · policies · schemas.
 * Additional buckets are on demand: agents · catalogs · errors · prompts · tools.
 *
 * ARCH-1005: substrate-blind — never imports @afenda/feature-knowledge.
 * Lynx and Knowledge products compose this package; it does not compose them.
 */

// ---------------------------------------------------------------------------
// Explicit bucket entrypoints
// ---------------------------------------------------------------------------

export * from "./actions";
export * from "./components";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./metadata";
export * from "./policies";
export * from "./schemas";

// ---------------------------------------------------------------------------
// On-demand platform buckets
// ---------------------------------------------------------------------------

export * from "./agents";
export * from "./errors";
export * from "./prompts";
export * from "./tools";
export { AI_ERP_HTTP_ROUTES } from "./contracts/ai.http.contract";
