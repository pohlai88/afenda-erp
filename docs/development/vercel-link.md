# Vercel project linking

Local CLI link is active for this monorepo. Preview/production promotion still requires env provisioning and a successful first preview deploy.

## Current platform state (May 2026)

| Item                      | Value                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| Intended deploy app       | `@afenda/erp` (`apps/erp`)                                                                        |
| Build contract            | Root [`vercel.json`](../../vercel.json): `pnpm install` → `pnpm turbo build --filter=@afenda/erp` |
| **Linked Vercel project** | `afenda-erp` (`prj_rEu23fWSlpHD3C7FzPnsxfWQHBfm`) on team `jacks-projects-7b3cfe94`               |
| **Blob store**            | `afenda-erp-documents` (private, `iad1`) — linked to project; `BLOB_READ_WRITE_TOKEN` on all envs |
| Local link metadata       | `.vercel/project.json` (gitignored; created by `vercel link`)                                     |
| Git integration           | `https://github.com/pohlai88/afenda-erp` (connected at link time)                                 |
| Legacy project            | `afenda-vercel` — still points at `pohlai88/afenda-vercel`; do not use for this monorepo          |

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
3. Provision Neon, Neon Auth, Blob (`afenda-erp-documents`, private), AI Gateway, `CRON_SECRET`, `VERCEL_DRAIN_SECRET`, drain URL on the **`afenda-erp`** project. Blob env: `BLOB_READ_WRITE_TOKEN` (auto when store is linked); optional local `VERCEL_BLOB_CALLBACK_URL` — see [env.md](./env.md#vercel-blob-document-uploads).
4. First **preview**: `vercel deploy` (or push to GitHub for automatic preview). Fix builder-only issues before `vercel deploy --prod`.
5. Enable Vercel Remote Cache for Turborepo when builds are stable.

## AI route preview smoke (Phase H gate)

After Phases A–G land green, run the following against a Vercel preview deploy:

**Auth:** `/api/ai/*` routes use Neon session cookies via `getApiAuthContext` (JSON 401/403), not `Authorization: Bearer`. Sign in on the preview first, then pass cookies to `curl` (`-b cookies.txt`), or smoke from the authenticated ERP UI. `VERCEL_OIDC_TOKEN` is for AI Gateway provider auth only.

```bash
# 1. Deploy a preview
vercel deploy

PREVIEW_URL="<paste preview URL here>"
# 2. Export session cookies after signing in (browser devtools → Application → Cookies)
COOKIE_JAR="./preview-cookies.txt"

# 3. Smoke each AI route
curl -sf -X POST "$PREVIEW_URL/api/ai/chat" \
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"Hello"}]}],"contextModuleId":"dashboard"}'

curl -sf -X GET "$PREVIEW_URL/api/ai/spend" \
  -b "$COOKIE_JAR"

curl -sf -X POST "$PREVIEW_URL/api/ai/extract" \
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"moduleId":"finance","documentId":"doc_test","documentText":"Invoice INV-001 total 1000 MYR"}'

curl -sf -X POST "$PREVIEW_URL/api/lynx/operator" \
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"Analyze revenue"}]}]}'

# Legacy (deprecated — prefer /api/lynx/operator):
# curl -sf -X POST "$PREVIEW_URL/api/ai/solution-provider" ...
```

Expected: each route returns HTTP 200 (or 503 if Gateway credentials are absent on preview) — no 401/403/500.

### New env vars for AI enterprise features

| Variable             | Purpose                                                   | Required                                 |
| -------------------- | --------------------------------------------------------- | ---------------------------------------- |
| `AI_GATEWAY_API_KEY` | AI Gateway runtime calls and spend report reads           | Local / CI only when OIDC is unavailable |
| `VERCEL_OIDC_TOKEN`  | AI Gateway runtime calls and spend report reads on Vercel | Auto-managed by Vercel                   |
| `RERANK_MODEL`       | Optional Gateway reranking model for Knowledge retrieval  | No                                       |
| `VERCEL_API_TOKEN`   | Vercel management APIs only; not a model-call credential  | No                                       |

Add these to the Vercel project via `vercel env add` or the dashboard.

## Still out of scope until preview is green

- Production domain and promotion
- Reading production env values into committed files

Canonical policy: [ARCH-001 § Platform linkage](../architecture/001-system-architecture.md).
