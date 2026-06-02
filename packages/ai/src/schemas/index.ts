/**
 * Zod schema barrel for @afenda/ai.
 *
 * All structured-output and operational schemas live in schemas/.
 * Import from this barrel rather than reaching into schemas/ directly.
 */

// Operational schemas (grounding, context, sandbox, confidence)
export * from "./ai.operations.schema";

// Document extraction schemas
export * from "./ai.extraction.schema";

// Recommendation schemas (workspace summary, approval, anomaly, report)
export * from "./ai.recommendations.schema";

// Solution provider schemas (problem input, recovery playbook, run)

// Tool input/output schemas
export * from "./ai.tools.schema";

// HTTP ingress schemas
export * from "./ai.chat.schema";
