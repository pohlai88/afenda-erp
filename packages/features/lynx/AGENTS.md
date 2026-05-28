# @afenda/feature-lynx

Scaffold default: `packages/_template-definition`.

Boundary map: `../../README.md`.

Role: Lynx product and brand layer. Compose `@afenda/ai` specialists and
`@afenda/feature-knowledge` substrate through public doors; do not absorb either
package.

## Public doors

- `src/index.ts`
- `src/client.ts`
- `src/server.ts`
- `src/metadata.ts`

`src/server.ts` is the only Lynx server-boundary marker and imports
`@afenda/kernel/server`. Deep `*.server.ts` implementation files do not import
`server-only` or `@afenda/kernel/server` directly, so Vitest can import them
without package-local server-only stubs.

## Bucket constraints

- Keep all canonical buckets explicit.
- Do not introduce catch-all directories (`_shared`, `lib`, `utils`, `common`, etc).
- Put Server Actions in `actions/` with `*.actions.server.ts`.
- Keep client-safe modules in `components/` and `hooks/`.
- Put Zod runtime validation in `schemas/`; contracts may re-export schemas for
  compatibility but should not own parser definitions.
