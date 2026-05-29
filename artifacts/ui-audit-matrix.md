# UI audit matrix (baseline)

Generated during TSX shadcn / governed EUI audit.

## Scope summary

| Layer | TSX files (approx) | Violations (scope=all) |
|-------|-------------------|------------------------|
| `packages/governed-surface` | ~90 | 0 errors in governed-only strict gate |
| `packages/features` | ~67 | Primary drift: typography, viewport breakpoints |
| `apps/erp/src` | ~80+ | route-states, auth, ai-elements, document forms |
| `packages/ui` | ~57 | Canonical primitives (excluded from consumer audits) |

## Drift rule counts (scope=all)

| Rule ID | Count | Files |
|---------|-------|-------|
| `no-raw-typography` | 299 | 62 |
| `no-viewport-breakpoint` | 97 | 30 |
| `no-raw-radius` | 91 | 30 |
| `no-raw-gap-semantic` | 77 | 53 |
| `no-raw-spacing-semantic` | 56 | 27 |
| `no-arbitrary-value` | 7 | 7 |
| `no-raw-elevation-shadow` | 5 | 5 |
| `no-destructive-as-status` | 4 | 4 |
| `no-raw-z-numeric` | 1 | 1 |

## Composition drift (manual scan)

| Rule | Hits |
|------|------|
| `space-y-*` / `space-x-*` | apps/erp route-states, ai-elements |
| Raw `<button>` | 0 in features |
| Missing `FieldGroup` on forms | system-admin forms (label + text-sm pattern) |

## Post-repair status

- `pnpm audit:governed-design-tokens --scope=all --strict` — **pass** (0 errors, 0 warnings; 110 info advisories)
- `pnpm audit:shadcn-composition --strict` — **pass** (space-y, raw buttons, FieldGroup — does **not** detect Suspense skeleton drift)
- `pnpm audit:skeleton-parity` — **pass** (Suspense fallback grid/tile parity vs governed stat renderers)
- `pnpm audit:list-surface-chrome` — **pass** (list toolbar row + pagination footer inset alignment)
- `pnpm lint:governed-renderers` — **pass** (registry + import allowlist)
- `pnpm typecheck` — **pass**
