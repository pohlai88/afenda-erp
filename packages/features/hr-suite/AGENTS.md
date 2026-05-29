# @afenda/feature-hr-suite

Scaffold default: `packages/_template-definition`.

## Public doors
- `src/index.ts`
- `src/client.ts`
- `src/server.ts`
- `src/metadata.ts`

## Buckets
- `src/actions/`
- `src/components/`
- `src/contracts/`
- `src/data/`
- `src/events/`
- `src/policies/`
- `src/schemas/`
- `src/tests/`

## Constraints
- Module components live in `src/components/`, not `apps/erp`.
- TypeScript schemas live in `src/schemas/`; `@afenda/db` owns SQL and migrations.
- Import public doors only (., ./client, ./server, ./metadata).
