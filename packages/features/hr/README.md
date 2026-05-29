# @afenda/feature-hr

Enterprise HR feature package (`moduleId: hr`). Migration doctrine: **TRACK-004**
(`docs/roadmap/004-hrm-migration.md`), boundaries: **ARCH-010**.

## Legacy source (read-only)

`C:\JackProject\afenda-vercel\packages\features\hrm` — reference behavior only; do
not copy file trees or nested workspace packages.

## Non-stop factory (local legacy only — no legacy DB URL)

```bash
pnpm hr:inventory-legacy
```

Writes `migration/legacy-inventory.generated.json` from
`HRM_LEGACY_ROOT` (default: sibling `../afenda-vercel`). Re-run after each slice
to refresh counts.

| Step | Action |
| ---- | ------ |
| 1 | `pnpm hr:inventory-legacy` — pick **one** capability in the active slice |
| 2 | Read legacy `data/*.queries.server.ts` + `*.mutations.server.ts` (spec only) |
| 3 | Extend `packages/db/src/schema/hr.ts` if needed → `pnpm db:generate` → `pnpm db:migrate` |
| 4 | Reimplement in `src/workforce/` (system-admin vertical pattern) |
| 5 | Thin adapter in `apps/erp/src/lib/hr-sections/` |
| 6 | `pnpm --filter @afenda/feature-hr test` + typecheck |
| 7 | TRACK-004 evidence bundle → merge → next capability (do not batch whole workspaces) |

**Never:** copy 2,024 files, nested `feature-hrm-*` packages, or mark a slice complete without tests + routes.

**Current focus:** finish **Slice 1b** (assignments table, employee create/update/archive, audit) using legacy `employee-records-management` as the spec.

## Slice 1 routes (current)

| Route | Purpose |
| ----- | ------- |
| `/hr` | Workforce hub |
| `/hr/employees` | Employee directory |
| `/hr/employees/[id]` | Employee detail |
| `/hr/departments` | Department catalog |
| `/hr/positions` | Position catalog |
| `/hr/org-chart` | Reporting lines + department hierarchy |

Integration tests (`pnpm --filter @afenda/feature-hr test`) hit Neon when `DATABASE_URL` is set and assert the demo seed (3 employees).

Evidence bundle: update `docs/roadmap/004-hrm-migration.md` status ledger before marking a slice complete.

## Reset mistaken scaffolding

```bash
pnpm exec tsx packages/features/hr/scripts/reset-to-slice0.mts
pnpm scaffold:vertical hr workforce
```

Do not pre-create payroll, talent, or industry verticals until their slice is active.

## Dev seed (employee directory)

After `pnpm db:migrate`:

```bash
pnpm exec tsx packages/db/scripts/seed-hr-workforce.mts
# or full seed chain:
pnpm db:seed
```

Seeds three demo employees per organization that has no `hr_employees` rows yet (idempotent). When the database has no tenants yet, non-production runs bootstrap `org_afenda_demo` automatically (disable with `HR_SEED_BOOTSTRAP_DEMO=0`).

## Validation

```bash
pnpm --filter @afenda/feature-hr typecheck
pnpm --filter @afenda/feature-hr test
pnpm architecture:check
```
