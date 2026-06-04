/**
 * @afenda/feature-knowledge
 *
 * Knowledge substrate for Afenda's machine layer (Lynx).
 * Server-only exports via `./server`.
 * Client component exports via `./client`.
 * Metadata builder exports via `./metadata`.
 *
 * Doctrine: docs/architecture/1005-infrastructure.md (ARCH-1005)
 */
export * from "./kno-core.contract";
export * from "./kno-eval-dataset.schema";
export * from "./kno-retrieval.contract";
export * from "./kno-source-adapter.contract";
