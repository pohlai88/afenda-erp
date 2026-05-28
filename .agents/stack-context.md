# Afenda stack context (for agents, Context7, and skills)

Pinned versions from `pnpm-workspace.yaml` catalog and `apps/erp/package.json`. Prefer **repo doctrine** (`docs/architecture/`, `.cursor/rules/`) for Afenda boundaries; use **Context7** for framework API details at these versions.

## TypeScript policy

Canonical compiler options: [`packages/config/tsconfig.base.json`](../packages/config/tsconfig.base.json).

| Flag | Status |
| ---- | ------ |
| `strict` | on |
| `noImplicitReturns` | on |
| `noFallthroughCasesInSwitch` | on |
| `noUnusedLocals` / `noUnusedParameters` | on |
| `noUncheckedIndexedAccess` | on |
| `exactOptionalPropertyTypes` | deferred (high churn) |

Run `pnpm typecheck` after TS config changes.

## Runtime (catalog / app)

| Package            | Version | Context7 hint (resolve if unsure) |
| ------------------ | ------- | --------------------------------- |
| next               | 16.2.6  | `/vercel/next.js`                 |
| react / react-dom  | 19.2.4  | —                                 |
| typescript         | ^5.9.3  | —                                 |
| zod                | ^4.4.3  | `/colinhacks/zod`                 |
| vitest             | ^3.2.4  | `/vitest-dev/vitest`              |
| drizzle-orm        | ^0.45.2 | `/drizzle-team/drizzle-orm`       |
| eslint-config-next | 16.2.6  | —                                 |

## App-specific (`apps/erp`)

| Package                  | Version    | Context7 / local                            |
| ------------------------ | ---------- | ------------------------------------------- |
| @neondatabase/auth       | 0.4.1-beta | Neon Auth docs via Context7 or Neon MCP     |
| @neondatabase/serverless | ^1.1.0     | Neon serverless driver                      |
| ai / @ai-sdk/react       | ^6 / ^3    | `/vercel/ai`                                |
| tailwindcss              | ^4         | `/tailwindlabs/tailwindcss`                 |
| @playwright/test         | ^1.55.1    | `/microsoft/playwright`                     |
| shadcn                   | ^4.8.1     | **shadcn MCP** + `apps/erp/components.json` |

## Local docs (no Context7)

| Topic                         | Source                                                |
| ----------------------------- | ----------------------------------------------------- |
| Next.js 16 breaking changes   | `node_modules/next/dist/docs/` (see `AGENTS.md`)      |
| Afenda architecture           | `docs/architecture/README.md` (`ARCH-001`–`ARCH-008`) |
| ERP app routes / handlers     | `AGENTS.md`, rule `afenda-erp-app`                    |
| Governed UI                   | **ARCH-006**, **ARCH-007**, rule `afenda-governed-ui` |
| shadcn components in monorepo | `@afenda/ui`, `apps/erp/components.json` aliases      |
| Environment sync            | `docs/development/env.md`, `.env.config.example`      |

## Context7 usage

1. Add `use context7` to the prompt when implementing unfamiliar framework APIs.
2. Call `resolve-library-id` when the table ID is wrong or version-specific docs are needed.
3. Call `query-docs` with the resolved ID and a focused question (one API area per query).

Set **`CONTEXT7_API_KEY`** for reliable MCP (§L in `.env.config`, `pnpm env:sync:cursor`, global `~/.cursor/mcp.json`). Skill: `.agents/skills/context7-mcp` · `docs/development/env.md`.

## Vercel (pre-link)

- **Do not** `vercel link` until ARCH-001 stabilization gate passes — see `docs/development/vercel-link.md`.
- Intended deploy: root `vercel.json` → `pnpm turbo build --filter=@afenda/erp`.
- Legacy team project `afenda-vercel` is a different GitHub repo; ERROR deploys there are not ERP health signals.
