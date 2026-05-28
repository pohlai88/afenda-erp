# @afenda/feature-knowledge

Scaffold default: `packages/_template-definition`.

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

- Remove scaffold buckets that remain empty after audit.
- Do not introduce catch-all directories (`_shared`, `lib`, `utils`, `common`, etc).
- Put Server Actions in `actions/` with `*.actions.server.ts`.
- Keep substrate contracts in `contracts/`, runtime validation in `schemas/`, and server-heavy substrate implementation in `data/`.
- New retrieval callers should prefer `retrieveKnowledgeChunksWithDiagnostics`.
  Keep `retrieveKnowledgeChunks` as the row-only compatibility wrapper.
- Use the package audit helper for sync, commit, retrieval degradation, rerank
  fallback, and eval events. Do not add ad hoc audit `console.log` payloads in
  adapters or data modules.
