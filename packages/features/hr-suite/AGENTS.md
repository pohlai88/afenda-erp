# @afenda/feature-hr-suite

Scaffold default: `packages/_template-definition`.

## Public doors
- `src/index.ts`
- `src/client.ts`
- `src/server.ts`
- `src/metadata.ts`

## Vertical slices (shipped capabilities)

Implemented capabilities use the same bucket layout as `@afenda/feature-system-admin` under `src/<category>/<capability>/` with slice doors (`server.ts`, `client.ts`, `metadata.ts`). File prefix: `hr.<domain>.*` (e.g. `hr.workforce.compliance.actions.server.ts`). List surfaces live in `surface/`, not `data/`. See rule `afenda-hr-feature-vertical` and `scripts/check-hr-feature-vertical-naming.mts`.

## Buckets
- `src/actions/`
- `src/components/`
- `src/contracts/`
- `src/data/`
- `src/events/`
- `src/policies/`
- `src/schemas/`
- `src/surface/` (governed list surfaces + UI copy for shipped slices)
- `src/tests/`

## Constraints
- Module components live in `src/components/`, not `apps/erp`.
- TypeScript schemas live in `src/schemas/`; `@afenda/db` owns SQL and migrations.
- Import public doors only (., ./client, ./server, ./metadata).
