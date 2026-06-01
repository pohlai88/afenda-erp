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

### Vercel Blob (document uploads)

| Item | Value |
| ---- | ----- |
| Store name | `afenda-erp-documents` (`store_Xj6sQ439ILZy4w8Y`) |
| Access | `private` |
| Upload route | `/api/uploads` (client upload via `@vercel/blob/client`) |
| Config route | `GET /api/uploads/config?moduleId=<moduleId>` — tenant pathname prefix |
| Download route | `GET /api/documents/[documentId]/download?moduleId=<moduleId>` |
| Required env | `BLOB_READ_WRITE_TOKEN` (auto-provisioned when store is linked) |
| Local callback (optional) | `VERCEL_BLOB_CALLBACK_URL` — tunnel URL ending in `/api/uploads` so `onUploadCompleted` runs locally |

**Provision (linked project):**

```bash
vercel blob create-store afenda-erp-documents --access private --yes \
  --environment production --environment preview --environment development
```

Copy `BLOB_READ_WRITE_TOKEN` into `.env.config` §D, then `pnpm env:sync:all`. On Vercel preview/production the platform injects the token automatically.

**Local `onUploadCompleted`:** Vercel Blob cannot call `localhost`. Use ngrok/cloudflared and set `VERCEL_BLOB_CALLBACK_URL=https://<tunnel>/api/uploads`. Without it, uploads still land in Blob but DB registration may not run until the callback succeeds on a reachable URL.

Canonical policy: [ARCH-001 § Files and Documents](../architecture/001-system-architecture.md).
