# Afenda package scaffolds

Two templates — **feature** (ERP module truth) and **platform** (shared pipes).  
Canonical rules: **ARCH-1002** §6–§8 · Guards: `pnpm architecture:check`.

```txt
packages/_scaffold/
  feature/          → packages/features/<moduleId>/   (@afenda/feature-*)
  platform/
    runtime-library/ → packages/<slug>/               (@afenda/*)
    ui-primitives/   → packages/<slug>/               (@afenda/*, React)
  scripts/            scaffold + validate commands
```

## Norm

| Template | Location | Owns |
| -------- | -------- | ---- |
| **Feature** | `packages/features/*` | Module commands, domain, data, read-models, events |
| **Platform** | `packages/*` (not under `features/`) | Shared infrastructure — **no** module business rules |

If it is ERP module behavior, use **feature**. Everything else is platform unless listed in **ARCH-1002** §6.

## Commands

```bash
# ERP module (@afenda/feature-<moduleId>)
pnpm scaffold:feature <module-id>
pnpm scaffold:vertical <feature> <capability>

# Platform package (@afenda/<slug>)
pnpm scaffold:platform <package-slug>
pnpm scaffold:platform <package-slug> --category ui-primitives

pnpm validate:feature-entry --feature <module-id> [--slice <capability>]
pnpm architecture:check
```

### Feature buckets (horizontal)

`actions/` · `commands/` · `api/` · `contracts/` · `components/` · `data/` · `domain/` · `events/` · `policies/` · `read-models/` · `schemas/` · `tests/`

Four public doors: `index.ts` · `client.ts` · `server.ts` · `metadata.ts`

Vertical slice: full bucket set under `src/<capability>/`.

### Platform categories

| Category | Template path | Export doors |
| -------- | ------------- | ------------ |
| `runtime-library` | `platform/runtime-library/` | `.` · optional `./server` |
| `ui-primitives` | `platform/ui-primitives/` | `.` · `./client` |

Do **not** use `scaffold:platform` for ERP modules.

## Post-scaffold checklist

**Feature**

1. `packages/config/src/module-ids.ts` (when module has a workspace route)
2. `packages/config/src/next.ts` → `afendaTranspilePackages`
3. `apps/erp/package.json` workspace dependency

**Platform**

1. `scripts/check-directory-architecture.mts` → `packageArchitectureRules`
2. `afendaTranspilePackages` if imported by the app

Then: `pnpm architecture:check`.

## HR suite

HR uses `pnpm scaffold:hr-slice` (feature-specific) on top of the feature template. See `packages/features/hr-suite/AGENTS.md`.
