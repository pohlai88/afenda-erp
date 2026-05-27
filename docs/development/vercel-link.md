# Vercel project linking (deferred)

This monorepo is **not** linked to Vercel yet. Do not run `vercel link`, preview deploys, or production promotion until the stabilization gate in [ARCH-001](../architecture/001-system-architecture.md) is complete.

## Current platform state (May 2026)

| Item | Value |
| ---- | ----- |
| Intended deploy app | `@afenda/erp` (`apps/erp`) |
| Build contract | Root [`vercel.json`](../../vercel.json): `pnpm install` → `pnpm turbo build --filter=@afenda/erp` |
| Local link metadata | No `.vercel/project.json` in this repo |
| Team project today | `afenda-vercel` on GitHub `pohlai88/afenda-vercel` (legacy codebase) |
| This repo | `pohlai88/afenda-erp` — **not** wired to Vercel |

ERROR deployments on `afenda-vercel` reflect the **legacy** repository, not Afenda ERP health.

## Stabilization gate (run locally before link)

```bash
pnpm env:sync:all          # Windows: includes MCP user env
pnpm typecheck
pnpm architecture:check
pnpm turbo build --filter=@afenda/erp
pnpm test
# Optional before production: pnpm test:e2e
```

Also confirm Neon Auth, migrations, AI routes, and governed list surfaces in a preview-shaped `.env.local`.

## When the gate passes

1. At repo root: `vercel link` — create **`afenda-erp`** or retarget **`afenda-vercel`** to this GitHub repo.
2. Align project settings with `vercel.json` (`installCommand`, `buildCommand`, crons).
3. `vercel env pull` — map keys from [`.env.config.example`](../../.env.config.example) (no secrets in docs).
4. Provision Neon, Neon Auth, Blob, AI Gateway, `CRON_SECRET`, `VERCEL_DRAIN_SECRET`, drain URL.
5. First **preview** deploy; fix builder-only issues before production.

## Out of scope until linked

- Vercel Remote Cache (enable after link)
- Production domain and promotion
- Reading production env values into committed files

Canonical policy: [ARCH-001 § Platform linkage](../architecture/001-system-architecture.md).
