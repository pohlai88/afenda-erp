/**
 * Server-only exports for @afenda/feature-knowledge.
 * Includes DB queries, pipeline, sync, eval, and retrieval.
 * Never import from a "use client" file.
 */
export * from "./server/chunker";
export * from "./server/embeddings";
export * from "./server/eval";
export * from "./eval-dataset-contract";
export * from "./server/pipeline-commit";
export * from "./server/queries";
export * from "./server/retrieve-hybrid";
export * from "./server/source-adapter";
export * from "./server/sync";
export { manualSourceAdapter } from "./server/source-manual";
export { githubRepoSourceAdapter } from "./server/source-github-repo";
export { getKnowledgeSourceAdapter } from "./server/source-adapter-registry";
