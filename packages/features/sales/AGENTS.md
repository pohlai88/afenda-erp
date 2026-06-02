# @afenda/feature-sales

Scaffold default: `packages/_scaffold/feature`.

## Public doors
- `src/index.ts`
- `src/client.ts`
- `src/server.ts`
- `src/metadata.ts`

## Bucket constraints
- Keep all canonical buckets explicit.
- Do not introduce catch-all directories (`_shared`, `lib`, `utils`, `common`, etc).
- Put Server Actions in `actions/` with `*.actions.server.ts`.
- Keep client-safe modules in `components/` and `hooks/`.
