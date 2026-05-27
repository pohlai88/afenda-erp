# Cursor setup (Afenda ERP)

## MCP: global vs project

| Scope       | File                              | Servers                                           |
| ----------- | --------------------------------- | ------------------------------------------------- |
| **Global**  | `%USERPROFILE%\.cursor\mcp.json` | context7, Neon, github, playwright, vercel |
| **Project** | `.cursor/mcp.json`                | shadcn (`-c apps/erp`, `components.json`)  |

Canonical global path on Windows: **`%USERPROFILE%\.cursor\mcp.json`** (not `%APPDATA%\Cursor\mcp.json`).

**Env (single source of truth):** copy `.env.config.example` → `.env.config`, fill values, then:

```bash
pnpm env:sync          # .env.local + apps/erp/.env.local
pnpm env:sync:cursor   # Windows User env (NEON_API_KEY, GITHUB_TOKEN)
pnpm env:sync:dry-run  # preview (values redacted; lists preserved keys)
```

Fully **restart Cursor** after `env:sync:cursor`.

**Verify (PowerShell, new window):**

```powershell
@('NEON_API_KEY','GITHUB_TOKEN') | ForEach-Object { "$_=$(if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_, 'User'))) { 'MISSING' } else { 'SET' })" }
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
