# @afenda/feature-knowledge

Scaffold default: `packages/_scaffold/feature`.

Boundary map: `../../README.md`.

Role: retrieval substrate only. Do not add Lynx product behavior, specialist
agent orchestration, or user-facing machine-layer branding here.

## Public doors

- `src/index.ts`
- `src/client.ts`
- `src/server.ts`
- `src/metadata.ts`

`src/server.ts` is the only Knowledge server-boundary marker and imports
`@afenda/kernel/server`. Deep `*.server.ts` implementation files do not import
`server-only` or `@afenda/kernel/server` directly, so Vitest can import them
without package-local server-only stubs.

## Bucket constraints

- `commands/` — sync and cron sweep (`executeKnowledgeSyncOrgCommand`, `executeKnowledgeScheduledSyncSweepCommand`).
- `domain/` — sync orchestration invariants (adapter purity enforced in `data/`).
- `read-models/` — admin page model (`loadKnowledgeAdminPageModel`).
- `contracts/`, `schemas/`, `data/`, `metadata.ts` — substrate implementation.
- Do not introduce catch-all directories (`_shared`, `lib`, `utils`, `common`, etc).
- Cron and routes call **commands**, not `syncOrgKnowledge` directly.
- New retrieval callers should prefer `retrieveKnowledgeChunksWithDiagnostics`.
  Keep `retrieveKnowledgeChunks` as the row-only compatibility wrapper.
- Use the package audit helper for sync, commit, retrieval degradation, rerank
  fallback, and eval events. Do not add ad hoc audit `console.log` payloads in
  adapters or data modules.
