# Directory Architecture Audit

## Target Shape

Afenda ERP is a Vercel/Turborepo monorepo. Apps own deployable surfaces, packages own reusable libraries, and generated output must stay out of source directories.

| Root        | Ownership                                     | Contents                                                                               |
| ----------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `apps/erp/` | Deployable Next.js App Router application     | routes, app composition, app-only components, app tests, Next/Playwright/Vitest config |
| `packages/` | Workspace libraries                           | reusable domain, data, auth, AI, UI, workflows, config, and governed-surface code      |
| `scripts/`  | Repo-level automation                         | artifact, architecture, security, performance, and environment scripts                 |
| `docs/`     | Human architecture, roadmap, and testing docs | stable architecture, staged plans, test-artifact policy                                |
| `.github/`  | CI orchestration                              | quality, build, artifact, and e2e workflows                                            |

## Package Boundaries

| Package                    | Boundary                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `@afenda/ai`               | AI schemas, prompts, tools, agents, and guardrails. Depends on domain metadata, not app routes. |
| `@afenda/auth`             | Shared auth/server/session helpers. Client and server subpaths compile to `dist`.               |
| `@afenda/config`           | Shared repo configuration helpers for Next.js, env, module ids, and Vitest.                     |
| `@afenda/db`               | Database client, schema, migrations, tenancy, RLS, and seed/migration scripts.                  |
| `@afenda/domain`           | ERP module metadata, route copy, workspace/query metadata, and domain-level tests.              |
| `@afenda/governed-surface` | Governed UI schemas, renderers, builders, and metadata adapters.                                |
| `@afenda/observability`    | Shared request/logging helpers.                                                                 |
| `@afenda/ui`               | Single owner of reusable UI primitives and design-system utilities.                             |
| `@afenda/workflows`        | Workflow orchestration helpers using domain/db contracts.                                       |

## Package Categories

Every workspace package is classified in `scripts/check-directory-architecture.mts` before it is allowed into the monorepo. This keeps new package types explicit instead of letting directory rules drift.

| Category          | Applies To                         | Required Policy                                                                                    |
| ----------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `next-app`        | `@afenda/erp`                      | App owns deployable Next.js routes and emits `.next/**`, excluding `.next/cache/**` from caching.  |
| `runtime-library` | domain, auth, AI, workflow helpers | Source stays in `src`, package build emits `dist`, runtime exports point to compiled JS.           |
| `ui-primitives`   | `@afenda/ui`                       | Shared primitive owner; app-local primitive folders are forbidden.                                 |
| `config`          | `@afenda/config`                   | Shared config helpers compile source-backed subpaths while config files may remain direct exports. |
| `database`        | `@afenda/db`                       | Database source, migrations, seeds, and Drizzle artifacts stay package-owned; build emits `dist`.  |

When a new category is needed, add the category and its output/export policy to the architecture check in the same change that introduces the package.

## Conflicts Found

| Conflict                                                                              | Correction                                                                                                                         |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Generated `*.js`, `*.d.ts`, and `*.d.ts.map` files were present in `packages/ui/src`. | Remove them from source; package builds emit compiled output to `packages/ui/dist`.                                                |
| `apps/erp/src/components/ui` duplicated primitives owned by `@afenda/ui`.             | Replace app imports with `@afenda/ui/*`, remove the app-local primitive folder, and direct `components.json` to `packages/ui/src`. |
| `apps/erp/tsconfig.tsbuildinfo` was written beside app source/config.                 | Route incremental TS build info to `.next/cache/tsconfig.tsbuildinfo`.                                                             |
| `@afenda/governed-surface` exported source files as runtime defaults.                 | Build with `tsc -p tsconfig.build.json` and point runtime defaults to `dist`.                                                      |
| `@afenda/auth/client` and `@afenda/config/vitest` used source defaults.               | Compile those subpaths and point default exports to `dist`.                                                                        |

## Output Rules

| Output                       | Approved Location                                                      |
| ---------------------------- | ---------------------------------------------------------------------- |
| Next.js build output         | `apps/erp/.next/**`, excluding `.next/cache/**` from Turborepo outputs |
| Package builds               | `packages/*/dist/**`                                                   |
| Turborepo cache/logs         | `.turbo/**` and package `.turbo/**`                                    |
| Test reports and traces      | `.artifacts/**`                                                        |
| Vitest blob junction         | `.vitest-reports` -> `.artifacts/vitest-reports`                       |
| TypeScript incremental state | ignored cache locations such as `.next/cache/**`, never source roots   |

## Prevention

- `pnpm architecture:check` fails when generated source files, root/app `*.tsbuildinfo`, app-local UI primitives, source-default package exports, missing Turborepo build outputs, or unclassified workspace packages reappear.
- Documentation naming follows [Naming Conventions](naming-conventions.md); stable architecture docs live in `docs/architecture/` and roadmap drafts live in `docs/roadmap/`.
- `pnpm artifacts:check` remains focused on test/report output layout.
- CI runs both checks before build/e2e artifact upload.
- New reusable UI primitives belong in `packages/ui/src`; app-specific composition belongs under `apps/erp/src/app` or `apps/erp/src/components`.
