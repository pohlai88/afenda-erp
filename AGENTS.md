<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

When working with Next.js in `apps/erp`, call the **`init` tool** from the **next-devtools** MCP server at the start of the session (project config: `.cursor/mcp.json`) to load version-matched guidance. Afenda doctrine in `docs/architecture/` still wins over generic MCP defaults.

<!-- END:nextjs-agent-rules -->

# Afenda ERP (`@afenda/erp`) — Agent Guide

You are working in the **deployable Next.js 16 App Router application** for Afenda ERP. Canonical architecture lives in `docs/architecture/` (`ARCH-###`). When docs disagree on package boundaries or deployment, follow **ARCH-002**, then **ARCH-001**, and update the other doc in the same change.

## Canonical references

| ID           | File                                                       | Use when                                           |
| ------------ | ---------------------------------------------------------- | -------------------------------------------------- |
| **ARCH-001** | `docs/architecture/001-system-architecture.md`             | Runtime, auth, AI, Vercel deploy, tenancy, caching |
| **ARCH-002** | `docs/architecture/002-erp-domain-package-architecture.md` | Feature packages, imports, extraction              |
| **ARCH-003** | `docs/architecture/003-directory-architecture-audit.md`    | Monorepo guards, outputs, UI boundary              |
| **ARCH-004** | `docs/architecture/004-naming-conventions.md`              | Routes, packages, exports, module IDs              |
| **ARCH-005** | `docs/architecture/005-database-scale-architecture.md`     | Schema ownership, promotion                        |
| **ARCH-006** | `docs/architecture/006-metadata-driven-ui-architecture.md` | Metadata vs runtime authority, list windows        |
| **ARCH-007** | `docs/architecture/007-governed-metadata-architecture.md`  | Renderer kernel, profiles, builders                |

Index: `docs/architecture/README.md`.

## What this app owns

- App Router routes, layouts, `loading.tsx` / `error.tsx`, Route Handlers under `src/app/api/`.
- Server-side session and organization resolution at page entry.
- Thin adapters: call `@afenda/domain`, `@afenda/feature-*` (when they exist), platform packages; compose governed sections.

**Do not put here:** durable ERP business rules, Drizzle schema, cross-module workflow state, governed renderer implementations, or reusable UI primitives (`@afenda/ui`).

## Non-negotiables

1. **Tenancy** — Derive `organizationId` from server session/context (`@afenda/auth`, `@afenda/db` tenancy helpers). Never trust client-supplied org IDs.
2. **Authorization** — `src/proxy.ts` refreshes Neon Auth sessions; **re-check capabilities** in Server Components, Server Actions, and Route Handlers before reads or mutations.
3. **One app, one deploy** — Single Vercel project from repo root (`vercel.json` → `pnpm turbo build --filter=@afenda/erp`). No per-module Vercel projects. Linking is **deferred** until ARCH-001 stabilization gate passes.
4. **Module routes** — Core modules use `(app)/[moduleId]/…` only. Do not add per-module route folders unless the URL tree genuinely differs.
5. **Governed UI** — Metadata declares intent; runtime owns authority. Lists use server windows and `GovernedPatternCListSection`; never ship full datasets to the client for pagination.
6. **Lazy clients** — Use `getDb()` and package auth doors; do not create Neon pools or SDK clients at module scope in new app code.
7. **Caching** — `cacheComponents: true` via `@afenda/config`. Cache only shared/non-tenant data. Tenant dashboards and org-scoped lists stay dynamic.
8. **Cron** — `/api/cron/*` must validate `Authorization: Bearer ${CRON_SECRET}` (`src/lib/cron.ts`).
9. **AI** — Gateway auth: `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`. Mutating AI tools require human approval and domain services, not direct table writes.

## As-built vs target

| Area          | Today                                         | Target                                                   |
| ------------- | --------------------------------------------- | -------------------------------------------------------- |
| Module logic  | `@afenda/domain`, route adapters              | `@afenda/feature-<moduleId>` under `packages/features/*` |
| List builders | `packages/domain/src/module-list-surfaces.ts` | Move to feature packages when threshold met (ARCH-002)   |
| Schema        | Flat `packages/db/src/schema/*.ts`            | `schema/<moduleId>/` for ledger-grade tables             |

Do not extend generic `erp_module_records` for posting-grade, inventory-grade, or statutory workflows.

## Typical route shape

```txt
src/app/
  (auth)/sign-in, sign-up, …
  (app)/layout.tsx
  (app)/dashboard/
  (app)/solution-console/
  (app)/[moduleId]/page.tsx
  (app)/[moduleId]/records/[recordId]/page.tsx
  api/ai/*, api/uploads, api/cron/*, api/observability/drain
```

Server Actions: internal mutations. Route Handlers: webhooks, uploads, AI streams, cron, public APIs.

## Before you finish

```bash
pnpm typecheck
pnpm architecture:check
pnpm lint:governed-renderers   # if governed-surface or list metadata changed
pnpm test                      # and pnpm test:e2e when routes/flows change
```

DB changes: `pnpm db:generate` and migration validation. Security-sensitive paths: `pnpm security:review`.

## Programmatic agents (Cursor SDK)

For CI, bots, or scripts outside the IDE, use `@cursor/sdk` or `cursor-sdk` with **explicit** `local: { cwd }` or `cloud: { repos }`, dispose agents (`await using` / `with`), and distinguish startup failures (`CursorAgentError`) from `result.status === "error"`. See [Cursor SDK docs](https://cursor.com/docs/sdk/typescript). Inline MCP on `Agent.resume` must be passed again.
