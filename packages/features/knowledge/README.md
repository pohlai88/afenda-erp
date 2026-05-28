# @afenda/feature-knowledge

`@afenda/feature-knowledge` is the retrieval substrate: sources, documents,
chunks, embeddings, pgvector retrieval, and eval data.

Current package shape follows the feature template:

- `src/contracts/` for source kinds, retrieval DTOs, and adapter contracts
- `src/schemas/` for eval and source-config validation
- `src/data/` for chunking, embeddings, retrieval, sync, and pipeline commit
- `src/metadata.ts` for governed list-surface builders only
- empty starter buckets are removed after audit instead of being kept as placeholders

Read the shared boundary map before adding files:

- [AI, Lynx, And Knowledge Package Map](../../README.md)

Do not add Lynx product behavior or agent orchestration here.
