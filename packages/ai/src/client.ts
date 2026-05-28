/**
 * Browser-safe public door for @afenda/ai.
 *
 * Keep this limited to serializable contracts and schemas. No database,
 * provider SDK, gateway clients, server auth, or Node-only modules.
 */
export { aiFeatureFlags } from "./metadata";
export * from "./components";
export * from "./contracts";
export * from "./schemas";
