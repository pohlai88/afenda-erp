# ARCH-003 · Directory Architecture Audit

**Doc ID:** `ARCH-003` · **File:** `003-directory-architecture-audit.md`

| Field       | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Status      | Active — enforced by `pnpm architecture:check` (May 2026)                       |
| Authority   | Monorepo layout, package categories, output locations, guard scripts            |
| Enforced by | `scripts/check-directory-architecture.mts`                                      |
| Related     | **ARCH-001** (deploy) · **ARCH-002** (feature packages) · **ARCH-004** (naming) |

This document describes **what the repository enforces today**. The guard script is the
source of truth when this file and code disagree — update both in the same change.

## Target shape

Afenda ERP is a Vercel/Turborepo monorepo: one deployable Next.js app, internal
workspace libraries, generated output outside source trees. Vercel project linking is
**deferred** until stable (**ARCH-001**); root `vercel.json` already defines the
intended production build.

| Root                 | Ownership                         | Contents                                                           |
| -------------------- | --------------------------------- | ------------------------------------------------------------------ |
| `apps/erp/`          | Deployable App Router application | routes, layouts, handlers, app-only composition, Playwright/Vitest |
| `packages/`          | Workspace libraries               | domain, db, auth, AI, UI, workflows, config, governed-surface      |
| `packages/features/` | Future ERP modules                | glob ready; **no packages on disk yet**                            |
| `scripts/`           | Repo automation                   | architecture, artifacts, security, performance, env sync           |
| `docs/architecture/` | Stable doctrine                   | `ARCH-###` + `00N-*.md` (see **ARCH-004**)                         |
| `docs/roadmap/`      | Tracking / plans                  | `TRACK-###` + `00N-*.md`                                           |
| `.github/`           | CI                                | quality, build, e2e, artifact upload on failure                    |
| `.artifacts/`        | Test outputs (gitignored)         | coverage, vitest reports, playwright results                       |

## Registered workspace packages

| Package                    | Category          | Build / outputs                                                                   |
| -------------------------- | ----------------- | --------------------------------------------------------------------------------- |
| `@afenda/erp`              | `next-app`        | No package `build`; Turborepo `@afenda/erp#build` → `.next/**`, `!.next/cache/**` |
| `@afenda/ai`               | `runtime-library` | `tsc -p tsconfig.build.json` → `dist/**`                                          |
| `@afenda/auth`             | `runtime-library` | compiled `dist`; `client` / `server` subpaths                                     |
| `@afenda/config`           | `config`          | compiled `dist`; Next/Vitest/env helpers                                          |
| `@afenda/db`               | `database`        | schema, migrations, seeds → `dist/**`                                             |
| `@afenda/domain`           | `runtime-library` | cross-module contracts → `dist/**`                                                |
| `@afenda/governed-surface` | `runtime-library` | metadata kernel → `dist/**`                                                       |
| `@afenda/observability`    | `runtime-library` | logging/tracing helpers → `dist/**`                                               |
| `@afenda/ui`               | `ui-primitives`   | shadcn primitives + `erp-shell` → `dist/**`                                       |
| `@afenda/workflows`        | `runtime-library` | workflow helpers → `dist/**`                                                      |
| `@afenda/feature-*`        | `feature-package` | **dynamic** when added under `packages/features/*`                                |

## Package categories (guard rules)

Every workspace package must map to a category in
`scripts/check-directory-architecture.mts` (`packageArchitectureRules` or dynamic
`feature-package` detection).

| Category          | Applies to                                                   | Policy                                                                                                          |
| ----------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `next-app`        | `@afenda/erp`                                                | Owns deployable routes; Turborepo caches `.next/**` excluding `.next/cache/**` (Vercel `NEXTJS_NO_TURBO_CACHE`) |
| `runtime-library` | ai, auth, domain, governed-surface, observability, workflows | `src/` source; `build` = `tsc -p tsconfig.build.json`; runtime `default` exports → `./dist/*.js`                |
| `ui-primitives`   | `@afenda/ui`                                                 | Sole owner of reusable primitives; **forbidden:** `apps/erp/src/components/ui`                                  |
| `config`          | `@afenda/config`                                             | Shared Next/env/Vitest; compiled subpaths where required                                                        |
| `database`        | `@afenda/db`                                                 | Migrations and Drizzle source stay in package; emits `dist`                                                     |
| `feature-package` | `@afenda/feature-*`                                          | Under `packages/features/<moduleId>`; compiled `dist`; must not import `apps/erp`                               |

Adding a category requires updating the guard script in the same PR that introduces
the package type.

## Export and build policy

For packages with `requiresCompiledDistExports: true`:

- `package.json` `scripts.build` must be exactly `tsc -p tsconfig.build.json`.
- `tsconfig.build.json` must exist.
- Every export subpath `default` must point to `./dist/...js` (not `./src/...`).

`development` and `types` may point at `./src` for local DX. Next.js
`transpilePackages` in `@afenda/config` compiles workspace TypeScript during
`next build` (**ARCH-002**).

`@afenda/erp` is exempt from compiled dist exports (the Next.js app is the runtime
consumer of its own `.next` output).

## Turborepo integration (Vercel-aligned)

Root `turbo.json` uses the v2 **`tasks`** key (not legacy `pipeline`).

| Task                 | Purpose                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `build`              | Default `dependsOn: ["^build"]`, `outputs: ["dist/**"]` for libraries                      |
| `@afenda/erp#build`  | `outputs: [".next/**", "!.next/cache/**"]`                                                 |
| Per-package `#build` | Overrides for domain, ui, governed-surface, db, auth, ai, workflows, observability, config |
| `test` / `test:e2e`  | `cache: false` (artifacts not cached as build outputs)                                     |
| `globalEnv`          | DATABASE*\*, NEON_AUTH*_, public NEXT*PUBLIC*_ — affects cache hashes                      |

When Vercel Remote Cache is enabled (after link), `globalEnv` and task `env` must stay
accurate so preview and production caches do not cross-contaminate.

**Vercel conformance (validated May 2026):** `@afenda/erp#build` outputs follow
[NEXTJS_NO_TURBO_CACHE](https://vercel.com/docs/conformance/rules/NEXTJS_NO_TURBO_CACHE)
(`.next/**` with `!.next/cache/**`). Official Turborepo examples may still show the
legacy `pipeline` key; this repo uses Turborepo v2 **`tasks`**. `@afenda/erp#build`
also lists `VERCEL_URL` in `env` for deployment-scoped cache hashing.

## Output rules

| Output                 | Approved location                                                     |
| ---------------------- | --------------------------------------------------------------------- |
| Next.js build          | `apps/erp/.next/**` (exclude `.next/cache/**` from Turborepo outputs) |
| Package builds         | `packages/*/dist/**`                                                  |
| Turborepo              | `.turbo/**`, package `.turbo/**`                                      |
| Tests / coverage       | `.artifacts/**` (see `docs/testing/README.md`)                        |
| Vitest blob junction   | `.vitest-reports` → `.artifacts/vitest-reports`                       |
| TypeScript incremental | `.next/cache/**` or ignored paths — **never** next to app `src/`      |
| Vercel local metadata  | `.vercel/**` (gitignored; created after `vercel link`)                |

Forbidden in source trees:

- `*.js`, `*.d.ts`, `*.d.ts.map` under any `src/`
- `*.tsbuildinfo` outside approved cache locations
- `apps/erp/src/components/ui/` (use `@afenda/ui`)

## App ↔ UI boundary

Enforced checks:

- `apps/erp/src/components/ui` must **not** exist.
- `apps/erp/components.json` → `aliases.ui` must be `../../packages/ui/src`.
- New primitives go in `packages/ui/src`; app-specific composition stays under
  `apps/erp/src/app` or `apps/erp/src/components` (non-`ui`).

## Documentation layout

Enforced by the same guard (walk + link validation):

- Stable architecture: `docs/architecture/00N-<topic>.md` with `ARCH-00N` IDs.
- Roadmap / tracking: `docs/roadmap/00N-<topic>.md` with `TRACK-00N` IDs.
- No root-level `*-architecture.md` files.
- Architecture markdown must not reference removed legacy doc paths (informal root
  architecture draft, old governed-surface metadata doc, retired roadmap drafts).
  The guard maintains an explicit denylist in `check-directory-architecture.mts`.
- Relative links between architecture docs must resolve (CI fails on broken links).

Agent skill markdown under `.agents/skills/` is outside this policy; the guard
walk skips `.agents/` entirely.

## Prevention commands

| Command                        | What it guards                                         |
| ------------------------------ | ------------------------------------------------------ |
| `pnpm architecture:check`      | Layout, exports, turbo outputs, UI boundary, doc links |
| `pnpm lint:governed-renderers` | Governed-surface renderer registry parity              |
| `pnpm artifacts:check`         | Test artifact directories under `.artifacts/`          |
| `pnpm security:review`         | Auth, cron, uploads, tenant scoping (complementary)    |

### CI order (quality job)

1. `pnpm install --frozen-lockfile`
2. `pnpm artifacts:init`
3. `pnpm typecheck`
4. **`pnpm architecture:check`**
5. **`pnpm lint:governed-renderers`**
6. `pnpm test` + `pnpm artifacts:check`
7. `pnpm build` (full monorepo graph)

Vercel deploy and Remote Cache setup remain **deferred** until **ARCH-001**
stabilization gate passes.

## Resolved conflicts (historical)

Recorded for audit history — not open work.

| Conflict                                                       | Correction                                       |
| -------------------------------------------------------------- | ------------------------------------------------ |
| Generated `*.js` / `*.d.ts` in `packages/ui/src`               | Removed from source; emit via `packages/ui/dist` |
| `apps/erp/src/components/ui` duplicated `@afenda/ui`           | Removed; imports use `@afenda/ui`                |
| `apps/erp/tsconfig.tsbuildinfo` beside source                  | Moved to `.next/cache/tsconfig.tsbuildinfo`      |
| `@afenda/governed-surface` source-only runtime defaults        | `tsc` build + `default` → `dist`                 |
| `@afenda/auth/client`, `@afenda/config/vitest` source defaults | Compiled subpaths → `dist`                       |
| Architecture doc filenames without search IDs                  | Renumbered to `00N-*.md` (**ARCH-004**)          |

## Related documents

- **ARCH-001** [System Architecture](001-system-architecture.md) — runtime, Vercel deferral, observability
- **ARCH-002** [ERP Domain Package Architecture](002-erp-domain-package-architecture.md) — feature extraction and imports
- **ARCH-004** [Naming Conventions](004-naming-conventions.md) — files, docs, packages
- **ARCH-005** [Database Scale Architecture](005-database-scale-architecture.md) — schema ownership

### External (Vercel monorepo)

- [Monorepos with Turborepo](https://vercel.com/docs/monorepos/turborepo)
- [Turborepo env and cache hashing](https://vercel.com/docs/monorepos/turborepo)
- [NEXTJS_NO_TURBO_CACHE](https://vercel.com/docs/conformance/rules/NEXTJS_NO_TURBO_CACHE)
