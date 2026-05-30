# ARCH-010 · HR feature package architecture

**Doc ID:** `ARCH-010` · **File:** `010-hr-feature-package-architecture.md`

| Field    | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Status   | Active scaffold — export doors and compatibility stubs; TRACK-004 slices pending |
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

## Reference slice (golden path)

Shipped HR capabilities under `src/<category>/<capability-slug>/` must follow the **compliance-regulatory-tracking** vertical slice (not legacy `@afenda/feature-hr` or ad-hoc layouts).

| Artifact | Location |
| -------- | -------- |
| Canonical implementation | `packages/features/hr-suite/src/employee-management/compliance-regulatory-tracking/` |
| Agent rule | `.cursor/rules/afenda-hr-reference-slice.mdc` |
| Human checklist | `packages/features/hr-suite/docs/hr-reference-slice-checklist.md` |
| CI guard | `packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts` (`SHIPPED_CAPABILITIES` + pattern checks) |

New slices (e.g. `documents-management`) stay scaffold-only until they pass the checklist and are added to `SHIPPED_CAPABILITIES`.

## Current state

Compliance workbench is shipped at `/hr/compliance` (see capability `compliance-regulatory-tracking-architecture.md`). Other HR sections may still use package-root compatibility stubs until their slice ships. Physical HR schema lives in `@afenda/db` per accepted TRACK-004 slices.
