/**
 * @afenda/ai — provider-agnostic agent, tool, and governance layer.
 *
 * Flat src layout (GUARD 5 / scaffold-aligned):
 *   ai-{topic}.{artifact}.{canonical}.ts
 * Public doors: index.ts, client.ts, server.ts, metadata.ts
 *
 * ARCH-1005: substrate-blind — never imports @afenda/feature-knowledge.
 */

export * from "./client";
