# @afenda/feature-hr-suite

Scaffold default: `packages/_template-definition`.

## Public doors
- `src/index.ts`
- `src/client.ts`
- `src/server.ts`
- `src/metadata.ts`

## Vertical slices (shipped capabilities)

**Golden path:** copy `src/employee-management/compliance-regulatory-tracking/` for every new shipped capability — not legacy `@afenda/feature-hr` layouts.

- Cursor rules: `afenda-hr-reference-slice` (pattern), `afenda-hr-feature-vertical` (naming/buckets)
- Checklist: `docs/hr-reference-slice-checklist.md`
- CI guard: `scripts/check-hr-feature-vertical-naming.mts` (`SHIPPED_CAPABILITIES` + reference-slice pattern)
- File prefix: `hr.<domain>.*` (e.g. `hr.workforce.compliance.actions.server.ts`); list surfaces in `surface/`, not `data/`

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
