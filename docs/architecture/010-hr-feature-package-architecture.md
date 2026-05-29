# ARCH-010 · HR feature package architecture

**Doc ID:** `ARCH-010` · **File:** `010-hr-feature-package-architecture.md`

| Field    | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Status   | Active — Slice 1 partial: employee directory at `/hr/employees`   |
| Package  | `@afenda/feature-hr-suite` (`packages/features/hr-suite`, moduleId `hr`)        |
| Track    | TRACK-004 (`docs/roadmap/004-hrm-migration.md`)                       |
| Related  | **ARCH-002**, **ARCH-005**, **ARCH-008**                              |

## Boundaries

| Layer | Owner | Notes |
| ----- | ----- | ----- |
| ERP `/hr` routes | `apps/erp` | Thin adapters only; no HR business rules in the app |
| HR product logic | `packages/features/hr-suite` | Commands, queries, metadata builders, internal categories |
| Shared contracts | `@afenda/kernel` | Module registry, generic list/detail builders until extracted |
| Physical schema | `@afenda/db` | `schema/hr/` only when a TRACK-004 slice is accepted |
| Legacy reference | *(removed 2026-05-28)* | Former `packages/features/hrm` deleted; implement in `@afenda/feature-hr-suite` only |

## Public export doors (ARCH-008)

- `.` — metadata-compatible barrel (no server graph)
- `./metadata` — governed list/detail builders (`createModuleFeatureMetadata("hr")` today)
- `./server` — queries, commands, workspace loaders (empty until Slice 1+)
- `./client` — client-safe forms and hooks (empty until needed)

`./client` must not import `@afenda/db`, `@afenda/ai`, `@afenda/workflows`, `@afenda/auth/server`, or `node:*`.

## Internal layout (target)

```txt
packages/features/hr-suite/src/
  metadata.ts          # export door (present)
  server.ts            # export door (present)
  client.ts            # export door (present)
  workforce/           # Slice 1 — org, positions, employees
  compliance/          # Slice 2 — obligations, filings, evidence
  lifecycle/           # later slices
```

Add category folders when a slice ships; do not create nested `package.json` workspaces.

## Migration rules

1. Reimplement behavior on the Afenda stack — do not restore deleted legacy HRM file trees.
2. Prove parity with tests and TRACK-004 evidence bundles before marking a slice complete.
3. Resolve tenant scope from server session only; enforce capabilities at mutations and sensitive reads.
4. Lists use governed Pattern C server windows — never ship full datasets for client pagination.

## Current state

Scaffold only: metadata delegates to `@afenda/kernel` generic module workspace (`erp_module_records`). No `packages/db/src/schema/hr` until the first accepted schema slice. Migration `0030_revert_hr_migration_tables` removes tables from the withdrawn `0027` / `0029` attempt.
