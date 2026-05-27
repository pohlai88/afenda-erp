# Cursor setup (Afenda ERP)

## MCP: global vs project

| Scope       | File                              | Servers                                           |
| ----------- | --------------------------------- | ------------------------------------------------- |
| **Global**  | `%USERPROFILE%\.cursor\mcp.json` | context7, github, Neon (OAuth), playwright, vercel |
| **Project** | `.cursor/mcp.json`                | shadcn (`-c apps/erp`), **next-devtools** (`next-devtools-mcp@latest`) |

Canonical global path on Windows: **`%USERPROFILE%\.cursor\mcp.json`** (not `%APPDATA%\Cursor\mcp.json`).

**Env (single source of truth):** copy `.env.config.example` → `.env.config`, fill values, then:

```bash
pnpm env:sync          # .env.local + apps/erp/.env.local
pnpm env:sync:cursor   # Windows User env — §L: NEON_API_KEY, GITHUB_TOKEN, CONTEXT7_API_KEY
pnpm env:sync:dry-run  # preview (values redacted; lists preserved keys)
```

**Context7:** set `CONTEXT7_API_KEY` (`ctx7sk…` from [context7.com/dashboard](https://context7.com/dashboard)) in `.env.config` §L + `env:sync:cursor`, and reference `${env:CONTEXT7_API_KEY}` in global `mcp.json` `context7.env` — avoids monthly quota errors.

**GitHub MCP (remote):** `https://api.githubcopilot.com/mcp/` — **OAuth (preferred):** no `Authorization` header → **Settings → Tools & MCP → github → Connect**. **Or PAT:** `Bearer ${env:GITHUB_TOKEN}` via §L + `env:sync:cursor` (scopes e.g. `repo`, `read:org`). Invalid `GITHUB_TOKEN` breaks both MCP and `gh` CLI.

**Neon MCP (OAuth):** restart Cursor → **Settings → Tools & MCP** → enable **Neon** → **Connect** → authorize in the browser (no API key in `mcp.json`).

Fully **restart Cursor** after changing MCP config or `env:sync:cursor`. Troubleshooting: [`docs/development/env.md`](../docs/development/env.md#cursor-mcp).

**Verify (PowerShell, new window):**

```powershell
@('NEON_API_KEY','GITHUB_TOKEN','CONTEXT7_API_KEY') | ForEach-Object { "$_=$(if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_, 'User'))) { 'MISSING' } else { 'SET' })" }
```

Duplicate MCP files under `AppData\Roaming\Cursor\...` and `AppData\Roaming\.cursor\` were cleared so servers are not registered twice.

## Other context layers

| Layer   | Location                            | Role                                          |
| ------- | ----------------------------------- | --------------------------------------------- |
| Rules   | `.cursor/rules/*.mdc`               | Always-on + path-scoped doctrine              |
| Hooks   | `.cursor/hooks.json`                | Session routing + post-edit ARCH hints        |
| Index   | `.cursorignore`                     | Exclude artifacts and lockfile noise          |
| Stack   | `.agents/stack-context.md`          | Pinned versions + Context7 library hints      |
| VS Code | `.vscode/settings.json`, `mcp.json` | Editor + MCP for VS Code (parallel to Cursor) |

## After clone

1. `pnpm install`
2. Copy `.env.config.example` → `.env.config`, fill secrets, then `pnpm env:sync:all` — see [`docs/development/env.md`](../docs/development/env.md)
3. Confirm global + project MCP in **Cursor Settings → MCP**
4. **Extensions: Show Recommended Extensions**
5. **Indexing & Docs** — add `docs/architecture/`, `docs/testing/`

See rule `afenda-external-context` for Context7 vs ARCH doc priority.

Vercel linking is deferred — [`docs/development/vercel-link.md`](../docs/development/vercel-link.md).
