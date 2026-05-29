---
name: raf
description: >-
  Refactor And Fold duplicate Afenda feature areas into a canonical module.
  Use when the user invokes /raf, asks to merge duplicate system-admin sections,
  consolidate overlapping routes, or remove a feature folder after folding its
  unique fields into the surviving area. No redirects unless explicitly requested.
disable-model-invocation: true
---

# /raf — Refactor And Fold

Fold a duplicate or overlapping feature area into its canonical home. Remove the
loser route and shared-folder dead code. **Do not add redirects** unless the
user explicitly asks.

## When to use

- Two System Admin (or feature) areas edit the same persistence row or domain
- Overlapping forms, list surfaces, or server actions with inconsistent audit
- User says "merge into organization", "remove settings if duplicate", or `/raf`

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Map both areas (routes, actions, schemas, surfaces, components, policies)
- [ ] 2. List shared vs unique fields and audit/webhook semantics
- [ ] 3. Pick canonical area (prefer fuller vertical slice + ARCH doc intent)
- [ ] 4. Extend canonical schema, page model, form, surface, and action
- [ ] 5. Delete loser feature folder and route adapter
- [ ] 6. Clean shared folders (components/, surfaces/, schemas/, events/, client, server, metadata)
- [ ] 7. Update manifest, registry, nav, route-paths, execution capability routes
- [ ] 8. Keep capability keys if used as fallbacks elsewhere (do not delete permissions)
- [ ] 9. Run pnpm typecheck and targeted tests
```

## Afenda-specific rules

| Layer | Canonical pattern |
| ----- | ----------------- |
| Route | `apps/erp/src/lib/system-admin-sections/<slug>.server.tsx` only — thin adapter |
| Feature | `packages/features/<module>/src/<area>/` — actions, data, components, events |
| Shared | `components/`, `surfaces/`, `schemas/` at package root — delete orphans when folding |
| Persistence | One action calling domain/db helper; no second write path for same fields |
| Capabilities | `system-admin.settings.*` may remain as broad fallbacks even when Settings route is removed |
| Redirects | **Never** add `/old → /new` unless user explicitly requests |

## Field merge checklist

When folding area A into B:

1. Add A's **unique** fields to B's Zod schema (`schemas/system-admin.*.schema.ts` or control-action schema)
2. Extend B's contract types and page-model mapper
3. Add form inputs to B's client component (match existing typography: `type-control`, `NativeSelect` for booleans)
4. Add list rows to B's governed surface builder
5. Include new fields in B's action `patch`, execution audit metadata, and webhook payload
6. Remove A's revalidate paths; B revalidates only its own route

## Deletion targets (typical)

- `packages/features/<module>/src/<loser>/` entire folder
- `apps/erp/src/lib/system-admin-sections/<loser>.server.tsx`
- Manifest + registry loader entry for loser slug
- Nav item and `systemAdminRoutePaths.<loser>`
- Orphan exports in `client.ts`, `server.ts`, `metadata.ts`, `events/index.ts`
- Dedicated surface file if rows merged into canonical surface
- Dedicated form component if merged into canonical form

## Verification

```bash
pnpm typecheck
pnpm architecture:check
pnpm test --filter=@afenda/feature-system-admin
```

Grep for stale symbols: loser action names, surface keys, route paths, form exports.

## Example (settings → organization)

Settings and Organization both edited `tenant_settings`. Organization was canonical;
Settings' unique fields (`dataRegion`, `zdrEnabled`) were folded into Organization
schema, form, surface, and action. Settings route, nav item, and `src/settings/`
were removed. `system-admin.settings.read/write` capabilities kept for other sections.
