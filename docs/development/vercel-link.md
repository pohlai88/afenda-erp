# Vercel project linking

Local CLI link is active for this monorepo. Preview/production promotion still requires env provisioning and a successful first preview deploy.

## Current platform state (May 2026)

| Item | Value |
| ---- | ----- |
| Intended deploy app | `@afenda/erp` (`apps/erp`) |
| Build contract | Root [`vercel.json`](../../vercel.json): `pnpm install` → `pnpm turbo build --filter=@afenda/erp` |
| **Linked Vercel project** | `afenda-erp` (`prj_rEu23fWSlpHD3C7FzPnsxfWQHBfm`) on team `jacks-projects-7b3cfe94` |
| Local link metadata | `.vercel/project.json` (gitignored; created by `vercel link`) |
| Git integration | `https://github.com/pohlai88/afenda-erp` (connected at link time) |
| Legacy project | `afenda-vercel` — still points at `pohlai88/afenda-vercel`; do not use for this monorepo |

Link command used (non-interactive):

```bash
vercel link --yes --project afenda-erp --scope jacks-projects-7b3cfe94
```

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

## Next steps (after link)

1. Confirm dashboard project settings match `vercel.json` (`installCommand`, `buildCommand`, crons). CLI may show “No framework detected” at repo root; custom build commands still apply.
2. `vercel env pull .env.local` — map keys from [`.env.config.example`](../../.env.config.example) (no secrets in docs). Or continue `pnpm env:sync:all` and merge with pulled vars.
3. Provision Neon, Neon Auth, Blob, AI Gateway, `CRON_SECRET`, `VERCEL_DRAIN_SECRET`, drain URL on the **`afenda-erp`** project.
4. First **preview**: `vercel deploy` (or push to GitHub for automatic preview). Fix builder-only issues before `vercel deploy --prod`.
5. Enable Vercel Remote Cache for Turborepo when builds are stable.

## Still out of scope until preview is green

- Production domain and promotion
- Reading production env values into committed files

Canonical policy: [ARCH-001 § Platform linkage](../architecture/001-system-architecture.md).
