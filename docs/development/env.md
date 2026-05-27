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
pnpm env:sync:cursor                 # Windows: NEON_API_KEY + GITHUB_TOKEN → User env
pnpm env:sync:all                    # both
pnpm env:sync:dry-run                # preview (values redacted)
```

Run `pnpm env:sync:all` before the first `pnpm build` or `pnpm dev` on a fresh clone.

## Schema

Runtime validation: [`packages/config/src/env.ts`](../../packages/config/src/env.ts).

Turbo cache env keys: [`turbo.json`](../../turbo.json) `globalEnv` and `@afenda/erp#build.env`.

## Cursor MCP

- **Neon** / **github**: `NEON_API_KEY` (§C), `GITHUB_TOKEN` (§L) via `env:sync:cursor`
- **Context7**: no API key required
