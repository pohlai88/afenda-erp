# Environment configuration

## Source of truth

| File | Role |
| ---- | ---- |
| [`.env.config.example`](../../.env.config.example) | Committed template |
| `.env.config` | Gitignored maintainer file (edit here only) |
| `.env.local`, `apps/erp/.env.local` | Generated — do not edit by hand |

## Commands

```bash
cp .env.config.example .env.config   # first-time setup
pnpm env:sync                        # app env files
pnpm env:sync:cursor                 # Windows: §L MCP keys → User env (NEON_API_KEY, GITHUB_TOKEN, CONTEXT7_API_KEY)
pnpm env:sync:all                    # both
pnpm env:sync:dry-run                # preview (values redacted)
```

Run `pnpm env:sync:all` before the first `pnpm build` or `pnpm dev` on a fresh clone.

### Neon Auth

Branch-specific `NEON_AUTH_BASE_URL`, trusted origins, and Next.js proxy patterns: **[neon-auth.md](./neon-auth.md)**.

```bash
pnpm env:verify:neon-auth   # JWKS reachability + env alignment when Neon is on
```

## Schema

Runtime validation: [`packages/config/src/env.ts`](../../packages/config/src/env.ts).

Turbo cache env keys: [`turbo.json`](../../turbo.json) `globalEnv` and `@afenda/erp#build.env`.

## Cursor MCP

MCP is **operator-owned** in **`~/.cursor/mcp.json`** (global). This repo adds **project** [`.cursor/mcp.json`](../../.cursor/mcp.json) for **shadcn** (`apps/erp/components.json`) and **next-devtools** (`npx -y next-devtools-mcp@latest`). Same global file is shared with other Afenda workspaces (e.g. `afenda-vercel`); do not duplicate a full MCP manifest in-repo.

After changing §L keys or global `mcp.json`, **fully quit and restart Cursor**.

### Global servers (`~/.cursor/mcp.json`)

| Server | Endpoint / command | Auth |
| ------ | ------------------ | ---- |
| **context7** | `npx -y @upstash/context7-mcp@latest` | **API key recommended** — [context7.com/dashboard](https://context7.com/dashboard) (`ctx7sk…`). See §L + example below. |
| **github** | `https://api.githubcopilot.com/mcp/` | **OAuth (recommended):** no `Authorization` header → **Settings → Tools & MCP → github → Connect**. **Or PAT:** `Bearer ${env:GITHUB_TOKEN}` + valid §L token via `env:sync:cursor`. |
| **Neon** | `https://mcp.neon.tech/mcp` | OAuth **Connect** in Cursor (no bearer in `mcp.json`). Keep `NEON_API_KEY` in §C for `neonctl`/CLI. |
| **vercel** | `https://mcp.vercel.com` | OAuth **Connect** in Cursor |
| **playwright** | `npx -y @playwright/mcp@latest` | None |

### Section L (`.env.config` → Windows User env)

`pnpm env:sync:cursor` copies §L keys into **Windows User** environment variables (not Next.js `.env.local`):

- `NEON_API_KEY` — also in §C; CLI / optional MCP
- `GITHUB_TOKEN` — only if github MCP uses PAT auth (skip or leave empty when using OAuth)
- `CONTEXT7_API_KEY` — optional; avoids anonymous Context7 quota errors

`pnpm env:sync` still **removes** `CONTEXT7_API_KEY` from generated `.env.local` files (MCP-only; not an app runtime secret).

### Example global snippets (do not commit secrets)

Context7 with key from User env:

```json
"context7": {
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp@latest"],
  "env": {
    "CONTEXT7_API_KEY": "${env:CONTEXT7_API_KEY}"
  }
}
```

GitHub via OAuth (no PAT in env):

```json
"github": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/"
}
```

GitHub via PAT:

```json
"github": {
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "Authorization": "Bearer ${env:GITHUB_TOKEN}"
  }
}
```

### Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------- | --- |
| Context7 `Monthly quota exceeded` | No API key / free tier exhausted | Add `CONTEXT7_API_KEY` (§L + `env:sync:cursor` or `mcp.json` `env`), or wait for quota reset / upgrade at [context7.com/plans](https://context7.com/plans) |
| GitHub MCP “errored”, no tools | Invalid or missing `GITHUB_TOKEN` when using PAT mode | Refresh PAT in §L, `pnpm env:sync:cursor`, restart Cursor — **or** switch to OAuth snippet above |
| `gh`: token in `GITHUB_TOKEN` is invalid | Stale §L synced to User env | Fix §L or clear User env: `[Environment]::SetEnvironmentVariable('GITHUB_TOKEN', $null, 'User')`; use `gh auth login` keyring or valid PAT |
| MCP unchanged after env edit | Cursor caches User env at startup | Full quit Cursor, not reload window only |

Official references: [GitHub MCP setup](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/set-up-the-github-mcp-server) · [Context7 MCP configuration](https://www.mintlify.com/upstash/context7/mcp/configuration)

## Vercel

Project linking: [vercel-link.md](./vercel-link.md). Blob storage setup is below.

### Object storage (document uploads)

Provider selection is env-driven via `@afenda/object-storage`. Default on Vercel: **Vercel Blob**. Alternative: **Cloudflare R2** (S3-compatible).

| Item | Value |
| ---- | ----- |
| Package | `@afenda/object-storage` — handlers in package, thin routes in `apps/erp` |
| Upload route | `POST /api/internal/v1/uploads` |
| Config route | `GET /api/internal/v1/uploads/config?moduleId=<moduleId>` — provider + tenant pathname prefix |
| Download route | `GET /api/internal/v1/documents/[documentId]/download?moduleId=<moduleId>` (legacy `/api/documents/...` → 308 redirect) |
| Provider env | `OBJECT_STORAGE_PROVIDER=vercel-blob\|r2` (auto-detect when unset) |

#### Vercel Blob (default)

| Item | Value |
| ---- | ----- |
| Store name | `afenda-erp-documents` (`store_Xj6sQ439ILZy4w8Y`) |
| Access | `private` |
| Client SDK | `@vercel/blob/client` via object-storage handler |
| Required env | `BLOB_READ_WRITE_TOKEN` (auto-provisioned when store is linked) |
| Local callback (optional) | `VERCEL_BLOB_CALLBACK_URL` — tunnel URL ending in `/api/internal/v1/uploads` so `onUploadCompleted` runs locally |

**Provision (linked project):**

```bash
vercel blob create-store afenda-erp-documents --access private --yes \
  --environment production --environment preview --environment development
```

Copy `BLOB_READ_WRITE_TOKEN` into `.env.config` §D, then `pnpm env:sync:all`. On Vercel preview/production the platform injects the token automatically.

**Local `onUploadCompleted`:** Vercel Blob cannot call `localhost`. Use ngrok/cloudflared and set `VERCEL_BLOB_CALLBACK_URL=https://<tunnel>/api/internal/v1/uploads`. Without it, uploads still land in Blob but DB registration may not run until the callback succeeds on a reachable URL.

#### Cloudflare R2

| Item | Value |
| ---- | ----- |
| Required env | `OBJECT_STORAGE_PROVIDER=r2`, `OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ACCESS_KEY_ID`, `OBJECT_STORAGE_SECRET_ACCESS_KEY` |
| Legacy aliases | `R2_ENDPOINT`, `R2_BUCKET_NAME`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` → normalized in `@afenda/config/env` |
| Optional | `OBJECT_STORAGE_PUBLIC_URL_BASE` — R2 custom domain / CDN base URL (**required** when storing `access: public`; private downloads always use signed GET) |
| Upload flow | `uploadTenantObject()` / `uploadTenantDocument()` on client — or raw `POST` with `{ intent: "presign" }` → PUT → `{ intent: "complete" }` |
| CORS | Bucket CORS must allow ERP origin (include `http://localhost:3000` for local dev), `PUT`, `GET`, `HEAD`, `Content-Type`, `Content-Length`, expose `ETag` — see `packages/object-storage/AGENTS.md` |
| Verify | `pnpm r2:verify` — env + S3 `HeadBucket` + presigned PUT smoke test · `pnpm r2:status` — wrangler + Cloudflare SDK snapshot |
| SDK verify | `pnpm r2:cloudflare:verify` — `cloudflare-typescript` token + zone list (`CLOUDFLARE_API_TOKEN` in `.secret.config`) |
| CORS apply | `pnpm r2:provision` — Cloudflare SDK when token set, else wrangler; origins from `NEXT_PUBLIC_SITE_URL`, `R2_CORS_EXTRA_ORIGINS`, localhost |
| Public domain | Add `nexuscanon.com` to Cloudflare → `CLOUDFLARE_ZONE_ID` or SDK auto-resolve → `pnpm r2:domain:provision` (SDK + disable r2.dev) |
| MCP checks | `cloudflare-bindings` → `r2_bucket_get` · `cloudflare` → `execute` / `search` (same REST paths as SDK) |
| Provisioning | `npx wrangler r2 bucket create <name>` · API token (Object Read & Write) → `.secret.config` keys · `pnpm env:sync:all` |
| Download | `GET /api/internal/v1/documents/[documentId]/download?moduleId=…` (signed redirect) |

Canonical policy: [ARCH-1005 §10.2](../architecture/1005-infrastructure.md#102-object-storage-afendaobject-storage).
