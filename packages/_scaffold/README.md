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

### Feature layout (flat)

**Single-feature package** — everything flat under `src/`:

```txt
src/index.ts · client.ts · server.ts · metadata.ts
src/{code}-{topic}.{artifact}.{canonical}.ts
```

**Multi-capability package** — group only by capability folder, still flat inside:

```txt
src/<capability>/index.ts
src/<capability>/{code}-{topic}.{artifact}.{canonical}.ts
```

### Flat file naming

```txt
{code}-{topic}.{artifact}.{canonical}.{ext}
```

| Part | Rule | Example |
| ---- | ---- | ------- |
| `code` | First 3 alphanumeric chars of module id | `purchasing` → `pur` |
| `topic` | kebab-case subject | `order-create`, `truth-search` |
| `artifact` | command · handler · contract · schema · read-model · policy · repository · domain · component · … | `.command.server.ts` |
| `canonical` | optional server · client · types · shared | `.server.ts`, `.client.tsx` |

Examples:

- `pur-order-create.command.server.ts`
- `pur-order.schema.ts`
- `lyn-truth-search.handler.server.ts`

Four public doors: `index.ts` · `client.ts` · `server.ts` · `metadata.ts`

Legacy bucket folders in existing packages are grandfathered. **New** scaffold output is flat only.

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

HR uses `pnpm scaffold:hr-slice` (feature-specific) on top of legacy bucket layout. See `packages/features/hr-suite/AGENTS.md`.
