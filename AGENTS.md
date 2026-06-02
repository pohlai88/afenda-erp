<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

Read `node_modules/next/dist/docs/` for version-matched Next.js behavior. **Afenda doctrine (`docs/architecture/`) overrides generic MCP defaults.**

When working in `apps/erp`, call **next-devtools** `init` once per session (`.cursor/mcp.json`).

<!-- END:nextjs-agent-rules -->

# Afenda ERP — Agent Guide

You implement **target architecture only** (**ARCH-1001**–**ARCH-1006**). Deviations are **wrong**, not deferred legacy. Hooks enforce this (`guard-architecture-compliance.mjs`, `failClosed: true`). Rule: `.cursor/rules/afenda-agent-discipline.mdc`.

```txt
Constitution: ARCH-1001
Backend:      ARCH-1002  — features own truth; commands + kernel for writes
Frontend:     ARCH-1003  — RSC; no self-fetch /api for page data
API:          ARCH-1004  — app/api/{public|internal}/v1; thin routes only
Platform:     ARCH-1005  — monorepo, guards, Neon, Vercel
Control:      ARCH-1006  — system-admin feature
```

Index: [`docs/architecture/README.md`](docs/architecture/README.md).

## Non-negotiables (do not re-litigate)

1. **Target-only** — No “as-built OK,” no shims, no `git show` to resurrect fat routes. Read ARCH; implement ARCH.
2. **Tenancy** — `organizationId` from server session only (`@afenda/auth`).
3. **Writes** — `transport → command → kernel → domain → db → event` (**ARCH-1002** §3).
4. **Reads** — `server query → read-model → db` in-process (**ARCH-1003**); not `fetch('/api/…')` for workspace pages.
5. **HTTP API** — `apps/erp/src/app/api/internal/v1/…` or `public/v1/…` only. Flat `app/api/lynx/*` is **non-compliant** (**ARCH-1004** §7).
6. **Routes** — ≤15 lines: auth, parse, dispatch to `@afenda/feature-*/server` or `@afenda/api`. No `@afenda/db` in `route.ts`.
7. **Feature packages** — `packages/features/<moduleId>`; doors `.` / `./client` / `./server` / `./metadata` only.
8. **No business logic in** `apps/erp/src/lib/` — app composes; features own module truth (**ARCH-1002** §6).
9. **Governed lists** — server windows; never full datasets to the client.
10. **Repo hygiene** — test output under `.artifacts/` only (rule `afenda-repo-hygiene`).

## Routing table (read one doc per task)

| Task | Rule | ARCH |
| ---- | ---- | ---- |
| App routes, `workspace-routes/` | `afenda-erp-app` | 1001, 1003 |
| HTTP handlers | `afenda-erp-app`, `afenda-agent-discipline` | **1004** |
| Feature package | `afenda-feature-packages`, `afenda-feature-shape` | **1002** |
| Lynx / Knowledge | `afenda-lynx-knowledge` | **1005** §11, **1004** §5 |
| DB schema | `afenda-database-migrations` | **1005**, **1002** |
| Governed UI | `afenda-governed-ui` | **1003** |
| System Admin | `afenda-system-admin` | **1006** |

Session inject: `.cursor/hooks/afenda-architecture-routing.md`.

## Lynx HTTP (**ARCH-1004** §5)

| Required path | Feature |
| ------------- | ------- |
| `POST …/internal/v1/lynx/queries/truth-search` | `handleLynxTruthSearchPost` |
| `POST …/internal/v1/lynx/queries/operator` | `handleLynxOperatorPost` |
| `POST …/internal/v1/lynx/commands/record-run-feedback` | `executeLynxRecordRunFeedbackCommand` |
| `GET …/internal/v1/lynx/queries/run-ledger-export` | read-model export |

Scaffold: `pnpm scaffold:feature <moduleId>` · `packages/_scaffold/README.md`.

## Forbidden agent behavior

| Behavior | Why |
| -------- | --- |
| Compliance review that blesses flat `/api/*` | **ARCH-1004** §7 lists it as wrong |
| Restoring old routes from git instead of target shape | Laziness; violates §3 |
| Fat `route.ts` or `apps/erp/src/lib/api` module logic | **ARCH-1004** §3 |
| Full monorepo test/lint/build after tiny doc edit | Wastes time; see below |
| “User can migrate later” in architecture docs | Docs are target-only |
| Ask user to run `pnpm architecture:check` after hook failure | **You** fix hook output |

## Validation (minimal)

```bash
pnpm --filter <package> typecheck   # touched package
pnpm --filter <package> test        # touched package
pnpm architecture:check           # boundaries, docs/architecture, exports, guards
pnpm lint:governed-renderers      # governed-surface only
```

Do **not** run repo-wide `pnpm test`, full build, or full typecheck after doc-only changes.

Schema: `packages/db/src/schema` → `pnpm db:generate` → review → `pnpm db:migrate` — no hand-written `drizzle/*.sql` unless the user explicitly requires it.

## App layout

```txt
apps/erp/src/app/
  (auth)/…
  (workspace)/…          # shell via @afenda/appshell
  api/internal/v1/…        # required HTTP tree
  api/public/v1/…          # partners (when added)
  api/auth/[...path]/      # Neon Auth (framework)
apps/erp/src/workspace-routes/   # governed composition — not fat pages
packages/features/<moduleId>/src/
  commands/ domain/ data/ read-models/ api/ schemas/ …
```

## Hooks (automatic)

- `sessionStart` → architecture routing + discipline
- `preToolUse` → `guard-architecture-compliance` (**failClosed**), kernel boundary, root hygiene, DDL
- `postToolUse` → `enforce-architecture-drift`, feature shape validation

Fix denials in-session. Do not argue that legacy paths are acceptable.

## Programmatic agents

[`Cursor SDK`](https://cursor.com/docs/sdk/typescript) — explicit `cwd`, dispose agents, pass MCP on `resume`.
