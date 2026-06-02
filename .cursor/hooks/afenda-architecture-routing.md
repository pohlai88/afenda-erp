# Afenda architecture routing (injected every session)

**Target-only.** ARCH-1001–1006 are law. Non-compliance = wrong (**ARCH-1004** §7, **ARCH-1002** §13). No “as-built OK.” No “migrate later.” Rule: `afenda-agent-discipline`.

**Hooks (fail closed):** `guard-architecture-compliance` blocks flat `/api/*`, fat routes, lazy doc phrases, module logic in `apps/erp/src/lib/api/`. Fix denials yourself — do not ask the user to run pnpm.

Index: `docs/architecture/README.md`.

## Path → rule → ARCH (read only what you touch)

| Editing… | Rule | Read |
| -------- | ---- | ---- |
| `apps/erp/**` routes, API | `afenda-erp-app`, `afenda-agent-discipline` | **1004**, **1001**, root `AGENTS.md` |
| `apps/erp/src/workspace-routes/**` | `afenda-erp-app` | **1003**, **1001** |
| `packages/features/**` | `afenda-feature-packages`, `afenda-feature-shape` | **1002**, **1005** |
| `packages/features/lynx/**`, `knowledge/**` | `afenda-lynx-knowledge` | **1005** §11, **1004** §5 |
| `packages/db/**` | `afenda-database-migrations` | **1005**, **1002** |
| `packages/governed-surface/**` | `afenda-governed-ui` | **1003** |
| `packages/features/system-admin/**` | `afenda-system-admin` | **1006** |
| `packages/kernel/**` | `afenda-core` | **1002** §7 |
| `docs/architecture/**` | `afenda-architecture-docs` | Same book you edit — §7 Non-compliance only |

## HTTP (required)

```txt
apps/erp/src/app/api/internal/v1/...   # Lynx, AI, cron, webhooks
apps/erp/src/app/api/public/v1/...    # partners
apps/erp/src/app/api/auth/...        # Neon Auth only
```

**Wrong:** `apps/erp/src/app/api/lynx/`, `api/ai/`, `api/cron/` without `internal/v1`.

## Verification (minimal — not lazy)

| Touch | Command |
| ----- | ------- |
| One package | `pnpm --filter <pkg> typecheck` / `test` |
| Boundaries, ARCH docs, exports | `pnpm architecture:check` |
| Governed renderers | `pnpm lint:governed-renderers` |
| Schema | `db:generate` → review → `db:migrate` |
| Docs only | Read diff; stop |

Do **not** run full-repo test/build after small doc edits.

## Non-negotiables

- Tenancy from server session only.
- Writes: command → kernel → domain (**1002**).
- Page reads: in-process feature server — no `fetch('/api/…')` for tenant lists.
- Routes: thin transport only (**1004** §3).
- Never delete `*architecture*` paths — update in place.
